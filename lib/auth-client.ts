import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  baseURL: "https://repose-ai.vercel.app/",
});
