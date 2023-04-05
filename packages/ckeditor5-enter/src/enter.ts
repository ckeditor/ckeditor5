/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module enter/enter
 */

import { Plugin } from '@ckeditor/ckeditor5-core';
import EnterCommand from './entercommand';
import EnterObserver, { type ViewDocumentEnterEvent } from './enterobserver';

/**
 * This plugin handles the <kbd>Enter</kbd> keystroke (hard line break) in the editor.
 *
 * See also the {@link module:enter/shiftenter~ShiftEnter} plugin.
 *
 * For more information about this feature see the {@glink api/enter package page}.
 */
export default class Enter extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'Enter' {
		return 'Enter';
	}

	public init(): void {
		const editor = this.editor;
		const view = editor.editing.view;
		const viewDocument = view.document;

		view.addObserver( EnterObserver );

		editor.commands.add( 'enter', new EnterCommand( editor ) );

		this.listenTo<ViewDocumentEnterEvent>( viewDocument, 'enter', ( evt, data ) => {
			// When not in composition, we handle the action, so prevent the default one.
			// When in composition, it's the browser who modify the DOM (renderer is disabled).
			if ( !viewDocument.isComposing ) {
				data.preventDefault();
			}

			// The soft enter key is handled by the ShiftEnter plugin.
			if ( data.isSoft ) {
				return;
			}

			editor.execute( 'enter' );

			view.scrollToTheSelection();
		}, { priority: 'low' } );
	}
}
