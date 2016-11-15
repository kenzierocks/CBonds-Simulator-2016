import {isolate, drawAt} from "./ui/d2d_extensions";
import {UIElement} from "./ui/base";

export class MenuItem extends UIElement {
    /**
     * @param {String} name
     * @param {int} width
     * @param {int} height
     * @param {String} color
     * @param {String} clickedColor
     */
    constructor({
        name, width, height, color = "#FFFFFF", clickedColor = "#18E7E7"
    }) {
        super({width: width, height: height});
        this.name = name;
        this.color = color;
        this.clickedColor = clickedColor;

        this.dirty = true;
        this.fontSize = 16;
        this.renderColor = this.color;
    }

    /**
     * @param {boolean} bool
     */
    set clicked(bool) {
        if (this.clicked !== bool) {
            this.renderColor = bool ? this.clickedColor : this.color;
        }
        super.clicked = bool;
    }

    /**
     * @returns {boolean}
     */
    get clicked() {
        return super.clicked;
    }

    set renderColor(c) {
        this._rc = c;
        this.dirty = true;
    }

    get renderColor() {
        return this._rc;
    }

    /**
     * @param {CanvasRenderingContext2D} d2d
     */
    render(d2d) {
        d2d::isolate(() => {
            d2d.lineWidth = 1;
            d2d.fillStyle = this.renderColor;
            d2d.fillRect.apply(d2d, this._aabb.array);
            d2d.strokeStyle = "black";
            d2d.strokeRect.apply(d2d, this._aabb.array);
            d2d.fillStyle = "black";
            d2d.font = `${this.fontSize}px serif`;
            d2d.fillText(this.name,
                (this.width - d2d.measureText(this.name).width) / 2,
                (this.height + (2 * this.fontSize) / 3) / 2);
        });
    }
}
export class Menu extends MenuItem {
    /**
     * @param {int} buttonWidth
     * @param {int} buttonHeight
     */
    constructor(buttonWidth, buttonHeight) {
        super({name: undefined, width: Infinity, height: Infinity});
        this.buttonWidth = buttonWidth;
        this.buttonHeight = buttonHeight;
        /** @type {Array.<MenuItem>} */
        this._items = [];
        this.dirty = true;
    }

    get clickArea() {
        return this._items.reduce((aabb, mi) => aabb.newWithLast(mi.clickArea), super.clickArea);
    }

    /**
     * @param {number} x
     * @param {number} y
     */
    onClick(x, y) {
        let anyClicked = false;
        this._items.forEach((mi, i) => {
            if (anyClicked) {
                return;
            }
            const [mX, mY] = this.getItemPosition(i);
            const nX = x - mX, nY = y - mY;
            if (mi.clickArea.contains(nX, nY) && mi.onClick(nX, nY)) {
                if (mi.clicked) {
                    this._items.forEach(mi2 => {
                        if (mi2 !== mi) {
                            mi2.clicked = false;
                        }
                    });
                    anyClicked = true;
                }
            }
        });
        return anyClicked;
    }

    /**
     *
     * @param {int} index
     * @returns {Array|[int,int]}
     */
    getItemPosition(index) {
        return [0, index * this.buttonHeight];
    }

    /**
     * @param {Function.<Object>} Constructor
     * @param {Object} args
     */
    addButton(Constructor, args = undefined) {
        if (args === undefined) {
            args = {};
        }

        args.width = args.width || this.buttonWidth;
        args.height = args.height || this.buttonHeight;
        const item = new Constructor(args);
        this._items.push(item);
        return item;
    }

    set dirty(bool) {
        if (!this._items) {
            return;
        }
        // Propagate dirty state to children
        this._items.forEach(mi => mi.dirty = bool);
    }

    get dirty() {
        // dirty state comes from children
        for (let mi of this._items) {
            if (mi.dirty) {
                return true;
            }
        }
        return false;
    }

    onClickedChange(oldVal, newVal) {
        if (!newVal && this._items) {
            this._setItemsClicked(false);
            return true;
        }
        return false;
    }

    setNothingClicked() {
        this.setClicked(false);
        this._setItemsClicked(false);
    }

    _setItemsClicked(bool) {
        this._items.forEach(mi => {
            mi.setClicked(bool);
        });
    }

    /**
     * @param {CanvasRenderingContext2D} d2d
     */
    clearRenderArea(d2d) {
        this._items.forEach((mi, i) => {
            if (mi.dirty) {
                const [x,y] = this.getItemPosition(i);
                d2d::drawAt({x: x, y: y}, ::mi.clearRenderArea);
            }
        });
    }

    /**
     * @param {CanvasRenderingContext2D} d2d
     */
    render(d2d) {
        this._items.forEach((mi, i) => {
            if (!mi.dirty) {
                return;
            }
            const [x,y] = this.getItemPosition(i);
            d2d::drawAt({x: x, y: y}, ::mi.render);
            mi.dirty = false;
        });
    }
}
/** @property {Menu} DropDownMenuItem.menu */
export class DropDownMenuItem extends MenuItem {
    constructor(ref) {
        super(ref);
        this.menu = new Menu(this.width, this.height);
    }

    get clickArea() {
        return this.clicked
            ? super.clickArea.newWithLast(this.menu.clickArea)
            : super.clickArea;
    }

    onClick(x, y) {
        if (this.clicked) {
            // check menu click
            if (this.menu.clickArea.contains(x - this.width, y)) {
                if (this.menu.onClick(x - this.width, y)) {
                    this.clicked = false;
                    return true;
                }
            }
        }
        return super.onClick(x, y);
    }

    set clicked(bool) {
        super.clicked = bool;
        if (!this.clicked && this.menu) {
            // clear clicking for menu
            this.menu.setNothingClicked();
        }
    }

    get clicked() {
        return super.clicked;
    }

    set dirty(bool) {
        this._dirty = bool;
        if (this.menu) {
            this.menu.dirty = bool;
        }
    }

    get dirty() {
        return this._dirty || this.menu.dirty;
    }

    clearRenderArea(d2d) {
        super.clearRenderArea(d2d);
        d2d::drawAt({x:this.width}, ::this.menu.clearRenderArea);
    }

    render(d2d) {
        super.render(d2d);
        if (this.clicked) {
            d2d::drawAt({x:this.width}, ::this.menu.render);
        }
    }
}