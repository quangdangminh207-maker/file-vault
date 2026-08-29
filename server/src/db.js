import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..');
const DATA_FILE = path.join(DATA_DIR, 'data.json');

// Khởi tạo file data nếu chưa có
function loadData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      const initialData = { users: [], sessions: {}, files: [] };
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      return initialData;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.users) parsed.users = [];
    if (!parsed.sessions) parsed.sessions = {};
    if (!parsed.files) parsed.files = [];
    if (!parsed.deletedIds) parsed.deletedIds = [];
    return parsed;
  } catch (error) {
    console.error('Lỗi khi đọc database:', error);
    return { users: [], sessions: {}, files: [], deletedIds: [] };
  }
}

function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Lỗi khi lưu database:', error);
  }
}

// Băm mật khẩu bảo mật bằng Crypto scrypt
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const [salt, key] = storedHash.split(':');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return hash === key;
}

// Phân loại danh mục dựa trên mime-type và đuôi file
export function detectCategory(mimeType = '', filename = '') {
  const ext = path.extname(filename).toLowerCase().replace('.', '');
  const mime = mimeType.toLowerCase();

  if (
    mime.startsWith('image/') ||
    ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'avif', 'tiff', 'heic'].includes(ext)
  ) {
    return 'image';
  }

  if (
    mime.startsWith('video/') ||
    mime.startsWith('audio/') ||
    ['mp4', 'mkv', 'avi', 'mov', 'webm', 'mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'].includes(ext)
  ) {
    return 'media';
  }

  if (
    mime.includes('pdf') ||
    mime.includes('document') ||
    mime.includes('sheet') ||
    mime.includes('presentation') ||
    mime.includes('text') ||
    ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'md', 'rtf', 'odt', 'ods'].includes(ext)
  ) {
    return 'document';
  }

  if (
    mime.includes('zip') ||
    mime.includes('compressed') ||
    mime.includes('tar') ||
    mime.includes('rar') ||
    ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'].includes(ext)
  ) {
    return 'archive';
  }

  return 'other';
}

const AVATAR_COLORS = [
  '#6366f1', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#14b8a6', '#f43f5e'
];

