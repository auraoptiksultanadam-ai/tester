const encoder = new TextEncoder();

function safeEqual(a, b) {
  const x = encoder.encode(a);
  const y = encoder.encode(b);
  if (x.length !== y.length) return false;
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

export default async (request) => {
  const expectedUser = Netlify.env.get("AURA_ADMIN_USER");
  const expectedPass = Netlify.env.get("AURA_ADMIN_PASS");
  if (!expectedUser || !expectedPass) {
    return new Response("Admin access is not configured.", { status: 503 });
  }

  const header = request.headers.get("authorization") || "";
  const [scheme, encoded] = header.split(" ");
  if (scheme === "Basic" && encoded) {
    try {
      const decoded = atob(encoded);
      const separator = decoded.indexOf(":");
      if (separator >= 0) {
        const user = decoded.slice(0, separator);
        const pass = decoded.slice(separator + 1);
        if (safeEqual(user, expectedUser) && safeEqual(pass, expectedPass)) {
          return;
        }
      }
    } catch (_) {}
  }

  return new Response("Login diperlukan untuk membuka AURA Visual Studio.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="AURA Visual Studio", charset="UTF-8"',
      "Cache-Control": "no-store"
    }
  });
};

export const config = { path: "/admin.html" };
