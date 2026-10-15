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

/** Coerce anything thrown into an ImageResponseError, keeping existing ones as-is. */
export function toImageResponseError(error: unknown): ImageResponseError {
	if (error instanceof ImageResponseError) return error;
	const err = error instanceof Error ? error : new Error(String(error));
	return new ImageResponseError(err.message, ErrorCodes.UNKNOWN_ERROR, err);
}

/**
 * Give a failure a code and message, unless it already has them: an ImageResponseError
 * thrown deeper in the pipeline (ENGINE_NOT_INSTALLED, UNSUPPORTED_FORMAT, FONT_LOAD_FAILED…)
 * must reach the caller as-is, whichever wrapper it passes through on the way out.
 */
function wrap(error: unknown, code: string, message: string): ImageResponseError {
	if (error instanceof ImageResponseError) return error;
	const err = error instanceof Error ? error : new Error(String(error));
	return new ImageResponseError(message, code, err);
}

export const ErrorCodes = {
	FONT_LOAD_FAILED: "FONT_LOAD_FAILED",
	VNODE_CREATION_FAILED: "VNODE_CREATION_FAILED",
	SATORI_RENDER_FAILED: "SATORI_RENDER_FAILED",
	RESVG_INIT_FAILED: "RESVG_INIT_FAILED",
	RESVG_RENDER_FAILED: "RESVG_RENDER_FAILED",
	SATORI_INIT_FAILED: "SATORI_INIT_FAILED",
	EMOJI_LOAD_FAILED: "EMOJI_LOAD_FAILED",
	TAKUMI_INIT_FAILED: "TAKUMI_INIT_FAILED",
	TAKUMI_RENDER_FAILED: "TAKUMI_RENDER_FAILED",
	COMPONENT_IN_WORKER: "COMPONENT_IN_WORKER",
	UNSUPPORTED_FORMAT: "UNSUPPORTED_FORMAT",
	ENGINE_NOT_INSTALLED: "ENGINE_NOT_INSTALLED",
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
		throw wrap(error, errorCode, errorMessage);
	}
}

/**
 * Wraps a sync operation with error handling and logging
 */
export function handleSync<T>(operation: () => T, errorCode: string, errorMessage: string): T {
	try {
		return operation();
	} catch (error) {
		throw wrap(error, errorCode, errorMessage);
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
		throw wrap(error, errorCode, errorMessage);
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
		throw new ImageResponseError(`${errorMessage} (HTTP ${response.status})`, errorCode);
	}
	const buffer = await response.arrayBuffer();
	return buffer;
}
