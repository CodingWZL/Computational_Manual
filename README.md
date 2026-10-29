# Computational Manual · 计算工作手册

A compact bilingual, task-oriented reference for computational materials science and computational chemistry. The site is buildless: plain HTML, CSS, and JavaScript. Open `index.html` locally, or publish the repository root with GitHub Pages.

## Content map

- **VASP** — relaxation/SCF/band/DOS, CI-NEB, AIMD, Bader and charge-density difference, COHP, OER, optics, effective mass, VASPKIT, installation, and method notes.
- **Gaussian** — job control, checkpoint conversion, cube generation, restart.
- **ORCA** — a clearly marked starter input; the source folder did not contain ORCA notes.
- **GROMACS** — Packmol, topology, EM/NVT/NPT/production, common trajectory analysis, and installation.
- **Linux** — resource checks, queue/process status, files, SSH/transfer, environment, and logs.

The entries reorganize the documents found alongside this project. They are personal working notes, not universal protocols. Source attribution and caveats are shown in each entry. Several source documents were incomplete; those topics are marked as such rather than filled with guessed parameters.

## Run locally

Open `index.html` in a modern browser. The Google Fonts import is optional; the page falls back to system fonts when offline. Search works across all entries; the left navigation filters by software; each recipe has a copy button.

## Publish with GitHub Pages

The included `.github/workflows/pages.yml` builds the repository root as a Pages artifact. In GitHub, enable Pages with **GitHub Actions** as the build source. Every push to `main` then publishes the current site.

**Treat the repository and the deployed site as public.** A public GitHub Pages site is publicly available even when the source repository is private; a password prompt implemented in browser JavaScript is not access control. Do not put passwords, API keys, credentials, license files, proprietary input data, or material marked “do not distribute” in this repository. The source folder's `AIMS-Lab … 请勿外传.pdf`, software archives, and binaries have intentionally not been copied here.

If visitors must authenticate, keep the site behind a real identity-aware access layer (for example, Cloudflare Access on a domain/proxy you control), or use an access-controlled hosting option suitable for your account. Do not add a client-side password gate and describe it as private. See [ACCESS.md](ACCESS.md) before choosing a deployment path.

## Add an entry

Add an object to `manual.js`. Use a short Chinese title, an English title, a concise purpose, a copyable command/input block, caveats, tags, and the source document. Keep cluster-specific paths and account names out of examples. If a workflow is a new recommendation rather than a source-derived practice, say so in `source` and include validation notes.

## Scope and licensing

No proprietary software, pseudopotentials, binaries, checkpoints, trajectories, or raw source documents are bundled. Respect the license terms of VASP, Gaussian, ORCA, GROMACS, force-field files, and all other referenced software/data. Add only text and input snippets you are entitled to redistribute.
