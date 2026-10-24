import express, { type Express, type Request, type Response } from 'express';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './infrastructure/auth/better-auth.ts';

const app: Express = express();
const port = process.env.PORT || 3000;
app.get('/', (req: Request, res: Response) => {
  res.send({
    up: true,
    message: 'Server is running 3',
  });
});

app.use(express.json());

app.use('/api/auth', toNodeHandler(auth));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
