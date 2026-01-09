
import { describe, it, expect, vi, beforeEach } from 'vitest'

// 1. Host globals FIRST
vi.hoisted(() => {
    globalThis.useRuntimeConfig = () => ({
        firebaseAdminPrivateKey: 'test-key',
        firebaseAdminProjectId: 'test-project',
        firebaseAdminClientEmail: 'test@email.com'
    })
    globalThis.defineEventHandler = (handler) => handler
    globalThis.readBody = () => Promise.resolve({ title: 'Test Shelf' })
    globalThis.createError = (err) => err
})

// 2. Mock Firebase
vi.mock('firebase-admin/app', () => ({
  initializeApp: vi.fn(),
  getApps: vi.fn(() => []),
  cert: vi.fn(() => 'mock-credential')
}))

vi.mock('firebase-admin/firestore', () => ({
  getFirestore: vi.fn(() => ({
    collection: vi.fn(() => ({
        doc: vi.fn(() => ({
            get: vi.fn(() => Promise.resolve({ exists: false })),
            set: vi.fn(() => Promise.resolve()),
        })),
        orderBy: vi.fn(() => ({
            limit: vi.fn(() => ({
                get: vi.fn(() => Promise.resolve({ empty: true }))
            }))
        }))
    }))
  }))
}))

vi.mock('firebase-admin/auth', () => ({
  getAuth: vi.fn()
}))

// Mock Firebase Utils (top level)
vi.mock('../../server/utils/firebase', () => ({
    dbAdmin: {
        collection: () => ({
            doc: () => ({
                get: () => Promise.resolve({ exists: false }),
                set: () => Promise.resolve(),
            }),
            orderBy: () => ({
                limit: () => ({
                    get: () => Promise.resolve({ empty: true })
                })
            })
        })
    }
}))

// NOTE: We are NOT mocking ../../server/utils/auth here.
// We want to use the REAL requireSuperUser function.

import handler from '../../server/api/admin/create-shelf.post'

describe('create-shelf endpoint', () => {
  it('should enforce authentication (Returns 401 when no user)', async () => {
    const event = { context: {} } // No user in context

    try {
        await handler(event)
        expect.fail('Should have thrown 401 Unauthorized')
    } catch (e: any) {
        // The handler catches errors and rethrows them with statusCode
        expect(e.statusCode).toBe(401)
        expect(e.statusMessage).toContain('Unauthorized')
    }
  })
})
