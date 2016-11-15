const PIXEL_RATIO = (() => {
    const ctx = document.createElement("canvas").getContext("2d"),
        dpr = window["devicePixelRatio"] || 1,
        bsr = ctx["webkitBackingStorePixelRatio"] ||
            ctx["mozBackingStorePixelRatio"] ||
            ctx["msBackingStorePixelRatio"] ||
            ctx["oBackingStorePixelRatio"] ||
            ctx["backingStorePixelRatio"] || 1;

    return dpr / bsr;
})();

export function createHiDPICanvas(w, h, zIndex) {
    const canvas = document.createElement("canvas");
    const ratio = PIXEL_RATIO;
    canvas.width = w * ratio;
    canvas.height = h * ratio;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    canvas.style.zIndex = zIndex;
    canvas.classList.add("layer");
    canvas.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
    return canvas;
}