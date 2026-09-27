// Generates src/fluent/client_script.js from src/bundle/workbench.js.
// The bundle is gzipped and base64-embedded exactly like the original
// in-instance Diagnostic Workbench, so no character of the application source
// is exposed to Jelly processing or scoped-script rewriting.
import { readFileSync, writeFileSync } from 'fs'
import { gzipSync } from 'zlib'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const bundle = readFileSync(join(root, 'src/bundle/workbench.js'))
const b64 = gzipSync(bundle, { level: 9 }).toString('base64')

const loader = `"use strict";
(async function () {
  var bytes = Uint8Array.from(atob("${b64}"), function (character) {
    return character.charCodeAt(0);
  });
  var stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
  var source = await new Response(stream).text();
  (0, eval)(source);
})().catch(function (error) {
  var root = document.getElementById("app");
  if (root) root.textContent = "The Diagnostic Workbench could not start: " + error.message;
  if (window.console) console.error("Diagnostic Workbench startup failed", error);
});
`
writeFileSync(join(root, 'src/fluent/client_script.js'), loader)
console.log(`client_script.js written: bundle ${bundle.length.toLocaleString()} bytes -> base64 ${b64.length.toLocaleString()} chars`)
