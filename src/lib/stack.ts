// Temporarily disabled Stack Auth - using mock authentication
export const stackClientApp = {
  getUser: async () => ({ id: "mock-user-id", email: "user@example.com" }),
  signInWithOAuth: async () => {},
  signOut: async () => {},
};
