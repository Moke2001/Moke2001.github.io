# Public website data

`leaderboard.json` is a faithful presentation extract of the 2026-11-13 historical `composite_v1` ranking. It preserves all five model scores, P/R/A components, exact deployment labels, within-task bootstrap intervals and per-task metrics. It performs no new scoring.

The historical evaluation used 10 fixed tasks, 5 trials per task and no web access. The task IDs were 01, 07, 08, 13, 17, 22, 25, 34, 39 and 48. The R threshold was applied to original I=max(0,(B-U)/s), not to the normalized amplitude A. The historical result must not be relabeled as a current 50-task or two-agent evaluation, nor recomputed with the newer exact-energy score rule.

`models.json` preserves all 50 frozen task definitions and adds concise English names, descriptions and six editorial family labels for browsing. It includes 12 one-dimensional, 21 two-dimensional and 17 three-dimensional tasks. These are finite-range interactions on infinite qubit lattices; q denotes the number of physical qubits per translation cell, and energy is per physical qubit. The complete terms, rational coefficients, cell convention and source URLs are retained. Conventional spin-exchange factors are already present in the Pauli coefficients. Constants are not omitted.

The original E/P/V solvability label is retained as `frozen_solvability_code` for provenance, not as a website-ready assertion of a verified global exact ground-state reference. In particular, a freely solvable gauge sector does not by itself establish global sector minimization. This data extract deliberately does not mix current draft group scores with the historical leaderboard.

Source paths and SHA-256 hashes are relative to `Projects/QuantumManyBodyVariational` and recorded inside each JSON file. No credentials, raw API requests, local absolute paths, unpublished paper metadata or placeholder remote URLs are included. Existing source artifacts are read only.

To regenerate, run from the Eureka root:

```bash
Environment/Python/run.sh Projects/QuantumManyBodyVariational/website/data/build_data.py
```

The builder writes only this directory and checks that all preserved score fields and all 50 mathematical definitions exactly match the frozen sources.
