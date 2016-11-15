/**
 * @callback DrawHandler
 * @param {CanvasRenderingContext2D} d2d
 */
/**
 * @memberOf CanvasRenderingContext2D#
 * @param {int} x translate x, default 0
 * @param {int} y translate y, default 0
 * @param {DrawHandler} cb
 */
export function drawAt({x = 0, y = 0}, cb) {
    this::isolate(() => {
        this.translate(x, y);
        cb(this);
    });
}
/**
 * @memberOf CanvasRenderingContext2D#
 * @param {DrawHandler} cb
 */
export function isolate(cb) {
    this.save();
    try {
        cb(this);
    } finally {
        this.restore();
    }
}