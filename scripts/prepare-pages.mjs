import { access, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const clientDir = resolve(root, "dist", "client");
const serverDir = resolve(root, "dist", "server");
const outputDir = resolve(root, "pages-output");

await Promise.all([
  access(clientDir),
  access(resolve(serverDir, "index.js")),
]);

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });
await cp(clientDir, outputDir, { recursive: true });
await cp(serverDir, resolve(outputDir, "server"), { recursive: true });

await writeFile(
  resolve(outputDir, "_worker.js"),
  `import app from "./server/index.js";

export default {
  async fetch(request, env, ctx) {
    const asset = await env.ASSETS.fetch(request);
    if (asset.status !== 404) return asset;
    return app.fetch(request, env, ctx);
  },
};
`,
);

await writeFile(
  resolve(outputDir, "_routes.json"),
  `${JSON.stringify(
    {
      version: 1,
      include: ["/*"],
      exclude: [
        "/assets/*",
        "/*.ico",
        "/*.png",
        "/*.jpg",
        "/*.jpeg",
        "/*.webp",
        "/*.avif",
        "/*.mp4",
        "/*.webm",
      ],
    },
    null,
    2,
  )}\n`,
);

const ignorePath = resolve(outputDir, ".assetsignore");
let ignore = "";
try {
  ignore = await readFile(ignorePath, "utf8");
} catch {
  // The client build normally creates this file, but it is optional.
}

const ignored = new Set(
  ignore
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean),
);
ignored.add("_worker.js");
ignored.add("server/");
await writeFile(ignorePath, `${[...ignored].join("\n")}\n`);

console.log("Prepared Cloudflare Pages output in pages-output/");
