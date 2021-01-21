/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ckfinder/ckfinder
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import CKFinderUI from './ckfinderui';
import CKFinderEditing from './ckfinderediting';
import CKFinderUploadAdapter from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter';

/**
 * The CKFinder feature, a bridge between the CKEditor 5 WYSIWYG editor and the
 * [CKFinder](https://ckeditor.com/ckfinder) file manager and uploader.
 *
 * This is a "glue" plugin which enables:
 *
 * * {@link module:ckfinder/ckfinderediting~CKFinderEditing},
 * * {@link module:ckfinder/ckfinderui~CKFinderUI},
 * * {@link module:adapter-ckfinder/uploadadapter~CKFinderUploadAdapter}.
 *
 * See the {@glink features/image-upload/ckfinder "CKFinder integration" guide} to learn how to configure
 * and use this feature.
 *
 * Check out the {@glink features/image-upload/image-upload comprehensive "Image upload" guide} to learn about
 * other ways to upload images into CKEditor 5.
 *
 * @extends module:core/plugin~Plugin
 */
export default class CKFinder extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'CKFinder';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ CKFinderEditing, CKFinderUI, CKFinderUploadAdapter ];
	}
}

/**
 * The configuration of the {@link module:ckfinder/ckfinder~CKFinder CKFinder feature}.
 *
 * Read more in {@link module:ckfinder/ckfinder~CKFinderConfig}.
 *
 * @member {module:ckfinder/ckfinder~CKFinderConfig} module:core/editor/editorconfig~EditorConfig#ckfinder
 */

/**
 * The configuration of the {@link module:ckfinder/ckfinder~CKFinder CKFinder feature}
 * and its {@link module:adapter-ckfinder/uploadadapter~CKFinderUploadAdapter upload adapter}.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 *				ckfinder: {
 *					options: {
 *						resourceType: 'Images'
 *					}
 *				}
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 *
 * @interface CKFinderConfig
 */

/**
 * The configuration options passed to the CKFinder file manager instance.
 *
 * Check the file manager [documentation](https://ckeditor.com/docs/ckfinder/ckfinder3/#!/api/CKFinder.Config-cfg-language)
 * for the complete list of options.
 *
 * @member {Object} module:ckfinder/ckfinder~CKFinderConfig#options
 */

/**
 * The type of the CKFinder opener method.
 *
 * Supported types are:
 *
 * * `'modal'` &ndash; Opens CKFinder in a modal,
 * * `'popup'` &ndash; Opens CKFinder in a new "pop-up" window.
 *
 * Defaults to `'modal'`.
 *
 * @member {String} module:ckfinder/ckfinder~CKFinderConfig#openerMethod
 */

/**
 * The path (URL) to the connector which handles the file upload in CKFinder file manager.
 * When specified, it enables the automatic upload of resources such as images inserted into the content.
 *
 * For instance, to use CKFinder's
 * [quick upload](https://ckeditor.com/docs/ckfinder/ckfinder3-php/commands.html#command_quick_upload)
 * command, your can use the following (or similar) path:
 *
 *		ClassicEditor
 *			.create( editorElement, {
 *				ckfinder: {
 *					uploadUrl: '/ckfinder/core/connector/php/connector.php?command=QuickUpload&type=Files&responseType=json'
 *				}
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * Used by the {@link module:adapter-ckfinder/uploadadapter~CKFinderUploadAdapter upload adapter}.
 *
 * @member {String} module:ckfinder/ckfinder~CKFinderConfig#uploadUrl
 */
