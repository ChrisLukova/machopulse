# MachoPulse

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen?style=flat-square)](https://machopulse-frontend.onrender.com)
[![React](https://img.shields.io/badge/Frontend-React%20%2F%20Tailwind-blue?style=flat-square)](https://react.dev/)
[![Spring Boot](https://img.shields.io/badge/Backend-Spring%20Boot-brightgreen?style=flat-square)](https://spring.io/projects/spring-boot)

MachoPulse is a full-stack, real-time system uptime and health monitoring application. It tracks websites, APIs, and backend services, providing live status updates, telemetry audit logs, and response latency charts.

> **[Check out the Live Demo Here](https://machopulse-frontend.onrender.com)**

## Tech Stack

* **Frontend:** React, Tailwind CSS, Recharts, React Query
* **Backend:** Spring Boot, Java, REST APIs
* **Infrastructure:** Docker & Docker Compose (Monorepo architecture)

---

## Features

* **Real-Time Uptime Tracking:** Automatically checks website and service availability with smart, adaptive polling intervals.
* **Live Status Badges:** Visual indicators for Online, Offline, and Checking states.
* **Telemetry & History:** Audit log tables tracking historical status changes and response events.
* **Latency Visualizer:** Interactive charts mapping out response time trends using Recharts.

---

## Engineering & Architecture Highlights

* **Adaptive Polling Engine:** Implemented smart polling via TanStack Query—switching dynamically from aggressive 2-second polls during active checks down to 30-second back-off polling when systems are stable, preventing unnecessary server overhead.
* **Dual-Layer Cache Synchronization:** Features an immediate UI optimistic update combined with a 1.5-second delayed safety-net refetch to flawlessly sync client state with asynchronous backend pings.
* **Background Tab Optimization:** Prevents background bandwidth hammering by disabling refetching when browser tabs are inactive (`refetchIntervalInBackground: false`).
* **Resilient Diagnostics & Defensive Design:** Built-in UTC parsing (`parseUtcDate`) to prevent timezone shifts, isolated error states per component, and input normalization/sanitization.
* **Dockerized Monorepo:** Orchestrated Spring Boot backend and React frontend services using Docker Compose for seamless single-command local development and production setup.

---

## Getting Started (Quick Start with Docker)

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
   ├── docker-compose.yml           # Container orchestration configuration
   └── .env.example                 # Example environment variable configuration

5. **License:**
This project is open-source and available for personal or portfolio use.
