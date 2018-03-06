/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module cloudservices/cloudservices
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Token from '@ckeditor/ckeditor-cloudservices-core/src/token/token';

/**
 * Plugin introducing CKEditor 5's Cloud Services integration.
 * It takes care of the {@link module:cloudservices/cloudservices~CloudServicesConfig `config.cloudService`}
 * configuration options and initializes the token provider.
 *
 * @extends module:core/plugin~Plugin
 */
export default class CloudServices extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const config = editor.config;

		const options = config.get( 'cloudServices' ) || {};

		for ( const optionName in options ) {
			this[ optionName ] = options[ optionName ];
		}

		/**
		 * The authentication token URL for CKEditor Cloud Services.
		 *
		 * @readonly
		 * @member {String|undefined} #tokenUrl
		 */

		/**
		 * The URL to which the files should be uploaded.
		 *
		 * @readonly
		 * @member {String} #uploadUrl
		 */

		if ( !this.uploadUrl ) {
			this.uploadUrl = 'https://files.cke-cs.com/upload/';
		}

		/**
		 * Other plugins use this token for the authorization process. It handles token requesting and refreshing.
		 * Its value is `null` when {@link module:cloudservices/cloudservices~CloudServicesConfig#tokenUrl} is not provided.
		 *
		 * @readonly
		 * @member {Object|null} #token
		 */

		if ( !this.tokenUrl ) {
			this.token = null;

			return;
		}

		this.token = new CloudServices.Token( this.tokenUrl );

		return this.token.init();
	}
}

CloudServices.Token = Token;

/**
 * The configuration of CKEditor Cloud Services. Introduced by the {@link module:cloudservices/cloudservices~CloudServices} plugin.
 *
 * Read more in {@link module:cloudservices/cloudservices~CloudServicesConfig}.
 *
 * @member {module:cloudservices/cloudservices~CloudServicesConfig} module:core/editor/editorconfig~EditorConfig#cloudServices
 */

/**
 * The configuration for all plugins using CKEditor Cloud Services.
 *
 *		ClassicEditor
 *			.create( document.querySelector( '#editor' ), {
 *				cloudServices: {
 *					uploadUrl: 'https://your-organisation-id.cke-cs.com/easyimage/upload/',
 *					tokenUrl: 'https://example.com/cs-token-endpoint'
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
 * The authentication token URL for CKEditor Cloud Services. The token is used to authenticate all plugins using Cloud Services,
 * for instance Easy Image. The token URL has to point to the service where the token is generated.
 *
 * See [Cloud Services Quick Start](https://docs.ckeditor.com/cs/latest/guides/quick-start.html).
 *
 * @member {String} module:cloudservices/cloudservices~CloudServicesConfig#tokenUrl
 */

/**
 * The URL to which the files should be uploaded.
 *
 * @member {String} [module:cloudservices/cloudservices~CloudServicesConfig#uploadUrl]
 */
