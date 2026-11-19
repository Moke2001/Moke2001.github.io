"""Rebuild public website data from frozen local sources, without new scoring.

Run from Eureka using Environment/Python/run.sh. Only website/data is written.
"""
from __future__ import annotations

import copy
import hashlib
import json
from pathlib import Path

DATA = Path(__file__).resolve().parent
PROJECT = DATA.parent.parent
EUREKA = PROJECT.parent.parent
assert DATA.is_relative_to(EUREKA.resolve())


def read(relative):
    return json.loads((PROJECT / relative).read_text())


def sha(relative):
    return hashlib.sha256((PROJECT / relative).read_bytes()).hexdigest()


def write(name, value):
    target = DATA / name
    if target.is_symlink():
        raise ValueError("Refusing to follow an output symlink")
    target.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


RANK_DIR = "results/benchmark10-complete-ranking-20261113/"
ranking = read(RANK_DIR + "ranking.json")
catalogue = read("config/benchmark50_tasks.json")
task_ids = [m["task_id"] for m in ranking["summaries"][0]["task_metrics"]]

leaderboard = {
    "schema": "seekgnomes.website.leaderboard/v1",
    "title": "LLM rank",
    "snapshot_date": "2026-11-13",
    "snapshot_label": "Historical 10-task evaluation",
    "scoring_version": "composite_v1",
    "post_hoc_exploratory": True,
    "task_ids": task_ids,
    "task_count": 10,
    "trials_per_task": 5,
    "trials_per_model": 50,
    "total_scientific_trials": 250,
    "web_access": False,
    "complete_model_count": 5,
    "score_range": [0, 100],
    "metric_units": {
        "score": "points out of 100",
        "pass_rate": "fraction in [0,1]",
        "improvement_rate": "fraction in [0,1]",
        "amplitude_mean": "fraction in [0,1]",
        "ci95": "score points",
    },
    "definitions": {
        "S": "30 P + 30 R + 40 A",
        "P": "Fraction of trials with at least one certified legal state and energy upper bound within the original run budget.",
        "R": "Fraction of trials with original I = max(0, (B-U)/s) >= 0.01. This is not a threshold on A.",
        "A": "Mean of max(0, (B-U)/(B-L)) over all 50 scientific outcomes per model, including zero for scientific outcomes with no certified state.",
        "B": "Frozen public baseline energy upper bound.",
        "U": "Best certified upper bound obtained within the selected run's budget.",
        "L": "Frozen rigorous algebraic lower bound, not an exact ground-state energy.",
        "s": "Sum of absolute nonidentity Pauli coefficients per physical qubit.",
    },
    "caption": "Historical results on 10 fixed tasks with five trials per task and no web access. Bars show S = 30P + 30R + 40A; whiskers show within-task bootstrap 95% intervals. Only models with all 50 scientific outcomes are included.",
    "bootstrap": copy.deepcopy(ranking["score_definition"]["bootstrap"]),
    "limitations": [
        "This historical composite_v1 snapshot is not scored with the revised exact-energy rule or the newer two-agent protocol.",
        "These are results on ten fixed tasks, not completed evaluations on all 50 models in the physical-model library.",
        "The score is a task-specific research utility measure, not state fidelity or a fraction of the true ground-state error removed.",
        "Technical failures are not imputed as zero; incomplete model families are excluded.",
        "GLM-5.3 combines 49 bh2 trials and one infi trial. Technical retry policies and runtime versions also differ among families.",
        "Bootstrap intervals condition on the fixed ten tasks and omit task-selection and deployment uncertainty.",
        "The MiMo minus GLM score difference has a 95% bootstrap interval of [-1.8, 4.2], so their point-estimate order is not a robust separation.",
    ],
    "excluded_models": copy.deepcopy(ranking["excluded_families"]),
    "exclusion_note": ranking["exclusion_note"],
    "models": [],
    "source": {
        "ranking": RANK_DIR + "ranking.json",
        "ranking_sha256": sha(RANK_DIR + "ranking.json"),
        "score_spec": RANK_DIR + "score-spec.json",
        "score_spec_sha256": sha(RANK_DIR + "score-spec.json"),
        "protocol": "BENCHMARK10_PROTOCOL.md",
        "protocol_sha256": sha("BENCHMARK10_PROTOCOL.md"),
        "source_created_utc": ranking["created_utc"],
    },
}

