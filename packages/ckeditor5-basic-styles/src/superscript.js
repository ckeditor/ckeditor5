/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module basic-styles/superscript
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import SuperscriptEditing from './superscript/superscriptediting';
import SuperscriptUI from './superscript/superscriptui';

/**
 * The superscript feature.
 *
 * It loads the {@link module:basic-styles/superscript/superscriptediting~SuperscriptEditing} and
 * {@link module:basic-styles/superscript/superscriptui~SuperscriptUI} plugins.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Superscript extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ SuperscriptEditing, SuperscriptUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Superscript';
	}
}
