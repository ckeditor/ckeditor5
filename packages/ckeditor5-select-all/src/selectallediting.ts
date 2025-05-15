/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module select-all/selectallediting
 */

import { Plugin } from '@ckeditor/ckeditor5-core';
import { getCode, parseKeystroke } from '@ckeditor/ckeditor5-utils';
import SelectAllCommand from './selectallcommand.js';
import type { ViewDocumentKeyDownEvent } from '@ckeditor/ckeditor5-engine';

const SELECT_ALL_KEYSTROKE = /* #__PURE__ */ parseKeystroke( 'Ctrl+A' );

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
	public static get pluginName() {
		return 'SelectAllEditing' as const;
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
	public init(): void {
		const editor = this.editor;
		const t = editor.t;
		const view = editor.editing.view;
		const viewDocument = view.document;

		editor.commands.add( 'selectAll', new SelectAllCommand( editor ) );

		this.listenTo<ViewDocumentKeyDownEvent>( viewDocument, 'keydown', ( eventInfo, domEventData ) => {
			if ( getCode( domEventData ) === SELECT_ALL_KEYSTROKE ) {
				editor.execute( 'selectAll' );
				domEventData.preventDefault();
			}
		} );

		// Add the information about the keystroke to the accessibility database.
		editor.accessibility.addKeystrokeInfos( {
			keystrokes: [
				{
					label: t( 'Select all' ),
					keystroke: 'CTRL+A'
				}
			]
		} );
	}
}
