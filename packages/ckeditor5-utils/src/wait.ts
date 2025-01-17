/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/wait
 */

/**
 * Returns a promise that is resolved after the specified time.
 *
 * @param timeout The time in milliseconds to wait.
 * @param options.signal A signal to abort the waiting.
 */
export default function wait( timeout: number, options: { signal?: AbortSignal } = {} ): Promise<void> {
	return new Promise( ( resolve, reject ) => {
		const signal = options.signal || ( new AbortController() ).signal;

		signal.throwIfAborted();

		const timer = setTimeout( timeoutHandler, timeout );

		signal.addEventListener( 'abort', abortHandler, { once: true } );

		function timeoutHandler() {
			signal.removeEventListener( 'abort', abortHandler );
			resolve();
		}

		function abortHandler() {
			clearTimeout( timer );
			reject( signal.reason );
		}
	} );
}
