/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module autosave/throttle
 */

/* globals window */

/**
 * Throttle function - a helper that provides ability to specify minimum time gap between calling the original function.
 * Comparing to the lodash implementation, this provides an information if calling the throttled function will result in
 * calling the original function.
 *
 * @param {Function} fn Original function that will be called.
 * @param {Number} wait Minimum amount of time between original function calls.
 */
export default function throttle( fn, wait ) {
	// Time in ms of the last call.
	let lastCallTime = 0;

	// Timeout id that enables stopping scheduled call.
	let timeoutId = null;

	// @returns {Boolean} `true` if the original function was or will be called.
	function throttledFn() {
		const now = Date.now();

		// Cancel call, as the next call is scheduled.
		if ( timeoutId ) {
			return false;
		}

		// Call instantly, as the fn wasn't called within the `time` period.
		if ( now > lastCallTime + wait ) {
			call();
			return true;
		}

		// Set timeout, so the fn will be called `time` ms after the last call.
		timeoutId = window.setTimeout( call, lastCallTime + wait - now );

		return true;
	}

	throttledFn.flush = flush;

	function flush() {
		if ( timeoutId ) {
			window.clearTimeout( timeoutId );
			call();
		}

		lastCallTime = 0;
	}

	// Calls the original function and updates internals.
	function call() {
		lastCallTime = Date.now();
		timeoutId = null;

		fn();
	}

	return throttledFn;
}
