"""Static demonstration knowledge graph: role → competency → topic → resource."""

GRAPH = {
    "nodes": [
        {"id": "role:so", "type": "role", "label": "Statistical Officer"},
        {"id": "comp:D-SAM", "type": "competency", "label": "Sampling"},
        {"id": "comp:D-QUA", "type": "competency", "label": "Data Quality"},
        {"id": "comp:F-DA", "type": "competency", "label": "Regression / Analysis"},
        {"id": "comp:D-NSS", "type": "competency", "label": "Survey Methodology"},
        {"id": "topic:stratified", "type": "topic", "label": "Stratified sampling"},
        {"id": "topic:cluster", "type": "topic", "label": "Cluster sampling"},
        {"id": "topic:gsbpm", "type": "topic", "label": "GSBPM quality steps"},
        {"id": "topic:plfs", "type": "topic", "label": "PLFS concepts"},
        {"id": "topic:regression", "type": "topic", "label": "Linear regression"},
        {"id": "res:igot-sample", "type": "resource", "label": "iGOT-ready sampling course (demo catalogue)"},
        {"id": "assess:diag", "type": "assessment", "label": "Diagnostic + adaptive quiz"},
        {"id": "mastery:sampling", "type": "mastery", "label": "Sampling mastery gate"},
    ],
    "edges": [
        {"from": "role:so", "to": "comp:D-SAM", "rel": "requires"},
        {"from": "role:so", "to": "comp:D-QUA", "rel": "requires"},
        {"from": "role:so", "to": "comp:F-DA", "rel": "requires"},
        {"from": "role:so", "to": "comp:D-NSS", "rel": "requires"},
        {"from": "comp:D-SAM", "to": "topic:stratified", "rel": "includes"},
        {"from": "comp:D-SAM", "to": "topic:cluster", "rel": "includes"},
        {"from": "topic:cluster", "to": "topic:stratified", "rel": "confused_with"},
        {"from": "comp:D-QUA", "to": "topic:gsbpm", "rel": "includes"},
        {"from": "comp:D-NSS", "to": "topic:plfs", "rel": "includes"},
        {"from": "comp:F-DA", "to": "topic:regression", "rel": "includes"},
        {"from": "topic:stratified", "to": "res:igot-sample", "rel": "resource"},
        {"from": "topic:stratified", "to": "assess:diag", "rel": "assessed_by"},
        {"from": "assess:diag", "to": "mastery:sampling", "rel": "verifies"},
        {"from": "topic:gsbpm", "to": "topic:stratified", "rel": "prerequisite"},
    ],
    "disclaimer": "Demonstration graph for SIH. Edges are pedagogical, not an official MoSPI taxonomy.",
}


def get_graph() -> dict:
    return GRAPH
