# ⚡ APIForge Pro Platinum

[![React](https://img.shields.io/badge/React-19.0-blue?style=for-the-badge&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=for-the-badge&logo=vite)](https://vite.dev)
[![Express](https://img.shields.io/badge/Express-4.21-000000?style=for-the-badge&logo=express)](https://expressjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)

An elite 72-Hour REST API Playground & out-of-the-box sandbox designed for hackathons.
It acts as a secure, CORS-free outbound proxy console with multi-origin orchestration, environment configurations, and automatic code exporter generators.

## 🌟 Key Features

*   **💎 CORS-Free Proxy Engine:** Bypass strict browser Cross-Origin Resource Sharing (CORS) limits programmatically on both JSON responses and binary/media streams.
*   **⚙️ Multi-Suite Environment Variables:** Establish multiple environments (Dev, Staging, Production) with dynamic macro replacements like `{{baseUrl}}` inside query parameters, URLs, and headers.
*   **🛠️ Headers, Params, & Auth Deskers:** First-class visual builders for complex query parameters, customs HTTP Header tables, and deep Authentication flows (Bearer Token, Basic Auth, and API Keys).
*   **📜 Auto-cURL Exporter:** Instant source code code-generation supporting standard cURL command scripts, Javascript `fetch` blocks, and Python `requests` modules on-the-fly.
*   **📂 Saved Folder Collections:** Group and preserve active requests within custom folders, support collection export/import structures via JSON blobs.
*   **🔁 URL State Shareability:** Encapsulate entire request configurations—including current method, params, headers, and payload bodies—into a shareable URL query string.
*   **🕰️ 50-Item Local History Suite:** Persistent database history preserving the last 50 executed HTTP responses with fast loading capability and search matching.

## 🚀 Local Installation & Setup

Get APIForge up and running locally in under 60 seconds.

### Prerequisites

*   **Node.js** v20+ or newer
*   **npm** v10+

### Steps

1.  **Clone & Enter Repository:**
    ```bash
    git clone https://github.com/your-username/apiforge.git
    cd apiforge
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Duplicate the sample environment configurations and customize:
    ```bash
    cp .env.example .env
    ```
    *Open `.env` and specify `VITE_API_URL` to point to your live running backend server (leave empty in local matching development defaults).*

4.  **Run Development Mode:**
    Launch the fullstack development server natively in the local workspace:
    ```bash
    npm run dev
    ```
    *The console will open at `http://localhost:3000` executing both Vite client compilation and Node.js proxy server concurrently.*

5.  **Build and Compile for Production:**
    ```bash
    npm run build
    npm start
    ```

# 🔮 Future Improvements & Product Roadmap

To scale APIForge Pro Platinum into a production-ready enterprise suite post-hackathon, we have planned the following feature integrations:

*   **🔌 GraphQL & WebSocket streams:** Visual query builders for GraphQL endpoints and interactive socket listener panels with frame-by-frame binary logs.
*   **🧠 AI-Powered Request Auto-Compiling:** Native Gemini SDK integration allowing developers to describe their goals in plain English (e.g., *"Authenticate and fetch paginated users from GitHub"*) and automatically generate the parameters, headers, and authentication blocks.
*   **🩺 Scripted Test Assertions:** A sandbox test runner permitting developers to write synchronous post-request assertions (e.g., `expect(response.status).toBe(200)`) to validate live reactions.
*   **👥 Real-Time Workspace Sync:** Shared multi-user rooms utilizing background synchronization to collaborate in real-time on query parameters and response payloads.
*   **📁 Instant Mock Server Deployments:** One-click generation of mock response servers returning saved JSON collections with adjustable mock latency.

Made with 💖 by the **APIForge Team**
