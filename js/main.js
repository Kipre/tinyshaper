import * as ui from "./ui.js";
import * as surf from "./surf.js";
import * as trid from "./3d.js";
import {coords} from "./config.js";

const { board } = surf;

const svg = document.getElementById("vis");
const canvas = document.getElementById("threed");

surf.addBoardChangeListener(() => {
	surf.getPositions(trid.getPositionsAttribute());
	trid.update();
});

ui.setProfile("z");
const positions = surf.getPositions();
const indices = surf.getIndices();
trid.display3D(positions, indices, board);

const showSvg = () => {
	document.documentElement.style.setProperty("--svg-opacity", 0);
	svg.classList.remove("hidden");
};
const hideSvg = () => {
	svg.classList.add("hidden");
	trid.controls.removeEventListener("change", hideSvg);
};

const [top, side, front, back] = document.getElementById("positions").children;

function moveTo({ profile, ...destination }) {
	if (trid.alreadyWellOriented(destination)) return;
	ui.setProfile(profile);
	showSvg();
	trid
		.tweenCameraTo(destination)
		//.onComplete(() => trid.controls.addEventListener("change", hideSvg, {once: true}));
}

top.addEventListener("click", () => moveTo(coords.top));
side.addEventListener("click", () => moveTo(coords.side));
front.addEventListener("click", () => moveTo(coords.front));
back.addEventListener("click", () => moveTo(coords.back));

window.addEventListener("resize", () => {
	trid.onResize();
	ui.updateViewport();
});
