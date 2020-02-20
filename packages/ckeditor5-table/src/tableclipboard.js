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

		/**
		 * A table selection plugin instance.
		 *
		 * @private
		 * @readonly
		 * @member {module:table/tableselection~TableSelection} module:tableclipboard~TableClipboard#_tableSelection
		 */
		this._tableSelection = editor.plugins.get( 'TableSelection' );

		this.listenTo( viewDocument, 'copy', ( evt, data ) => this._onCopy( evt, data ), { priority: 'normal' } );
		this.listenTo( viewDocument, 'cut', ( evt, data ) => this._onCut( evt, data ), { priority: 'high' } );
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

		const dataController = this.editor.data;
		const viewDocument = this.editor.editing.view.document;

		const content = dataController.toView( tableSelection.getSelectionAsFragment() );

		viewDocument.fire( 'clipboardOutput', {
			dataTransfer: data.dataTransfer,
			content,
			method: evt.name
		} );
	}

	/**
	 * A clipboard "cut" event handler.
	 *
	 * @param {module:utils/eventinfo~EventInfo} evt An object containing information about the handled event.
	 * @param {Object} data Clipboard event data.
	 * @private
	 */
	_onCut( evt, data ) {
		if ( this._tableSelection.hasMultiCellSelection ) {
			data.preventDefault();
			evt.stop();
		}
	}
}
