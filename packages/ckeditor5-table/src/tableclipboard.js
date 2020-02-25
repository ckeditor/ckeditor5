/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableclipboard
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import TableSelection from './tableselection';
import { clearTableCellsContents } from './tableselection/utils';
import viewToPlainText from '@ckeditor/ckeditor5-clipboard/src/utils/viewtoplaintext';
import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';

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

		/**
		 * A table selection plugin instance.
		 *
		 * @private
		 * @readonly
		 * @member {module:table/tableselection~TableSelection} module:tableclipboard~TableClipboard#_tableSelection
		 */
		this._tableSelection = editor.plugins.get( 'TableSelection' );

		this.listenTo( viewDocument, 'copy', ( evt, data ) => this._onCopy( evt, data ) );
		this.listenTo( viewDocument, 'cut', ( evt, data ) => this._onCut( evt, data ) );
		this.listenTo( viewDocument, 'clipboardOutput', ( evt, data ) => this._onClipboardOutput( evt, data ) );
	}

	/**
	 * A clipboard "copy" event handler.
	 *
	 * @param {module:utils/eventinfo~EventInfo} evt An object containing information about the handled event.
	 * @param {Object} data Clipboard event data.
	 * @private
	 */
	_onCopy( evt, data ) {
		const tableSelection = this._tableSelection;

		if ( !tableSelection.hasMultiCellSelection ) {
			return;
		}

		data.preventDefault();
		evt.stop();

		this._copySelectedCellsToClipboard( tableSelection.getSelectionAsFragment(), data, evt.name );
	}

	/**
	 * A clipboard "cut" event handler.
	 *
	 * @param {module:utils/eventinfo~EventInfo} evt An object containing information about the handled event.
	 * @param {Object} data Clipboard event data.
	 * @private
	 */
	_onCut( evt, data ) {
		const tableSelection = this._tableSelection;

		if ( !tableSelection.hasMultiCellSelection ) {
			return;
		}

		data.preventDefault();
		evt.stop();

		this._copySelectedCellsToClipboard( tableSelection.getSelectionAsFragment(), data, evt.name );
		clearTableCellsContents( this.editor.model, tableSelection.getSelectedTableCells() );
	}

	/**
	 * Overrides default Clipboard plugin "clipboardOutput" handler. The table contents clearing is on in {@link #_onCut} handler.
	 *
	 * @param {module:utils/eventinfo~EventInfo} evt An object containing information about the handled event.
	 * @param {Object} data Clipboard event data.
	 * @private
	 */
	_onClipboardOutput( evt, data ) {
		if ( !this._tableSelection.hasMultiCellSelection && data.method !== 'cut' ) {
			return;
		}

		evt.stop();

		data.dataTransfer.setData( 'text/html', new HtmlDataProcessor().toData( data.content ) );
		data.dataTransfer.setData( 'text/plain', viewToPlainText( data.content ) );
	}

	/**
	 * Handles clipboard output the same way as Clipboard plugin would.
	 *
	 * @private
	 * @param {Array.<module:engine/model/element~Element>} selectedTableCells
	 * @param {module:clipboard/clipboard~ClipboardOutputEventData} data Event data.
	 * @param {String} method Copy/cut method.
	 */
	_copySelectedCellsToClipboard( selectedTableCells, data, method ) {
		const dataController = this.editor.data;
		const viewDocument = this.editor.editing.view.document;

		const content = dataController.toView( this._tableSelection.getSelectionAsFragment() );

		viewDocument.fire( 'clipboardOutput', {
			dataTransfer: data.dataTransfer,
			content,
			method
		} );
	}
}
