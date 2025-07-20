# AI-AudioInterviewer Frontend

## What is this?

AI-AudioInterviewer Frontend is a React and TypeScript single-page application that serves as the user interface for the AudioInterviewer platform. It allows users to:

* Log in and authenticate
* Input job descriptions
* Conduct and record mock interviews
* View and download past interview reports

The frontend communicates with a backend API (ASP.NET Core) and other services over HTTP.

---

## Features

* **React & TypeScript**: Strong typing and modular components
* **Redux Toolkit**: Centralized state management for interview data
* **React Router**: Client-side routing for multiple views
* **Axios**: API client with a configurable base URL
* **Jest & React Testing Library**: Unit and integration tests covering key flows
* **Docker & Docker Compose**: Containerized for easy deployment

---

## Directory Structure

```
AudioInterviewer-Frontend/
├── Dockerfile                # Docker image definition
├── docker-compose.yml        # Compose setup for multi-container dev
├── public/                   # Static files
│   ├── index.html            # Main HTML
│   ├── favicon.ico
│   ├── logo192.png
│   └── robots.txt
├── src/                      # Application source code
│   ├── api/                  # Axios instance (baseURL configuration)
│   │   └── index.ts
│   ├── assets/               # Images and static assets (e.g., bg.png)
│   ├── auth/                 # Authentication components and routes
│   │   ├── Login.tsx
│   │   └── ProtectedRoute.tsx
│   ├── components/           # UI components
│   │   ├── Navbar.tsx
│   │   ├── JDInput.tsx
│   │   ├── Interview.tsx
│   │   ├── Report.tsx
│   │   ├── PastReports.tsx
│   │   └── ReportDetails.tsx
│   ├── redux/                # Redux Toolkit slices and store
│   │   ├── interviewSlice.ts
│   │   └── store.ts
│   ├── types/                # Type declarations
│   │   └── html2pdf.d.ts
│   ├── tests/                # Unit and integration tests
│   │   └── *.test.tsx
│   ├── App.tsx               # Root component and routes
│   ├── index.tsx             # App entry point
│   ├── setupTests.ts         # Jest setup
│   └── reportWebVitals.ts    # Performance metrics
└── package.json              # NPM scripts and dependencies
```

---

## Prerequisites
* **React** 
* **npm** 
* **Docker**

### Installation

1. Clone this repository:

   ```bash
   git clone <https://github.com/Saubhik998/Interview-Project-Frontend>
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

### Running Locally

To start the development server:

```bash
npm start
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Running Tests

Execute the test suite with:

```bash
npm test

```

This runs Jest in watch mode and reports on code coverage.

---

## Docker

### Build and Run with Docker

1. Build the Docker image:

   ```bash
   docker build -t audio-interviewer-frontend .
   ```

2. Run a container:

   ```bash
   docker run -p 3000:80 audio-interviewer-frontend
   ```

This serves the production build on port 3000.

### Using Docker Compose

A `docker-compose.yml` is provided for an integrated dev setup:

```bash
docker-compose up --build
```

This command spins up the frontend container (and any linked services defined).

---

## How It Works

1. **Authentication**: Users log in via `auth/Login.tsx`. Protected routes use `ProtectedRoute.tsx`.
2. **Job Description Input**: `JDInput.tsx` captures a description, triggering an interview session.
3. **Interview Flow**: `Interview.tsx` handles recording audio, sending it to the backend, and updating state via Redux.
4. **Report Generation**: After completion, `Report.tsx` renders results; past reports live in `PastReports.tsx`.
5. **State Management**: Redux slice in `redux/interviewSlice.ts` tracks questions, answers, and scores.

---


