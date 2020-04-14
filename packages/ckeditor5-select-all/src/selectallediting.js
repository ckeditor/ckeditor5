/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module selectall/selectallediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { getCode, parseKeystroke } from '@ckeditor/ckeditor5-utils/src/keyboard';
import SelectAllCommand from './selectallcommand';

const SELECT_ALL_KEYSTROKE = parseKeystroke( 'Ctrl+A' );

/**
 * The select all editing feature.
 *
 * It registers the `'selectAll'` {@link module:selectall/selectallcommand~SelectAllCommand command}
 * and the <kbd>Ctrl</kbd>+<kbd>A</kbd> keystroke listener which executes it.
 *
 * @extends module:core/plugin~Plugin
 */
export default class SelectAllEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'SelectAllEditing';
	}

	init() {
		const editor = this.editor;
		const view = editor.editing.view;
		const viewDocument = view.document;

		editor.commands.add( 'selectAll', new SelectAllCommand( editor ) );

		this.listenTo( viewDocument, 'keydown', ( eventInfo, domEventData ) => {
			if ( getCode( domEventData ) === SELECT_ALL_KEYSTROKE ) {
				editor.execute( 'selectAll' );
				domEventData.preventDefault();
			}
		} );
	}
}
