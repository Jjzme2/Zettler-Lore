import { ACCESS_LEVELS, STORY_STATUS } from '~/config/roles'

/**
 * Represents a Shelf (Category) in the library.
 * Shelves organize stories and determine high-level access control.
 *
 * Think of this as a section in a physical library (e.g., "Science Fiction", "History").
 */
export interface Shelf {
    /** Unique identifier for the shelf (often matches the slug). */
    id: string
    /** Display title of the shelf. */
    title: string
    /**
     * The access level required to view this shelf.
     * - `PUBLIC`: Visible to everyone, including guests.
     * - `MEMBER`: Visible only to logged-in members.
     */
    accessLevel: typeof ACCESS_LEVELS.PUBLIC | typeof ACCESS_LEVELS.MEMBER
    /** List of IDs of items (stories) that belong to this shelf. */
    itemIds: string[]
    /** Optional description or blurb about the shelf's content. */
    description?: string
    /**
     * URL-friendly identifier for routing (e.g., "science-fiction").
     * Used in browser URLs: `/library/science-fiction`
     */
    slug: string
}

/**
 * Represents a Story (Lore Item) entity.
 * Holds metadata about the story, its status, and location in the library.
 *
 * This object contains the *metadata* but not the full text content (which is versioned).
 */
export interface Story {
    /** Unique database ID. */
    id: string
    /** The title of the story. */
    title: string
    /** URL-friendly identifier (e.g., "the-last-starfighter"). */
    slug: string
    /** ID of the user who created this story. */
    authorId: string
    /** ID of the currently active/published version (points to a StoryVersion). */
    currentVersionId: string
    /**
     * Publishing status:
     * - `DRAFT`: Work in progress, not visible to readers.
     * - `PUBLISHED`: Live and visible.
     * - `ARCHIVED`: Hidden but preserved.
     */
    status: typeof STORY_STATUS.DRAFT | typeof STORY_STATUS.PUBLISHED | typeof STORY_STATUS.ARCHIVED
    /** ID of the shelf this story belongs to. */
    shelfId: string
    /** Array of keywords for searching and categorization. */
    tags: string[]
    /** Firestore Timestamp of when the story was first created. */
    createdAt: any
    /** Firestore Timestamp of the last metadata update. */
    updatedAt: any
}

/**
 * Represents a specific version of a Story's content.
 * Enables version control for story edits (like Git commits for stories).
 */
export interface StoryVersion {
    /** Unique ID for this version. */
    id: string
    /** ID of the parent Story this version belongs to. */
    storyId: string
    /**
     * The actual text content of the story.
     * Typically stored as a string (Markdown or HTML).
     */
    content: string
    /** When this version was saved. */
    createdAt: any // Firestore Timestamp
    /** Sequential number (1, 2, 3...) indicating the revision history. */
    versionNumber: number
}
