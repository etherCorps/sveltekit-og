const sizeFormats = ['Bytes', 'KB', 'MB', 'GB'];
const kbSize = 1024;

export const formatBytes = (bytes: number, decimals = 2) => {
	if (bytes === 0) return '0 Bytes';
	const decimalPoint = decimals < 0 ? 0 : decimals;
	const sizeIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(kbSize)), 3);
	return parseFloat((bytes / Math.pow(kbSize, sizeIndex)).toFixed(decimalPoint)) + ' ' + sizeFormats[sizeIndex];
};