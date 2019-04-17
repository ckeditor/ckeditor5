/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module enter/enter
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import EnterCommand from './entercommand';
import EnterObserver from './enterobserver';

/**
 * This plugin handles the <kbd>Enter</kbd> key (hard line break) in the editor.
 *
 * See also the {@link module:enter/shiftenter~ShiftEnter} plugin.
 *
 * For more information about this feature see the {@glink api/enter package page}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Enter extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Enter';
	}

	init() {
		const editor = this.editor;
		const view = editor.editing.view;
		const viewDocument = view.document;

		view.addObserver( EnterObserver );

		editor.commands.add( 'enter', new EnterCommand( editor ) );

		this.listenTo( viewDocument, 'enter', ( evt, data ) => {
			data.preventDefault();

			// The soft enter key is handled by the ShiftEnter plugin.
			if ( data.isSoft ) {
				return;
			}

			editor.execute( 'enter' );
			view.scrollToTheSelection();
		}, { priority: 'low' } );
	}
}
