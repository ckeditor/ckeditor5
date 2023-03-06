/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module cloud-services/cloudservicesconfig
 */

/**
 * Endpoint address to download the token or a callback that provides the token.
 */
export type TokenUrl = string | ( () => Promise<string> );

/**
 * The configuration for all plugins using CKEditor Cloud Services.
 *
 * ```ts
 * ClassicEditor
 * 	.create( document.querySelector( '#editor' ), {
 * 		cloudServices: {
 * 			tokenUrl: 'https://example.com/cs-token-endpoint',
 * 			uploadUrl: 'https://your-organization-id.cke-cs.com/easyimage/upload/'
 * 		}
 * 	} )
 * 	.then( ... )
 * 	.catch( ... );
 * ```
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 */
export interface CloudServicesConfig {

	/**
	 * A token URL or a token request function.
	 *
	 * As a string, it should be a URL to the security token endpoint in your application.
	 * The role of this endpoint is to securely authorize
	 * the end users of your application to use [CKEditor Cloud Services](https://ckeditor.com/ckeditor-cloud-services) only
	 * if they should have access e.g. to upload files with {@glink @cs guides/easy-image/quick-start Easy Image} or to use the
	 * {@glink @cs guides/collaboration/quick-start Collaboration} service.
	 *
	 * ```ts
	 * ClassicEditor
	 * 	.create( document.querySelector( '#editor' ), {
	 * 		cloudServices: {
	 * 			tokenUrl: 'https://example.com/cs-token-endpoint',
	 * 			...
	 * 		}
	 * 	} )
	 * 	.then( ... )
	 * 	.catch( ... );
	 * ```
	 *
	 * As a function, it should provide a promise to the token value,
	 * so you can highly customize the token and provide your token URL endpoint.
	 * By using this approach you can set your own headers for the request.
	 *
	 * ```ts
	 * ClassicEditor
	 * 	.create( document.querySelector( '#editor' ), {
	 * 		cloudServices: {
	 * 			tokenUrl: () => new Promise( ( resolve, reject ) => {
	 * 				const xhr = new XMLHttpRequest();
	 *
	 * 				xhr.open( 'GET', 'https://example.com/cs-token-endpoint' );
	 *
	 * 				xhr.addEventListener( 'load', () => {
	 * 					const statusCode = xhr.status;
	 * 					const xhrResponse = xhr.response;
	 *
	 * 					if ( statusCode < 200 || statusCode > 299 ) {
	 * 						return reject( new Error( 'Cannot download new token!' ) );
	 * 					}
	 *
	 * 					return resolve( xhrResponse );
	 * 				} );
	 *
	 * 				xhr.addEventListener( 'error', () => reject( new Error( 'Network Error' ) ) );
	 * 				xhr.addEventListener( 'abort', () => reject( new Error( 'Abort' ) ) );
	 *
	 * 				xhr.setRequestHeader( customHeader, customValue );
	 *
	 * 				xhr.send();
	 * 			} ),
	 * 			...
	 * 		}
	 * 	} )
	 * ```
	 *
	 * You can find more information about token endpoints in the
	 * {@glink @cs guides/easy-image/quick-start#create-token-endpoint Cloud Services - Quick start}
	 * and {@glink @cs guides/security/token-endpoint Cloud Services - Token endpoint} documentation.
	 *
	 * Without a properly working token endpoint (token URL) CKEditor plugins will not be able to connect to CKEditor Cloud Services.
	 */
	tokenUrl?: TokenUrl;

	/**
	 * The endpoint URL for [CKEditor Cloud Services](https://ckeditor.com/ckeditor-cloud-services) uploads.
	 * This option must be set for Easy Image to work correctly.
	 *
	 * The upload URL is unique for each customer and can be found in the
	 * [CKEditor Ecosystem customer dashboard](https://dashboard.ckeditor.com) after subscribing to the Easy Image service.
	 * To learn how to start using Easy Image, check the {@glink @cs guides/easy-image/quick-start Easy Image - Quick start} documentation.
	 *
	 * Note: Make sure to also set the {@link module:cloud-services/cloudservicesconfig~CloudServicesConfig#tokenUrl} configuration option.
	 */
	uploadUrl?: string;

	/**
	 * The URL for web socket communication, used by the `RealTimeCollaborativeEditing` plugin. Every customer (organization in the CKEditor
	 * Ecosystem dashboard) has their own, unique URLs to communicate with CKEditor Cloud Services. The URL can be found in the
	 * CKEditor Ecosystem customer dashboard.
	 *
	 * Note: Unlike most plugins, `RealTimeCollaborativeEditing` is not included in any CKEditor 5 build and needs to be installed manually.
	 * Check [Collaboration overview](https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/overview.html) for more details.
	 */
	webSocketUrl?: string;

	/**
	 * An optional parameter used for integration with CKEditor Cloud Services when uploading the editor build to cloud services.
	 *
	 * Whenever the editor build or the configuration changes, this parameter should be set to a new, unique value to differentiate
	 * the new bundle (build + configuration) from the old ones.
	 */
	bundleVersion?: string;
}
