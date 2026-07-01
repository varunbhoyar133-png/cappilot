import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-cap-guide-2026';

// PBKDF2-like SHA-256 hashing using Web Crypto
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = encoder.encode("mht-cet-salt-cap-guide-2026");
  const pwdData = encoder.encode(password);
  
  // Combine password and salt
  const combined = new Uint8Array(pwdData.length + salt.length);
  combined.set(pwdData);
  combined.set(salt, pwdData.length);
  
  const hashBuffer = await crypto.subtle.digest("SHA-256", combined);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// Generate base64url encoding
function base64UrlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

// JWT Sign using Web Crypto HMAC SHA-256
export async function signJWT(payload: any): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  
  const encoder = new TextEncoder();
  const keyData = encoder.encode(JWT_SECRET);
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(signingInput)
  );
  
  const signatureBytes = new Uint8Array(signatureBuffer);
  let binarySignature = "";
  for (let i = 0; i < signatureBytes.byteLength; i++) {
    binarySignature += String.fromCharCode(signatureBytes[i]);
  }
  const encodedSignature = btoa(binarySignature)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
    
  return `${signingInput}.${encodedSignature}`;
}

// JWT Verify
export async function verifyJWT(token: string): Promise<any | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    
    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const signingInput = `${encodedHeader}.${encodedPayload}`;
    
    const encoder = new TextEncoder();
    const keyData = encoder.encode(JWT_SECRET);
    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    
    // Decode signature
    const binarySignature = atob(encodedSignature.replace(/-/g, "+").replace(/_/g, "/"));
    const signatureBytes = new Uint8Array(binarySignature.length);
    for (let i = 0; i < binarySignature.length; i++) {
      signatureBytes[i] = binarySignature.charCodeAt(i);
    }
    
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      encoder.encode(signingInput)
    );
    
    if (!isValid) return null;
    
    return JSON.parse(base64UrlDecode(encodedPayload));
  } catch (error) {
    return null;
  }
}

// Session helpers for Next.js App Router
export async function getSession(): Promise<any | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_session')?.value;
  if (!token) return null;
  return verifyJWT(token);
}

export async function setSession(payload: any) {
  const token = await signJWT(payload);
  const cookieStore = await cookies();
  cookieStore.set('auth_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/'
  });
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_session');
}
