
# 🌐 GatewayOS: Control Plane (Admin Dashboard)

![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=for-the-badge&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Upstash](https://img.shields.io/badge/Redis-Upstash-red?style=for-the-badge&logo=redis)
![Neon](https://img.shields.io/badge/Postgres-Neon-336791?style=for-the-badge&logo=postgresql)

GatewayOS is a high-performance, self-hosted API Gateway designed to manage, monitor, and protect your microservices. This repository houses the **Control Plane** — a beautifully designed Next.js Admin Dashboard used to configure routes, monitor traffic, and issue API keys. 

**[🔗 Live Demo: gatewayos.vercel.app](https://gatewayos.vercel.app)**



---

## ✨ Enterprise-Grade Features

*   **🚦 Interactive Pipeline Simulator:** A custom-built visual playground that allows developers to simulate requests through the gateway. Watch headers mutate, circuit breakers trip, and rate limiters engage in real-time before pushing configurations to production.
*   **🛡️ Dynamic Route Configuration:** Map incoming paths to upstream microservices on the fly. Configure prefix stripping, path rewriting, and HTTP method restrictions.
*   **🔌 Circuit Breaker Management:** Prevent cascading failures with configurable Open/Half-Open/Closed state machines. Set failure thresholds, sliding windows, and cooldown periods.
*   **🛑 Edge Rate Limiting:** Powered by Upstash Redis, configure sliding-window rate limits per route based on IP addresses, API keys, or custom headers.
*   **🔑 Zero-Trust Auth Enforcement:** Require standard JWTs or issue cryptographic API keys directly from the dashboard. The gateway handles validation and strips auth headers before forwarding to upstream services.
*   **📊 Real-Time Observability:** Dedicated logs viewer and health monitors to track request latency, status codes, and traffic spikes.

## 🏗️ The Architecture: Control Plane vs Data Plane
GatewayOS uses a decoupled architecture:
1.  **This Repository (Control Plane):** Built with Next.js App Router and React Server Components. It connects directly to the Neon Postgres database and Upstash Redis to push configuration changes and manage user state.
2.  **[Backend Repository] (Data Plane):** A lightning-fast Node.js/Express proxy deployed on Render that reads these configurations in real-time to route actual network traffic.

## 💻 Tech Stack
*   **Framework:** Next.js (App Router, Server Actions)
*   **Styling:** Tailwind CSS + Shadcn UI
*   **Authentication:** Better Auth (GitHub OAuth & Email/Password)
*   **Database ORM:** Prisma (connected to Neon Serverless Postgres)
*   **Caching & Rate Limiting:** Upstash Redis (REST API for serverless compatibility)
*   **Error Tracking:** Sentry

## 🚀 Local Development Setup

**1. Clone the repository**
```bash
git clone [https://github.com/yourusername/gatewayos-frontend.git](https://github.com/yourusername/gatewayos-frontend.git)
cd gatewayos-frontend
npm install
```

**2. Configure Environment Variables**
Create a `.env` file in the root directory:
```env
# Database & Cache
DATABASE_URL="postgresql://..."
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# Authentication (Better Auth)
BETTER_AUTH_SECRET="your-random-secret"
BETTER_AUTH_URL="http://localhost:3000"
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
EMAIL_USER="..."
EMAIL_APP_PASSWORD="..."

# Application Settings
NEXT_PUBLIC_APP_URL="http://localhost:3000"
GATEWAY_URL="http://localhost:3001" # URL of your local Data Plane proxy

# Error Tracking (Optional for local dev)
NEXT_PUBLIC_SENTRY_DSN="..."
SENTRY_DSN="..."
```

**3. Initialize the Database**
Sync the Prisma schema with your Neon database:
```bash
npx prisma db push
npx prisma generate
```

**4. Run the Development Server**
```bash
npm run dev
```
Visit `http://localhost:3000` to access the dashboard.

## 👨‍💻 Author
**Clinton Phillips**
*   **Portfolio:** [clintondevlab.netlify.app](https://clintondevlab.netlify.app/)
*   **LinkedIn:** [in/clinton-phillips-316a42250](https://www.linkedin.com/in/clinton-phillips-316a42250/)
*   **X / Twitter:** [@phillips464](https://x.com/phillips464)


