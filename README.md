# Portfolio
## Next.js, Firebase, and Genkit Starter Project

This is a comprehensive starter project built with [Next.js](https://nextjs.org/), a popular React framework, and integrated with [Firebase](https://firebase.google.com/) for backend services and [Genkit](https://firebase.google.com/docs/genkit) for AI-powered features.

This starter provides a solid foundation for building modern, scalable web applications with a rich set of pre-configured tools and libraries.

## Features

*   **Framework:** [Next.js](https://nextjs.org/) 15 with Turbopack for fast development.
*   **Dashboard:** An analytics dashboard to monitor website traffic and user interactions, built with components from `shadcn/ui`.
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) for a utility-first CSS workflow.
*   **UI Components:** A rich set of accessible and customizable UI components from [Radix UI](https://www.radix-ui.com/) and `shadcn/ui`.
*   **Backend:** [Firebase](https://firebase.google.com/) integration for services like authentication, database, and hosting.
*   **AI:** [Genkit](https://firebase.google.com/docs/genkit) for building and managing AI-powered features.
*   **Authentication:** [NextAuth.js](https://next-auth.js.org/) for robust authentication solutions.
*   **Forms:** [React Hook Form](https://react-hook-form.com/) and [Zod](https://zod.dev/) for type-safe form validation.
*   **Linting & Formatting:** Pre-configured with ESLint and Prettier for code quality and consistency.

## Dashboard

This project includes a comprehensive analytics dashboard that provides insights into website traffic and user behavior. The dashboard is built with `shadcn/ui` components and features a responsive design for optimal viewing on any device.

Key features of the dashboard include:

*   **Real-time Analytics:** Monitor website activity as it happens.
*   **User Insights:** Gain a deeper understanding of your audience with detailed user data.
*   **Customizable Widgets:** Tailor the dashboard to your specific needs with a variety of widgets and charts.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   Node.js (v20 or later)
*   npm or another package manager

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root of your project and add your Firebase configuration and other environment-specific keys.

    ```
    NEXT_PUBLIC_FIREBASE_API_KEY=...
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
    NEXT_PUBLIC_FIREBASE_APP_ID=...
    ```

## Available Scripts

In the project directory, you can run the following commands:

*   `npm run dev`
    Runs the app in development mode with Turbopack. Open [http://localhost:9002](http://localhost:9002) to view it in the browser.

*   `npm run build`
    Builds the app for production to the `.next` folder.

*   `npm run start`
    Starts a Next.js production server.

*   `npm run lint`
    Lints the project files using Next.js' built-in ESLint configuration.

*   `npm run genkit:dev`
    Starts the Genkit development server to work with your AI flows.

## Deployment

This project is configured for easy deployment to [Firebase Hosting](https://firebase.google.com/docs/hosting). The `apphosting.yaml` file contains the necessary configuration for deploying the Next.js application.
