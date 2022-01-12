/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module cloud-services/cloudservices
 */

import { ContextPlugin } from 'ckeditor5/src/core';
import { CKEditorError } from 'ckeditor5/src/utils';
import CloudServicesCore from './cloudservicescore';

/**
 * Plugin introducing the integration between CKEditor 5 and CKEditor Cloud Services .
 *
 * It initializes the token provider based on
 * the {@link module:cloud-services/cloudservices~CloudServicesConfig `config.cloudService`}.
 *
 * @extends module:core/contextplugin~ContextPlugin
 */
export default class CloudServices extends ContextPlugin {
	/**
	 * @inheritdoc
	 */
	static get pluginName() {
		return 'CloudServices';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ CloudServicesCore ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const config = this.context.config;

		const options = config.get( 'cloudServices' ) || {};

		for ( const optionName in options ) {
			this[ optionName ] = options[ optionName ];
		}

		/**
		 * A map of token object instances keyed by the token URLs.
		 *
		 * @private
		 * @type {Map.<String, module:cloud-services/token~Token>}
		 */
		this._tokens = new Map();

		/**
		 * The authentication token URL for CKEditor Cloud Services or a callback to the token value promise. See the
		 * {@link module:cloud-services/cloudservices~CloudServicesConfig#tokenUrl} for more details.
		 *
		 * @readonly
		 * @member {String|Function|undefined} #tokenUrl
		 */

		/**
		 * The URL to which the files should be uploaded.
		 *
		 * @readonly
		 * @member {String} #uploadUrl
		 */

		/**
		 * Other plugins use this token for the authorization process. It handles token requesting and refreshing.
		 * Its value is `null` when {@link module:cloud-services/cloudservices~CloudServicesConfig#tokenUrl} is not provided.
		 *
		 * @readonly
		 * @member {module:cloud-services/token~Token|null} #token
		 */

		if ( !this.tokenUrl ) {
			this.token = null;

			return;
		}

		this.token = this.context.plugins.get( 'CloudServicesCore' ).createToken( this.tokenUrl );

		this._tokens.set( this.tokenUrl, this.token );

		return this.token.init();
	}

	/**
	 * Registers an additional authentication token URL for CKEditor Cloud Services or a callback to the token value promise. See the
	 * {@link module:cloud-services/cloudservices~CloudServicesConfig#tokenUrl} for more details.
	 *
	 * @param {String|Function} tokenUrl The authentication token URL for CKEditor Cloud Services or a callback to the token value promise.
	 * @returns {Promise.<module:cloud-services/token~Token>}
	 */
	registerTokenUrl( tokenUrl ) {
		// Reuse the token instance in case of multiple features using the same token URL.
		if ( this._tokens.has( tokenUrl ) ) {
			return Promise.resolve( this.getTokenFor( tokenUrl ) );
		}

		const token = this.context.plugins.get( 'CloudServicesCore' ).createToken( tokenUrl );

		this._tokens.set( tokenUrl, token );

		return token.init();
	}

	/**
	 * Returns an authentication token provider previously registered by {@link #registerTokenUrl}.
	 *
	 * @param {String|Function} tokenUrl The authentication token URL for CKEditor Cloud Services or a callback to the token value promise.
	 * @returns {module:cloud-services/token~Token}
	 */
	getTokenFor( tokenUrl ) {
		const token = this._tokens.get( tokenUrl );

		if ( !token ) {
			/**
			 * The provided `tokenUrl` was not registered by {@link module:cloud-services/cloudservices~CloudServices#registerTokenUrl}.
			 *
			 * @error cloudservices-token-not-registered
			 */
			throw new CKEditorError( 'cloudservices-token-not-registered', this );
		}

		return token;
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		super.destroy();

		for ( const token of this._tokens.values() ) {
			token.destroy();
		}
	}
}

/**
 * The configuration of CKEditor Cloud Services. Introduced by the {@link module:cloud-services/cloudservices~CloudServices} plugin.
 *
 * Read more in {@link module:cloud-services/cloudservices~CloudServicesConfig}.
 *
 * @member {module:cloud-services/cloudservices~CloudServicesConfig} module:core/editor/editorconfig~EditorConfig#cloudServices
 */

