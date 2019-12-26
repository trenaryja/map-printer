import mapboxConfig from "../config/mapbox.config.secret";
import mapboxgl from "mapbox-gl";
import { canvas2png } from "./canvasUtils";

mapboxgl.accessToken = mapboxConfig.accessToken;
mapboxgl.defaultAccessToken = mapboxConfig.defaultAccessToken;
mapboxgl.username = mapboxConfig.username;

export const removeMapboxLogo = () => {
	const logos = document.getElementsByClassName("mapboxgl-ctrl-logo");
	while (logos[0]) {
		logos[0].parentNode.removeChild(logos[0]);
	}
};

export const getLocation = () => {
	return new Promise((resolve, reject) => {
		navigator.geolocation.getCurrentPosition(resolve, reject);
	});
};

export const lon2tile = (lon, zoom) => {
	return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
};

export const tile2lon = (x, z) => {
	return (x / Math.pow(2, z)) * 360 - 180;
};

export const lat2tile = (lat, zoom) => {
	return Math.floor(((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) * Math.pow(2, zoom));
};

export const tile2lat = (y, z) => {
	const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, z);
	return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
};

export const tilesRequired = (north, south, east, west, zoom) => {
	const width = Math.abs(lon2tile(west, zoom) - lon2tile(east, zoom)) + 1;
	const height = Math.abs(lat2tile(north, zoom) - lat2tile(south, zoom)) + 1;
	return { width, height };
};

export const tilesRequiredForMap = (map, zoom) => {
	const north = map.getBounds().getNorth();
	const south = map.getBounds().getSouth();
	const east = map.getBounds().getEast();
	const west = map.getBounds().getWest();
	return tilesRequired(north, south, east, west, zoom);
};

export const map2Png = map => {
	canvas2png(map.getCanvas());
};

export const generateTileRequestUrl = (map, zoom, x, y) => {
	return `https://api.mapbox.com/styles/v1/${mapboxgl.username}/${map.style.stylesheet.id}/tiles/512/${zoom}/${x}/${y}@2x?access_token=${mapboxgl.accessToken}`;
};

export const generateMapPieces = (map, zoom) => {
	const pieces = [];
	const northY = lat2tile(map.getBounds().getNorth(), zoom);
	const southY = lat2tile(map.getBounds().getSouth(), zoom);
	const westX = lon2tile(map.getBounds().getWest(), zoom);
	const eastX = lon2tile(map.getBounds().getEast(), zoom);
	for (let x = westX; x <= eastX; x++) {
		for (let y = northY; y <= southY; y++) {
			pieces.push({
				url: generateTileRequestUrl(map, zoom, x, y),
				x: x - westX,
				y: y - northY,
				img: new Image(),
			});
		}
	}
	return pieces;
};

export const loadMapPieces = pieces => {
	let loaded = 0;
	let postaction = () => {};
	const imageloaded = () => {
		loaded++;
		if (loaded == pieces.length) {
			postaction(pieces);
		}
	};
	for (var i = 0; i < pieces.length; i++) {
		pieces[i].img.crossOrigin = "anonymous";
		pieces[i].img.onload = imageloaded;
		pieces[i].img.src = pieces[i].url;
	}
	return {
		done: f => (postaction = f || postaction),
	};
};

export const combineMapPieces = pieces => {
	loadMapPieces(pieces).done(loadedPieces => {
		const canvas = document.createElement("canvas");
		canvas.width =
			(1 +
				Math.max.apply(
					Math,
					loadedPieces.map(piece => piece.x),
				)) *
			1024;
		canvas.height =
			(1 +
				Math.max.apply(
					Math,
					loadedPieces.map(piece => piece.y),
				)) *
			1024;
		for (let i = 0; i < loadedPieces.length; i++) {
			canvas.getContext("2d").drawImage(loadedPieces[i].img, loadedPieces[i].x * 1024, loadedPieces[i].y * 1024);
		}
		canvas2png(canvas);
	});
};

export const downloadMap = (map, zoom = map.getZoom()) => {
	const pieces = generateMapPieces(map, zoom);
	combineMapPieces(pieces);
};
