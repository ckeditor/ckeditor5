/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module essentials/essentials
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';

/**
 * A plugin including all essential editing features. It represents a set of features that enables similar functionalities
 * to a `<textarea>` element.
 *
 * It includes:
 *
 * * {@link module:clipboard/clipboard~Clipboard},
 * * {@link module:enter/enter~Enter},
 * * {@link module:typing/typing~Typing},
 * * {@link module:undo/undo~Undo}.
 *
 * This plugin set does not define any block-level containers (such as {@link module:paragraph/paragraph~Paragraph}).
 * If your editor is supposed to handle block content, make sure to include it.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Essentials extends Plugin {
	static get requires() {
		return [ Clipboard, Enter, Typing, Undo ];
	}
}
