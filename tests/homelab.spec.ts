import { test, expect } from "@playwright/test";
import { publicRoutes } from "@/lib/homelab";

test("only Cloudflare HTTP routes become public service links", () => {
  const source = `
kind: HTTPRoute
metadata:
  name: drawing
spec:
  parentRefs:
    - name: default-gateway
      namespace: default
    - name: cloudflare-gateway
      namespace: cloudflare
  hostnames: [draw.okwilkins.dev, '*.okwilkins.dev', 192.168.1.1, example.com]
---
kind: HTTPRoute
metadata:
  name: internal-monitoring
spec:
  parentRefs:
    - name: default-gateway
      namespace: default
  hostnames: [prometheus.okwilkins.dev]
`;
  expect(publicRoutes(source)).toEqual([
    { id: "drawing", href: "https://draw.okwilkins.dev/" },
  ]);
});

test("new public services are discovered without an existing description", () => {
  expect(publicRoutes(`
kind: HTTPRoute
metadata:
  name: new-service
  namespace: cloudflare
spec:
  parentRefs:
    - name: cloudflare-gateway
  hostnames: [new.okwilkins.dev]
`)).toEqual([{ id: "new-service", href: "https://new.okwilkins.dev/" }]);
});
