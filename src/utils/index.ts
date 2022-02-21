export * from "./map.utils";

export const gcd = (a: number, b: number): number => (!b ? a : gcd(b, a % b));

export const getRatio = (width: number, height: number) => {
	const divisor = gcd(width, height);
	return `${width}:${height}` + (divisor !== 1 ? ` (${width / divisor}:${height / divisor})` : "");
};
