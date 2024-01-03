/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module clipboard/clipboard
 */

import { Plugin } from '@ckeditor/ckeditor5-core';

import ClipboardPipeline from './clipboardpipeline.js';
import DragDrop from './dragdrop.js';
import PastePlainText from './pasteplaintext.js';

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
	public static get requires() {
		return [ ClipboardPipeline, DragDrop, PastePlainText ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public afterInit(): void {
		const editor = this.editor;

		if ( editor.plugins.has( 'AccessibilityHelp' ) ) {
			const t = editor.t;

			editor.plugins.get( 'AccessibilityHelp' ).registerKeystroke( {
				label: t( 'Copy' ),
				keystroke: 'CTRL+C'
			} );

			editor.plugins.get( 'AccessibilityHelp' ).registerKeystroke( {
				label: t( 'Paste' ),
				keystroke: 'CTRL+V'
			} );

			editor.plugins.get( 'AccessibilityHelp' ).registerKeystroke( {
				label: t( 'Paste as plain text' ),
				keystroke: 'CTRL+SHIFT+V'
			} );
		}
	}
}
