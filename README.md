# EasyRice Inspection Platform

A modern web application for inspecting, analyzing, and grading rice grain compositions based on standards. Built with a React frontend and an Express/TypeScript backend connected to a PostgreSQL database.

## Architecture & Tech Stack

**Frontend**
- **React 18** (Vite)
- **TypeScript**
- **Tailwind CSS** (for styling)
- **React Router** (for navigation)
- **Lucide React** (for icons)

**Backend**
- **Node.js + Express**
- **TypeScript**
- **Prisma ORM** (Database interaction)
- **Multer** (For handling file uploads, images, and JSON standard data files)

**Database & Infrastructure**
- **PostgreSQL 15**
- **Docker & Docker Compose** (Containerization of the 3-tier architecture)

---

## Prerequisites

- **Docker** and **Docker Compose** installed on your machine.
- (Optional) Node.js 18+ if you want to run the frontend or backend locally outside of Docker.

---

## Quick Start (with Docker)

The easiest way to run the entire stack (Frontend, Backend, and Database) is using Docker Compose.

### 1. Configure Environment Variables

1. Copy `.env.example` (or create a new `.env` file in the root directory):
   ```bash
   touch .env
   ```
2. Add the following environment variables to the root `.env` file:
   ```env
   # Frontend API target
   API_URL=http://localhost:3000

   # Postgres Database Credentials
   POSTGRES_USER=easyrice
   POSTGRES_PASSWORD=password123
   POSTGRES_DB=easyrice_db
   
   # Prisma Connection String for the Backend container
   DATABASE_URL=postgresql://easyrice:password123@database:5432/easyrice_db?schema=public
   ```

### 2. Start the Application

Run the following command in the root directory:

```bash
docker-compose up --build -d
```

This will spin up three containers:
- **`database`**: PostgreSQL database exposed on port `5433` locally.
- **`backend`**: Express API running on `http://localhost:3000`. Inside, Prisma will automatically generate the client and connect to the DB.
- **`frontend`**: React Vite application running on `http://localhost:5173`.

### 3. Access the Application
Open your browser and navigate to:

👉 **[http://localhost:5173](http://localhost:5173)**

---

## Local Development (Without Docker for Node services)

If you prefer to run the Node services directly on your host machine while keeping PostgreSQL in Docker:

1. **Start only the database**:
   ```bash
   docker-compose up database -d
   ```

2. **Backend Setup**:
   ```bash
   cd Backend
   npm install
   
   # Create a local .env for Prisma pointing to exposed localhost port 5433
   echo 'DATABASE_URL="postgresql://easyrice:password123@localhost:5433/easyrice_db?schema=public"' > .env
   
   # Sync Database schema
   npx prisma generate
   npx prisma db push
   
   # Run Dev Server
   npm run dev
   ```

3. **Frontend Setup**:
   ```bash
   cd Frontend
   npm install
   
   # Create frontend .env pointing to local backend
   echo "VITE_API_URL=http://localhost:3000" > .env
   
   # Run Vite Dev Server
   npm run dev
   ```

## Application Features
- **Dashboard**: View all past inspections with real-time filtering and pagination.
- **Upload Form**: Submit new rice sample data, select grading standards, and attach images.
- **Result & Grading View**: Dynamically calculates the weight and count percentages of different rice grades (Whole grain, Broken, Defect) against the selected specific standards.
- **Edit Records**: Append notes, prices, or modify sampling metadata for past inspections.
