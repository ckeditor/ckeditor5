/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module essentials/essentials
 */

import { Plugin } from 'ckeditor5/src/core.js';

import { Clipboard } from 'ckeditor5/src/clipboard.js';
import { Enter, ShiftEnter } from 'ckeditor5/src/enter.js';
import { SelectAll } from 'ckeditor5/src/select-all.js';
import { Typing } from 'ckeditor5/src/typing.js';
import { Undo } from 'ckeditor5/src/undo.js';
import { AccessibilityHelp } from 'ckeditor5/src/ui.js';

/**
 * A plugin including all essential editing features. It represents a set of features that enables similar functionalities
 * to a `<textarea>` element.
 *
 * It includes:
 *
 * * {@link module:ui/editorui/accessibilityhelp/accessibilityhelp~AccessibilityHelp},
 * * {@link module:clipboard/clipboard~Clipboard},
 * * {@link module:enter/enter~Enter},
 * * {@link module:select-all/selectall~SelectAll},
 * * {@link module:enter/shiftenter~ShiftEnter},
 * * {@link module:typing/typing~Typing},
 * * {@link module:undo/undo~Undo}.
 *
 * This plugin set does not define any block-level containers (such as {@link module:paragraph/paragraph~Paragraph}).
 * If your editor is supposed to handle block content, make sure to include it.
 */
export default class Essentials extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ AccessibilityHelp, Clipboard, Enter, SelectAll, ShiftEnter, Typing, Undo ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'Essentials' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}
}
