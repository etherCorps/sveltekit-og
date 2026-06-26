const sizeFormats = ["Bytes", "KB", "MB", "GB"];
const kbSize = 1024;

export const formatBytes = (bytes: number, decimals = 2) => {
	if (bytes === 0) return "0 Bytes";
	const decimalPoint = decimals < 0 ? 0 : decimals;
	const sizeIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(kbSize)), 3);
	return (
		parseFloat((bytes / Math.pow(kbSize, sizeIndex)).toFixed(decimalPoint)) +
		" " +
		sizeFormats[sizeIndex]
	);
};

export async function importWasm(input: any) {
	// may be a nested await for some reason
	const _input = await input;
	const _module = _input.default || _input;
	// this is from rollup/wasm, it does some magic we need to recover from
	if (typeof _module === "function") {
		// empty input is to avoid instantiating the wasm module
		// this will just compile it
		const fnRes = await _module();
		const _instance = fnRes.instance || fnRes;
		return _instance.exports || _instance || _module;
	}
	return _module;
}
