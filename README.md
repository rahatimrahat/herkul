# Herkul Fingerprint Service

A backend service that generates unique digital fingerprints for visitors using browser APIs and the FingerprintJS library. It collects various browser signals, calculates entropy, and sends this data to a configurable `BEACON_ENDPOINT`.

## Features

*   **Unique Fingerprint Generation**: Creates a unique identifier from browser and device characteristics.
*   **Entropy Calculation**: Calculates the Shannon entropy of the collected fingerprint data.
*   **Data Transmission**: Sends fingerprint data to a specified backend endpoint using `navigator.sendBeacon` or `fetch`.
*   **Express.js Backend**: Built with Express.js and TypeScript for efficient API serving.

## How to Run Locally

**Prerequisites:**
*   Node.js and npm installed.

**Steps:**
1.  Clone the repository:
    ```bash
    git clone https://github.com/rahatimrahat/herkul.git
    cd herkul
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  **Configure the Beacon Endpoint:**
    The service sends data to a `BEACON_ENDPOINT`. You need to set this as an environment variable. Create a `.env` file in the root directory with the following content:
    ```
    BEACON_ENDPOINT=YOUR_POSTGRES_DATA_INGESTION_API_ENDPOINT
    ```
    *Replace `YOUR_POSTGRES_DATA_INGESTION_API_ENDPOINT` with your actual endpoint.*

4.  Run the service in development mode (with hot-reloading):
    ```bash
    npm run dev
    ```
    This will start the server, typically on `http://localhost:3000`. You can then make requests to `/fingerprint` to test it.

5.  Run the service in production mode:
    ```bash
    npm start
    ```

## How it Works

This service utilizes the `@fingerprintjs/fingerprintjs` library to generate a unique visitor identifier. It collects a wide range of browser signals, including:
*   Canvas fingerprint
*   WebGL vendor and renderer
*   AudioContext processing
*   Screen properties (width, height, color depth)
*   Platform information (OS, vendor)
*   Hardware concurrency
*   Device memory
*   Browser languages
*   Timezone

These collected details are then processed to calculate their Shannon entropy, providing a measure of uniqueness. Finally, the aggregated fingerprint data, including the visitor ID, details, entropy, and confidence score, is sent to the configured `BEACON_ENDPOINT`.

## Running via Docker

**Prerequisites:**
*   Docker installed and running.

**Steps:**
1.  **Build the Docker image:**
    ```bash
    docker build -t herkul-fingerprint-service .
    ```
2.  **Run the Docker container:**
    You need to pass your `BEACON_ENDPOINT` as an environment variable.
    ```bash
    docker run -p 3000:3000 -e BEACON_ENDPOINT='YOUR_POSTGRES_DATA_INGESTION_API_ENDPOINT' herkul-fingerprint-service
    ```
    *Replace `YOUR_POSTGRES_DATA_INGESTION_API_ENDPOINT` with your actual endpoint.*
    The service will be accessible at `http://localhost:3000`.

## Deploying to Render Cloud (Free Tier)

Render is a cloud platform that makes it easy to deploy web services.

**Steps:**
1.  **Sign up or log in to Render:** Go to [render.com](https://render.com/) and create an account or log in.
2.  **Create a New Web Service:**
    *   From your Render dashboard, click "New +" and select "Web Service".
3.  **Connect Your Repository:**
    *   Connect your GitHub account and select the repository containing this project.
4.  **Configure Your Service:**
    *   **Name:** Give your service a name (e.g., `herkul-fingerprint`).
    *   **Region:** Choose a region closest to your users.
    *   **Branch:** Select the branch you want to deploy (e.g., `main` or `master`).
    *   **Build Command:** Enter `npm install` (or `npm ci` for a cleaner install if you have `package-lock.json`).
    *   **Start Command:** Enter `npm start`.
5.  **Add Environment Variables:**
    *   Under "Environment Variables", add a new variable:
        *   **Key:** `BEACON_ENDPOINT`
        *   **Value:** `YOUR_POSTGRES_DATA_INGESTION_API_ENDPOINT`
        *Replace `YOUR_POSTGRES_DATA_INGESTION_API_ENDPOINT` with your actual endpoint.*
6.  **Deploy:** Click the "Deploy Web Service" button.

Render will automatically build and deploy your service. Once deployed, your service will be available at a public URL.

## Components (Frontend - if applicable)

*   **`App`**: The main application component.
*   **`FingerprintDisplay`**: Displays the detailed fingerprint data.
*   **`EntropyVisualizer`**: Visualizes the entropy of the fingerprint.
*   **`Spinner`**: A loading spinner.
*   **`PrivacyModal`**: A modal that displays privacy and security information.

## Privacy and Security Considerations

Browser fingerprinting is a powerful technique that can be used to track users across different websites. While this service collects detailed browser signals, it's crucial to handle this data responsibly and transparently. Ensure compliance with privacy regulations (like GDPR, CCPA) and clearly inform users about data collection practices.

For more information on fingerprinting techniques and privacy, refer to the [FingerprintJS documentation](https://dev.fingerprint.com/docs).

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
