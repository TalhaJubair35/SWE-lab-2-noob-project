import app from './app.js';
import { env } from './config/env.js';
import './db/connection.js';

const port = env.PORT;

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
