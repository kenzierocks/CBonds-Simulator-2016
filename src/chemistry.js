function calcVE(an, ve, charge) {
    // subtract charge to fix ve for charge
    ve -= charge;
    // if 0, set to appropriate ve for level below
    if (ve === 0) {
        if (an === 1) {
            ve = 0;
        } else if (an > 6) {
            // above carbon --> Ne
            ve = 8;
        } else {
            // less than carbon --> He
            ve = 2;
        }
    }
    return ve;
}
/**
 * Represents a single atom. It has an integer mass and a charge.
 */
export class Atom {
    constructor({atomicNumber, atomicMass, charge, name, symbol, valenceElectrons}) {
        this._atomicNumber = atomicNumber;
        this._atomicMass = atomicMass;
        this._name = name;
        this._symbol = symbol;
        this._charge = charge;
        const chargeVe = valenceElectrons - charge;
        this._valence = calcVE(atomicNumber, valenceElectrons, charge);
        this._oxyNum = chargeVe <= 4 ? chargeVe : -(8 - chargeVe);
    }

    get protons() {
        return this.atomicNumber;
    }

    get neutrons() {
        return this.atomicMass - this.atomicNumber;
    }

    get electrons() {
        return this.atomicNumber - this.charge;
    }

    get valenceElectrons() {
        return this._valence;
    }

    get oxidationNumber() {
        return this._oxyNum;
    }

    get electronsNeededForNBC() {
        return -this.oxidationNumber;
    }

    get charge() {
        return this._charge;
    }

    get atomicNumber() {
        return this._atomicNumber;
    }

    get atomicMass() {
        return this._atomicMass;
    }

    get name() {
        return this._name;
    }

    get symbol() {
        return this._symbol;
    }

    isIon() {
        return this.charge != 0;
    }

    reCharge(charge) {
        return new Atom({
            atomicNumber: this.atomicNumber,
            atomicMass: this.atomicMass,
            charge: charge,
            name: this.name,
            symbol: this.symbol,
            valenceElectrons: this.valenceElectrons
        });
    }

    subElectron() {
        return this.reCharge(this.charge + 1);
    }

    addElectron() {
        return this.reCharge(this.charge - 1);
    }
}
const VE_TABLE = {
    1: 1,
    2: 2,
    13: 3,
    14: 4,
    15: 5,
    16: 6,
    17: 7,
    18: 8
};
window.VE_TABLE = VE_TABLE;
function veFromGroup(group) {
    return VE_TABLE[parseInt(group)] || NaN;
}
export function getIsotope(name, jsonData) {
    return new Atom({
        atomicNumber: parseInt(jsonData["number"]),
        atomicMass: parseInt(jsonData["atomic_mass"] + 0.5),
        charge: 0,
        name: name,
        symbol: jsonData["symbol"],
        valenceElectrons: veFromGroup(jsonData["xpos"])
    });
}
export function getAllIsotopes(jsonData) {
    const m = new Map();
    jsonData.forEach(d => m.set(d[0], getIsotope.apply(undefined, d)));
    return m;
}