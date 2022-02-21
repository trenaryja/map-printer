import React from "react";
import Head from "next/head";
import { AppProps } from "next/app";
import { ThemeProvider, Theme, StyledEngineProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "../src/styles/theme";

declare module "@mui/styles/defaultTheme" {
	interface DefaultTheme extends Theme {}
}

export default function MyApp(props: AppProps) {
	const { Component, pageProps } = props;

	React.useEffect(() => {
		const jssStyles = document.querySelector("#jss-server-side");
		if (jssStyles) {
			jssStyles.parentElement!.removeChild(jssStyles);
		}
	}, []);

	return (
		<React.Fragment>
			<Head>
				<title>Map Printer</title>
				<meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
				<link rel="icon" type="image/svg+xml" href="/logo.svg" />
			</Head>
			<StyledEngineProvider injectFirst>
				<ThemeProvider theme={theme}>
					<CssBaseline />
					<Component {...pageProps} />
				</ThemeProvider>
			</StyledEngineProvider>
		</React.Fragment>
	);
}
