import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const proxySource = readFileSync(
  new URL("../src/lib/supabase/proxy.ts", import.meta.url),
  "utf8",
);

test("Supabase proxy preserves refreshed auth state across iOS resume redirects", () => {
  assert.match(proxySource, /setAll\(cookiesToSet, headers\)/);
  assert.match(proxySource, /Object\.entries\(headers\)/);
  assert.match(
    proxySource,
    /applyPendingAuthState\(buildRegisterRedirect\(request\)\)/,
  );
  assert.match(
    proxySource,
    /applyPendingAuthState\(buildLoginRedirect\(request\)\)/,
  );
});
