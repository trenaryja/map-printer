import { createTheme } from "@mui/material";
import { amber } from "@mui/material/colors";

const theme = createTheme({
	palette: {
		mode: "dark",
		primary: {
			main: amber[500],
		},
	},
});

export default theme;