export const db = {
  // ============ NGƯỜI DÙNG & XÁC THỰC ============
  registerUser({ username, displayName, password }) {
    const data = loadData();
    const cleanUsername = username.trim().toLowerCase();

    if (data.users.some(u => u.username.toLowerCase() === cleanUsername)) {
      return { success: false, message: 'Tên đăng nhập này đã được sử dụng' };
    }

    const userId = crypto.randomUUID();
    const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    const newUser = {
      id: userId,
      username: cleanUsername,
      displayName: displayName?.trim() || cleanUsername,
      passwordHash: hashPassword(password),
      avatarColor: randomColor,
      createdAt: new Date().toISOString(),
    };

    data.users.push(newUser);
    saveData(data);

    // Tạo token đăng nhập ngay
    const token = crypto.randomBytes(32).toString('hex');
    data.sessions[token] = { userId: newUser.id, createdAt: Date.now() };
    saveData(data);

    const { passwordHash, ...safeUser } = newUser;
    return { success: true, user: safeUser, token };
  },

  loginOrRegisterGoogle({ googleId, email, displayName, avatar }) {
    const data = loadData();

    // Tim user da lien ket Google truoc do
    let user = data.users.find(u => u.googleId === googleId);

    // Neu chua co, tim theo email
    if (!user) {
      user = data.users.find(u => u.email === email);
    }

    if (user) {
      // Cap nhat thong tin Google neu can
      if (!user.googleId) user.googleId = googleId;
      if (!user.avatar && avatar) user.avatar = avatar;
      if (!user.email && email) user.email = email;
      saveData(data);
    } else {
      // Tao tai khoan moi tu thong tin Google
      const userId = crypto.randomUUID();
      const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
      const usernameBase = (email.split('@')[0] || 'user').toLowerCase().replace(/[^a-z0-9]/g, '');

      user = {
        id: userId,
        username: usernameBase,
        displayName: displayName || usernameBase,
        passwordHash: '',
        googleId: googleId,
        email: email,
        avatar: avatar || '',
        avatarColor: randomColor,
        createdAt: new Date().toISOString(),
      };

      data.users.push(user);
      saveData(data);
    }

    // Tao token phien dang nhap
    const token = crypto.randomBytes(32).toString('hex');
    data.sessions[token] = { userId: user.id, createdAt: Date.now() };
    saveData(data);

    const { passwordHash, ...safeUser } = user;
    return { success: true, user: safeUser, token };
  },

  loginUser({ username, password }) {
    const data = loadData();
    const cleanUsername = username.trim().toLowerCase();
    const user = data.users.find(u => u.username.toLowerCase() === cleanUsername);

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return { success: false, message: 'Tên đăng nhập hoặc mật khẩu không chính xác' };
    }

    // Tạo token phiên đăng nhập
    const token = crypto.randomBytes(32).toString('hex');
    data.sessions[token] = { userId: user.id, createdAt: Date.now() };
    saveData(data);

    const { passwordHash, ...safeUser } = user;
    return { success: true, user: safeUser, token };
  },

  getUserByToken(token) {
    if (!token) return null;
    const data = loadData();
    const session = data.sessions[token];
    if (!session) return null;

    const user = data.users.find(u => u.id === session.userId);
    if (!user) return null;

    const { passwordHash, ...safeUser } = user;
    return safeUser;
  },

  logoutUser(token) {
    if (!token) return;
    const data = loadData();
    if (data.sessions[token]) {
      delete data.sessions[token];
      saveData(data);
    }
  },

  // ============ QUẢN LÝ TẬP TIN THEO NGƯỜI DÙNG ============
  getAll({ userId, category = 'all', search = '', favoriteOnly = false, sortBy = 'createdAt', sortOrder = 'desc' } = {}) {
    const data = loadData();
    let result = data.files.filter(f => !f.userId || f.userId === userId);

    // Lọc theo danh mục
    if (category && category !== 'all') {
      result = result.filter(f => f.category === category);
    }

    // Lọc theo mục yêu thích
    if (favoriteOnly === true || favoriteOnly === 'true') {
      result = result.filter(f => f.isFavorite);
    }

    // Tìm kiếm theo tên file gốc
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(f => f.originalName.toLowerCase().includes(q));
    }

    // Sắp xếp
    result.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === 'createdAt') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      } else if (sortBy === 'originalName') {
        valA = (valA || '').toLowerCase();
        valB = (valB || '').toLowerCase();
      } else if (sortBy === 'size') {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  },

  getById(id, userId) {
    const data = loadData();
    return data.files.find(f => f.id === id && (!f.userId || f.userId === userId)) || null;
  },

  getByIds(ids = [], userId) {
    const data = loadData();
    const set = new Set(ids);
    return data.files.filter(f => set.has(f.id) && (!f.userId || f.userId === userId));
  },

  addMultiple(files) {
    const data = loadData();
    data.files.unshift(...files);
    saveData(data);
    return files;
  },

  update(id, userId, updates) {
    const data = loadData();
    const index = data.files.findIndex(f => f.id === id && (!f.userId || f.userId === userId));
    if (index === -1) return null;

    data.files[index] = { ...data.files[index], ...updates, updatedAt: new Date().toISOString() };
    saveData(data);
    return data.files[index];
  },

  toggleFavorite(id, userId) {
    const data = loadData();
    const index = data.files.findIndex(f => f.id === id && (!f.userId || f.userId === userId));
    if (index === -1) return null;

    data.files[index].isFavorite = !data.files[index].isFavorite;
    data.files[index].updatedAt = new Date().toISOString();
    saveData(data);
    return data.files[index];
  },

  delete(id, userId) {
    const data = loadData();
    const file = data.files.find(f => f.id === id && (!f.userId || f.userId === userId));
    if (!file) return null;

    data.files = data.files.filter(f => f.id !== id);
    if (!data.deletedIds) data.deletedIds = [];
    data.deletedIds.push(file.id);
    if (file.storedName) data.deletedIds.push(file.storedName);
    if (file.path) data.deletedIds.push(file.path);
    saveData(data);
    return file;
  },

  deleteMultiple(ids = [], userId) {
    const data = loadData();
    const set = new Set(ids);
    const deletedFiles = data.files.filter(f => set.has(f.id) && (!f.userId || f.userId === userId));
    const deletedIdSet = new Set(deletedFiles.map(f => f.id));
    data.files = data.files.filter(f => !deletedIdSet.has(f.id));

    if (!data.deletedIds) data.deletedIds = [];
    for (const f of deletedFiles) {
      data.deletedIds.push(f.id);
      if (f.storedName) data.deletedIds.push(f.storedName);
      if (f.path) data.deletedIds.push(f.path);
    }

    saveData(data);
    return deletedFiles;
  },

  syncCloudinaryFiles(resources = [], userId) {
    const data = loadData();
    let addedCount = 0;
    const deletedSet = new Set(data.deletedIds || []);

    for (const res of resources) {
      // Bo qua neu tep da bi nguoi dung xoa truoc do
      if (deletedSet.has(res.public_id) || deletedSet.has(res.secure_url)) {
        continue;
      }

      // Kiem tra neu URL hoac public_id da ton tai trong data.json
      const exists = data.files.some(f => f.path === res.secure_url || f.storedName === res.public_id);
      if (!exists) {
        const ext = res.format ? `.${res.format}` : '';
        const originalName = res.original_filename ? `${res.original_filename}${ext}` : (res.public_id.split('/').pop() + ext);
        const mimeType = res.resource_type === 'image' ? `image/${res.format || 'jpeg'}` : (res.resource_type === 'video' ? `video/${res.format || 'mp4'}` : 'application/octet-stream');

        const category = detectCategory(mimeType, originalName);

        data.files.push({
          id: crypto.randomUUID(),
          userId: userId || (data.users[0]?.id || 'default-user'),
          originalName: originalName,
          storedName: res.public_id,
          path: res.secure_url,
          mimeType: mimeType,
          size: res.bytes || 0,
          category: category,
          isFavorite: false,
          tags: [],
          createdAt: res.created_at || new Date().toISOString(),
          updatedAt: res.created_at || new Date().toISOString()
        });
        addedCount++;
      }
    }

    if (addedCount > 0) {
      saveData(data);
    }
    return addedCount;
  },

  getStats(userId) {
    const data = loadData();
    const userFiles = data.files.filter(f => !f.userId || f.userId === userId);

    const stats = {
      totalFiles: userFiles.length,
      totalSize: 0,
      categories: {
        image: { count: 0, size: 0 },
        document: { count: 0, size: 0 },
        media: { count: 0, size: 0 },
        archive: { count: 0, size: 0 },
        other: { count: 0, size: 0 },
      },
      favoritesCount: 0,
    };

    for (const f of userFiles) {
      stats.totalSize += f.size || 0;
      if (f.isFavorite) stats.favoritesCount++;
      const cat = f.category || 'other';
      if (stats.categories[cat]) {
        stats.categories[cat].count++;
        stats.categories[cat].size += f.size || 0;
      } else {
        stats.categories.other.count++;
        stats.categories.other.size += f.size || 0;
      }
    }

    return stats;
  }
};
