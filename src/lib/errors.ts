export class SliceFileGenerationError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'SliceFileGenerationError'
	}
}

export class SecretAssemblyError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'SecretAssemblyError'
	}
}

export class InsufficientSlicesError extends SecretAssemblyError {
	constructor(message: string) {
		super(message)
		this.name = 'InsufficientSlicesError'
	}
}

export class InconsistentThresholdError extends SecretAssemblyError {
	constructor(message: string) {
		super(message)
		this.name = 'InconsistentThresholdError'
	}
}

export class SerializationError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'SerializationError'
	}
}

export class CryptoError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'CryptoError'
	}
}

export class SecretSharingError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'SecretSharingError'
	}
}

export class InvalidThresholdError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'InvalidThresholdError'
	}
}

export class InvalidShareCountError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'InvalidShareCountError'
	}
}

export class GF256RangeError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'GF256RangeError'
	}
}

export class GF256UndefinedOperationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'GF256UndefinedOperationError';
	}
}
