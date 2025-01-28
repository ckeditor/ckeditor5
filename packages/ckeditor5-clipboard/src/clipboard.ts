/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module clipboard/clipboard
 */

import { Plugin } from '@ckeditor/ckeditor5-core';

import ClipboardPipeline from './clipboardpipeline.js';
import DragDrop from './dragdrop.js';
import PastePlainText from './pasteplaintext.js';
import ClipboardMarkersUtils from './clipboardmarkersutils.js';

/**
 * The clipboard feature.
 *
 * Read more about the clipboard integration in the {@glink framework/deep-dive/clipboard clipboard deep-dive} guide.
 *
 * This is a "glue" plugin which loads the following plugins:
 * * {@link module:clipboard/clipboardpipeline~ClipboardPipeline}
 * * {@link module:clipboard/dragdrop~DragDrop}
 * * {@link module:clipboard/pasteplaintext~PastePlainText}
 */
export default class Clipboard extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'Clipboard' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ ClipboardMarkersUtils, ClipboardPipeline, DragDrop, PastePlainText ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const t = this.editor.t;

		// Add the information about the keystrokes to the accessibility database.
		editor.accessibility.addKeystrokeInfos( {
			keystrokes: [
				{
					label: t( 'Copy selected content' ),
					keystroke: 'CTRL+C'
				},
				{
					label: t( 'Paste content' ),
					keystroke: 'CTRL+V'
				},
				{
					label: t( 'Paste content as plain text' ),
					keystroke: 'CTRL+SHIFT+V'
				}
			]
		} );
	}
}
