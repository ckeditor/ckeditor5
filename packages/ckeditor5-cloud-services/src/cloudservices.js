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
 * Base plugin for Cloud Services. It takes care about the `cloudServices` config options and initializes token provider.
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
		 * The authentication token URL for CloudServices.
		 *
		 * @readonly
		 * @member {String|undefined} #tokenUrl
		 */

		/**
		 * The URL to which the files should be uploaded.
		 *
		 * @readonly
		 * @default 'https://files.cke-cs.com/upload/'
		 * @member {String} #uploadUrl
		 */

		if ( !this.uploadUrl ) {
			this.uploadUrl = 'https://files.cke-cs.com/upload/';
		}

		/**
		 * Other plugins use this token for authorization process. It handles token requesting and refreshing.
		 * Its value is null when `tokenUrl` is not provided.
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
 * The configuration of the Cloud Services. Introduced by the {@link module:cloudservices/cloudservices~CloudServices} plugin.
 *
 * Read more in {@link module:cloudservices/cloudservices~CloudServices}.
 *
 * @member {module:cloudservices/cloudservices~CloudServicesConfig} module:core/editor/editorconfig~EditorConfig#cloudServices
 */

/**
 * The configuration for all plugins using Cloud Services.
 *
 *		ClassicEditor
 *			.create( {
 * 				cloudServices: ... // CloudServices config.
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * @interface CloudServicesConfig
 */

/**
 * The authentication token URL for CloudServices. Token us used to authenticate all plugins using CloudServices,
 * for instance Easy Image. The token URL have to point to the service where the token is generated.
 *
 *		ClassicEditor
 *			.create( document.querySelector( '#editor' ), {
 *				cloudServices: {
 *					tokenUrl: TOKEN_URL
 *				},
 * 				plugins: [ ArticlePluginSet, EasyImage ],
 *				toolbar: [ 'headings', 'undo', 'redo', 'insertImage' ],
 *				image: {
 *					toolbar: [ 'imageStyleFull', 'imageStyleSide', '|', 'imageTextAlternative' ]
 *				}
 *			} );
 *
 * @member {String} module:cloudservices/cloudservices~CloudServicesConfig#tokenUrl
 */

/**
 * The URL to which the files should be uploaded.
 *
 * @member {String} [module:cloudservices/cloudservices~CloudServicesConfig#uploadUrl='https://files.cke-cs.com/upload/']
 */
