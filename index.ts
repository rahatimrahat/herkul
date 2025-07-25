import express, { Request, Response } from 'express';

// Explicitly type process
const nodeProcess: NodeJS.Process = process;

const app = express();
const port = nodeProcess.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Endpoint to receive fingerprint data from the client
app.post('/api/fingerprint', async (req: Request, res: Response) => {
  try {
    const fingerprintData = req.body; // Assuming the client sends fingerprint data in the body
    console.log('Received fingerprint data:', fingerprintData);

    // Here you can process the fingerprintData, e.g., save it to a database.
    // For now, we'll just log it and send a success response.

    res.status(200).json({ message: 'Fingerprint data received successfully' });
  } catch (error) {
    console.error('Error receiving fingerprint data:', error);
    res.status(500).json({ error: 'Failed to receive fingerprint data' });
  }
});

app.listen(port, () => {
  console.log(`Fingerprint API listening on port ${port}`);
});
