/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module upload/uploadconfig
 */

/**
 * The configuration of the {@link module:upload/adapters/simpleuploadadapter~SimpleUploadAdapter simple upload adapter}.
 *
 * ```ts
 * ClassicEditor
 * 	.create( editorElement, {
 * 		simpleUpload: {
 * 			// The URL the images are uploaded to.
 * 			uploadUrl: 'http://example.com',
 *
 * 			// Headers sent along with the XMLHttpRequest to the upload server.
 * 			headers: {
 * 				...
 * 			}
 * 		}
 * 	} );
 * 	.then( ... )
 * 	.catch( ... );
 * ```
 *
 * See the {@glink features/images/image-upload/simple-upload-adapter "Simple upload adapter"} guide to learn more.
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor configuration options}.
 */
export interface SimpleUploadConfig {

	/**
	 * The path (URL) to the server (application) which handles the file upload. When specified, enables the automatic
	 * upload of resources (images) inserted into the editor content.
	 *
	 * Learn more about the server application requirements in the
	 * {@glink features/images/image-upload/simple-upload-adapter#server-side-configuration "Server-side configuration"} section
	 * of the feature guide.
	 */
	uploadUrl: string;

	/**
	 * [Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers) sent with the request to the server during the upload.
	 * This is the right place to implement security mechanisms like authentication and
	 * [CSRF](https://developer.mozilla.org/en-US/docs/Glossary/CSRF) protection.
	 *
	 * The value can be specified either as an object of key-value pairs or a callback function that returns such an object:
	 *
	 * ```ts
	 * ClassicEditor
	 * 	.create( editorElement, {
	 * 		simpleUpload: {
	 * 			// Set headers statically:
	 * 			headers: {
	 * 				'X-CSRF-TOKEN': 'CSRF-Token',
	 * 				Authorization: 'Bearer <JSON Web Token>'
	 * 			}
	 *
	 * 			// Or dynamically, based on the file:
	 * 			headers: ( file ) => {
	 * 				return {
	 * 					'X-File-Name': file.name,
	 * 					'X-File-Size': file.size
	 * 				};
	 * 			}
	 * 		}
	 * 	} );
	 * ```
	 *
	 * Learn more about the server application requirements in the
	 * {@glink features/images/image-upload/simple-upload-adapter#server-side-configuration "Server-side configuration"} section
	 * of the feature guide.
	 */
	headers?: Record<string, string> | ( ( file: File ) => Record<string, string> );

	/**
	 * This flag enables the
	 * [`withCredentials`](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials)
	 * property of the request sent to the server during the upload. It affects cross-site requests only and, for instance,
	 * allows credentials such as cookies to be sent along with the request.
	 *
	 * ```ts
	 * ClassicEditor
	 * 	.create( editorElement, {
	 * 		simpleUpload: {
	 * 			withCredentials: true
	 * 		}
	 * 	} );
	 * 	.then( ... )
	 * 	.catch( ... );
	 * ```
	 *
	 * Learn more about the server application requirements in the
	 * {@glink features/images/image-upload/simple-upload-adapter#server-side-configuration "Server-side configuration"} section
	 * of the feature guide.
	 *
	 * @default false
	 */
	withCredentials?: boolean;
}
