import mapboxgl from "mapbox-gl";

export type MapBounds = {
	north: number;
	south: number;
	east: number;
	west: number;
};

type MapPiece = {
	url: string;
	x: number;
	y: number;
	img: HTMLImageElement;
};

type LatLng = {
	lat: number;
	lng: number;
};

export const DEFAULTS = {
	accessToken: "pk.eyJ1IjoidHJlbmFyeWphIiwiYSI6ImNqNHpzcDFxZTA3dGczM285cDMydmpqcmkifQ.RhvgTPAhEWhiBJ3pd5ObgQ",
	tileSize: 1024,
	zoom: 12,
	mapBounds: {
		north: 0,
		south: 0,
		east: 0,
		west: 0,
	} as MapBounds,
};

mapboxgl.accessToken = DEFAULTS.accessToken;

export const gcd = (a: number, b: number): number => (!b ? a : gcd(b, a % b));

export const deg2Rad = (deg: number) => (deg * Math.PI) / 180;

export const rad2deg = (rad: number) => (rad * 180) / Math.PI;

export const getRatio = (width: number, height: number) => {
	const divisor = gcd(width, height);
	return `${width}:${height}` + (divisor !== 1 ? ` (${width / divisor}:${height / divisor})` : "");
};

const getMapCoordinateBounds = (map: mapboxgl.Map): MapBounds => {
	const bounds = map.getBounds();
	return {
		north: bounds.getNorth() % 180,
		south: bounds.getSouth() % 180,
		east: bounds.getEast() % 85,
		west: bounds.getWest() % 85,
	};
};

export const getMapBounds = (map: mapboxgl.Map, zoom = Math.floor(map.getZoom())): MapBounds => {
	const { north, south, east, west } = getMapCoordinateBounds(map);
	return {
		north: lat2tile(north, zoom),
		south: lat2tile(south, zoom),
		east: lng2tile(east, zoom),
		west: lng2tile(west, zoom),
	};
};

export const removeMapboxLogo = () => {
	const logos = document.getElementsByClassName("mapboxgl-ctrl");
	while (logos[0]) logos[0].parentNode?.removeChild(logos[0]);
};

export const getLocation = async (): Promise<GeolocationPosition> => {
	return await new Promise((resolve, reject) => {
		navigator.geolocation.getCurrentPosition(resolve, reject);
	});
};

export const lng2tile = (lng: number, zoom: number) => {
	return Math.floor(((lng + 180) / 360) * Math.pow(2, zoom));
};
export const lat2tile = (lat: number, zoom: number) => {
	return Math.floor(
		((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
			Math.pow(2, zoom),
	);
};

export const tilesRequired = (mapBounds: MapBounds, zoom: number) => {
	const { north, south, east, west } = mapBounds;
	const width = Math.abs(lng2tile(west, zoom) - lng2tile(east, zoom)) + 1;
	const height = Math.abs(lat2tile(north, zoom) - lat2tile(south, zoom)) + 1;
	return { width, height };
};

export const generateTileRequestUrl = (zoom: number, x: number, y: number) => {
	return `https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/${zoom}/${x}/${y}@2x?access_token=${DEFAULTS.accessToken}`;
};

export const loadMapPieces = (pieces: MapPiece[]) => {
	let loaded = 0;
	let postaction = (x: MapPiece[]) => {};
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
		done: (f: (x: MapPiece[]) => void) => (postaction = f || postaction),
	};
};

export const combineMapPieces = (pieces: MapPiece[], filename?: string) => {
	loadMapPieces(pieces).done((loadedPieces) => {
		const size = DEFAULTS.tileSize;
		const canvas = document.createElement("canvas");
		canvas.width = (1 + Math.max(...loadedPieces.map((piece) => piece.x))) * size;
		canvas.height = (1 + Math.max(...loadedPieces.map((piece) => piece.y))) * size;
		for (const piece of loadedPieces) {
			canvas.getContext("2d")?.drawImage(piece.img, piece.x * size, piece.y * size);
		}
		canvas2png(canvas, filename);
	});
};

export const padNum = (num: number, length = 2, fillString = "0") => `${num}`.padStart(length, fillString);

export const formatCoord = (num: number) => {
	const formatter = new Intl.NumberFormat("en-US", {
		minimumFractionDigits: 3,
		maximumFractionDigits: 3,
		minimumIntegerDigits: 3,
	});
	return formatter.format(num);
};

export const getMidPoint = (mapBounds: MapBounds) => {
	const { north, south, east, west } = mapBounds;
	const dLon = deg2Rad(west - east);
	const rNorth = deg2Rad(north);
	const rSouth = deg2Rad(south);
	const rEast = deg2Rad(east);
	const bX = Math.cos(rSouth) * Math.cos(dLon);
	const bY = Math.cos(rSouth) * Math.sin(dLon);
	const lat = Math.atan2(
		Math.sin(rNorth) + Math.sin(rSouth),
		Math.sqrt((Math.cos(rNorth) + bX) * (Math.cos(rNorth) + bX) + bY * bY),
	);
	const lng = rEast + Math.atan2(bY, Math.cos(rNorth) + bX);

	return { lat, lng } as LatLng;
};

export const getFilename = (mapBounds: MapBounds, zoom: number) => {
	const { lat, lng } = getMidPoint(mapBounds);
	return `${formatCoord(lat)}, ${formatCoord(lng)}, ${padNum(zoom)}.png`;
};

export const downloadMap = (mapBounds: MapBounds, zoom: number) => {
	const { north, south, east, west } = mapBounds;
	const pieces = new Array<MapPiece>();
	for (let x = west; x <= east; x++) {
		for (let y = north; y <= south; y++) {
			pieces.push({
				url: generateTileRequestUrl(zoom, x, y),
				x: x - west,
				y: y - north,
				img: new Image(),
			});
		}
	}
	combineMapPieces(pieces, getFilename(mapBounds, zoom));
};

export const canvas2png = (canvas: HTMLCanvasElement, filename = "download.png") => {
	canvas.toBlob((blob) => {
		if (!blob) return;
		const link = document.createElement("a");
		link.download = filename;
		link.href = URL.createObjectURL(blob);
		const event = new MouseEvent("click");
		link.dispatchEvent(event);
	});
};
