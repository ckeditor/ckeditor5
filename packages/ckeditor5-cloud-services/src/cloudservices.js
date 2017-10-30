/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module cloudservices/cloudservices
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Token from '@ckeditor/ckeditor-cloudservices-core/src/token/token';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * Base plugin for Cloud Services. It takes care about the `cloudServices` config options and initializes token provider.
 */
export default class CloudServices extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const config = editor.config;

		const options = config.get( 'cloudServices' );

		for ( const optionName in options ) {
			this[ optionName ] = options[ optionName ];
		}

		/**
		 * The authentication token URL for CloudServices.
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
		 * @readonly
		 * @member {String} #tokenUrl
		 */

		if ( !this.tokenUrl ) {
			/**
			 * The authentication `cloudServices.token` config is not provided.
			 *
			 * @error cloudservices-token-endpoint-not-provided
			 */
			throw new CKEditorError(
				'cloudservices-token-endpoint-not-provided: The authentication `cloudServices.token` config is not provided.'
			);
		}

		/**
		 * Other plugins use this token for authorization process.
		 * It handles token refreshing. You should use `token.value` later to get its value.
		 *
		 * @readonly
		 */
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
 * The configuration of the Cloud Services.
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
 * The authentication token URL for CloudServices.
 *
 * @member {String} module:cloudservices/cloudservices~CloudServicesConfig#tokenUrl
 */
