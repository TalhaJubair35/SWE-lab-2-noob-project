import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: Number(process.env.PORT || 4000),
  JWT_SECRET: process.env.JWT_SECRET || 'development-secret',
  DB_PATH: process.env.DB_PATH || './data/elearning.db',
};

export default env;
