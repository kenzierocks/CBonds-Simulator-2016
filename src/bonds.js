/** @property {Map.<Atom,Array.<Bond>>} BondContainer._atomToBond */
export class BondContainer {
    static of(...bonds) {
        return new BondContainer(bonds);
    }

    constructor(bonds = []) {
        this.bonds = bonds.slice();
        this._atomToBond = new Map();
        this.computeGraph();
    }

    computeGraph() {
        this.bonds.forEach(b => {
            if (b instanceof MetallicBond) {
                // can't really know atoms involved here...
            } else {
                b.atoms.forEach(a => {
                    const arr = this._atomToBond.get(a) || [];
                    arr.push(b);
                    this._atomToBond.set(a, arr);
                });
            }
        });
    }

    getBondsForAtom(atom) {
        return this._atomToBond.get(atom).slice();
    }
}
class Bond {
}
export class CovalentBond extends Bond {
    constructor(atoms) {
        super();
        this.atoms = atoms;
        this.valid = this.verify();
    }

    verify() {
        return true;
    }
}
function ionificate(atoms) {
    // find out what atoms are donating electrons, and how much
    let donators = atoms.filter(a => a.oxidationNumber > 0);
    let totalDonated = -donators.reduce((acc, a) => acc + a.electronsNeededForNBC, 0);
    let stealers = atoms.filter(a => a.oxidationNumber < 0);
    let totalNeeded = stealers.reduce((acc, a) => acc + a.electronsNeededForNBC, 0);
    if (totalDonated !== totalNeeded) {
        console.error(donators, stealers);
        throw Error(`Wanted ${totalNeeded} electrons, only donated ${totalDonated}!`);
    }
    return atoms.map(a => a.reCharge(a.oxidationNumber));
}
export class IonicBond extends CovalentBond {
    constructor(atoms) {
        super(ionificate(atoms));
    }

    verify() {
        const totalCharge = this.atoms.reduce((acc, a) => a.charge + acc, 0);
        return totalCharge === 0;
    }
}
// kinda just made of a mess of a single atom, yea?
export class MetallicBond extends Bond {
    constructor(atom) {
        super();
        this.atom = atom;
    }
}
