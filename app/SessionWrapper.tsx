"use client";

import { SessionProvider } from "next-auth/react";

export default function SessionWrapper({
    children,
}: {
    // This line defines the type of the 'children' prop, which allows any valid React node (elements, strings, numbers, fragments, etc.) to be passed as children to the SessionWrapper component.
    children: React.ReactNode;
}) {
    return <SessionProvider>{children}</SessionProvider>;
// The SessionProvider is imported from "next-auth/react" at the top of this file.
// It is used in Next.js projects that use next-auth for authentication session management.
}
