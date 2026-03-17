import { logger } from "./logger.js";

export class ImageResponseError extends Error {
	constructor(
		message: string,
		public code: string,
		public originalError?: Error
	) {
		super(message);
		this.name = "ImageResponseError";
	}
}

export const ErrorCodes = {
	FONT_LOAD_FAILED: "FONT_LOAD_FAILED",
	VNODE_CREATION_FAILED: "VNODE_CREATION_FAILED",
	SATORI_RENDER_FAILED: "SATORI_RENDER_FAILED",
	RESVG_INIT_FAILED: "RESVG_INIT_FAILED",
	RESVG_RENDER_FAILED: "RESVG_RENDER_FAILED",
	SATORI_INIT_FAILED: "SATORI_INIT_FAILED",
	EMOJI_LOAD_FAILED: "EMOJI_LOAD_FAILED",
	UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

/**
 * Wraps an async operation with error handling and logging
 */
export async function handleAsync<T = unknown>(
	operation: () => Promise<T>,
	errorCode: string,
	errorMessage: string
): Promise<T> {
	try {
		return await operation();
	} catch (error) {
		const err = error instanceof Error ? error : new Error(String(error));
		logger.error(`${errorMessage}:`, err.message);
		throw new ImageResponseError(errorMessage, errorCode, err);
	}
}

/**
 * Wraps a sync operation with error handling and logging
 */
export function handleSync<T>(operation: () => T, errorCode: string, errorMessage: string): T {
	try {
		return operation();
	} catch (error) {
		const err = error instanceof Error ? error : new Error(String(error));
		logger.error(`${errorMessage}:`, err.message);
		throw new ImageResponseError(errorMessage, errorCode, err);
	}
}

/**
 * Wraps multiple async operations with error handling
 */
export async function handleAsyncAll<T extends readonly unknown[]>(
	operations: { readonly [K in keyof T]: () => Promise<T[K]> },
	errorCode: string,
	errorMessage: string
): Promise<T> {
	try {
		return (await Promise.all(operations.map((op) => op()))) as unknown as T;
	} catch (error) {
		const err = error instanceof Error ? error : new Error(String(error));
		logger.error(`${errorMessage}:`, err.message);
		throw new ImageResponseError(errorMessage, errorCode, err);
	}
}

/**
 * Validates a response and throws if not ok
 */
export async function validateResponse(
	response: Response,
	errorCode: string,
	errorMessage: string
): Promise<ArrayBuffer> {
	if (!response.ok) {
		logger.error(`${errorMessage}: HTTP ${response.status} ${response.statusText}`);
		throw new ImageResponseError(`${errorMessage} (HTTP ${response.status})`, errorCode);
	}
	const buffer = await response.arrayBuffer();
	return buffer;
}
