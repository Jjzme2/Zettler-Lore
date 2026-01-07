import { ACCESS_LEVELS, STORY_STATUS } from '~/config/roles'

export interface Shelf {
    id: string
    title: string
    accessLevel: typeof ACCESS_LEVELS.PUBLIC | typeof ACCESS_LEVELS.MEMBER
    itemIds: string[]
    description?: string
    slug: string
}

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

export interface StoryVersion {
    id: string
    storyId: string
    content: string // JSON or HTML string
    createdAt: any // Firestore Timestamp
    versionNumber: number
}
