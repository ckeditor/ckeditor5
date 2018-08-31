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
	 * @param {String|Function} tokenUrlOrRefreshToken Endpoint address to download the token or a callback that provides the token. If the
	 * value is a function it has to match the {@link ~refreshToken} interface.
	 * @param {Object} options
	 * @param {String} [options.initValue] Initial value of the token.
	 * @param {Number} [options.refreshInterval=3600000] Delay between refreshes. Default 1 hour.
	 * @param {Boolean} [options.autoRefresh=true] Specifies whether to start the refresh automatically.
	 */
	constructor( tokenUrlOrRefreshToken, options = DEFAULT_OPTIONS ) {
		if ( !tokenUrlOrRefreshToken ) {
			throw new Error( 'A `tokenUrl` must be provided as the first constructor argument.' );
		}

		/**
		 * Value of the token.
		 * The value of the token is null if `initValue` is not provided or `init` method was not called.
		 * `create` method creates token with initialized value from url.
		 *
		 * @name value
		 * @member {String} #value
		 * @observable
		 * @readonly
		 */
		this.set( 'value', options.initValue );

		let refresh = () => defaultRefreshToken( tokenUrlOrRefreshToken );

		if ( typeof tokenUrlOrRefreshToken === 'function' ) {
			refresh = tokenUrlOrRefreshToken;
		}

		/**
		 * Refresh token function.
		 *
		 * @member {Function} #_refreshToken
		 * @protected
		 */
		this._refreshToken = () => {
			return refresh()
				.then( value => this.set( 'value', value ) )
				.then( () => this );
		};

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
	 * Starts value refreshing every `refreshInterval` time.
	 *
	 * @protected
	 */
	_startRefreshing() {
		this._refreshInterval = setInterval( this._refreshToken, this._options.refreshInterval );
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
	 * @param {String|Function} tokenUrlOrRefreshToken Endpoint address to download the token or a callback that provides the token. If the
	 * value is a function it has to match the {@link ~refreshToken} interface.
	 * @param {Object} options
	 * @param {String} [options.initValue] Initial value of the token.
	 * @param {Number} [options.refreshInterval=3600000] Delay between refreshes. Default 1 hour.
	 * @param {Boolean} [options.autoRefresh=true] Specifies whether to start the refresh automatically.
	 * @returns {Promise.<Token>}
	 */
	static create( tokenUrlOrRefreshToken, options = DEFAULT_OPTIONS ) {
		const token = new Token( tokenUrlOrRefreshToken, options );

		return token.init();
	}
}

mix( Token, ObservableMixin );

/**
 * This function is called in a defined interval by the {@link ~Token} class.
 * It should return a promise, which resolves with the new token value.
 * If any error occurs it should return a rejected promise with an error message.
 *
 * @function refreshToken
 * @returns {Promise.<String>}
 */

/**
 * @private
 * @param {String} tokenUrl
 */
function defaultRefreshToken( tokenUrl ) {
	return new Promise( ( resolve, reject ) => {
		const xhr = new XMLHttpRequest();

		xhr.open( 'GET', tokenUrl );

		xhr.addEventListener( 'load', () => {
			const statusCode = xhr.status;
			const xhrResponse = xhr.response;

			if ( statusCode < 200 || statusCode > 299 ) {
				return reject( 'Cannot download new token!' );
			}

			return resolve( xhrResponse );
		} );

		xhr.addEventListener( 'error', () => reject( 'Network Error' ) );
		xhr.addEventListener( 'abort', () => reject( 'Abort' ) );

		xhr.send();
	} );
};

export default Token;
