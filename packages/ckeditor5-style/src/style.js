/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module style/style
 */

import { Plugin } from 'ckeditor5/src/core';

import StyleUI from './styleui';
import StyleEditing from './styleediting';

/**
 * TODO
 *
 * @extends module:core/plugin~Plugin
 */
export default class Style extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Style';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ StyleEditing, StyleUI ];
	}
}

/**
 * The configuration of the {@link module:style/style~Style} feature.
 *
 * Read more in {@link module:style/style~StyleConfig}.
 *
 * @member {module:style/style~StyleConfig} module:core/editor/editorconfig~EditorConfig#style
 */

/**
 * The configuration of the style feature.
 *
 *		ClassicEditor
 *			.create( {
 * 				style: ... // Style feature config.
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 *
 * @interface StyleConfig
 */

/**
 * The available style definitions.
 *
 * @member {Array.<module:style/style~StyleDefinition>} module:style/style~StyleConfig#definitions
 */

/**
 * Style definition.
 *
 * TODO
 *
 * @typedef {Object} module:style/style~StyleDefinition
 */
