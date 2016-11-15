import {UIElement} from "./base";
import {isolate} from "./d2d_extensions";

function boolOrDefault(ret, def) {
    if (typeof ret !== "undefined") {
        return ret;
    }
    return def;
}
/**
 * @callback DownHandler
 * @param {Button} $this
 */
/**
 * @callback UpHandler
 * @param {Button} $this
 */
/**
 */
export class Button extends UIElement {
    /**
     *
     * @param {Object} options
     * @param {int} options.width width
     * @param {int} options.height height
     * @param {string} options.text text
     * @param {string} [options.onColor="#2DFFB3"] onColor
     * @param {string} [options.offColor="black"] offColor
     */
    constructor(options) {
        super(options);
        this.text = options.text;
        this.onColor = options.onColor || "#2DFFB3";
        this.offColor = options.offColor || "black";
        this._assignColorFromClicked();
    }

    /**
     * @param {DownHandler} action
     */
    set downHandler(action) {
        this._down = action;
    }

    /**
     * @param {UpHandler} action
     */
    set upHandler(action) {
        this._up = action;
    }

    set clicked(bool) {
        super.clicked = bool;
        this._assignColorFromClicked();
    }

    get clicked() {
        return super.clicked;
    }

    set onColor(c) {
        this._onColor = c;
        this._assignColorFromClicked();
    }

    get onColor() {
        return this._onColor;
    }

    set offColor(value) {
        this._offColor = value;
        this._assignColorFromClicked();
    }

    get offColor() {
        return this._offColor;
    }

    _assignColorFromClicked() {
        this.color = this.clicked ? this.onColor : this.offColor;
    }

    onClickedChange(oldVal, newVal) {
        if (!oldVal && newVal) {
            if (this._down) {
                return boolOrDefault(this._down(this), true);
            }
        } else if (oldVal && !newVal) {
            if (this._up) {
                return boolOrDefault(this._up(this), true);
            }
        }
        return super.onClickedChange(oldVal, newVal);
    }

    render(d2d) {
        d2d::isolate(() => {
            const textHeight = 16;
            d2d.lineWidth = 1;
            d2d.font = `${textHeight}px serif`;
            d2d.fillStyle = d2d.strokeStyle = this.color;
            d2d.strokeRect(0, 0, this.width, this.height);
            const x = (this.width - d2d.measureText(this.text).width) / 2;
            const y = (this.height + (2 * textHeight) / 3) / 2;
            d2d.fillText(this.text, x, y);
        });
    }
}