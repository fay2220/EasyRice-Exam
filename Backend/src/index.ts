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

// Temporary in-memory storage
const historyData: any[] = [];

app.get('/history', (req: Request, res: Response) => {
  // Return the history
  res.json(historyData);
});

app.post('/history', (req: Request, res: Response) => {
  console.log("Received new inspection payload");

  // Since frontend sends FormData via multer, we would parse it here.
  // For now, we simulate adding an item to history so the Home page updates!
  const newItem = {
    rawId: `INS-${Date.now().toString().slice(-6)}`,
    createDate: new Date().toLocaleDateString('en-GB') + ' - ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    rawDate: Date.now(),
    name: 'New Uploaded Inspection',
    standard: 'Quality Standard A',
    note: 'Added from Form',
  };

  historyData.unshift(newItem); // Add to the top
  res.status(200).json({ success: true, message: "Inspection saved successfully" });
});

app.listen(PORT, () => {
  console.log(`Server listening strictly typed on port ${PORT}`);
});
