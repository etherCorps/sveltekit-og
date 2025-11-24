type Success<T> = { data: T; error: null };
type Failure<E> = { data: null; error: E };
type Result<T, E = Error> = Success<T> | Failure<E>;

export const tryCatch = async <T, E = Error>(promise: Promise<T>): Promise<Result<T, E>> => {
	try {
		const data = await promise;
		return { data, error: null };
	} catch (error) {
		return { data: null, error: error as E };
	}
};

export const tryCatchSync = <T, E = Error>(func: () => T): Result<T, E> => {
	try {
		const data = func();
		return { data, error: null };
	} catch (error) {
		return { data: null, error: error as E };
	}
};
