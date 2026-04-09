import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileRouter } from './controllers/fileController.js';
import { FileService } from './services/fileService.js';
import { getDirname } from './utils/dirname.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';

dotenv.config();

const app = express();
const fileService = new FileService();

const __dirname = getDirname(import.meta.url);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

async function main() {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/', (req, res) => {
    const files = fileService.getFilesWithMetadata();
    res.render('index', { files, title: 'File Upload Service' });
  });

  app.use('/files', fileRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  const PORT = process.env.PORT || 3009;

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

main();
