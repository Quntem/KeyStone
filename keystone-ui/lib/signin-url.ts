export function buildSignInUrl(apiUrl: string | undefined, redirectTo: string) {
    const baseUrl = (apiUrl || "").replace(/\/+$/, "");
    const query = new URLSearchParams({ redirectTo });
    return `${baseUrl}/auth/signin?${query.toString()}`;
}
