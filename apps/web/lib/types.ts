export interface Guild {
    id: string
    name: string
    icon: string | null
    permissions?: string
    memberCount?: number
    channels?: number
    roles?: number
    [key: string]: unknown
}
