/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module
 */

import { Plugin } from 'ckeditor5/src/core';

/**
 *
 */
export default class TableColumnResizeTrackChanges extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'TableColumnResizeTrackChanges';
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		/**
		 * Intarnal storage for changed tables used to pass tableIndex instead of table itself because passing a table causes some errors.
		 *
		 * @readonly
		 * @member {Array}
		 */
		this._changedTables = [];
	}

	/**
	 * @inheritDoc
	 */
	afterInit() {
		const editor = this.editor;

		if ( !editor.plugins.has( 'TableColumnResizeEditing' ) ) {
			return;
		}

		const plugin = editor.plugins.get( 'TrackChangesEditing' );

		plugin.enableCommand( 'columnResizeTableWidth', ( executeCommand, options = {} ) => {
			const selection = editor.model.document.selection;

			const table = selection.getFirstPosition().findAncestor( 'table' );

			editor.model.change( () => {
				executeCommand( options );

				plugin.markBlockFormat( table, {
					commandName: 'columnResizeTableWidth',
					commandParams: [ options ]
				} );
			} );
		} );

		plugin._descriptionFactory.registerDescriptionCallback( suggestion => {
			const { data } = suggestion;

			if ( !data ) {
				return;
			}

			if ( data.commandName == 'columnResizeTableWidth' ) {
				const newTableWidth = data.commandParams[ 0 ].value;

				if ( newTableWidth ) {
					return {
						type: 'format',
						content: `*Width changed* to ${ newTableWidth }`
					};
				} else {
					return {
						type: 'format',
						content: '*Remove table width*'
					};
				}
			}
		} );

		plugin.enableCommand( 'columnResizeColumnWidths', ( executeCommand, options = {} ) => {
			const resizePlugin = editor.plugins.get( 'TableColumnResizeEditing' );
			const table = resizePlugin._resizingData.elements.modelTable;

			this._changedTables.push( table );
			options.tableIndex = this._changedTables.length - 1;

			editor.model.change( () => {
				plugin.markBlockFormat( table, {
					commandName: 'columnResizeColumnWidths',
					commandParams: [ options ]
				} );
			} );
		} );

		plugin._descriptionFactory.registerDescriptionCallback( suggestion => {
			const { data } = suggestion;

			if ( !data ) {
				return;
			}

			if ( data.commandName == 'columnResizeColumnWidths' ) {
				const newColumnWidth = data.commandParams[ 0 ].value;

				if ( newColumnWidth ) {
					const newColumnWidthSplitted = newColumnWidth.split( ',' );
					const suggestionColumnWidths = suggestion.getContainedElement().getAttribute( 'columnWidths' ).split( ',' );

					for ( let i = 0; i < newColumnWidthSplitted.length; i++ ) {
						if ( newColumnWidthSplitted[ i ] !== suggestionColumnWidths[ i ] ) {
							suggestionColumnWidths[ i ] = `*${ newColumnWidthSplitted[ i ] }*`;
						}
					}

					return {
						type: 'format',
						content: `*Column widths changed* to ${ suggestionColumnWidths.join( ',' ) }`
					};
				} else {
					return {
						type: 'format',
						content: '*Remove column width*'
					};
				}
			}
		} );
	}
}
