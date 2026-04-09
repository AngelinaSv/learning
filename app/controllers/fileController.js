import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import AppError from '../errors/appError.js';
import { FileService } from '../services/fileService.js';
import { ERROR_MESSAGES, ERROR_CODES } from '../constants/errors/file.errors.js';
import { MESSAGES } from '../constants/file.constants.js';
import { MIME_TYPES } from '../constants/mimeTypes.js';
import { validateQuota } from '../middlewares/validateQuota.js';
import { decodeIdParam } from '../middlewares/decodeIdParam.js';

const router = Router();
const fileService = new FileService();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, fileService.STORAGE);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

router.get('/quota', (req, res) => {
  res.json({ quota: fileService.getQuota(), used: fileService.getTotalSize() });
});

router.post('/quota', validateQuota, (req, res, next) => {
  const { quota } = req.body;
  const newQuota = fileService.setQuota(quota);
  if (newQuota === null) {
    throw new AppError(ERROR_MESSAGES.INVALID_QUOTA, 400);
  }
  res.json({ quota: newQuota });
});

router.get('/', (req, res) => {
  const files = fileService.getFilesWithMetadata();
  res.json({ files });
});

router.get('/:id', decodeIdParam, (req, res) => {
  const id = req.params.id;
  
  if (!fileService.checkFileExists(id)) {
    throw new AppError(ERROR_MESSAGES.FILE_NOT_FOUND, 404, ERROR_CODES.FILE_NOT_FOUND);
  }
  const stream = fileService.getFileStream(id);
  const ext = path.extname(id).toLowerCase();

  res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
  stream.pipe(res);
});

router.get('/:id/status', decodeIdParam, (req, res) => {
  const id = req.params.id;
  if (!fileService.checkFileExists(id)) {
    throw new AppError(ERROR_MESSAGES.FILE_NOT_FOUND, 404, ERROR_CODES.FILE_NOT_FOUND);
  }
  res.json({ status: fileService.getStatus(id) });
});

router.delete('/:id', decodeIdParam, (req, res) => {
  const id = req.params.id;
  if (!fileService.checkFileExists(id)) {
    throw new AppError(ERROR_MESSAGES.FILE_NOT_FOUND, 404, ERROR_CODES.FILE_NOT_FOUND);
  }
  fileService.deleteFile(id);
  res.status(204).send();
});

router.post('/', upload.single('file'), (req, res, next) => {
  if (!req.file) {
    throw new AppError(ERROR_MESSAGES.INVALID_FILE_ID, 400, ERROR_CODES.INVALID_FILE_ID);
  }

  const quotaCheck = fileService.checkQuota(req.file.originalname, req.file.size);
  if (!quotaCheck.allowed) {
    fileService.deleteFile(req.file.originalname);
    throw new AppError(ERROR_MESSAGES.QUOTA_EXCEEDED, 413, ERROR_CODES.QUOTA_EXCEEDED);
  }

  res.status(200).json({ message: MESSAGES.FILE_UPLOADED });
});

export const fileRouter = router;
