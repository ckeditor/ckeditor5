/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableclipboard
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import TableSelection from './tableselection';

/**
 * The table clipboard integration plugin.
 *
 * It introduces the ability to copy selected table cells.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TableClipboard extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'TableClipboard';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ TableSelection ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const viewDocument = editor.editing.view.document;

		const tableSelection = editor.plugins.get( 'TableSelection' );

		this.listenTo( viewDocument, 'copy', createTableCopyHandler( tableSelection, editor ), { priority: 'normal' } );
		this.listenTo( viewDocument, 'cut', createPreventTableCutHandler( tableSelection ), { priority: 'high' } );
	}
}

function createPreventTableCutHandler( tableSelection ) {
	return ( evt, data ) => {
		if ( tableSelection.hasMultiCellSelection ) {
			data.preventDefault();
			evt.stop();
		}
	};
}

function createTableCopyHandler( tableSelection, editor ) {
	return ( evt, data ) => {
		if ( !tableSelection.hasMultiCellSelection ) {
			return;
		}

		data.preventDefault();
		evt.stop();

		const content = editor.data.toView( tableSelection.getSelectionAsFragment() );

		editor.editing.view.document.fire( 'clipboardOutput', {
			dataTransfer: data.dataTransfer,
			content,
			method: evt.name
		} );
	};
}
