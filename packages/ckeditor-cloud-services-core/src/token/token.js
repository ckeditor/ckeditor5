/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* eslint-env browser */

'use strict';

import mix from '@ckeditor/ckeditor5-utils/src/mix';
import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';

const DEFAULT_OPTIONS = { refreshInterval: 3600000, autoRefresh: true };

/**
 * Class representing the token used for communication with CKEditor Cloud Services.
 * Value of the token is retrieving from the specified URL and is refreshed every 1 hour by default.
 *
 * @mixes ObservableMixin
 */
class Token {
	/**
	 * Creates `Token` instance.
	 * Method `init` should be called after using the constructor or use `create` method instead.
	 *
	 * @param {String} tokenUrl Endpoint address to download the token.
	 * @param {Object} options
	 * @param {String} [options.initValue] Initial value of the token.
	 * @param {Number} [options.refreshInterval=3600000] Delay between refreshes. Default 1 hour.
	 * @param {Boolean} [options.autoRefresh=true] Specifies whether to start the refresh automatically.
	 */
	constructor( tokenUrl, options = DEFAULT_OPTIONS ) {
		if ( !tokenUrl ) {
			throw new Error( '`tokenUrl` must be provided' );
		}

		/**
		 * Value of the token.
		 * The value of the token is null if `initValue` is not provided or `init` method was not called.
		 * `create` method creates token with initialized value from url.
		 *
		 * @name value
		 * @type {String}
		 * @observable
		 * @readonly
		 * @memberOf Token#
		 */
		this.set( 'value', options.initValue );

		/**
		 * @type {String}
		 * @private
		 */
		this._tokenUrl = tokenUrl;

		/**
		 * @type {Object}
		 * @private
		 */
		this._options = Object.assign( {}, DEFAULT_OPTIONS, options );
	}

	/**
	 * Initializes the token.
	 *
	 * @returns {Promise.<Token>}
	 */
	init() {
		return new Promise( ( resolve, reject ) => {
			if ( this._options.autoRefresh ) {
				this._startRefreshing();
			}

			if ( !this.value ) {
				this._refreshToken()
					.then( resolve )
					.catch( reject );

				return;
			}

			resolve( this );
		} );
	}

	/**
	 * Gets the new token.
	 *
	 * @protected
	 * @returns {Promise.<Token>}
	 */
	_refreshToken() {
		return new Promise( ( resolve, reject ) => {
			const xhr = new XMLHttpRequest();

			xhr.open( 'GET', this._tokenUrl );

			xhr.addEventListener( 'load', () => {
				const statusCode = xhr.status;
				const xhrResponse = xhr.response;

				if ( statusCode < 200 || statusCode > 299 ) {
					return reject( 'Cannot download new token!' );
				}

				this.set( 'value', xhrResponse );

				return resolve( this );
			} );

			xhr.addEventListener( 'error', () => reject( 'Network Error' ) );
			xhr.addEventListener( 'abort', () => reject( 'Abort' ) );

			xhr.send();
		} );
	}

	/**
	 * Starts value refreshing every `refreshInterval` time.
	 *
	 * @protected
	 */
	_startRefreshing() {
		this._refreshInterval = setInterval( this._refreshToken.bind( this ), this._options.refreshInterval );
	}

	/**
	 * Stops value refreshing.
	 *
	 * @protected
	 */
	_stopRefreshing() {
		clearInterval( this._refreshInterval );
	}

	/**
	 * Creates a initialized {@link Token} instance.
	 *
	 * @param {String} tokenUrl Endpoint address to download the token.
	 * @param {Object} options
	 * @param {String} [options.initValue] Initial value of the token.
	 * @param {Number} [options.refreshInterval=3600000] Delay between refreshes. Default 1 hour.
	 * @param {Boolean} [options.autoRefresh=true] Specifies whether to start the refresh automatically.
	 * @returns {Promise.<Token>}
	 */
	static create( tokenUrl, options = DEFAULT_OPTIONS ) {
		const token = new Token( tokenUrl, options );

		return token.init();
	}
}

mix( Token, ObservableMixin );

export default Token;
