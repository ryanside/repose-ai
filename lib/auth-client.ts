import { createAuthClient } from "better-auth/client"

export const authClient = createAuthClient({
    baseURL: process.env.PRODUCTION_BASE_URL // The base URL of your auth server
})