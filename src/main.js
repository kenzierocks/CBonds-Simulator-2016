import "./ui/d2d_extensions";
import {getAllIsotopes} from "./chemistry";
import {createHiDPICanvas} from "./hidpicanvas";
import {DropDownMenuItem, Menu} from "./menu";
import NS from "./namespace";
import $ from "jquery";
import * as uiActions from "./uiActions";
const WIDTH = 800, HEIGHT = 600;
let zIndex = 1;
const canvas = createHiDPICanvas(WIDTH, HEIGHT, zIndex++);
const menuCanvas = createHiDPICanvas(WIDTH, HEIGHT, zIndex++);

const gameDiv = document.getElementById("gamediv");
gameDiv.appendChild(canvas);
gameDiv.appendChild(menuCanvas);

const d2d = NS.d2d = canvas.getContext("2d");
const menuD2d = menuCanvas.getContext("2d");

const menuX = 0, menuY = 50;
/** @type Menu */
const menu = (() => {
    const menu = new Menu(200, 40);
    const bondMenu = menu.addButton(DropDownMenuItem, {
        name: "New Bond"
    });
    bondMenu.menu.addButton(uiActions.CovalentMenuItem, {
        name: "Covalent"
    });

    return menu;
})();
$(menuCanvas).click(({preventDefault: cancel, offsetX: x, offsetY: y}) => {
    const mx = x - menuX;
    const my = y - menuY;
    if (menu.clickArea.contains(mx, my)) {
        if (menu.onClick(mx, my)) {
            cancel();
            return;
        }
    }
    if (uiActions.handleClick(x, y)) {
        cancel();
        //return;
    }
});

/**
 * @param {CanvasRenderingContext2D} d2d
 */
function clearScreen(d2d = NS.d2d) {
    d2d.clearRect(0, 0, WIDTH, HEIGHT);
    // d2d.fillStyle = 'red';
    // d2d.fillRect(0,0,WIDTH,HEIGHT);
}

function maybeRedrawMenu() {
    if (menu.dirty) {
        const d2d = menuD2d;
        d2d.save();
        d2d.translate(menuX, menuY);
        menu.clearRenderArea(d2d);
        menu.render(d2d);
        d2d.restore();
        menu.dirty = false;
    }
}


function drawFPS(delta, color = "black") {
    d2d.font = "16px sans";
    d2d.fillStyle = color;
    d2d.fillText("FPS: " + parseInt((1000 / delta) + 0.5), 20, 20);
}

let lastTime = 0;
function doDraw(time) {
    const delta = time - lastTime;
    lastTime = time;
    clearScreen();
    drawFPS(delta);
    uiActions.draw(menuD2d);
    maybeRedrawMenu();
}

function drawLoop(time) {
    try {
        doDraw(time);
        window.requestAnimationFrame(drawLoop);
    } catch (e) {
        clearScreen();
        drawFPS(Number.MAX_SAFE_INTEGER, "red");
        d2d.fillStyle = "red";
        d2d.fillText("Error occurred! " + e, 100, 100);
        throw e;
    }
}

/**
 * @return Promise
 */
function loadJSON(url) {
    return new Promise((res, rej) => {
        $.getJSON(url)
            .done((data) => res(data))
            .fail((xhr, textStatus, err) => rej(err));
    });
}

loadJSON("./elements.json").then(json => {
    console.log("Got JSON, loading isotopes...");
    NS.jsonIsotopes = Object.keys(json).map(k => [k, json[k]]);
    NS.isotopes = getAllIsotopes(NS.jsonIsotopes);
    console.log("Complete! Drawing...");
    window.requestAnimationFrame(drawLoop);
}, err => {
    console.error(err);
});