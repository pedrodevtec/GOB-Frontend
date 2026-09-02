export const DEFAULT_LOGIN_REDIRECT = "/dashboard";
export const DEFAULT_REGISTER_REDIRECT = "/characters/create";

export const AUTH_ENTRY_ROUTES = ["/login", "/register", "/esqueci-senha", "/redefinir-senha"];
export const PUBLIC_ROUTE_PREFIXES = [
  "/",
  "/login",
  "/register",
  "/esqueci-senha",
  "/redefinir-senha",
  "/terms",
  "/termos",
  "/privacy",
  "/privacidade",
  "/contato",
  "/verify-email",
  "/confirm-email",
  "/confirmar-email",
  "/verificar-email"
];

export const RETURN_TO_PARAM = "returnTo";

function isAbsoluteExternalUrl(value: string) {
  return /^[a-z][a-z\d+\-.]*:/i.test(value) || value.startsWith("//");
}

function hasUnsafeEncodedPath(value: string) {
  try {
    const decoded = decodeURIComponent(value);
    return (
      decoded.startsWith("//") ||
      decoded.includes("\\") ||
      /[\u0000-\u001f\u007f]/.test(decoded)
    );
  } catch {
    return true;
  }
}

function isPublicCampaignLanding(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  return parts.length === 2 && (parts[0] === "campanhas" || parts[0] === "campaigns");
}

export function isPublicRoute(pathname: string) {
  if (isPublicCampaignLanding(pathname)) return true;

  return PUBLIC_ROUTE_PREFIXES.some((route) =>
    route === "/" ? pathname === "/" : pathname === route || pathname.startsWith(`${route}/`)
  );
}

export function isAuthEntryRoute(pathname: string) {
  return AUTH_ENTRY_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export function isSafeReturnPath(value?: string | null) {
  if (!value) return false;
  if (!value.startsWith("/") || isAbsoluteExternalUrl(value)) return false;
  if (value.includes("\\") || /[\u0000-\u001f\u007f]/.test(value)) return false;
  if (hasUnsafeEncodedPath(value)) return false;

  try {
    const parsed = new URL(value, "https://bravantus.invalid");
    return (
      parsed.origin === "https://bravantus.invalid" &&
      !isAuthEntryRoute(parsed.pathname)
    );
  } catch {
    return false;
  }
}

export function safeReturnPath(value?: string | null, fallback = DEFAULT_LOGIN_REDIRECT) {
  if (!isSafeReturnPath(value)) return fallback;
  return value as string;
}

export function pathWithReturnTo(pathname: string, search = "") {
  return `${pathname}${search}`;
}

export function authPathWithReturnTo(authPath: string, returnTo?: string | null) {
  if (!isSafeReturnPath(returnTo)) return authPath;

  const params = new URLSearchParams();
  params.set(RETURN_TO_PARAM, returnTo as string);
  return `${authPath}?${params.toString()}`;
}
