# Client Fingerprint Pro

An advanced client-side identifier generator using high-entropy browser signals for unique visitor analytics.

## Features

*   **Unique Fingerprint Generation**: Creates a unique identifier from browser and device characteristics.
*   **Entropy Visualization**: Visualizes the entropy of the generated fingerprint.
*   **Detailed Fingerprint Data**: Displays the raw data used to generate the fingerprint.
*   **Privacy Information**: Provides information about the privacy and security implications of browser fingerprinting.

## How to Install and Run

1.  Clone the repository:
    ```bash
    git clone https://github.com/xxxxx
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```
3.  Run the application:
    ```bash
    npm run dev
    ```

## How it Works

This application uses the [@fingerprintjs/fingerprintjs](https://github.com/fingerprintjs/fingerprintjs) library to generate a unique visitor identifier. The library collects various browser signals, such as user agent, screen resolution, and installed fonts, and then uses a hashing function to create a unique fingerprint.

The application then displays the fingerprint and a visualization of its entropy. Entropy is a measure of the uniqueness of the fingerprint. A higher entropy value means a more unique fingerprint.

## Components

The application is built with React and TypeScript and consists of the following components:

*   **`App`**: The main application component.
*   **`FingerprintDisplay`**: Displays the detailed fingerprint data.
*   **`EntropyVisualizer`**: Visualizes the entropy of the fingerprint.
*   **`Spinner`**: A loading spinner.
*   **`PrivacyModal`**: A modal that displays privacy and security information.

## Privacy and Security

Browser fingerprinting is a powerful technique that can be used to track users across different websites. While this application is designed for educational purposes, it is important to be aware of the privacy and security implications of browser fingerprinting.

For more information, please refer to the [FingerprintJS documentation](https://dev.fingerprint.com/docs).

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
