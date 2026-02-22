import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Spotify Auth Endpoints
  app.get("/api/auth/url", (req, res) => {
    const client_id = process.env.SPOTIFY_CLIENT_ID;
    const redirect_uri = `${process.env.APP_URL}/auth/callback`;
    const scope = "user-read-private user-read-email user-read-currently-playing";

    if (!client_id) {
      // Fallback for development if client ID is missing
      const params = new URLSearchParams({
        client_id: client_id || "placeholder_client_id",
        response_type: "code",
        redirect_uri: redirect_uri,
        scope: scope,
        show_dialog: "true",
      });
      return res.json({ url: `https://accounts.spotify.com/authorize?${params.toString()}` });
    }

    const params = new URLSearchParams({
      client_id: client_id,
      response_type: "code",
      redirect_uri: redirect_uri,
      scope: scope,
    });

    res.json({ url: `https://accounts.spotify.com/authorize?${params.toString()}` });
  });

  app.get("/auth/callback", (req, res) => {
    const { code } = req.query;
    // TODO: Exchange authorization code for access tokens
    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', code: '${code}' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful! Closing window...</p>
        </body>
      </html>
    `);
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
