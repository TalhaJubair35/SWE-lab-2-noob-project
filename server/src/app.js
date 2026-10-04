import express from 'express';
import cors from 'cors';
import authRouter from './modules/auth/auth.routes.js';
import coursesRouter from './modules/courses/courses.routes.js';
import learningRouter from './modules/learning/learning.routes.js';
import errorHandler from './common/middleware/errorHandler.js';
import AppError from './common/AppError.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, status: 'healthy' });
});

app.use('/api/auth', authRouter);
app.use('/api/courses', coursesRouter);
app.use('/api', learningRouter);

app.use((req, res, next) => {
  next(new AppError(404, 'Route not found'));
});

app.use(errorHandler);

export default app;
