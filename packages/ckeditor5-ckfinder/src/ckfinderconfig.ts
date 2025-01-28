/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ckfinder/ckfinderconfig
 */

/**
 * The configuration of the {@link module:ckfinder/ckfinder~CKFinder CKFinder feature}
 * and its {@link module:adapter-ckfinder/uploadadapter~CKFinderUploadAdapter upload adapter}.
 *
 * ```
 * ClassicEditor
 * 	.create( editorElement, {
 * 		ckfinder: {
 * 			options: {
 * 				resourceType: 'Images'
 * 			}
 * 		}
 * 	} )
 * 	.then( ... )
 * 	.catch( ... );
 * ```
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 */
export interface CKFinderConfig {

	/**
	 * The configuration options passed to the CKFinder file manager instance.
	 *
	 * Check the file manager [documentation](https://ckeditor.com/docs/ckfinder/ckfinder3/#!/api/CKFinder.Config-cfg-language)
	 * for the complete list of options.
	 */
	options?: CKFinderOptions;

	/**
	 * The type of the CKFinder opener method.
	 *
	 * Supported types are:
	 *
	 * * `'modal'` &ndash; Opens CKFinder in a modal,
	 * * `'popup'` &ndash; Opens CKFinder in a new "pop-up" window.
	 *
	 * Defaults to `'modal'`.
	 */
	openerMethod?: 'modal' | 'popup';

	/**
	 * The path (URL) to the connector which handles the file upload in CKFinder file manager.
	 * When specified, it enables the automatic upload of resources such as images inserted into the content.
	 *
	 * For instance, to use CKFinder's
	 * [quick upload](https://ckeditor.com/docs/ckfinder/ckfinder3-php/commands.html#command_quick_upload)
	 * command, your can use the following (or similar) path:
	 *
	 * ```ts
	 * ClassicEditor
	 * 	.create( editorElement, {
	 * 		ckfinder: {
	 * 			uploadUrl: '/ckfinder/core/connector/php/connector.php?command=QuickUpload&type=Files&responseType=json'
	 * 		}
	 * 	} )
	 * 	.then( ... )
	 * 	.catch( ... );
	 * ```
	 *
	 * Used by the {@link module:adapter-ckfinder/uploadadapter~CKFinderUploadAdapter upload adapter}.
	 */
	uploadUrl?: string;
}

export interface CKFinderOptions extends Record<string, unknown> {
	chooseFiles?: boolean;
	onInit?: ( finder: any ) => void;
	language?: string;
}
