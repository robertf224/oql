export type Ok<T> = { value: T; error?: never };
export type Err = { error: Error; value?: never };
export type Result<T> = Ok<T> | Err;

function isOk<T>(result: Result<T>): result is Ok<T> {
    return "value" in result;
}

function isError<T>(result: Result<T>): result is Err {
    return "error" in result;
}

function ok<T>(value: T): Ok<T> {
    return { value };
}

function err(error: Error): Err {
    return { error };
}

function map<T, U>(result: Result<T>, mapper: (value: T) => U): Result<U> {
    return isOk(result) ? ok(mapper(result.value)) : err(result.error);
}

function unwrap<T>(result: Result<T>): T {
    if (isOk(result)) {
        return result.value;
    }
    throw result.error;
}

export const Result = {
    isOk,
    isError,
    ok,
    err,
    map,
    unwrap,
};
