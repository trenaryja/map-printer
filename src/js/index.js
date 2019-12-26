import "../css/style.css";
import $ from "jquery";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "@fortawesome/fontawesome-free/js/all";
import * as mapboxUtils from "./mapboxUtils";

mapboxUtils.getLocation().then(location => {
	const map = new mapboxgl.Map({
		container: "map",
		style: "mapbox://styles/trenaryja/cjplsh8d200xd2rmhj55mv05g",
		// style: "mapbox://styles/mapb`ox/satellite-v9",
		center: [location.coords.longitude, location.coords.latitude],
		zoom: 14,
		attributionControl: false,
		preserveDrawingBuffer: true,
	});

	mapboxUtils.removeMapboxLogo();

	map.on("zoom", () => {
		setHeaderValues(map);
	});

	$(window).resize(() => {
		setHeaderValues(map);
	});

	$("#download").on("click", () => {
		mapboxUtils.downloadMap(map, Number($("#zoom").text()));
	});

	$("#zoomLock").on("click", () => {
		$("#zoomLock")
			.find("[data-fa-i2svg]")
			.toggleClass("fa-lock")
			.toggleClass("fa-unlock");
		map.lock = !map.lock;
		setHeaderValues(map);
	});

	setHeaderValues(map);

	window.map = map;
	window.mapboxgl = mapboxgl;
});

const setHeaderValues = map => {
	const zoom = Math.ceil(map.lock ? Number($("#zoom").text()) : map.getZoom());
	const { width, height } = mapboxUtils.tilesRequiredForMap(map, zoom);
	const divisor = gcd(width, height);
	const ratio = `${width}:${height}` + (divisor !== 1 ? ` (${width / divisor}:${height / divisor})` : "");
	$("#zoom").text(zoom);
	$("#width").text(width * 1024);
	$("#height").text(height * 1024);
	$("#ratio").text(ratio);
	$("#tiles").text(width * height);
};

const gcd = (a, b) => (!b ? a : gcd(b, a % b));
