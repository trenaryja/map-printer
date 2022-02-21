import { AppBar, Button, ButtonGroup, Container, IconButton, Toolbar, Typography } from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import React, { FC, useState } from "react";
import { DEFAULTS, downloadMap, getMapBounds } from "../utils";
import { getRatio } from "../utils";
import { FaDownload, FaLock, FaLockOpen } from "react-icons/fa";
import mapboxgl from "mapbox-gl";

const useStyles = makeStyles(() =>
	createStyles({
		toolbar: {
			display: "grid",
			gridAutoFlow: "column",
			gridAutoColumns: "1fr",
			justifyItems: "center",
		},
	}),
);

interface Props {
	map: mapboxgl.Map | undefined;
}

const Menu: FC<Props> = ({ map }) => {
	const classes = useStyles();
	const currentZoom = map ? Math.floor(map.getZoom()) : DEFAULTS.zoom;
	const [zoomIsLocked, setZoomIsLocked] = useState(false);
	const [lockedZoomLevel, setLockedZoomLevel] = useState(currentZoom);

	const zoom = zoomIsLocked ? lockedZoomLevel : currentZoom;
	const { north, south, east, west } = map ? getMapBounds(map, zoom) : DEFAULTS.mapBounds;
	const lockIcon = zoomIsLocked ? <FaLock /> : <FaLockOpen />;

	const width = Math.abs(west - east) + 1;
	const height = Math.abs(north - south) + 1;
	const ratio = getRatio(width, height);
	const tiles = width * height;

	const download = () => downloadMap({ north, south, east, west }, zoom);
	const incrementZoom = () => setLockedZoomLevel(Math.min(lockedZoomLevel + 1, 22));
	const decrementZoom = () => setLockedZoomLevel(Math.max(lockedZoomLevel - 1, 1));

	return (
		<AppBar position="relative">
			<Container>
				<Toolbar className={classes.toolbar}>
					<IconButton color="primary" onClick={download}>
						<FaDownload />
					</IconButton>
					<ButtonGroup>
						{zoomIsLocked && <Button onClick={incrementZoom}>+</Button>}
						<Button
							startIcon={lockIcon}
							onClick={() => {
								setZoomIsLocked(!zoomIsLocked);
								setLockedZoomLevel(zoom);
							}}
						>
							Zoom: {zoom}
						</Button>
						{zoomIsLocked && <Button onClick={decrementZoom}>-</Button>}
					</ButtonGroup>
					<Button disabled>Ratio: {ratio}</Button>
					<Button disabled>Tiles: {tiles}</Button>
				</Toolbar>
			</Container>
		</AppBar>
	);
};

export default Menu;
