/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module enter/essentials
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Enter from './enter';
import ShiftEnter from './shiftenter';

/**
 * The Essentials feature. Handles the <kbd>Enter</kbd> and <kbd>Shift + Enter</kbd> keys in the editor.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Essentials extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ Enter, ShiftEnter ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Essentials';
	}
}
