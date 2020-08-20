/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module cloud-services-core/token
 */

/* globals XMLHttpRequest, setInterval, clearInterval */

import mix from '@ckeditor/ckeditor5-utils/src/mix';
import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

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
	 * value is a function it has to match the {@link module:cloud-services-core/token~refreshToken} interface.
	 * @param {Object} options
	 * @param {String} [options.initValue] Initial value of the token.
	 * @param {Number} [options.refreshInterval=3600000] Delay between refreshes. Default 1 hour.
	 * @param {Boolean} [options.autoRefresh=true] Specifies whether to start the refresh automatically.
	 */
	constructor( tokenUrlOrRefreshToken, options = DEFAULT_OPTIONS ) {
		if ( !tokenUrlOrRefreshToken ) {
			/**
			 * A `tokenUrl` must be provided as the first constructor argument.
			 *
			 * @error token-missing-token-url
			 */
			throw new CKEditorError(
				'token-missing-token-url',
				this
			);
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

		/**
		 * Base refreshing function.
		 *
		 * @private
		 * @member {String|Function} #_refresh
		 */
		if ( typeof tokenUrlOrRefreshToken === 'function' ) {
			this._refresh = tokenUrlOrRefreshToken;
		} else {
			this._refresh = () => defaultRefreshToken( tokenUrlOrRefreshToken );
		}

		/**
		 * @type {Object}
		 * @private
		 */
		this._options = Object.assign( {}, DEFAULT_OPTIONS, options );
	}

	/**
	 * Initializes the token.
	 *
	 * @returns {Promise.<module:cloud-services-core/token~Token>}
	 */
	init() {
		return new Promise( ( resolve, reject ) => {
			if ( this._options.autoRefresh ) {
				this._startRefreshing();
			}

			if ( !this.value ) {
				this.refreshToken()
					.then( resolve )
					.catch( reject );

				return;
			}

			resolve( this );
		} );
	}

	/**
	 * Refresh token method. Useful in a method form as it can be override in tests.
	 * @returns {Promise.<String>}
	 */
	refreshToken() {
		return this._refresh()
			.then( value => this.set( 'value', value ) )
			.then( () => this );
	}

	/**
	 * Destroys token instance. Stops refreshing.
	 */
	destroy() {
		this._stopRefreshing();
	}

	/**
	 * Starts value refreshing every `refreshInterval` time.
	 *
	 * @protected
	 */
	_startRefreshing() {
		this._refreshInterval = setInterval( () => this.refreshToken(), this._options.refreshInterval );
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
	 * Creates a initialized {@link module:cloud-services-core/token~Token} instance.
	 *
	 * @param {String|Function} tokenUrlOrRefreshToken Endpoint address to download the token or a callback that provides the token. If the
	 * value is a function it has to match the {@link module:cloud-services-core/token~refreshToken} interface.
	 * @param {Object} options
	 * @param {String} [options.initValue] Initial value of the token.
	 * @param {Number} [options.refreshInterval=3600000] Delay between refreshes. Default 1 hour.
	 * @param {Boolean} [options.autoRefresh=true] Specifies whether to start the refresh automatically.
	 * @returns {Promise.<module:cloud-services-core/token~Token>}
	 */
	static create( tokenUrlOrRefreshToken, options = DEFAULT_OPTIONS ) {
		const token = new Token( tokenUrlOrRefreshToken, options );

		return token.init();
	}
}

mix( Token, ObservableMixin );

/**
 * This function is called in a defined interval by the {@link ~Token} class. It also can be invoked manually.
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
				/**
				 * Cannot download new token from the provided url.
				 *
				 * @error token-cannot-download-new-token
				 */
				return reject(
					new CKEditorError( 'token-cannot-download-new-token', null )
				);
			}

			return resolve( xhrResponse );
		} );

		xhr.addEventListener( 'error', () => reject( new Error( 'Network Error' ) ) );
		xhr.addEventListener( 'abort', () => reject( new Error( 'Abort' ) ) );

		xhr.send();
	} );
}

export default Token;
