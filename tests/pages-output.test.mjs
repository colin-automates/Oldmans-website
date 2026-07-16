import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const outputRoot = new URL("../pages-output/", import.meta.url);

test("builds a complete Cloudflare Pages worker bundle", async () => {
  await Promise.all(
    [
      "_headers",
      "_routes.json",
      "_worker.js",
      ".assetsignore",
      "assets/",
      "server/index.js",
      "hero-poster.webp",
      "og.png",
    ].map((path) => access(new URL(path, outputRoot))),
  );

  const [routes, workerSource, assetsIgnore] = await Promise.all([
    readFile(new URL("_routes.json", outputRoot), "utf8").then(JSON.parse),
    readFile(new URL("_worker.js", outputRoot), "utf8"),
    readFile(new URL(".assetsignore", outputRoot), "utf8"),
  ]);

  assert.deepEqual(routes.include, ["/*"]);
  assert.ok(routes.exclude.includes("/assets/*"));
  assert.match(workerSource, /env\.ASSETS\.fetch\(request\)/);
  assert.match(workerSource, /\.\/server\/index\.js/);
  assert.match(assetsIgnore, /^_worker\.js$/m);
  assert.match(assetsIgnore, /^server\/$/m);
});

test("the packaged Pages worker serves the homepage", async () => {
  const workerUrl = new URL("_worker.js", outputRoot);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  assert.match(await response.text(), /Joseph Gioielli/i);
});
