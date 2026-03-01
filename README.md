# OT-Dashboard - Project Control Plane

A central dashboard to manage your applications, API configurations, and access control.

## Project Structure

- **server/**: Express.js backend with MongoDB.
- **client/**: React + Vite frontend with Tailwind CSS.

## Prerequisites

- Node.js (v18+)
- MongoDB (running locally or URI provided)

## Setup

1. **Backend**

   ```bash
   cd server
   npm install
   # Create .env file with MONGODB_URI if needed (defaults to local)
   npm start
   ```

   Server runs on http://localhost:5000

2. **Frontend**
   ```bash
   cd client
   npm install
   npm run dev
   ```
   Client runs on http://localhost:5173

## Features

- **Projects**: Create and manage multiple projects.
- **Config**: Environment-specific key-value configurations (Prod/Staging/Dev).
- **Versions**: Manage min/max versions and force updates.
- **Access Control**: Block specific Versions, IPs, or Instance IDs.
- **Instances**: View active instances and their metadata.

## API Endpoints

### Public

- `GET /v1/config/:publicId?env=prod&version=1.0.0`: Fetch config for a project.
- `POST /v1/heartbeat/:publicId`: Report instance activity.

### Management (Internal)

- `GET /api/projects`: List projects.
- `POST /api/projects`: Create project.
- ...and more.

## Tech Stack

- Express, Mongoose, React, Tailwind, Lucide Icons.
