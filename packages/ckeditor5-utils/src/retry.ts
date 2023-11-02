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
		maxAttempts?: number;
		retryDelay?: ( attempt: number ) => number;
	} = {}
): Promise<TResult> {
	const {
		maxAttempts = 4,
		retryDelay = exponentialDelay()
	} = options;

	for ( let attempt = 0; ; attempt++ ) {
		try {
			return await callback();
		} catch ( err ) {
			const isLast = attempt + 1 >= maxAttempts;

			if ( isLast ) {
				throw err;
			}
		}

		await new Promise( resolve => {
			setTimeout( resolve, retryDelay( attempt ) );
		} );
	}
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
