declare global {
	namespace NodeJS {
		interface ProcessEnv {
			NEXT_PUBLIC_ACCESS_TOKEN: string;
			NEXT_PUBLIC_DEFAULT_ACCESS_TOKEN: string;
			NEXT_PUBLIC_USERNAME: string;
			NODE_ENV: "development" | "production";
		}
	}
}

export {};
