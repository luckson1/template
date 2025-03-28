import NextAuth from "next-auth";
import { cache } from "react";

import { authConfig } from "./config";

// @ts-expect-error Type incompatibility due to @auth/core version mismatch (0.37.2 vs 0.38.0)
const { auth: uncachedAuth, handlers, signIn, signOut } = NextAuth(authConfig);

const auth = cache(uncachedAuth);

export { auth, handlers, signIn, signOut };