for row in ranking["summaries"]:
    fields = ["family", "label", "rank", "n", "task_count", "pass_count",
              "improvement_count", "pass_rate", "improvement_rate", "amplitude_mean",
              "original_mean_I", "score", "ci95", "contributions", "deployment_counts",
              "mixed_deployments", "task_metrics"]
    public = {key: copy.deepcopy(row[key]) for key in fields}
    public["display_label"] = row["label"].replace("*", "")
    public["pass_percent"] = row["pass_rate"] * 100
    public["improvement_percent"] = row["improvement_rate"] * 100
    public["amplitude_percent"] = row["amplitude_mean"] * 100
    public["note"] = ("Mixed deployment: 49 bh2/glm-5.3 + 1 infi/glm-5.3."
                      if row["mixed_deployments"] else "")
    leaderboard["models"].append(public)

FAMILIES = [
    dict(id="ising", name="Ising & plaquette", task_ids=[1,2,3,13,14,21,31,34,38],
         featured_task_id="13", description="Local Ising interactions, transverse fields and multispin plaquettes test quantum fluctuations across one, two and three dimensions."),
    dict(id="exchange", name="Exchange & frustration", task_ids=[4,5,6,7,11,12,15,16,17,18,19,32,33,35,36,39,40,43],
         featured_task_id="17", description="Spin exchange on chains, ladders and frustrated lattices spans anisotropy, dimerization, chirality and quantum spin ice."),
    dict(id="kitaev", name="Compass & Kitaev", task_ids=[10,20,22,23,24,37,41,42],
         featured_task_id="22", description="Bond direction selects the spin component, from compass interactions to honeycomb and three-dimensional tricoordinated Kitaev lattices."),
    dict(id="cluster", name="Cluster & SPT", task_ids=[8,9,28,29,30,44],
         featured_task_id="29", description="Multiqubit cluster and symmetry-protected topological fixed-point Hamiltonians provide structured entangled-state targets."),
    dict(id="topological", name="Topological codes", task_ids=[25,26,27,45,50],
         featured_task_id="25", description="Local commuting operators on faces, stars and cells define topologically ordered spin and quantum-code Hamiltonians."),
    dict(id="fracton", name="Fracton codes", task_ids=[46,47,48,49],
         featured_task_id="48", description="Three-dimensional commuting Pauli models exhibit restricted excitation motion and geometry beyond ordinary topological codes."),
]
for family in FAMILIES:
    family["task_ids"] = [f"{n:02d}" for n in family["task_ids"]]

