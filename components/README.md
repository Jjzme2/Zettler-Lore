# Component Documentation

The application's UI is built using Vue 3 components, organized into specific domains within the `components/` directory.

## Directory Structure

We use a domain-driven organization strategy:

*   **`ui/`**: Low-level, reusable UI primitives. These are "dumb" components that focus on presentation (e.g., Buttons, Inputs, Cards).
*   **`library/`**: Components specific to the Library feature (e.g., BookShelf, StoryCard). These may contain business logic.
*   **`element/`**: Specialized components for rendering the content of stories and lore (e.g., TextBlock, ImageBlock).

## Usage

Nuxt 3 automatically imports these components. The directory name is part of the component name.

### UI Components (`components/ui/`)

Examples:
*   `components/ui/Button.vue` -> `<UiButton>`
*   `components/ui/Input.vue` -> `<UiInput>`
*   `components/ui/Modal.vue` -> `<UiModal>`

### Library Components (`components/library/`)

Examples:
*   `components/library/Shelf.vue` -> `<LibraryShelf>`
*   `components/library/StoryCard.vue` -> `<LibraryStoryCard>`

### Element Components (`components/element/`)

Examples:
*   `components/element/Renderer.vue` -> `<ElementRenderer>`

## Development Guidelines

1.  **Keep it Atomic**: Try to build complex views from smaller, reusable `ui/` components.
2.  **Props & Events**: Use typed props and emits for clear data flow.
3.  **Accessibility**: Ensure interactive elements have proper ARIA attributes and keyboard support.
4.  **Styling**: Use Tailwind CSS utility classes. Avoid custom CSS blocks where possible.
