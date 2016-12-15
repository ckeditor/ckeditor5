/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* jshint browser: true */

import Plugin from 'ckeditor5-core/src/plugin';
import Enter from 'ckeditor5-enter/src/enter';
import Typing from 'ckeditor5-typing/src/typing';
import Paragraph from 'ckeditor5-paragraph/src/paragraph';
import Clipboard from 'ckeditor5-clipboard/src/clipboard';
import Undo from 'ckeditor5-undo/src/undo';
import Bold from 'ckeditor5-basic-styles/src/bold';
import Italic from 'ckeditor5-basic-styles/src/italic';

export default class PresetBasic extends Plugin {
	static get requires() {
		return [ Enter, Typing, Paragraph, Clipboard, Undo, Bold, Italic ];
	}
}
