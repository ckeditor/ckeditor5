/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module highlight/highlight
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import HighlightEditing from './highlightediting';
import HighlightUI from './highlightui';

/**
 * The highlight plugin.
 *
 * It requires {@link module:highlight/highlightediting~HighlightEditing} and {@link module:highlight/highlightui~HighlightUI} plugins.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Highlight extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ HighlightEditing, HighlightUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Highlight';
	}
}
