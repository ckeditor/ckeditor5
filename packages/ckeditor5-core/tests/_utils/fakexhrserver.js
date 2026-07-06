/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { vi } from 'vitest';

/**
 * Creates a fake `XMLHttpRequest` server for tests and installs it globally via `vi.stubGlobal()`.
 *
 * The server supports two usage styles:
 *
 * **Manual style** — no responses are registered upfront. `send()` only records the request and the test
 * responds by hand through the request instance:
 *
 * ```js
 * const server = createFakeXHRServer();
 *
 * // Code under test issues a request...
 * server.requests[ 0 ].respond( 200, { 'Content-Type': 'application/json' }, JSON.stringify( { ok: true } ) );
 * server.requests[ 0 ].error();
 * server.requests[ 0 ].uploadProgress( { loaded: 4, total: 10 } );
 * ```
 *
 * **Routing style** — responses are registered upfront with `respondWith()` and fire automatically
 * from `send()`. Requests that match no registered response receive a `404` response:
 *
 * ```js
 * const server = createFakeXHRServer();
 *
 * server.respondWith( 'GET', 'https://example.dev/permissions', [ 200, {}, JSON.stringify( { ok: true } ) ] );
 * server.respondWith( 'POST', /\/assets$/, xhr => xhr.error() );
 * ```
 *
 * The returned server object exposes:
 *
 * * `requests` — an array of all issued fake requests, in creation order.
 * * `respondWith( method, url, response )` — registers an automatic response. The `url` may be a string
 * (exact match) or a RegExp. The `response` may be a `[ status, headers, body ]` array or a callback
 * receiving the request instance (which may call `respond()`, `error()`, or `uploadProgress()`).
 * The latest matching registration wins, so tests can override earlier entries mid-test.
 * * `restore()` — reverts the `XMLHttpRequest` global. Calling it is optional (the Vitest configuration
 * unstubs globals between tests) unless the fake must be removed mid-test, for example before `editor.destroy()`.
 *
 * Each fake request records `method`, `url`, `async`, `requestHeaders`, `requestBody`, and `withCredentials`.
 * Responding dispatches `load` and `loadend` events, `error()` dispatches `error` and `loadend`, and
 * `abort()` dispatches `abort`. Response bodies are parsed with `JSON.parse()` when the code under test
 * sets `responseType` to `'json'`.
 *
 * @param {Object} [options]
 * @param {Number|null} [options.respondDelay=null] Delay (in milliseconds) applied to automatic responses
 * registered with `respondWith()`. By default responses fire synchronously from `send()`. Set a delay when
 * the code under test attaches its listeners only after calling `send()`. Delayed responses are skipped
 * for requests aborted in the meantime.
 * @returns {Object} The fake server.
 */
export function createFakeXHRServer( { respondDelay = null } = {} ) {
	const responses = [];
	const requests = [];
	const originalXMLHttpRequest = window.XMLHttpRequest;

	class FakeXMLHttpRequestUpload {
		constructor() {
			this.listeners = new Map();
		}

		addEventListener( event, callback ) {
			const callbacks = this.listeners.get( event ) || [];

			callbacks.push( callback );
			this.listeners.set( event, callbacks );
		}

		removeEventListener( event, callback ) {
			const callbacks = this.listeners.get( event ) || [];
			const index = callbacks.indexOf( callback );

			if ( index !== -1 ) {
				callbacks.splice( index, 1 );
			}
		}

		dispatchEvent( event, data ) {
			for ( const callback of [ ...this.listeners.get( event ) || [] ] ) {
				callback( data );
			}
		}
	}

	class FakeXMLHttpRequest {
		constructor() {
			this.aborted = false;
			this.withCredentials = false;
			this.listeners = new Map();
			this.requestHeaders = {};
			this.status = 0;
			this.response = null;
			this.responseText = '';
			this.responseType = '';
			this.upload = new FakeXMLHttpRequestUpload();

			requests.push( this );
		}

		open( method, url, async ) {
			this.method = method;
			this.url = url;
			this.async = async;
		}

		setRequestHeader( name, value ) {
			this.requestHeaders[ name ] = value;
		}

		addEventListener( event, callback ) {
			const callbacks = this.listeners.get( event ) || [];

			callbacks.push( callback );
			this.listeners.set( event, callbacks );
		}

		removeEventListener( event, callback ) {
			const callbacks = this.listeners.get( event ) || [];
			const index = callbacks.indexOf( callback );

			if ( index !== -1 ) {
				callbacks.splice( index, 1 );
			}
		}

		send( body ) {
			this.requestBody = body;
			this.dispatchEvent( 'loadstart' );

			// Manual style: no registered responses, the test responds by hand.
			if ( !responses.length ) {
				return;
			}

			if ( respondDelay === null ) {
				this._routeResponse();
			} else {
				// Defer the response so the code under test can finish attaching its listeners first.
				window.setTimeout( () => {
					if ( !this.aborted ) {
						this._routeResponse();
					}
				}, respondDelay );
			}
		}

		abort() {
			this.aborted = true;
			this.dispatchEvent( 'abort' );
		}

		respond( status, headers, body ) {
			this.status = status;
			this.responseHeaders = headers;
			this.responseText = body;
			this.response = this.responseType === 'json' ? JSON.parse( body ) : body;

			this.dispatchEvent( 'load' );
			this.dispatchEvent( 'loadend' );
		}

		error() {
			this.dispatchEvent( 'error' );
			this.dispatchEvent( 'loadend' );
		}

		uploadProgress( event ) {
			this.upload.dispatchEvent( 'progress', {
				lengthComputable: true,
				...event
			} );
		}

		dispatchEvent( event, data ) {
			for ( const callback of [ ...this.listeners.get( event ) || [] ] ) {
				callback( data );
			}
		}

		_routeResponse() {
			// Find the latest matching response, so tests can override earlier registrations.
			let match;

			for ( let i = responses.length - 1; i >= 0; i-- ) {
				const entry = responses[ i ];

				if ( entry.method !== this.method ) {
					continue;
				}

				if ( entry.url instanceof RegExp ? entry.url.test( this.url ) : entry.url === this.url ) {
					match = entry;
					break;
				}
			}

			if ( !match ) {
				this.status = 404;
				this.dispatchEvent( 'load' );
				this.dispatchEvent( 'loadend' );

				return;
			}

			if ( typeof match.response === 'function' ) {
				match.response( this );

				return;
			}

			this.respond( ...match.response );
		}
	}

	vi.stubGlobal( 'XMLHttpRequest', FakeXMLHttpRequest );

	return {
		requests,

		respondWith( method, url, response ) {
			responses.push( { method, url, response } );
		},

		restore() {
			vi.stubGlobal( 'XMLHttpRequest', originalXMLHttpRequest );
		}
	};
}
