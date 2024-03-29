export interface NodeException extends Error {
	errno?: number;
	code: string;
	path?: string;
	syscall?: string;
}

export function isNodeException(error: unknown): error is NodeException {
	if (error instanceof Error && 'code' in error) {
		return true;
	}
	return false;
}
