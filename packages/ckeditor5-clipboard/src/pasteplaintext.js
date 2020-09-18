/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module clipboard/clipboard
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import ClipboardObserver from './clipboardobserver';

/**
 * The plugin detects user intentions for pasting plain text.
 *
 * For example, it detects <kbd>ctrl/cmd</kbd> + <kbd>shift</kbd> + <kbd>ctrl/v</kbd> keystroke.
 *
 * @extends module:core/plugin~Plugin
 */
export default class PastePlainText extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'PastePlainText';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const view = this.editor.editing.view;
		const viewDocument = view.document;
		let shiftPressed = false;

		view.addObserver( ClipboardObserver );

		this.listenTo( viewDocument, 'keydown', ( evt, data ) => {
			shiftPressed = data.shiftKey;
		} );

		this.listenTo( viewDocument, 'clipboardInput', ( evt, data ) => {
			if ( shiftPressed ) {
				data.asPlainText = true;
			}
		}, { priority: 'high' } );
	}
}
