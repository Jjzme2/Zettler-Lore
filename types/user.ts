import { ROLES } from '~/config/roles'

export interface User {
    uid: string
    email: string
    memberId?: string
    membershipStatus: typeof ROLES.FREE | typeof ROLES.MEMBER
    isAdmin?: boolean
}
