import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import archiver from 'archiver';
import { db, detectCategory } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads');
const CLIENT_DIST = path.join(__dirname, '..', '..', 'client', 'dist');

// Đảm bảo thư mục uploads tồn tại
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Phục vụ file tĩnh trực tiếp (ảnh, video, v.v.)
app.use('/uploads', express.static(UPLOAD_DIR));

// Phục vụ giao diện web frontend đã build
if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
}

// Cấu hình Multer để lưu file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    let originalName = file.originalname;
    try {
      originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    } catch {
      originalName = file.originalname;
    }
    const ext = path.extname(originalName);
    const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // Giới hạn 500MB mỗi file
  }
});

// Middleware xác thực người dùng từ Token
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập để tiếp tục' });
  }

  const user = db.getUserByToken(token);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ' });
  }

  req.user = user;
  req.token = token;
  next();
}

// ================= AUTH ROUTES =================

// Trả về cấu hình Google Client ID cho frontend
app.get('/api/config', (req, res) => {
  res.json({
    success: true,
    data: {
      googleClientId: process.env.GOOGLE_CLIENT_ID || '1028638565090-2ogecvmsvmiq44pkbrspr83ku0d9reb8.apps.googleusercontent.com'
    }
  });
});

// Đăng ký tài khoản mới
app.post('/api/auth/register', (req, res) => {
  try {
    const { username, displayName, password } = req.body;
    if (!username || !password || username.trim().length < 3 || password.length < 4) {
      return res.status(400).json({
        success: false,
        message: 'Tên đăng nhập tối thiểu 3 ký tự và mật khẩu tối thiểu 4 ký tự'
      });
    }

    const result = db.registerUser({ username, displayName, password });
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công',
      data: { user: result.user, token: result.token }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi đăng ký', error: error.message });
  }
});

// Đăng nhập
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tên đăng nhập và mật khẩu' });
    }

    const result = db.loginUser({ username, password });
    if (!result.success) {
      return res.status(401).json(result);
    }

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: { user: result.user, token: result.token }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi đăng nhập', error: error.message });
  }
});

// Lấy thông tin tài khoản hiện tại
app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({ success: true, data: req.user });
});

// Đăng xuất
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  if (token) {
    db.logoutUser(token);
  }
  res.json({ success: true, message: 'Đã đăng xuất thành công' });
});

// Đăng nhập bằng Google OAuth
app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ success: false, message: 'Thiếu mã xác thực Google' });
    }

    // Xác minh ID token bằng Google API
    const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    if (!verifyRes.ok) {
      return res.status(401).json({ success: false, message: 'Mã xác thực Google không hợp lệ' });
    }

    const payload = await verifyRes.json();
    if (!payload.sub || !payload.email) {
      return res.status(401).json({ success: false, message: 'Không thể xác minh tài khoản Google' });
    }

    const result = db.loginOrRegisterGoogle({
      googleId: payload.sub,
      email: payload.email,
      displayName: payload.name || payload.email.split('@')[0],
      avatar: payload.picture || '',
    });

    res.json({
      success: true,
      message: 'Đăng nhập bằng Google thành công',
      data: { user: result.user, token: result.token }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi đăng nhập bằng Google', error: error.message });
  }
});

// ================= FILE MANAGEMENT ROUTES (BẢO VỆ BỞI AUTH) =================

// 1. Thống kê dung lượng & tập tin của người dùng
app.get('/api/stats', authMiddleware, (req, res) => {
  try {
    const stats = db.getStats(req.user.id);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy thống kê', error: error.message });
  }
});

// 2. Lấy danh sách files của người dùng
app.get('/api/files', authMiddleware, (req, res) => {
  try {
    const { category, search, favoriteOnly, sortBy, sortOrder } = req.query;
    const files = db.getAll({
      userId: req.user.id,
      category: category || 'all',
      search: search || '',
      favoriteOnly: favoriteOnly === 'true',
      sortBy: sortBy || 'createdAt',
      sortOrder: sortOrder || 'desc'
    });
    res.json({ success: true, data: files });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách tập tin', error: error.message });
  }
});

// 3. Tải lên 1 hoặc nhiều files
app.post('/api/upload', authMiddleware, upload.array('files', 50), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Không có tập tin nào được chọn' });
    }

    const newFiles = req.files.map(file => {
      let originalName = file.originalname;
      try {
        originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
      } catch {
        originalName = file.originalname;
      }

      const category = detectCategory(file.mimetype, originalName);
      const fileId = crypto.randomUUID();

      return {
        id: fileId,
        userId: req.user.id,
        originalName: originalName,
        storedName: file.filename,
        path: `/uploads/${file.filename}`,
        mimeType: file.mimetype,
        size: file.size,
        category: category,
        isFavorite: false,
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });

    db.addMultiple(newFiles);

    res.status(201).json({
      success: true,
      message: `Đã tải lên thành công ${newFiles.length} tập tin`,
      data: newFiles
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi tải lên tập tin', error: error.message });
  }
});

