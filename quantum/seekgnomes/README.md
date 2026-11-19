# SeekGnomes project page

A static project page for Eureka Studio / Quantum Cloud. The homepage links to it at `/quantum/seekgnomes/`.

## Preview

No Node build, package installation or backend is required. Serve this directory with any static HTTP server. For example, from this directory:

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

Then visit `http://127.0.0.1:8080/`. Double-clicking the unpacked `index.html` also runs the orbital simulation. Open the HTTP preview to use the bilingual ranking and model library, which load ES modules and JSON.

## Contents

- `index.html`, `styles.css`, `main.js`: four sections in continuous reading order, a language switch, the model library dialog and the carousel. `leaderboard.css` and `model-library.css` style the figures, table and catalogue.
- `charts.js`: bilingual SVG charts of the historical overall score and three score components.
- `i18n.js`: Chinese/English copy and language persistence. Use the header switch or `?lang=zh` / `?lang=en`.
- `carousel.js`: a cyclic native-scroll strip. The last family leads directly to the first; identical offscreen copies are rebased without a rewind animation.
- `model-math.js`, `math.js`: conventional operator Hamiltonians and locally rendered LaTeX. Exact cell densities remain expandable.
- `data/model-translations.json`: Chinese names, descriptions and lattice conventions for all 50 tasks.
- `config.js`: GitHub repository and release URLs, BibTeX citation and parent navigation.
- `data/leaderboard.json`: the 2026-11-13 `composite_v1` snapshot for the five complete families. Scores are retained, not recalculated under the revised scoring protocol.
- `data/models.json`: all 50 frozen physical model definitions and family descriptions.
- `assets/illustrations/`: editable scientific SVG diagrams and reusable quantum-lattice symbols. The bilingual overview uses the supplied TCSExam Figure 1 panel layout, with original model illustrations and SeekGnomes workflow content.
- `assets/brands/` and `assets/fonts/`: locally served icons and the Studio typeface, with third-party licenses.

## Interactive orbital illustration

Three equal masses start on a figure-eight orbit. The illustration depicts Earth, Venus and Mars at the same size. Moving the pointer over the cover or touching it places a prescribed external gravity source at the input position. Its strength stays at 0.32 in units of one star’s mass. The three planets accelerate toward the nearest periodic image of this point. Moving the source changes its position immediately. Leaving the cover or lifting a finger switches off the external force and preserves the stars’ current positions and velocities. Keyboard users can focus the grid, steer the source with the arrow keys and release it with Escape. Shift increases the step. Press Space on the focused grid to pause or resume. The small arrow in the upper right restores the initial orbit. The illustration starts paused when reduced motion is requested.

The rectangular orbital plane has periodic boundaries in both directions. In `gravity.js` each pair interacts through its nearest periodic image using Newtonian gravity with Plummer softening, in dimensionless units with G = 1 and softening length 0.052. Velocity Verlet advances the system with a time step of 1/480. The initial velocities have been adjusted for the softened potential. The classical figure-eight solution is described by [Chenciner and Montgomery](https://arxiv.org/abs/math/0011268).

The canvas shows the orbital plane from above at a fixed scale for each viewport size. Integrated positions and trail samples are continuous across boundaries. The renderer draws the parts of each planet and trail visible on either side of a seam. Near the stars and the active cursor source, the coordinate lines curve and bunch together. Shading on the lines gives the sides of each well a sense of depth. The grey grid is drawn on white, with a fixed white fade at the edges. This drawing illustrates the wells, while the stars and their trails follow the integrated Newtonian coordinates.

The distributed `hero-orbits.js` starts the simulation independently of the rest of the page, including on a local file URL. In the source project, run `node scripts/build_hero_orbits.mjs` after editing the simulation sources. Use `node scripts/build_hero_orbits.mjs --check` to verify the shipped script.

## Important content boundaries

The old rank is ten tasks, five trials each, without web access. It is separate from the current two-role framework and the 50-task catalogue. P/R/A definitions and the original R threshold on I=(B−U)/s remain recorded in `data/leaderboard.json`. The generic family labels and the model drawings do not assert exact solutions for every task. Every model’s frozen parameters, Pauli terms, sources and identity hash can be inspected.

The download opens the v1.3.0 release with its build-context parts, recovery scripts and build instructions. The BibTeX entry cites the software on GitHub. The arXiv control shows the publication status.

## Integration with Studio

All assets and data paths are relative. Copy the complete directory to the final static subdirectory; no root-level base URL is assumed. The integration agent can use an independent project route or an iframe. For an iframe, append `?embed=1` to hide this page’s own Studio header and footer while preserving its four-section content and internal anchors. The parent application owns iframe sizing and routing. The project does not mutate parent-page DOM, hashes or styles.

The Studio home and Quantum Cloud links are configured in `config.js`. The `arxiv` entry can be set when a paper URL is available. Community results require independent verification before inclusion in the leaderboard.

## Behaviour

The cyclic family strip advances while visible, pauses on hover, keyboard focus, an open dialog or an inactive tab, and has previous/next/pause controls. Its seam continues in the same direction rather than scrolling backwards through the strip. Duplicated visual copies are hidden from the accessibility tree; original family controls remain keyboard accessible. Reduced-motion preferences disable automatic advancement by default. The model dialog supports search, dimensions, clear filters, native modal focus containment and Escape to close. Each chart bar is keyboard accessible and opens the corresponding table row. The local terminal example can be copied.

The complete page supports Chinese and English, including model details, chart labels, accessibility text and the overview diagram. The initial language follows the URL, then saved preference, then browser language. Switching preserves other URL parameters and the current section. KaTeX0.19.1 is vendored, including its CSS and fonts, so formula rendering requires no runtime CDN access. The header/footer reflect the supplied Eureka Studio branding. The supplied handwritten layout and the live reference sites are the layout specification. Scientific figures remain editable SVG rather than generated raster assets.

Validation evidence and development screenshots are kept outside this distributable directory, in the project’s `tmp/website-qa/` folder. They are not included in the site bundle.
