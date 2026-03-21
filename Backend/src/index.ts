import express, { Request, Response } from 'express';
import cors from 'cors';
import standardRouter from './routes/route';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/', standardRouter);

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'EasyRice Backend is running using TypeScript' });
});

app.listen(PORT, () => {
    console.log(`Server listening strictly typed on port ${PORT}`);
});
