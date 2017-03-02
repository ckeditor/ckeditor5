/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module presets/textbox
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';

/**
 * Textbox preset. Represents a set of features which enable in the editor
 * similar functionalities to a `<textarea>`.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Textbox extends Plugin {
	static get requires() {
		return [ Clipboard, Enter, Paragraph, Typing, Undo ];
	}
}
