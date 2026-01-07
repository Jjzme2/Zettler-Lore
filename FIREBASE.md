# Firebase Data Model & Security Rules

## Firestore Data Schema

### 1. `users` Collection
Stores user profiles and roles.
- **Document ID**: `uid` (from Firebase Auth)
- **Fields**:
  - `email`: string
  - `displayName`: string
  - `uid`: string (matches doc ID)
  - `role`: string ('admin' | 'member')
  - `libraryCardNumber`: string (e.g., 'ZL-26-COMM-0001')
  - `status`: string ('pending' | 'approved' | 'active' | 'banned')
  - `branch`: string ('COMM', 'STOR', 'FOUND')
  - `approvedAt`: timestamp
  - `approvedBy`: string (admin uid)
  - `createdAt`: timestamp

### 2. `shelves` Collection
Metadata for the library shelves (categories).
- **Document ID**: `slug` (e.g., 'community', 'featured', 'world-building')
- **Fields**:
  - `title`: string
  - `description`: string
  - `order`: number
  - `isPublic`: boolean (Controls visibility to guest users)
  - `isArchived`: boolean (Soft-delete status)

### 3. `stories` Collection (Lore Items)
The primary unit of organization. Can be World-Building, Short Stories, Poems, etc.
- **Document ID**: `slug` (e.g., 'the-scent-of-time')
- **Fields**:
  - `title`: string
  - `slug`: string
  - `type`: string ('short_story', 'poem', 'world_building', 'micro', 'creative_writing', 'element')
  - `shelf`: string (slug of the shelf it belongs to, e.g. 'community')
  - `author`: string
  - `authorId`: string (uid of the creator)
  - `publishedDate`: string
  - `content`: string (Markdown/HTML)
  - `status`: string ('draft' | 'published' | 'archived')
  - `isPublicDomain`: boolean
  - `tags`: array of strings

#### Subcollections (Specific to 'element' type docs)
**`entries`**
Events, backstories, or specific details attached to this Element.
- **Document ID**: `slug` (e.g. 'the-betrayal-at-dock-4')
- **Fields**:
    - `title`: string
    - `content`: string
    - `type`: string ('event', 'backstory', 'trait')
    - `date`: string (custom timeline date or timestamp)

### 4. `books` Collection
Collections of stories (Anthologies or Series).
- **Document ID**: `slug` (e.g., 'tales-from-the-stacks-vol-1')
- **Fields**:
  - `title`: string
  - `slug`: string
  - `author`: string (or 'Various')
  - `storyIds`: array of strings (slugs of stories included)
  - `publishedDate`: string
  - `coverImage`: string (optional URL)
  - `status`: string ('published' | 'draft')

### 5. `counters` Collection
Used for sequential ID generation keying by year and branch.
- **Document ID**: `{YEAR}-{BRANCH}` (e.g., '26-COMM')
- **Fields**:
  - `count`: number