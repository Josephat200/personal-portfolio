import express from 'express';
import path from 'node:path';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { siteRouter } from './routes/site';
import { adminRouter } from './routes/admin';
import { authRouter } from './routes/auth';

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: env.corsOrigins }));
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));

app.use('/api/site', siteRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);

const root = path.resolve(__dirname, '..', '..');
app.use('/public', express.static(path.join(root, 'public')));
app.use('/admin', express.static(path.join(root, 'admin')));
app.get('/', (_req, res) => res.sendFile(path.join(root, 'public', 'index.html')));

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(env.port, () => {
  console.log(`Server running at http://localhost:${env.port}`);
});
