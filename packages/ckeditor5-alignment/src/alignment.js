/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module alignment/alignment
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import AlignmentEditing from './alignmentediting';
import AlignmentUI from './alignmentui';

/**
 * The text alignment plugin.
 *
 * For a detailed overview, check the {@glink features/text-alignment Text alignment feature documentation}
 * and the {@glink api/alignment package page}.
 *
 * This is a "glue" plugin which loads the {@link module:alignment/alignmentediting~AlignmentEditing} and
 * {@link module:alignment/alignmentui~AlignmentUI} plugins.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Alignment extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ AlignmentEditing, AlignmentUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Alignment';
	}
}

/**
 * The configuration of the {@link module:alignment/alignment~Alignment alignment feature}.
 *
 * Read more in {@link module:alignment/alignment~AlignmentConfig}.
 *
 * @member {module:alignment/alignment~AlignmentConfig} module:core/editor/editorconfig~EditorConfig#alignment
 */

/**
 * The configuration of the {@link module:alignment/alignment~Alignment alignment feature}.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 *				alignment: {
 *					options: [ 'left', 'right' ]
 *				}
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor configuration options}.
 *
 * @interface AlignmentConfig
 */

/**
 * Available alignment options.
 *
 * The available options are: `'left'`, `'right'`, `'center'` and `'justify'`. Other values are ignored.
 *
 * **Note:** It is recommended to always use `'left'` or `'right'` as these are default values which the user should
 * normally be able to choose depending on the
 * {@glink features/ui-language#setting-the-language-of-the-content language of the editor content}.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 *				alignment: {
 *					options: [ 'left', 'right' ]
 *				}
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * See the demo of {@glink features/text-alignment#configuring-alignment-options custom alignment options}.
 *
 * @member {Array.<String>} module:alignment/alignment~AlignmentConfig#options
 */
