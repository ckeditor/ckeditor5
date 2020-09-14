/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module typing/delete
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import DeleteCommand from './deletecommand';
import env from '@ckeditor/ckeditor5-utils/src/env';

import injectBeforeInputDeleteHandling from './utils/delete/injectbeforeinputdeletehandling';
import injectDeleteMutationsHandling from './utils/delete/injectdeletemutationshandling.js';

/**
 * The delete and backspace feature. Handles the <kbd>Delete</kbd> and <kbd>Backspace</kbd> keys in the editor.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Delete extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Delete';
	}

	init() {
		const editor = this.editor;

		editor.commands.add( 'forwardDelete', new DeleteCommand( editor, 'forward' ) );
		editor.commands.add( 'delete', new DeleteCommand( editor, 'backward' ) );

		// Use the beforeinput DOM event to handle delete when supported by the browser.
		if ( env.features.isInputEventsLevel1Supported ) {
			injectBeforeInputDeleteHandling( editor );
		}
		// Fall back to the DeleteObserver if beforeinput is not supported by the browser.
		else {
			injectDeleteMutationsHandling( editor );
		}
	}
}
