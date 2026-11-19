# Model mathematics and Chinese translations

`../model-math.js` exports `modelHamiltonian(task, language = 'en')` and `rationalLatex(value)`. It has no dependencies, network calls or DOM effects. The task argument is one of the fifty frozen definitions from `models.json`, not a general user submission format. The conventional formulas are indexed by those task IDs; when adding or changing a task, its conventional formula must be reviewed too. Unrecognized IDs use the exact generated Pauli interaction expression.

The return value contains KaTeX source strings:

- `hamiltonian`: conventional formal infinite interaction, with symbolic couplings.
- `parameterLatex`: a single string specifying every frozen rational parameter.
- `localDensity`: a conventional finite local expression where explicitly available; otherwise an exact generated Pauli sum.
- `expandedLocalDensity`: always generated directly from every frozen Pauli term, including identity constants.
- `definitions`: an array of supporting mathematical definitions. Colored bond sets are generated from the frozen local supports where applicable.
- `siteLatex`, `energyLatex`, `translationLatex`: site, per-qubit energy and formal translation conventions.
- `notation`: English and Chinese prose explaining the infinite-interaction, Pauli and cell-index conventions.
- `kind`: `conventional` for the fifty standard task formulas, or `exact-pauli-interaction` for an unrecognized ID.

Use `language = 'zh'` for Chinese text embedded in mathematical definitions. Mathematical coefficients and supports stay identical. The consumer should render the first two expressions prominently. The finite expanded density is a useful inspectable detail, but long expressions such as the Union-Jack Pauli expansion should not be used as the primary introduction.

All fifty conventional formulas were checked against the frozen `config/benchmark50_tasks.json`, `src/benchmark50_models.py` and `MODEL_CATALOG_50.md`. Particular convention checks include the direct-Pauli XXZ and XYZ couplings, the spin-exchange factor S=sigma/2, the J-Q singlet projector, the retained BFG additive constant, the positive sign of the cubic compass model, the Levin-Gu overall sign, the colored bonds in the three-dimensional Kitaev models, the reflected and swapped Haah Z supports, and the distinct even/odd FCC site and center lattices of Chamon.

These display formulas do not constitute new Lean proofs or new claims of exact solvability. H is a local interaction family, not a claimed bounded infinite total operator.

`model-translations.json` has `models[id] = {name, short_name, description, lattice}` for all fifty IDs and `families[id] = {name, description}` for all six families. English originals, parameters, Pauli terms and source URLs remain in `models.json` unchanged.

Validation used the local KaTeX 0.19.1 module with `throwOnError: true` and `strict: 'error'` on every model and both languages. No API or Lean execution is needed for this presentation layer.
