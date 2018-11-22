/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ckfinder/ckfinder
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import CKFinderUI from './ckfinderui';
import CKFinderEditing from './ckfinderediting';
import CKFinderUploadAdapter from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter';

/**
 * The CKFinder feature.
 *
 * This is a "glue" plugin which enables:
 *
 * * {@link module:ckfinder/ckfinderediting~CKFinderEditing},
 * * {@link module:ckfinder/ckfinderui~CKFinderUI}.
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
 * The configuration of the {@link module:adapter-ckfinder/uploadadapter~CKFinderUploadAdapter CKFinder upload adapter}.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 *				ckfinder: {
 *					options: {
 *						resourceType: 'Images'
 *					}
 * 				}
 *			} )
 *			.then( ... )
 			.catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 *
 * @interface CKFinderConfig
 */

/**
 * The configuration options to pass to the CKFinder instance.
 *
 * @member {Object} module:ckfinder/ckfinder~CKFinderConfig#options
 */

/**
 * The type of the CKFinder opener method.
 *
 * Supported types are:
 * * `"modal"` - opens a CKFinder modal
 * * `"popup"` - opens a CKFinder popup window
 *
 * Defaults to "'modal'".
 *
 * @member {String} module:ckfinder/ckfinder~CKFinderConfig#openerMethod
 */
