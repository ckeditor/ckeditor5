/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module cloud-services/token/token
 */

import { ObservableMixin, CKEditorError, logWarning } from 'ckeditor5/src/utils.js';
import type { TokenUrl } from '../cloudservicesconfig.js';

const DEFAULT_OPTIONS = { autoRefresh: true };
const DEFAULT_TOKEN_REFRESH_TIMEOUT_TIME = 3600000; // 1 hour
const TOKEN_FAILED_REFRESH_TIMEOUT_TIME = 5000; // 5 seconds

/**
 * The class representing the token used for communication with CKEditor Cloud Services.
 * The value of the token is retrieved from the specified URL and refreshed every 1 hour by default.
 * If the token retrieval fails, the token will automatically retry in 5 seconds intervals.
 */
export default class Token extends /* #__PURE__ */ ObservableMixin() {
	/**
	 * Value of the token.
	 * The value of the token is undefined if `initValue` is not provided or `init` method was not called.
	 * `create` method creates token with initialized value from url.
	 *
	 * @see module:cloud-services/token/token~InitializedToken
	 * @observable
	 * @readonly
	 */
	declare public value: string | undefined;

	/**
	 * Base refreshing function.
	 */
	private _refresh: () => Promise<string>;

	/**
	 * Cached token options.
	 */
	private _options: { initValue?: string; autoRefresh: boolean };

	/**
	 * `setTimeout()` id for a token refresh when {@link module:cloud-services/token/token~TokenOptions auto refresh} is enabled.
	 */
	private _tokenRefreshTimeout?: ReturnType<typeof setTimeout>;

	/**
	 * Flag indicating whether the token has been destroyed.
	 */
	private _isDestroyed = false;

	/**
	 * Creates `Token` instance.
	 * Method `init` should be called after using the constructor or use `create` method instead.
	 *
	 * @param tokenUrlOrRefreshToken Endpoint address to download the token or a callback that provides the token. If the
	 * value is a function it has to match the {@link module:cloud-services/token/token~Token#refreshToken} interface.
	 */
	constructor( tokenUrlOrRefreshToken: TokenUrl, options: TokenOptions = {} ) {
		super();

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

		if ( options.initValue ) {
			this._validateTokenValue( options.initValue );
		}

		this.set( 'value', options.initValue );

		if ( typeof tokenUrlOrRefreshToken === 'function' ) {
			this._refresh = tokenUrlOrRefreshToken;
		} else {
			this._refresh = () => defaultRefreshToken( tokenUrlOrRefreshToken );
		}

		this._options = { ...DEFAULT_OPTIONS, ...options };
	}

	/**
	 * Initializes the token.
	 */
	public init(): Promise<InitializedToken> {
		return new Promise( ( resolve, reject ) => {
			if ( !this.value ) {
				this.refreshToken()
					.then( resolve )
					.catch( reject );

				return;
			}

			if ( this._options.autoRefresh ) {
				this._registerRefreshTokenTimeout();
			}

			resolve( this as InitializedToken );
		} );
	}

	/**
	 * Refresh token method. Useful in a method form as it can be overridden in tests.
	 *
	 * This method will be invoked periodically based on the token expiry date after first call to keep the token up-to-date
	 * (requires {@link module:cloud-services/token/token~TokenOptions auto refresh option} to be set).
	 *
	 * If the token refresh fails, the method will retry in 5 seconds intervals until success or the token gets
	 * {@link #destroy destroyed}.
	 */
	public refreshToken(): Promise<InitializedToken> {
		const autoRefresh = this._options.autoRefresh;

		return this._refresh()
			.then( value => {
				this._validateTokenValue( value );
				this.set( 'value', value );

				if ( autoRefresh ) {
					this._registerRefreshTokenTimeout();
				}

				return this as InitializedToken;
			} )
			.catch( err => {
				/**
				 * You will see this warning when the CKEditor {@link module:cloud-services/token/token~Token token} could not be refreshed.
				 * This may be a result of a network error, a token endpoint (server) error, or an invalid
				 * {@link module:cloud-services/cloudservicesconfig~CloudServicesConfig#tokenUrl token URL configuration}.
				 *
				 * If this warning repeats, please make sure that the configuration is correct and that the token
				 * endpoint is up and running. {@link module:cloud-services/cloudservicesconfig~CloudServicesConfig#tokenUrl Learn more}
				 * about token configuration.
				 *
				 * **Note:** If the token's {@link module:cloud-services/token/token~TokenOptions auto refresh option} is enabled,
				 * attempts to refresh will be made until success or token's
				 * {@link module:cloud-services/token/token~Token#destroy destruction}.
				 *
				 * @error token-refresh-failed
				 * @param {boolean} autoRefresh Whether the token will keep auto refreshing.
				 */
				logWarning( 'token-refresh-failed', { autoRefresh } );

				// If the refresh failed, keep trying to refresh the token. Failing to do so will eventually
				// lead to the disconnection from the RTC service and the editing session (and potential data loss
				// if the user keeps editing).
				if ( autoRefresh ) {
					this._registerRefreshTokenTimeout( TOKEN_FAILED_REFRESH_TIMEOUT_TIME );
				}

				throw err;
			} );
	}

