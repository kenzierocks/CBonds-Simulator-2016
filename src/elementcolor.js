const PHASE_TABLE = {
    "Gas": "red",
    "Liquid": "purple",
    "Solid": "blue"
};
export function getElementPhaseColor(jsonIso) {
    const phase = jsonIso["phase"];
    if (!PHASE_TABLE.hasOwnProperty(phase)) {
        console.log("missing phase", phase);
        PHASE_TABLE[phase] = "white";
    }
    return PHASE_TABLE[phase];
}

const CATEGORY_TABLE = {
    "diatomic nonmetal": "#a1a3d8",
    "noble gas": "#3366cc",
    "alkali metal": "#f9ac93",
    "alkaline earth metal": "#fed293",
    "metalloid": "#a5dce4",
    "polyatomic nonmetal": "#c1ded0",
    "post-transition metal": "#a8d699",
    "transition metal": "#f6f499",
    "lanthanide": "#ee93c4",
    "actinide": "#e3aec3"

};
CATEGORY_TABLE["unknown, probably transition metal"] = CATEGORY_TABLE["transition metal"];
CATEGORY_TABLE["unknown, probably post transition metal"] = CATEGORY_TABLE["post-transition metal"];
CATEGORY_TABLE["unknown,probably metalloid"] = CATEGORY_TABLE["metalloid"];
CATEGORY_TABLE["unknown, predicted to be noble gas"] = CATEGORY_TABLE["noble gas"];
export function getElementCategoryColor(jsonIso) {
    const category = jsonIso["category"];
    if (!CATEGORY_TABLE.hasOwnProperty(category)) {
        console.log("missing category", category);
        CATEGORY_TABLE[category] = "white";
    }
    return CATEGORY_TABLE[category];
}