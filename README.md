#  Audio-Based Interviewer (Frontend)

This is the **frontend-only** implementation of an audio-based interviewer web application. The app simulates a job interview by asking questions using Text-to-Speech, records audio responses, transcribes them using Speech-to-Text, and generates a report with both audio and transcripted answers.

---

##  Features

-  Job Description (JD) input screen
-  Interview screen with:
  - Text-to-Speech (TTS) for questions
  - Automatic microphone recording
  - Live countdown timer
  - Speaking & recording animations
  - Speech-to-Text (STT) transcription
-  Final Report view with:
  - JD
  - Questions
  - Audio answers
  - Transcripts

---

##  Tech Stack

- **React** (w/ TypeScript)
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Web APIs**:
  - `speechSynthesis` for TTS
  - `webkitSpeechRecognition` for STT
- **CSS Modules** for styling
- **Jest** + **React Testing Library** for unit & integration tests

---

##  Running Tests

```bash
npm install
npm test
````

To view code coverage:

```bash
npm test -- --coverage
```

---

##  Docker Support

To build the frontend Docker image:

```bash
docker build -t audio-interviewer-frontend .
```

To run the container:

```bash
docker run -p 3000:3000 audio-interviewer-frontend
```

> The app will be available at [http://localhost:3000](http://localhost:3000)

---

##  CI - GitHub Actions

A GitHub Actions workflow (`.github/workflows/frontend-ci.yml`) runs on every push or pull request to `main`:

* Lints and builds the app
* Installs dependencies
* Runs all tests

---

## Folder Structure

```
src/
├── components/           # JDInput, Interview, Report components
├── redux/                # interviewSlice + store setup
├── tests/                # Unit/integration tests
├── App.tsx               # Routing logic
├── index.tsx             # Entry point
```

---

##  Notes

* This is a **frontend-only implementation**.
* All data is currently managed in the Redux store.


---

