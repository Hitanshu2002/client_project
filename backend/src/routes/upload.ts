import { randomUUID } from 'crypto';
import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getAuthTokenFromRequest, verifyToken } from '../lib/auth';

const router = Router();

const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const uniqueName = `${randomUUID()}${ext}`;
    cb(null, uniqueName);
  },
});

const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Allowed: jpg, png, webp, gif`));
    }
  },
});

// POST /api/upload
router.post('/', (req: Request, res: Response) => {
  const token = getAuthTokenFromRequest(req);
  const user = token ? verifyToken(token) : null;
  if (!user || user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Unauthorized. Admin access required.' });
  }

  upload.array('files')(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size exceeds 5MB limit' });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    const urls = files.map((file) => `/uploads/${file.filename}`);
    return res.json({ urls, message: `${urls.length} file(s) uploaded successfully` });
  });
});

export default router;
