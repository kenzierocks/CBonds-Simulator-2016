import {AABB, AABBCollection} from "../bbox";
import {drawAt} from "./d2d_extensions";

export class UIElement {
    /**
     *
     * @param {int} width
     * @param {int} height
     */
    constructor({width, height}) {
        this.clicked = false;
        this._aabb = new AABB(0, 0, width, height);
        /** @type {AABBCollection} */
        this._clickAreaCache = undefined;
        /** @type Array.<[int,int,UIElement]> */
        this.children = [];
    }

    /**
     * @param {UIElement} child
     * @param {int} x
     * @param {int} y
     */
    addChild(x, y, child) {
        this.children.push([x, y, child]);
        this._clickAreaCache = undefined;
    }

    /**
     * @returns {AABBCollection} the bounding boxes for clicking
     */
    get clickArea() {
        if (typeof this._clickAreaCache === "undefined") {
            const arr = [this._aabb];
            if (this.children) {
                this.children.forEach(([x,y,c]) => {
                    arr.push(c.clickArea.move(x, y));
                });
            }
            this._clickAreaCache = AABBCollection.fromMixedArray(arr);
        }
        return this._clickAreaCache;
    }

    get width() {
        return this._aabb.width;
    }

    get height() {
        return this._aabb.height;
    }

    setClicked(bool) {
        const old = this.clicked;
        this.clicked = bool;
        return old !== this.clicked ? this.onClickedChange(old, this.clicked) : undefined;
    }

    /**
     * @param {boolean} bool
     */
    set clicked(bool) {
        this._clicked = bool;
    }

    /**
     * @returns {boolean}
     */
    get clicked() {
        return this._clicked;
    }

    /**
     * @param {boolean} oldVal - old value of clicked
     * @param {boolean} newVal - new value of clicked
     * @returns {boolean} true if an action was performed - i.e. consume this click
     */
    onClickedChange(oldVal, newVal) {
        return false;
    }

    /**
     * @param {number} x
     * @param {number} y
     * @return {boolean} success
     */
    onClick(x, y) {
        for (let [cX,cY,c] of this.children) {
            const offX = x - cX;
            const offY = y - cY;
            if (c.clickArea.contains(offX, offY)) {
                if (c.onClick(offX, offY)) {
                    return true;
                }
            }
        }
        return this.setClicked(!this.clicked);
    }

    /**
     * @param {CanvasRenderingContext2D} d2d
     */
    clearRenderArea(d2d) {
        d2d.clearRect(-1, -1, this.width + 2, this.height + 2);
        this.children.forEach(([x,y,c]) => {
            d2d::drawAt({x: x, y: y}, ::c.clearRenderArea);
        });
    }

    /**
     * @param {CanvasRenderingContext2D} d2d
     */
    render(d2d) {
        this.children.forEach(([x,y,c]) => {
            d2d::drawAt({x: x, y: y}, ::c.render);
        });
    }

    /**
     * Creates a severely limited instance of UIElement that only allows clearing this object.
     * A promise is available (<pre>element.clearPromise</pre>) that will be resolved upon first clear.
     *
     * @return {ClearingUIElement}
     */
    createClearingInstance() {
        return new ClearingUIElement(this);
    }
}
/**
 */
class ClearingUIElement extends UIElement {
    /**
     * @param {UIElement} delegate
     */
    constructor(delegate) {
        super({width: Infinity, height: Infinity});
        this._delegate = delegate;
        this.clearPromise = new Promise((resolve) => {
            this._resolve = resolve;
        });
    }

    clearRenderArea(d2d) {
        this._delegate.clearRenderArea(d2d);
        this._resolve(this._delegate);
    }
}