# Short editorial descriptions only; all mathematical definitions stay in terms.
DESCRIPTIONS = {
    "01": ("Transverse-field Ising chain", "Ferromagnetic nearest-neighbor ZZ interactions compete with a transverse X field on an infinite chain."),
    "02": ("Mixed-field Ising chain", "A longitudinal Z field adds a second field direction to the nearest-neighbor transverse-field Ising chain."),
    "03": ("ANNNI chain", "Competing nearest- and next-nearest-neighbor Ising interactions are combined with a transverse field."),
    "04": ("Anisotropic XY chain", "Unequal XX and YY nearest-neighbor couplings interact with a transverse Z field."),
    "05": ("XXZ in a longitudinal field", "Anisotropic nearest-neighbor exchange competes with a longitudinal field on an infinite chain."),
    "06": ("Zero-field XYZ chain", "Three unequal nearest-neighbor spin-component couplings define an anisotropic chain without an external field."),
    "07": ("Majumdar-Ghosh chain", "Nearest- and next-nearest-neighbor spin-1/2 exchange is fixed at a known dimer ground-state point."),
    "08": ("1D cluster", "Commuting ZXZ operators couple each chain qubit to its two neighbors."),
    "09": ("Cluster-Ising chain", "Three-site XZX cluster interactions compete with nearest-neighbor YY interactions."),
    "10": ("Alternating compass chain", "XX and ZZ bonds alternate in a two-qubit unit cell along the chain."),
    "11": ("J-Q2 chain", "Singlet-projector bonds and products of adjacent disjoint singlet projectors define a one-dimensional J-Q interaction."),
    "12": ("Two-leg Heisenberg ladder", "Antiferromagnetic exchange runs along two legs and across the rung in each two-qubit cell."),
    "13": ("Square-lattice TFIM", "Square-lattice nearest-neighbor ZZ bonds compete with a uniform transverse X field."),
    "14": ("Triangular AF TFIM", "Antiferromagnetic Ising bonds on triangles combine geometric frustration with transverse-field fluctuations."),
    "15": ("Square J1-J2 Heisenberg", "Nearest-neighbor exchange competes with both next-nearest diagonal exchanges on the square lattice."),
    "16": ("Triangular Heisenberg", "Nearest-neighbor antiferromagnetic spin exchange acts on a triangular lattice."),
    "17": ("Kagome Heisenberg", "Nearest-neighbor antiferromagnetic exchange acts on corner-sharing triangles with three qubits per primitive cell."),
    "18": ("Shastry-Sutherland", "Square-lattice exchange and orthogonal dimer bonds are fixed at a known dimer-product ground-state point."),
    "19": ("Square J-Q", "Square-lattice singlet-projector interactions include both opposite-edge products on each plaquette."),
    "20": ("Square compass", "Horizontal XX and vertical ZZ bonds tie the interaction component to the square-lattice direction."),
    "21": ("Xu-Moore plaquette Ising", "Four-qubit Z plaquette interactions compete with on-site transverse X fields."),
    "22": ("Honeycomb Kitaev", "Three bond colors select XX, YY and ZZ interactions on a honeycomb lattice with two qubits per cell."),
    "23": ("Heisenberg-Kitaev-Gamma", "Honeycomb bonds combine isotropic exchange, bond-selective components and symmetric off-diagonal exchange."),
    "24": ("Decorated honeycomb Kitaev", "Each honeycomb vertex is replaced by a triangle, producing bond-colored couplings in a six-qubit cell."),
    "25": ("2D toric code", "X-type stars and Z-type plaquettes act on the edges of an infinite square lattice."),
    "26": ("Wen plaquette", "Commuting four-qubit XYXY operators act around square plaquettes."),
    "27": ("Honeycomb color code", "X- and Z-type hexagon operators act on honeycomb vertex qubits."),
    "28": ("2D cluster", "A central X operator is dressed by Z operators on its four square-lattice neighbors."),
    "29": ("Levin-Gu SPT", "Spin flips acquire phases from neighboring Ising domain walls at a triangular-lattice symmetry-protected topological fixed point."),
    "30": ("Union-Jack CCZ SPT", "Spin flips dressed by controlled-Z phases arise from a controlled-controlled-Z circuit on the Union-Jack lattice."),
    "31": ("Quantum Baxter-Wu", "Three-spin Ising interactions on both orientations of triangular plaquettes compete with a transverse field."),
    "32": ("BFG kagome", "Easy-axis interactions couple all pairs around kagome hexagons, together with weak transverse exchange."),
    "33": ("Chiral kagome Heisenberg", "Heisenberg exchange is supplemented by oriented scalar-spin-chirality terms on kagome triangles."),
    "34": ("Cubic TFIM", "Three-dimensional simple-cubic Ising bonds compete with a uniform transverse field."),
    "35": ("Cubic J1-J2 Heisenberg", "Simple-cubic nearest-neighbor exchange competes with exchange across all face diagonals."),
    "36": ("BCC J1-J2 Heisenberg", "Competing exchange couplings connect nearest and next-nearest neighbors on the body-centered cubic lattice."),
    "37": ("Cubic compass", "XX, YY and ZZ interactions are assigned to the three simple-cubic lattice directions."),
    "38": ("Cubic plaquette Ising", "Four-spin Ising interactions occupy all three plaquette orientations and compete with a transverse field."),
    "39": ("Quantum spin ice", "XXZ exchange acts on corner-sharing pyrochlore tetrahedra in a four-qubit primitive cell."),
    "40": ("Dimerized diamond Heisenberg", "Strong intra-cell and weaker inter-cell spin exchange distinguish one diamond-lattice bond direction."),
    "41": ("Hyperhoneycomb Kitaev", "Bond-selective XX, YY and ZZ interactions extend to the three-dimensional hyperhoneycomb lattice."),
    "42": ("Hyperoctagon Kitaev", "A three-dimensional tricoordinated lattice carries bond-colored Kitaev interactions with four qubits per cell."),
    "43": ("Hyperkagome Heisenberg", "Nearest-neighbor antiferromagnetic exchange acts on a three-dimensional corner-sharing-triangle lattice with twelve qubits per cell."),
    "44": ("3D cluster", "A central X operator is dressed by Z operators on its six simple-cubic neighbors."),
    "45": ("3D toric code", "X-type vertex stars and Z-type face plaquettes act on cubic-lattice edge qubits."),
    "46": ("X-cube", "Twelve-edge X cube operators and planar four-edge Z crosses define a cubic fracton Hamiltonian."),
    "47": ("Checkerboard fracton", "Eight-qubit X and Z cube operators act on one checkerboard sublattice of the cubic lattice."),
    "48": ("Haah cubic code", "Two-qubit cubic cells support commuting X and Z interactions with the code-1 polynomial geometry."),
    "49": ("Chamon", "Six-qubit mixed-Pauli stabilizers act on a face-centered cubic lattice."),
    "50": ("3D color code", "Commuting X- and Z-type operators are defined on a truncated-octahedral cellulation with twelve qubits per translation cell."),
}

