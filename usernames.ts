export function personalUsernameFromEmail(email: string) {
    return email
        .replaceAll("_", "_u")
        .replaceAll("@", "_a")
        .replaceAll(".", "_d");
}
