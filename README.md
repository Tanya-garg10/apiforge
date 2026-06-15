# ⚡ APIForge Pro Platinum

[![React](https://img.shields.io/badge/React-19.0-blue?style=for-the-badge&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=for-the-badge&logo=vite)](https://vite.dev)
[![Express](https://img.shields.io/badge/Express-4.21-000000?style=for-the-badge&logo=express)](https://expressjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)

An elite 72-Hour REST API Playground & out-of-the-box sandbox designed for hackathons.
It acts as a secure, CORS-free outbound proxy console with multi-origin orchestration, environment configurations, and automatic code exporter generators.

---

## 🔗 Live Demo Links

*   **Frontend Client (Vercel):** [https://apiforge-client.vercel.app](https://apiforge-client.vercel.app) *(Placeholder)*
*   **Backend Proxy Service (Render):** [https://apiforge-proxy.onrender.com](https://apiforge-proxy.onrender.com) *(Placeholder)*

---

## 🌟 Key Features

*   **💎 CORS-Free Proxy Engine:** Bypass strict browser Cross-Origin Resource Sharing (CORS) limits programmatically on both JSON responses and binary/media streams.
*   **⚙️ Multi-Suite Environment Variables:** Establish multiple environments (Dev, Staging, Production) with dynamic macro replacements like `{{baseUrl}}` inside query parameters, URLs, and headers.
*   **🛠️ Headers, Params, & Auth Deskers:** First-class visual builders for complex query parameters, customs HTTP Header tables, and deep Authentication flows (Bearer Token, Basic Auth, and API Keys).
*   **📜 Auto-cURL Exporter:** Instant source code code-generation supporting standard cURL command scripts, Javascript `fetch` blocks, and Python `requests` modules on-the-fly.
*   **📂 Saved Folder Collections:** Group and preserve active requests within custom folders, support collection export/import structures via JSON blobs.
*   **🔁 URL State Shareability:** Encapsulate entire request configurations—including current method, params, headers, and payload bodies—into a shareable URL query string.
*   **🕰️ 50-Item Local History Suite:** Persistent database history preserving the last 50 executed HTTP responses with fast loading capability and search matching.

---

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

---

## 📊 Deployment Architectures

### 💻 Frontend Deployment (Vercel)

APIForge's React SPA deploys automatically on Vercel using the preconfigured `/vercel.json` rewrite file:

1. Connect your repository to Vercel.
2. Configure **Framework Preset** as `Vite`.
3. Set the following environment variable under settings:
   * `VITE_API_URL`: `https://your-backend-service.onrender.com` (Point to your Render deployment URL).
4. Hit **Deploy**.

### ⚙️ Backend Deployment (Render)

Deploy the CORS-free Proxy Engine dynamically on Render's free tier as a web-service using the `/render.yaml` template:

1. Go to **Render Dashboard** and select **Blueprints**.
2. Connect your Git repository. Render will automatically parse `/render.yaml` to configure deployment properties.
3. Supply values for the prompt keys (such as `GEMINI_API_KEY`).
4. Click **Deploy**.

---

## 🎙️ Hackathon 3-Minute Demo Script

Follow this precise script to wow judges with a flawless, high-impact demonstration.

### ⏱️ Minute 1: The Out-of-the-Box CORS Bypasser (GET)
*   **Goal:** Demonstrate beautiful UI and effortless CORS-free request execution.
*   **Action:** 
    1. Click on the **Presets** sidebar tab.
    2. Click on the **Get Mock Todo** preset.
    3. Point to the URL bar (`https://jsonplaceholder.typicode.com/todos/1`).
    4. Hit **Send** (or **Execute**).
    5. Show the immediate visual reaction panel: the color-coded HTTP Status (`200 OK`), response duration (`110 ms`), and VS Code-style color tokenized JSON payload response block.
    6. *Judge Highlight:* *"We bypass browser CORS issues using our secure outbound intermediate node, giving users smooth access to any public endpoint."*

### ⏱️ Minute 2: Advanced Content Engine & Request Folders (POST)
*   **Goal:** Show robust authentication builders, body JSON formatting, and storage portfolios.
*   **Action:**
    1. Select **POST** verb from the dropdown selector.
    2. Click on the **Body** sub-tab and enter custom raw JSON (e.g., `{"title": "Submit Hackathon", "userId": 1}`).
    3. Click the **Format JSON** helper button to instantly align indentation.
    4. Click the **Headers** sub-tab and verify the default `Content-Type: application/json` is active.
    5. Click the **Auth Settings** tab, select **API Key Credentials**, specify `x-api-key`, and enter a dummy password key.
    6. Hit **Send** to prove the backend executes custom headers and queries synchronously.
    7. Under the **Request Label** heading, name the task `"Create Sandbox Record"`, pick folder `"API Workbench"`, and hit **Save to Folder**. Show it organized inside the **Collections** sidebar panel.

### ⏱️ Minute 3: Code Exporters, Local History, and Instant Link Sharing
*   **Goal:** Highlight real-world developer productivity tools.
*   **Action:**
    1. Point to the lower-right **cURL Generator** block.
    2. Toggle between **cURL**, **Fetch**, and **Python** to show the query string, custom headers, API auth credentials, and JSON payload body formatting correctly compiled in real-time.
    3. Click **Copy Equivalent cURL** to show immediate micro-feedback checkmark state.
    4. Click the **History** sidebar tab to show previous queries persisted cleanly across sessions.
    5. Finally, click the **Share Request** action button at the top header. 
    6. *Judge Highlight:* *"With our base64 config serialization, clicking Share Request encodes the complete multi-tab layout, query params, and payload state into a single link. Sharing it with teammates recreates the exact workspace state. Perfect for collaborative hackathon engineering."*

---

Generated with 💖 by the **APIForge Team**. Good luck on your Hackathon presentation! 🚀