family_by_id = {task_id: f["id"] for f in FAMILIES for task_id in f["task_ids"]}
assert set(family_by_id) == {t["id"] for t in catalogue["tasks"]} == set(DESCRIPTIONS)
assert sum(len(f["task_ids"]) for f in FAMILIES) == 50

models = {
    "schema": "seekgnomes.website.physical-models/v1",
    "title": "Physical models",
    "task_count": 50,
    "dimension_counts": {str(d):sum(t["dimension"]==d for t in catalogue["tasks"]) for d in (1,2,3)},
    "scope": "Infinite translation-invariant finite-range qubit lattice interactions, with a finite number of qubits per cell.",
    "interaction_convention": catalogue["interaction_convention"],
    "conventions": {
        "site": "A site is (cell, qubit): cell is an integer d-tuple and qubit is a zero-based index within the unit cell.",
        "pauli": "Each term is a coefficient times a finite Hermitian Pauli word. X, Y and Z denote Pauli matrices, not spin matrices.",
        "spin": "Conventional spin-1/2 exchange uses S=sigma/2. The frozen Pauli coefficients already include all required factors, including the 1/4 in Heisenberg exchange terms.",
        "translation": "One listed local interaction density h0 is translated over every unit cell. Cell translations do not permute qubit species.",
        "energy": "The energy density per physical qubit is omega(h0)/q, where q is qubits_per_cell.",
        "infinite_sum": "H denotes a local interaction family, not a bounded infinite operator sum.",
        "constants": "Identity terms, including projector offsets, are retained exactly.",
    },
    "families": FAMILIES,
    "source": {"catalogue":"config/benchmark50_tasks.json",
               "catalogue_sha256":sha("config/benchmark50_tasks.json"),
               "builder":"src/benchmark50_models.py", "builder_sha256":sha("src/benchmark50_models.py")},
    "historical_rank_task_ids":task_ids,
    "notes": [
        "This is the complete physical-model library. The displayed historical leaderboard evaluated only the ten task IDs identified separately.",
        "Descriptions and family labels are editorial summaries of the frozen interactions. The exact mathematical task definitions are the original terms, parameters and cell conventions below.",
        "Frozen solvability codes are retained for provenance only and are not a universal claim that a global exact ground-state energy has been established.",
        "The qubit-only fifty-task catalogue does not include a Fermi-Hubbard task.",
    ],
    "models": [],
}
for task in catalogue["tasks"]:
    row = copy.deepcopy(task)
    row["short_name"], row["description"] = DESCRIPTIONS[task["id"]]
    row["family"] = family_by_id[task["id"]]
    row["historical_rank_task"] = task["id"] in task_ids
    row["term_count"] = len(task["terms"])
    row["max_pauli_weight"] = max(len(term["word"]) for term in task["terms"])
    row["frozen_solvability_code"] = row.pop("solvability")
    models["models"].append(row)

# No old scientific result, task, definition or score is recomputed or changed.
for row, old in zip(leaderboard["models"], ranking["summaries"]):
    for key in ("score", "pass_rate", "improvement_rate", "amplitude_mean", "ci95"):
        assert row[key] == old[key]
    assert row["n"] == 50 and row["task_count"] == 10
for row, original in zip(models["models"], catalogue["tasks"]):
    for key in ("id", "name", "dimension", "qubits_per_cell", "parameters", "lattice", "terms", "sources", "canonical_sha256"):
        assert row[key] == original[key]

write("leaderboard.json", leaderboard)
write("models.json", models)
print(json.dumps({"models":len(models["models"]), "dimensions":models["dimension_counts"],
                  "leaderboard_models":len(leaderboard["models"]),
                  "historical_task_ids":task_ids,
                  "files":{n:hashlib.sha256((DATA/n).read_bytes()).hexdigest()
                           for n in ("leaderboard.json","models.json")}},indent=2))
