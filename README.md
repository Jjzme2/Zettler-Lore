# Zettler Lore

A Nuxt 3 application for managing and viewing a creative writing library. It features a rich content management system for stories, poems, and world-building elements, integrated with Firebase for backend services and Stripe for memberships.

## Tech Stack

*   **Framework:** [Nuxt 3](https://nuxt.com/) (Vue 3)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Backend & Database:** [Firebase](https://firebase.google.com/) (Firestore, Auth, Admin SDK)
*   **Payments:** [Stripe](https://stripe.com/)
*   **AI:** [Google Gemini](https://deepmind.google/technologies/gemini/) (Generative AI)
*   **Language:** TypeScript

## Prerequisites

*   [Node.js](https://nodejs.org/) (Latest LTS recommended)
*   [pnpm](https://pnpm.io/) (Recommended package manager) or npm/yarn

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd zettler-lore
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Set up environment variables:**
    *   Copy `.env.example` to `.env`.
    *   Fill in the required Firebase, Stripe, and Gemini API keys.
    ```bash
    cp .env.example .env
    ```

4.  **Run the development server:**
    ```bash
    pnpm dev
    ```
    The application will be available at `http://localhost:3000`.

## Project Structure

*   `components/`: Vue components, auto-imported.
*   `composables/`: Reusable logic (hooks), auto-imported.
*   `layouts/`: Page layouts (e.g., default, authenticated).
*   `pages/`: Application routes.
*   `server/`: Server-side logic (API endpoints, utilities, middleware).
    *   `server/api/`: API route handlers.
    *   `server/utils/`: Shared server-side utilities (Auth, AI, Firebase).
    *   `server/middleware/`: Server middleware.
*   `types/`: TypeScript type definitions.
*   `public/`: Static assets.

## Documentation

*   **Firebase & Data Schema:** See [FIREBASE.md](./FIREBASE.md) for detailed information on the Firestore data model and security rules.

## Development

*   **Code Style:** Standard Nuxt 3 and Vue 3 practices.
*   **Type Safety:** Uses TypeScript. Ensure all new code is strictly typed.
*   **Secrets:** Never commit `.env` files. Use `.env.example` for templates.

## Contributing

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes (`git commit -m 'Add some amazing feature'`).
4.  Push to the branch (`git push origin feature/amazing-feature`).
5.  Open a Pull Request.
