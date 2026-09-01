# MachoPulse 🚀

MachoPulse is a full-stack, real-time system uptime and health monitoring application. It tracks websites, APIs, and backend services, providing live status updates, telemetry audit logs, and response latency charts.

## 🛠️ Tech Stack

* **Frontend:** React, Tailwind CSS, Recharts, React Query
* **Backend:** Spring Boot, Java, REST APIs
* **Infrastructure:** Docker & Docker Compose (Monorepo architecture)

---

## ✨ Features

* **Real-Time Uptime Tracking:** Automatically checks website and service availability with smart, adaptive polling intervals.
* **Live Status Badges:** Visual indicators for Online, Offline, and Checking states.
* **Telemetry & History:** Audit log tables tracking historical status changes and response events.
* **Latency Visualizer:** Interactive charts mapping out response time trends using Recharts.

---

## 🚀 Getting Started (Quick Start with Docker)

The easiest way to run MachoPulse locally is using Docker Compose, which spins up both the React frontend and the Spring Boot backend simultaneously.

### Prerequisites
* [Docker](https://www.docker.com/) installed on your machine.
* [Docker Compose](https://docs.docker.com/compose/) (usually bundled with Docker Desktop).

### Setup & Run

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ChrisLukova/machopulse.git
   cd machopulse 
2. **Configure Environment Variables:**
   Copy the example environment file to create your local `.env`:
   ```bash
   cp .env.example .env 

3. **Build and Run Containers:**
   ```bash
   docker compose up --build 

4. **Project Structure:**
   ```text
   Machopulse/
   ├── machopulse-frontend/         # React + Vite / Tailwind client app
   ├── machopulse-backend/          # Spring Boot Java application
   ├── docker-compose.yml# Container orchestration configuration
   └── .env.example      # Example environment variable configuration

5. **License:**
This project is open-source and available for personal or portfolio use.
