/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/retry
 */

/**
 * Tries calling the given callback until it sucessfully resolves.
 *
 * If the callback fails `maxRetries` times, the returned promise is rejected with the last error.
 *
 * @typeParam TResult The result of a successful callback invocation.
 * @param options.maxRetries Maximum number of retries.
 * @param options.retryDelay The time in miliseconds between attempts. By default it implements exponential back-off policy.
 */
export default async function retry<TResult>(
	callback: () => Promise<TResult>,
	options: {
		maxRetries?: number;
		retryDelay?: ( attempt: number ) => number;
	} = {}
): Promise<TResult> {
	const {
		maxRetries = 3,
		retryDelay = exponentialDelay()
	} = options;

	const maxAttempts = maxRetries + 1;

	let lastError;

	for ( let attempt = 0; attempt < maxAttempts; attempt++ ) {
		try {
			return await callback();
		} catch ( err ) {
			lastError = err;
		}

		await new Promise( resolve => {
			setTimeout( resolve, retryDelay( attempt ) );
		} );
	}

	throw lastError;
}

/**
 * Creates a function that calculates exponential back-off delay. Pass it as `options.retryDelay` to {@link ~retry}.
 *
 * @param options.delay Base delay between invocations. Defaults to 1s.
 * @param options.factor How much to increase the delay. Defaults to 2x.
 * @param options.maxDelay Maximum timeout. Even if higher timeout is calculated, it cannot get higher than this value. Default to 10s.
 * @returns The function calculating the delay.
 */
export function exponentialDelay(
	options: {
		delay?: number;
		factor?: number;
		maxDelay?: number;
	} = {}
): ( attempt: number ) => number {
	const {
		delay = 1000,
		factor = 2,
		maxDelay = 10000
	} = options;

	return attempt => Math.min( factor ** attempt * delay, maxDelay );
}
