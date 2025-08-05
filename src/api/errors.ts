
class HttpError extends Error {
	readonly statusCode: number;

	constructor(statusCode: number, message: string) {
		super(message);
		this.statusCode = statusCode;
	}
}

class BadRequestError extends HttpError {
	constructor(message: string) {
		super(400, message);
	}
}

class UnauthorizedError extends HttpError {
	constructor(message: string) {
		super(401, message);
	}
}

class ForbiddenError extends HttpError {
	constructor(message: string) {
		super(403, message);
	}
}

class NotFoundError extends HttpError {
	constructor(message: string) {
		super(404, message);
	}
}

export {
	HttpError,
	BadRequestError,
	UnauthorizedError,
	ForbiddenError,
	NotFoundError
};