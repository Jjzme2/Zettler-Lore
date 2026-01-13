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

## Documentation

This project contains detailed documentation in specific directories:

*   **[Server Documentation](./server/README.md):** Details on API endpoints, authentication flow, and backend utilities.
*   **[Component Documentation](./components/README.md):** Guide to the UI component library and structure.
*   **[Firebase & Data Model](./FIREBASE.md):** Comprehensive guide to the Firestore data schema and security rules.

## Project Structure

The project follows a standard Nuxt 3 structure with some custom organization:

*   `components/`: Vue components, organized by domain:
    *   `ui/`: Reusable UI primitives (Buttons, Inputs, Modals).
    *   `library/`: Domain-specific components for the Library feature.
    *   `element/`: Components for rendering Story/Lore elements.
*   `composables/`: Auto-imported Vue composables (hooks).
*   `layouts/`: Page layouts (e.g., `default.vue`, `auth.vue`).
*   `pages/`: File-based routing.
*   `server/`: The backend API and server-side logic.
    *   `api/`: REST API endpoints defined as event handlers.
    *   `middleware/`: Server-side middleware (e.g., User Context).
    *   `utils/`: Shared helper functions (Firebase Admin, Auth, AI).
*   `types/`: TypeScript interfaces and types.
*   `public/`: Static assets.

## Testing

Currently, the project relies on static analysis and manual verification.

*   **Type Checking:** Run `npx nuxi typecheck` to verify TypeScript types.

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