/**
 * The configuration for all plugins using CKEditor Cloud Services.
 *
 *		ClassicEditor
 *			.create( document.querySelector( '#editor' ), {
 *				cloudServices: {
 *					tokenUrl: 'https://example.com/cs-token-endpoint',
 *					uploadUrl: 'https://your-organization-id.cke-cs.com/easyimage/upload/'
 *				}
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 *
 * @interface CloudServicesConfig
 */

/**
 * A token URL or a token request function.
 *
 * As a string, it should be a URL to the security token endpoint in your application. The role of this endpoint is to securely authorize
 * the end users of your application to use [CKEditor Cloud Services](https://ckeditor.com/ckeditor-cloud-services) only
 * if they should have access e.g. to upload files with {@glink @cs guides/easy-image/quick-start Easy Image} or to use the
 * {@glink @cs guides/collaboration/quick-start Collaboration} service.
 *
 *		ClassicEditor
 *			.create( document.querySelector( '#editor' ), {
 *				cloudServices: {
 *					tokenUrl: 'https://example.com/cs-token-endpoint',
 *					...
 *				}
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * As a function, it should provide a promise to the token value, so you can highly customize the token and provide your token URL endpoint.
 * By using this approach you can set your own headers for the request.
 *
 * 		ClassicEditor
 *			.create( document.querySelector( '#editor' ), {
 *				cloudServices: {
 *					tokenUrl: () => new Promise( ( resolve, reject ) => {
 *						const xhr = new XMLHttpRequest();
 *
 *						xhr.open( 'GET', 'https://example.com/cs-token-endpoint' );
 *
 *						xhr.addEventListener( 'load', () => {
 *							const statusCode = xhr.status;
 *							const xhrResponse = xhr.response;
 *
 *							if ( statusCode < 200 || statusCode > 299 ) {
 *								return reject( new Error( 'Cannot download new token!' ) );
 *							}
 *
 *							return resolve( xhrResponse );
 *						} );
 *
 *						xhr.addEventListener( 'error', () => reject( new Error( 'Network Error' ) ) );
 *						xhr.addEventListener( 'abort', () => reject( new Error( 'Abort' ) ) );
 *
 *						xhr.setRequestHeader( customHeader, customValue );
 *
 *						xhr.send();
 *					} ),
 *					...
 *				}
 *			} )
 *
 * You can find more information about token endpoints in the
 * {@glink @cs guides/easy-image/quick-start#create-token-endpoint Cloud Services - Quick start}
 * and {@glink @cs guides/security/token-endpoint Cloud Services - Token endpoint} documentation.
 *
 * Without a properly working token endpoint (token URL) CKEditor plugins will not be able to connect to CKEditor Cloud Services.
 *
 * @member {String|Function} module:cloud-services/cloudservices~CloudServicesConfig#tokenUrl
 */

/**
 * The endpoint URL for [CKEditor Cloud Services](https://ckeditor.com/ckeditor-cloud-services) uploads.
 * This option must be set for Easy Image to work correctly.
 *
 * The upload URL is unique for each customer and can be found in the
 * [CKEditor Ecosystem customer dashboard](https://dashboard.ckeditor.com) after subscribing to the Easy Image service.
 * To learn how to start using Easy Image, check the {@glink @cs guides/easy-image/quick-start Easy Image - Quick start} documentation.
 *
 * Note: Make sure to also set the {@link module:cloud-services/cloudservices~CloudServicesConfig#tokenUrl} configuration option.
 *
 * @member {String} module:cloud-services/cloudservices~CloudServicesConfig#uploadUrl
 */

/**
 * The URL for web socket communication, used by the `RealTimeCollaborativeEditing` plugin. Every customer (organization in the CKEditor
 * Ecosystem dashboard) has their own, unique URLs to communicate with CKEditor Cloud Services. The URL can be found in the
 * CKEditor Ecosystem customer dashboard.
 *
 * Note: Unlike most plugins, `RealTimeCollaborativeEditing` is not included in any CKEditor 5 build and needs to be installed manually.
 * Check [Collaboration overview](https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/overview.html) for more details.
 *
 * @member {String} module:cloud-services/cloudservices~CloudServicesConfig#webSocketUrl
 */

/**
 * An optional parameter used for integration with CKEditor Cloud Services when uploading the editor build to cloud services.
 *
 * Whenever the editor build or the configuration changes, this parameter should be set to a new, unique value to differentiate
 * the new bundle (build + configuration) from the old ones.
 *
 * @member {String} module:cloud-services/cloudservices~CloudServicesConfig#bundleVersion
 */
