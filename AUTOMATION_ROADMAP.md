# From notes to reusable research workflows

The manual is the lookup layer. Reusable scripts can make stable, repeated steps reproducible; they should be added incrementally, after the input assumptions and success checks are explicit.

## Good first scripts

1. **VASP case scaffolder** — create `opt/`, `scf/`, and `band-dos/` directories; copy selected templates; validate required `INCAR`, `POSCAR`, `KPOINTS`, `POTCAR` presence; print a review summary. Never submit a job automatically on the first version.
2. **NEB setup checker** — compare endpoint atom counts/species/order, report displacements, inspect image directories, and check `IMAGES` against the generated directory structure.
3. **AIMD duration and resource planner** — calculate `NSW × POTIM`, estimate output volume from user-supplied assumptions, and generate a human-readable checklist.
4. **GROMACS stage runner** — read an explicit config and input filenames, run `grompp` with warnings visible, stop on failure, save a command/log manifest, and require explicit opt-in before each expensive `mdrun`.
5. **Result parser** — summarize VASP convergence/forces and GROMACS run completion into CSV/JSON without changing raw calculation outputs.

## Agent boundaries

An agent can inspect an input directory, identify missing files, draft a job script, explain warnings, and prepare a proposed analysis. Keep high-impact actions behind user review: editing scientific inputs, deleting files, submitting or cancelling expensive jobs, changing production force fields, and interpreting results as publication-ready. Save provenance (software version, input hashes, command, scheduler job ID, and validation outcome) alongside generated outputs.

## A practical path

Start with a dry-run CLI utility and small validated templates. Add machine-readable metadata for each recipe (software/version, inputs, outputs, assumptions, and checks). Later, an agent can choose and parameterize a workflow from that catalog, while the CLI enforces deterministic file operations and validation. This is more reliable than making a free-form agent responsible for every shell action.
