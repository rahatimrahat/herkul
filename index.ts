import express from 'express';
import { generateVisitorId } from './services/fingerprintService'; // Assuming fingerprintService.ts is in services/

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Endpoint to get the fingerprint
app.get('/fingerprint', async (req, res) => {
  try {
    const fingerprintData = await generateVisitorId();
    res.json(fingerprintData);
  } catch (error) {
    console.error('Error generating fingerprint:', error);
    res.status(500).json({ error: 'Failed to generate fingerprint' });
  }
});

// The BEACON_ENDPOINT is configured in fingerprintService.ts.
// It's important that this endpoint is correctly set for the service to send data.
// The user will need to ensure this is set appropriately when running the Docker container.
// For example, via an environment variable passed to the container.

app.listen(port, () => {
  console.log(`Fingerprint service listening on port ${port}`);
  // Log the beacon endpoint for clarity, though it's defined within the service file.
  // console.log(`Beacon endpoint configured as: ${process.env.BEACON_ENDPOINT || 'YOUR_POSTGRES_DATA_INGESTION_API_ENDPOINT'}`);
});