// Config cho chunk upload lưu tạm trong uploads/temp
const chunkUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const tempDir = path.join(UPLOAD_DIR, 'temp');
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
      cb(null, tempDir);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.chunk`);
    }
  }),
  limits: { fileSize: 50 * 1024 * 1024 }
});

// Tải lên từng phân đoạn (Chunk Upload) cho file lớn (GB)
app.post('/api/upload/chunk', authMiddleware, chunkUpload.single('chunk'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Thiếu dữ liệu phân đoạn' });
    }
    res.json({
      success: true,
      tempPath: req.file.filename
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi upload phân đoạn', error: error.message });
  }
});

// Hoàn tất ghép các phân đoạn file lớn
app.post('/api/upload/chunk-complete', authMiddleware, async (req, res) => {
  try {
    const { originalName, chunkFiles, mimeType, size } = req.body;
    if (!chunkFiles || !Array.isArray(chunkFiles) || chunkFiles.length === 0) {
      return res.status(400).json({ success: false, message: 'Danh sách phân đoạn không hợp lệ' });
    }

    const tempDir = path.join(UPLOAD_DIR, 'temp');
    const ext = path.extname(originalName || '');
    const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    const targetPath = path.join(UPLOAD_DIR, uniqueName);

    const writeStream = fs.createWriteStream(targetPath);

    for (const chunkFile of chunkFiles) {
      const chunkPath = path.join(tempDir, chunkFile);
      if (fs.existsSync(chunkPath)) {
        const data = fs.readFileSync(chunkPath);
        writeStream.write(data);
        fs.unlinkSync(chunkPath); // Xóa chunk tạm
      }
    }

    writeStream.end();

    const category = detectCategory(mimeType, originalName);
    const fileId = crypto.randomUUID();

    const newFile = {
      id: fileId,
      userId: req.user.id,
      originalName: originalName,
      storedName: uniqueName,
      path: `/uploads/${uniqueName}`,
      mimeType: mimeType || 'application/octet-stream',
      size: Number(size) || 0,
      category: category,
      isFavorite: false,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.addMultiple([newFile]);

    res.status(201).json({
      success: true,
      message: 'Đã tải lên và ghép tập tin thành công',
      data: [newFile]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi ghép tập tin', error: error.message });
  }
});

// 4. Xem chi tiết 1 file
app.get('/api/files/:id', authMiddleware, (req, res) => {
  try {
    const file = db.getById(req.params.id, req.user.id);
    if (!file) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tập tin' });
    }
    res.json({ success: true, data: file });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
  }
});

// 5. Tải file về máy
app.get('/api/files/:id/download', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data.json'), 'utf-8'));
    const file = data.files.find(f => f.id === req.params.id);
    if (!file) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tập tin' });
    }

    const filePath = path.join(UPLOAD_DIR, file.storedName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Tập tin vật lý không tồn tại' });
    }

    res.download(filePath, file.originalName);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi tải tập tin', error: error.message });
  }
});

// 6. Đổi tên file (Rename)
app.patch('/api/files/:id/rename', authMiddleware, (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Tên mới không hợp lệ' });
    }

    const updated = db.update(req.params.id, req.user.id, { originalName: name.trim() });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tập tin' });
    }

    res.json({ success: true, message: 'Đổi tên thành công', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi đổi tên', error: error.message });
  }
});

// 7. Chuyển đổi trạng thái yêu thích
app.patch('/api/files/:id/favorite', authMiddleware, (req, res) => {
  try {
    const updated = db.toggleFavorite(req.params.id, req.user.id);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tập tin' });
    }
    res.json({ success: true, message: 'Đã cập nhật trạng thái yêu thích', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi cập nhật', error: error.message });
  }
});

// 8. Xóa 1 file
app.delete('/api/files/:id', authMiddleware, (req, res) => {
  try {
    const file = db.delete(req.params.id, req.user.id);
    if (!file) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tập tin để xóa' });
    }

    // Xóa file vật lý
    const filePath = path.join(UPLOAD_DIR, file.storedName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ success: true, message: 'Đã xóa tập tin thành công', data: file });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi xóa tập tin', error: error.message });
  }
});

// 9. Xóa nhiều file (Batch Delete)
app.post('/api/files/batch-delete', authMiddleware, (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Danh sách ID không hợp lệ' });
    }

    const deletedFiles = db.deleteMultiple(ids, req.user.id);

    // Xóa file vật lý
    for (const f of deletedFiles) {
      const filePath = path.join(UPLOAD_DIR, f.storedName);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.error(`Không thể xóa file ${f.storedName}:`, e);
        }
      }
    }

    res.json({
      success: true,
      message: `Đã xóa thành công ${deletedFiles.length} tập tin`,
      data: { count: deletedFiles.length }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi xóa tập tin', error: error.message });
  }
});

// 10. Tải về file ZIP chứa nhiều file (Batch Download as ZIP)
app.post('/api/files/batch-download', authMiddleware, (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn ít nhất một tập tin' });
    }

    const files = db.getByIds(ids, req.user.id);
    if (files.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tập tin tương ứng' });
    }

    const archive = archiver('zip', { zlib: { level: 9 } });

    res.attachment(`Storage-Files-${Date.now()}.zip`);

    archive.pipe(res);

    for (const f of files) {
      const filePath = path.join(UPLOAD_DIR, f.storedName);
      if (fs.existsSync(filePath)) {
        archive.file(filePath, { name: f.originalName });
      }
    }

    archive.finalize();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi tạo file nén ZIP', error: error.message });
  }
});

// SPA wildcard fallback
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  if (fs.existsSync(path.join(CLIENT_DIST, 'index.html'))) {
    res.sendFile(path.join(CLIENT_DIST, 'index.html'));
  } else {
    res.send('Kho lưu trữ FileVault đang chạy. Vui lòng mở frontend web client.');
  }
});

// Khởi chạy server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Kho lưu trữ FileVault đang chạy tại: http://localhost:${PORT}`);
});
