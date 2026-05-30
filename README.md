# AutoPaise

AutoPaise is a full-stack UPI AutoPay mandate management platform with a React frontend and Node.js backend.

## Project Structure

```text
AutoPaise/
├── frontend/   # React + Vite app
├── backend/    # Node.js + Express API
├── package.json
├── .gitignore
└── README.md
```

## Setup

Install dependencies for both apps:

```bash
npm run install:all
```

Create environment files locally as needed:

```text
frontend/.env
backend/.env
```

Do not commit `.env` files.

## Development

Run frontend and backend together:

```bash
npm run dev
```

Run only the frontend:

```bash
npm run frontend
```

Run only the backend:

```bash
npm run backend
```
