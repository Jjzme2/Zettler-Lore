import { ACCESS_LEVELS, STORY_STATUS } from '~/config/roles'

/**
 * Represents a Shelf (Category) in the library.
 * Shelves organize stories and determine high-level access control.
 */
export interface Shelf {
    id: string
    title: string
    /**
     * The access level required to view this shelf.
     * Determines if content is visible to the public or restricted to members.
     */
    accessLevel: typeof ACCESS_LEVELS.PUBLIC | typeof ACCESS_LEVELS.MEMBER
    itemIds: string[]
    description?: string
    /**
     * URL-friendly identifier for routing.
     */
    slug: string
}

/**
 * Represents a Story (Lore Item) entity.
 * Holds metadata about the story, its status, and location in the library.
 */
export interface Story {
    id: string
    title: string
    slug: string
    authorId: string
    currentVersionId: string
    status: typeof STORY_STATUS.DRAFT | typeof STORY_STATUS.PUBLISHED | typeof STORY_STATUS.ARCHIVED
    shelfId: string
    tags: string[]
    createdAt: any // Firestore Timestamp
    updatedAt: any // Firestore Timestamp
}

/**
 * Represents a specific version of a Story's content.
 * Enables version control for story edits.
 */
export interface StoryVersion {
    id: string
    storyId: string
    /**
     * The actual text content of the story.
     * Typically stored as JSON or HTML string.
     */
    content: string
    createdAt: any // Firestore Timestamp
    versionNumber: number
}
