# ResumAI - AI-Powered Resume Builder

This is a Next.js starter project built in Firebase Studio. It uses AI to help you build, tailor, and improve your resume.

## Getting Started Locally

Follow these instructions to get the project running on your local machine for development and testing purposes.

### Prerequisites

Before you begin, ensure you have the following installed on your system:
- [Node.js](https://nodejs.org/) (version 20.x or later recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

### 1. Install Dependencies

Once you have downloaded and unzipped the project, navigate to the project's root directory in your terminal (you can use the integrated terminal in VS Code) and run the following command to install all the necessary packages:

```bash
npm install
```

### 2. Set Up Environment Variables

The application requires API keys and connection strings to function correctly.

1.  Create a new file named `.env` in the root of your project directory.
2.  Copy the content from the `.env.example` file (if it exists) or use the template below and paste it into your new `.env` file.
3.  Replace the placeholder values with your actual credentials.

```
# Firebase Configuration - From your Firebase project settings
NEXT_PUBLIC_FIREBASE_API_KEY="your_firebase_api_key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_firebase_auth_domain"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_firebase_project_id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your_firebase_storage_bucket"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your_firebase_messaging_sender_id"
NEXT_PUBLIC_FIREBASE_APP_ID="your_firebase_app_id"

# MongoDB Connection String - From your MongoDB Atlas dashboard
MONGODB_URI="your_mongodb_connection_string_here"
```
> **Note:** Your Google AI/Gemini API key is managed through the Firebase `apiKey`, so you don't need a separate `GOOGLE_API_KEY`.

### 3. Run the Development Servers

This project requires two separate development servers to be running at the same time: one for the Next.js web application and one for the Genkit AI flows.

**Terminal 1: Start the Web App**
In your first terminal, run the following command to start the main application:
```bash
npm run dev
```
This will typically start the app on `http://localhost:9002`.

**Terminal 2: Start the Genkit AI Server**
Open a second terminal (you can split the terminal in VS Code). Run this command to start the Genkit server, which handles all the AI functionality:
```bash
npm run genkit:dev
```
This will start the Genkit development UI, usually on `http://localhost:4000`, which you can use to inspect and test your AI flows.

### 4. Open The App

Once both servers are running without errors, you can open your browser and navigate to `http://localhost:9002` to see your application in action. All features, including the AI tools, should now be fully functional.
