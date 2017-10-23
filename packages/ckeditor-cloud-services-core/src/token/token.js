/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* eslint-env browser */

'use strict';

import mix from '@ckeditor/ckeditor5-utils/src/mix';
import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';

const DEFAULT_OPTIONS = { refreshIntervalTime: 3600000, startAutoRefresh: true };

/**
 * Class representing the token used for communication with CKEditor Cloud Services.
 * Value of the token is retrieving from the specified URL and is refreshed every 1 hour by default.
 *
 * @mixes ObservableMixin
 */
class Token {
	/**
	 * Creates `Token` instance.
	 *
	 * @param {String} tokenUrl Endpoint address to download the token.
	 * @param {String} [initTokenValue] Initial value of the token.
	 * @param {Object} options
	 * @param {Number} [options.refreshIntervalTime=3600000] Delay between refreshes. Default 1 hour.
	 * @param {Boolean} [options.startAutoRefresh=true] Specifies whether to start the refresh automatically.
	 */
	constructor( tokenUrl, initTokenValue, options = DEFAULT_OPTIONS ) {
		if ( !tokenUrl ) {
			throw new Error( '`tokenUrl` must be provided' );
		}

		/**
		 * Value of the token.
		 *
		 * @name value
		 * @type {String}
		 * @observable
		 * @readonly
		 * @memberOf Token#
		 */
		this.set( 'value', initTokenValue );

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
	 * If `initTokenValue` is not provided then the value of the token is download from url.
	 *
	 * @returns {Promise.<Token>}
	 */
	init() {
		return new Promise( ( resolve, reject ) => {
			if ( this._options.startAutoRefresh ) {
				this.startRefreshing();
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
	 * Gets the new token.
	 *
	 * @returns {Promise.<Token>}
	 */
	refreshToken() {
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
	 */
	startRefreshing() {
		this._refreshInterval = setInterval( this.refreshToken.bind( this ), this._options.refreshIntervalTime );
	}

	/**
	 * Stops value refreshing.
	 */
	stopRefreshing() {
		clearInterval( this._refreshInterval );
	}
}

mix( Token, ObservableMixin );

export default Token;
