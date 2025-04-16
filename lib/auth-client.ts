import { createAuthClient } from "better-auth/client"

const signIn = async () => {
    const data = await authClient.signIn.social({
        provider: "google"
    })
}

export const authClient = createAuthClient({
    baseURL: "http://localhost:3000" // The base URL of your auth server
})