# Access and privacy choices

This manual is currently a static site with no authentication. The repository is public, so assume both its source and any GitHub Pages deployment can be read by anyone. A private repository alone does not make a GitHub Pages site private.

## If the notes can be public

Use GitHub Pages. Review every added file and commit for credentials, cluster hostnames/account details, unpublished results, licensed assets, and material carrying a distribution restriction.

## If only you or selected collaborators should read it

Use an actual access-control layer in front of the website (for example, an identity-aware gateway with email allowlists and one-time codes), and protect the origin so visitors cannot bypass that gateway. Keep secrets in the host's secret store; do not place a shared password or password hash in `manual.js` or other client-delivered files. Alternatively, choose a hosting plan that enforces authenticated/private site access and supports the intended collaborators.

Cloudflare Access typically requires a domain routed through Cloudflare and a Zero Trust access application/policy. Verify the current plan, DNS setup, and origin-protection path before relying on it. The public source repository remains public even when the deployed site is gated: remove any confidential notes from Git history as well as from the deployed bundle.

## Lightweight obscurity is not privacy

An obscure URL, `robots.txt`, a hidden navigation link, or JavaScript password dialog can deter casual discovery but cannot prevent source inspection, direct asset downloads, or bypass. Do not use these for confidential material.

## Platform references

- [GitHub Pages security and HTTPS](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https)
- [Cloudflare Access for a self-hosted public hostname](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/self-hosted-public-app/)
- [Cloudflare one-time PIN sign-in](https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/one-time-pin/)