	/**
	 * Destroys token instance. Stops refreshing.
	 */
	public destroy(): void {
		this._isDestroyed = true;

		clearTimeout( this._tokenRefreshTimeout );
	}

	/**
	 * Checks whether the provided token follows the JSON Web Tokens (JWT) format.
	 *
	 * @param tokenValue The token to validate.
	 */
	private _validateTokenValue( tokenValue: string ) {
		// The token must be a string.
		const isString = typeof tokenValue === 'string';

		// The token must be a plain string without quotes ("").
		const isPlainString = !/^".*"$/.test( tokenValue );

		// JWT token contains 3 parts: header, payload, and signature.
		// Each part is separated by a dot.
		const isJWTFormat = isString && tokenValue.split( '.' ).length === 3;

		if ( !( isPlainString && isJWTFormat ) ) {
			/**
			 * The provided token must follow the [JSON Web Tokens](https://jwt.io/introduction/) format.
			 *
			 * @error token-not-in-jwt-format
			 */
			throw new CKEditorError( 'token-not-in-jwt-format', this );
		}
	}

	/**
	 * Registers a refresh token timeout for the time taken from token.
	 */
	private _registerRefreshTokenTimeout( timeoutTime?: number ) {
		clearTimeout( this._tokenRefreshTimeout );

		if ( this._isDestroyed ) {
			return;
		}

		const tokenRefreshTimeoutTime = timeoutTime || this._getTokenRefreshTimeoutTime();

		this._tokenRefreshTimeout = setTimeout( () => {
			this.refreshToken();
		}, tokenRefreshTimeoutTime );
	}

	/**
	 * Returns token refresh timeout time calculated from expire time in the token payload.
	 *
	 * If the token parse fails or the token payload doesn't contain, the default DEFAULT_TOKEN_REFRESH_TIMEOUT_TIME is returned.
	 */
	private _getTokenRefreshTimeoutTime() {
		try {
			const [ , binaryTokenPayload ] = this.value!.split( '.' );
			const { exp: tokenExpireTime } = JSON.parse( atob( binaryTokenPayload ) );

			if ( !tokenExpireTime ) {
				return DEFAULT_TOKEN_REFRESH_TIMEOUT_TIME;
			}

			const tokenRefreshTimeoutTime = Math.floor( ( ( tokenExpireTime * 1000 ) - Date.now() ) / 2 );

			return tokenRefreshTimeoutTime;
		} catch {
			return DEFAULT_TOKEN_REFRESH_TIMEOUT_TIME;
		}
	}

	/**
	 * Creates a initialized {@link module:cloud-services/token/token~Token} instance.
	 *
	 * @param tokenUrlOrRefreshToken Endpoint address to download the token or a callback that provides the token. If the
	 * value is a function it has to match the {@link module:cloud-services/token/token~Token#refreshToken} interface.
	 */
	public static create( tokenUrlOrRefreshToken: TokenUrl, options: TokenOptions = {} ): Promise<InitializedToken> {
		const token = new Token( tokenUrlOrRefreshToken, options );

		return token.init();
	}
}

/**
 * A {@link ~Token} instance that has been initialized.
 */
export type InitializedToken = Token & { value: string };

/**
 * Options for creating tokens.
 */
export interface TokenOptions {

	/**
	 * Initial value of the token.
	 */
	initValue?: string;

	/**
	 * Specifies whether to start the refresh automatically.
	 *
	 * @default true
	 */
	autoRefresh?: boolean;
}

/**
 * This function is called in a defined interval by the {@link ~Token} class. It also can be invoked manually.
 * It should return a promise, which resolves with the new token value.
 * If any error occurs it should return a rejected promise with an error message.
 */
function defaultRefreshToken( tokenUrl: string ) {
	return new Promise<string>( ( resolve, reject ) => {
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
