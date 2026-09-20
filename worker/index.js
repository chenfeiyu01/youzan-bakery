export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    // Content-addressed film URLs can safely survive future deployments in cache.
    const immutableFilm = /\/assets\/shot-\d+-[a-f0-9]{12}\.mp4$/.test(new URL(request.url).pathname);
    if (immutableFilm && ["GET", "HEAD"].includes(request.method) && [200,206,304].includes(response.status)) {
      const cached = new Response(response.body, response);
      cached.headers.set("Cache-Control", "public, max-age=31536000, immutable");
      return cached;
    }
    const acceptsHtml = request.headers.get("accept")?.includes("text/html");

    if (response.status !== 404 || !acceptsHtml || !["GET", "HEAD"].includes(request.method)) {
      return response;
    }

    const indexUrl = new URL(request.url);
    indexUrl.pathname = "/index.html";
    indexUrl.search = "";
    return env.ASSETS.fetch(new Request(indexUrl, request));
  },
};
