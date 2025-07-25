import express, { Request, Response } from 'express';
import { generateVisitorId } from './services/fingerprintService';

// Explicitly type process
const nodeProcess: NodeJS.Process = process;

const app = express();
const port = nodeProcess.env.PORT || 3000;

app.use(express.json());

// Endpoint to get the fingerprint
app.get('/fingerprint', async (req: Request, res: Response) => {
  try {
    const fingerprintData = await generateVisitorId();
    res.json(fingerprintData);
  } catch (error) {
    console.error('Error generating fingerprint:', error);
    res.status(500).json({ error: 'Failed to generate fingerprint' });
  }
});

app.listen(port, () => {
  console.log(`Fingerprint service listening on port ${port}`);
});
