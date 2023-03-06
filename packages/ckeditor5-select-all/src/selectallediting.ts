/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module select-all/selectallediting
 */

import { Plugin } from '@ckeditor/ckeditor5-core';
import { getCode, parseKeystroke } from '@ckeditor/ckeditor5-utils';
import SelectAllCommand from './selectallcommand';
import type { ViewDocumentKeyDownEvent } from '@ckeditor/ckeditor5-engine';

const SELECT_ALL_KEYSTROKE = parseKeystroke( 'Ctrl+A' );

/**
 * The select all editing feature.
 *
 * It registers the `'selectAll'` {@link module:select-all/selectallcommand~SelectAllCommand command}
 * and the <kbd>Ctrl/⌘</kbd>+<kbd>A</kbd> keystroke listener which executes it.
 */
export default class SelectAllEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'SelectAllEditing' {
		return 'SelectAllEditing';
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const view = editor.editing.view;
		const viewDocument = view.document;

		editor.commands.add( 'selectAll', new SelectAllCommand( editor ) );

		this.listenTo<ViewDocumentKeyDownEvent>( viewDocument, 'keydown', ( eventInfo, domEventData ) => {
			if ( getCode( domEventData ) === SELECT_ALL_KEYSTROKE ) {
				editor.execute( 'selectAll' );
				domEventData.preventDefault();
			}
		} );
	}
}
