# Computational Manual · 计算工作手册

A bilingual, task-centered guide for computational materials science and computational chemistry. Each workflow spells out its goal, prerequisites, input files, ordered steps, command purposes, expected outputs, and checks. The site is buildless: plain HTML, CSS, and JavaScript.

## Content map

- **VASP** — structural relaxation and SCF, band structure, DOS, HSE, AIMD, CI-NEB, Bader, charge-density difference, OER, optical response, effective mass, COHP, installation, and source gaps for SOC/Meta-GGA.
- **Gaussian** — checkpoint conversion, density/ESP cubes, restart, and job checks.
- **ORCA** — a labeled water-molecule starter workflow; no original ORCA notes were present.
- **GROMACS** — Packmol and topology setup, EM/NVT/NPT/production stages, separate trajectory-analysis workflows, and installation.
- **Linux** — cluster login, scheduler submission and checks, file transfer, storage, and archiving.

Workflow steps are based on the author's source material and carry the standardized credit **Zhilong Wang（汪志龙）**. They are personal working notes, not universal protocols. Examples and version-specific cautions are identified within each workflow. Topics with incomplete source notes remain marked incomplete instead of being filled with guessed parameters.

## Run locally

Open `index.html` in a modern browser. No package installation or external font service is required. Search works across all workflows; the left navigation filters by software; each individual command has its own copy button.

## Publish with GitHub Pages

The included `.github/workflows/pages.yml` builds the repository root as a Pages artifact. In GitHub, enable Pages with **GitHub Actions** as the build source. Every push to `main` then publishes the current site.

**Treat the repository and the deployed site as public.** A public GitHub Pages site is publicly available even when the source repository is private; a password prompt implemented in browser JavaScript is not access control. Do not put passwords, API keys, credentials, license files, proprietary input data, or material marked “do not distribute” in this repository. The source folder's `AIMS-Lab … 请勿外传.pdf`, software archives, and binaries have intentionally not been copied here.

If visitors must authenticate, keep the site behind a real identity-aware access layer (for example, Cloudflare Access on a domain/proxy you control), or use an access-controlled hosting option suitable for your account. Do not add a client-side password gate and describe it as private. See [ACCESS.md](ACCESS.md) before choosing a deployment path.

## Add or revise a workflow

Add a workflow to `manual.js`. Include the objective, starting files/materials, and ordered steps. Each step should explain what it does; each command should state its purpose; every step should name the expected output and a concrete check before continuing. Keep examples bilingual and use generic paths/accounts. Preserve the standardized source credit in the UI.

## Scope and licensing

No proprietary software, pseudopotentials, binaries, checkpoints, trajectories, or raw source documents are bundled. Respect the license terms of VASP, Gaussian, ORCA, GROMACS, force-field files, and all other referenced software/data. Add only text and input snippets you are entitled to redistribute.

