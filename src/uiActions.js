import {MenuItem} from "./menu";
import {Promise} from "./es2015";
import {PeriodicTableSelectDialog} from "./ui/periodic_table";
import {drawAt} from "./ui/d2d_extensions";

import $ from "jquery";

const ptX = 300;
const ptY = 100;
/** @type PeriodicTableSelectDialog|ClearingUIElement */
let activePt = undefined;
/** @type PeriodicTableSelectDialog */
let cancelEscapingPt = undefined;
export function handleClick(x, y) {
    const pX = x - ptX;
    const pY = y - ptY;
    if (activePt) {
        if (activePt.clickArea.contains(pX, pY)) {
            activePt.onClick(pX, pY);
        }
    }
}
export function draw(d2d) {
    if (activePt) {
        d2d::drawAt({x: ptX, y: ptY}, () => {
            activePt.clearRenderArea(d2d);
            activePt.render(d2d);
        });
    }
}
function clearActivePt() {
    activePt = activePt.createClearingInstance();
    activePt.promise = activePt.clearPromise.then(() => {
        activePt = undefined;
    });
}
function getElement(okText, cancelText) {
    if (activePt) {
        // defer until table is done
        return activePt.promise.then(() => getElement(okText, cancelText));
    }
    return (activePt = new PeriodicTableSelectDialog(okText, cancelText)).promise.then(e => {
        cancelEscapingPt = activePt;
        clearActivePt();
        return e;
    }, e => {
        cancelEscapingPt = activePt;
        clearActivePt();
        throw e;
    });
}
/**
 * @param {int} count number to get or -1 for user-defined amount
 */
function getElements(count) {
    if (count >= 0) {
        // ez mode
        const promises = new Array(count);
        for (let i = 0; i < count; i++) {
            const hasNext = (i + 1) < count;
            promises[i] = getElement(hasNext ? "Next" : "Complete", "Cancel");
        }
        return Promise.all(promises).then(e => {
            cancelEscapingPt = undefined;
            return e;
        });
    } else {
        return new Promise((res, rej) => {
            const results = [];

            function handler(e) {
                results.push(e);
                submitter();
            }

            function submitter() {
                getElement("Next", "Submit").then(handler, e => {
                    // Take the selected one and add it, if needed
                    if (cancelEscapingPt.selected) {
                        results.push(cancelEscapingPt.selected);
                    }
                    cancelEscapingPt = undefined;
                    if (results.length === 0) {
                        rej(e);
                    } else {
                        res(results);
                    }
                });
            }

            submitter();
        });
    }
}
export class CovalentMenuItem extends MenuItem {
    constructor(ref) {
        super(ref);
    }

    onClickedChange(oldVal, newVal) {
        if (newVal) {
            getElements(-1)
                .then(elements => {
                    console.log(elements.map(a => a.name).join(","));
                }, $.noop);
        }
        return true;
    }

}
