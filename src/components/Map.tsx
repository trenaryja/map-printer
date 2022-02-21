import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { createStyles, makeStyles } from "@mui/styles";
import React, { FC, useEffect, useRef, useState } from "react";
import { getLocation, getMapBounds, MapBounds, removeMapboxLogo, DEFAULTS } from "../utils";
import Menu from "./Menu";

const useStyles = makeStyles(() =>
	createStyles({
		layout: {
			display: "flex",
			flexDirection: "column",
			height: "100vh",
		},
		map: {
			height: "100%",
		},
	}),
);

const Map: FC = () => {
	const classes = useStyles();
	const mapRef = useRef(null);
	const [map, setMap] = useState<mapboxgl.Map | undefined>();
	const [, setMapBounds] = useState<MapBounds>(DEFAULTS.mapBounds);

	const setupMap = async () => {
		if (!mapRef.current) return;
		const location = await getLocation();
		const _map = new mapboxgl.Map({
			container: mapRef.current ?? "",
			style: "mapbox://styles/mapbox/streets-v11",
			attributionControl: false,
			zoom: DEFAULTS.zoom,
			center: [location.coords.longitude, location.coords.latitude],
			preserveDrawingBuffer: true,
		});
		_map.on("move", ({ target }) => {
			setMap(target);
			setMapBounds(getMapBounds(target));
		});
		removeMapboxLogo();
		return () => _map?.remove();
	};

	useEffect(() => {
		setupMap();
	}, []);

	return (
		<div className={classes.layout}>
			<Menu map={map} />
			<div ref={mapRef} className={classes.map} />
		</div>
	);
};

export default Map;
