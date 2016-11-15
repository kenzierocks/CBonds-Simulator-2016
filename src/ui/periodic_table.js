import NS from "../namespace";
import {MenuItem} from "../menu";
import {UIElement} from "./base";
import {Button} from "./button";
import {isolate} from "./d2d_extensions";
import {Promise} from "../es2015";
import {getElementCategoryColor, getElementPhaseColor} from "../elementcolor";
// known values for periodic table width/height
export const PTV_WIDTH = 25;
export const PTV_HEIGHT = 25;
export const PT_WIDTH = 19 * PTV_WIDTH;
export const PT_HEIGHT = 11 * PTV_HEIGHT;

function getPtGrid() {
    if (getPtGrid._cache === undefined) {
        getPtGrid._cache = (jIso => {
            const arr = new Array(19);
            for (let i = 0; i < arr.length; i++) {
                arr[i] = new Array(11);
            }
            jIso.forEach(i => {
                const obj = i[1];
                arr[obj["xpos"] - 1][obj["ypos"] - 1] = NS.isotopes.get(i[0]);
            });
            return arr;
        })(NS.jsonIsotopes);
    }
    return getPtGrid._cache;
}
export class PeriodicTableMenuItem extends MenuItem {
    constructor(ref) {
        super(ref);
    }

    clearRenderArea(d2d) {
        super.clearRenderArea(d2d);
        d2d.clearRect(200 - 1, 100 - 1, PT_WIDTH + 2, PT_HEIGHT + 2);
    }

    render(d2d) {
        if (this.clicked) {
            d2d.save();
            d2d.translate(200, 100);
            drawPeriodicTable(d2d);
            d2d.restore();
        }
        return super.render(d2d);
    }
}
export class PeriodicTableSelectDialog extends UIElement {
    constructor(okText = "Ok", cancelText = "Cancel") {
        super({
            width: PT_WIDTH,
            height: PT_HEIGHT
        });
        // this sets up fast enough that we shouldn't need to worry
        // about undefined stuff
        this.promise = new Promise((res, rej) => {
            this.res = res;
            this.rej = rej;
        });
        this.addChild(100, PT_HEIGHT + PTV_HEIGHT, this.cancel = new Button({
            width: 100,
            height: 50,
            text: cancelText
        }));
        this.addChild(300, PT_HEIGHT + PTV_HEIGHT, this.ok = new Button({
            width: 100,
            height: 50,
            text: okText,
            // initially leave this "disabled"
            offColor: "gray"
        }));
        this.ok.downHandler = () => {
            const sel = this.selected;
            if (sel) {
                this.res(sel);
                return true;
            }
            return false;
        };
        this.cancel.downHandler = () => {
            this.rej("canceled");
            return true;
        };
    }

    get selected() {
        return this._selected === undefined ? undefined : this._selected[2];
    }

    onClick(x, y) {
        const gX = parseInt(x / (PTV_WIDTH + 1));
        const gY = parseInt(y / (PTV_HEIGHT + 1));
        /** @type Atom */
        const val = getPtGrid()[gX][gY];
        if (val) {
            this._selected = [gX, gY, val];
            this.ok.offColor = "black";
            return true;
        }
        return super.onClick(x, y);
    }

    render(d2d) {
        drawPeriodicTable(d2d);
        if (this._selected) {
            highlightSelected(d2d, this._selected);
        }
        super.render(d2d);
    }
}
function xy2Canvas(x, y) {
    return [x * (PTV_WIDTH + 1), y * (PTV_HEIGHT + 1)];
}
function highlightSelected(d2d, selected) {
    const [boxX, boxY] = xy2Canvas(selected[0], selected[1]);
    d2d::isolate(() => {
        d2d.fillStyle = "#22AA99";
        d2d.globalAlpha = 0.5;
        d2d.fillRect(boxX, boxY, PTV_WIDTH, PTV_HEIGHT);
    });
}
function drawPeriodicTable(d2d) {
    d2d::isolate(() => {
        const w = PTV_WIDTH;
        const h = PTV_HEIGHT;
        const textHeight = 16;
        d2d.font = `${textHeight}px serif`;
        for (let jData of NS.jsonIsotopes) {
            const jIso = jData[1];
            const name = jIso["symbol"];
            const [boxX, boxY] = xy2Canvas(jIso["xpos"] - 1, jIso["ypos"] - 1);
            d2d.beginPath();
            d2d.rect(boxX, boxY, w, h);
            d2d.strokeStyle = "black";
            d2d.lineWidth = 2;
            d2d.stroke();
            d2d.beginPath();
            d2d.rect(boxX, boxY, w, h);
            d2d.fillStyle = getElementCategoryColor(jIso);
            d2d.fill();

            const textMetrics = d2d.measureText(name);
            const textX = boxX + (w - textMetrics.width) / 2;
            const textY = /* really fake */ boxY + (h + (2 * textHeight) / 3) / 2;
            d2d.fillStyle = getElementPhaseColor(jIso);
            d2d.fillText(name, textX, textY);
        }
    });
}