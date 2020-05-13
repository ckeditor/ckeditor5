/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableclipboard
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import TableSelection from './tableselection';
import TableWalker from './tablewalker';
import { getColumnIndexes, getRowIndexes, isSelectionRectangular } from './utils';
import { findAncestor } from './commands/utils';
import { cropTableToDimensions } from './tableselection/croptable';
import TableUtils from './tableutils';

/**
 * This plugin adds support for copying/cutting/pasting fragments of tables.
 * It is loaded automatically by the {@link module:table/table~Table} plugin.
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
		return [ TableSelection, TableUtils ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const viewDocument = editor.editing.view.document;

		this.listenTo( viewDocument, 'copy', ( evt, data ) => this._onCopyCut( evt, data ) );
		this.listenTo( viewDocument, 'cut', ( evt, data ) => this._onCopyCut( evt, data ) );
		this.listenTo( editor.model, 'insertContent', ( evt, args ) => this._onInsertContent( evt, ...args ), { priority: 'high' } );
	}

	/**
	 * Copies table content to a clipboard on "copy" & "cut" events.
	 *
	 * @private
	 * @param {module:utils/eventinfo~EventInfo} evt An object containing information about the handled event.
	 * @param {Object} data Clipboard event data.
	 */
	_onCopyCut( evt, data ) {
		const tableSelection = this.editor.plugins.get( TableSelection );

		if ( !tableSelection.getSelectedTableCells() ) {
			return;
		}

		if ( evt.name == 'cut' && this.editor.isReadOnly ) {
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
	 * Overrides default {@link module:engine/model/model~Model#insertContent `model.insertContent()`} method to handle pasting table inside
	 * selected table fragment.
	 *
	 * Depending on selected table fragment:
	 * - If a selected table fragment is smaller than paste table it will crop pasted table to match dimensions.
	 * - If dimensions are equal it will replace selected table fragment with a pasted table contents.
	 *
	 * @private
	 * @param evt
	 * @param {module:engine/model/documentfragment~DocumentFragment|module:engine/model/item~Item} content The content to insert.
	 * @param {module:engine/model/selection~Selectable} [selectable=model.document.selection]
	 * The selection into which the content should be inserted. If not provided the current model document selection will be used.
	 */
	_onInsertContent( evt, content, selectable ) {
		if ( selectable && !selectable.is( 'documentSelection' ) ) {
			return;
		}

		const tableSelection = this.editor.plugins.get( TableSelection );
		const selectedTableCells = tableSelection.getSelectedTableCells();

		if ( !selectedTableCells ) {
			return;
		}

		// We might need to crop table before inserting so reference might change.
		let insertedTable = getTableFromContent( content );

		if ( !insertedTable ) {
			return;
		}

		// Override default model.insertContent() handling at this point.
		evt.stop();

		// Currently not handled. See: https://github.com/ckeditor/ckeditor5/issues/6121.
		if ( selectedTableCells.length === 1 ) {
			// @if CK_DEBUG // console.log( 'NOT IMPLEMENTED YET: Single table cell is selected.' );

			return;
		}

		const tableUtils = this.editor.plugins.get( TableUtils );

		// Currently not handled. The selected table content should be trimmed to a rectangular selection.
		// See: https://github.com/ckeditor/ckeditor5/issues/6122.
		if ( !isSelectionRectangular( this.editor.model.document.selection, tableUtils ) ) {
			// @if CK_DEBUG // console.log( 'NOT IMPLEMENTED YET: Selection is not rectangular (non-mergeable).' );

			return;
		}

		const { last: lastColumnOfSelection, first: firstColumnOfSelection } = getColumnIndexes( selectedTableCells );
		const { first: firstRowOfSelection, last: lastRowOfSelection } = getRowIndexes( selectedTableCells );

		const selectionHeight = lastRowOfSelection - firstRowOfSelection + 1;
		const selectionWidth = lastColumnOfSelection - firstColumnOfSelection + 1;

		const insertHeight = tableUtils.getRows( insertedTable );
		const insertWidth = tableUtils.getColumns( insertedTable );

		// The if below is temporal and will be removed when handling this case.
		// See: https://github.com/ckeditor/ckeditor5/issues/6769.
		if ( selectionHeight > insertHeight || selectionWidth > insertWidth ) {
			// @if CK_DEBUG // console.log( 'NOT IMPLEMENTED YET: Pasted table is smaller than selection area.' );

			return;
		}

		const model = this.editor.model;

		model.change( writer => {
			// Crop pasted table if it extends selection area.
			if ( selectionHeight < insertHeight || selectionWidth < insertWidth ) {
				insertedTable = cropTableToDimensions( insertedTable, 0, 0, selectionHeight - 1, selectionWidth - 1, tableUtils, writer );
			}

			// Stores cells as a map of inserted table cell as 'row * column' index.
			const pastedTableMap = createLocationMap( insertedTable, selectionWidth, selectionHeight );

			// Content table to which we insert a table.
			const contentTable = findAncestor( 'table', selectedTableCells[ 0 ] );

			// Selection must be set to pasted cells (some might be removed or new created).
			const cellsToSelect = [];

			// Store previous cell in order to insert a new table cells after it if required.
			let previousCellInRow;

			const tableMap = [ ...new TableWalker( contentTable, {
				startRow: firstRowOfSelection,
				endRow: lastRowOfSelection,
				includeSpanned: true
			} ) ];

			for ( const { column, row, cell, isSpanned } of tableMap ) {
				if ( column === 0 ) {
					previousCellInRow = null;
				}

				// Could use startColumn, endColumn. See: https://github.com/ckeditor/ckeditor5/issues/6785.
				if ( column < firstColumnOfSelection || column > lastColumnOfSelection ) {
					previousCellInRow = cell;

					continue;
				}

				// Map current table location to inserted table location.
				const pastedCell = pastedTableMap[ row - firstRowOfSelection ][ column - firstColumnOfSelection ];

				// There is no cell to insert (might be spanned by other cell in a pasted table) so...
				if ( !pastedCell ) {
					// ...if the cell is anchored in current location (not-spanned slot) then remove that cell from content table...
					if ( !isSpanned ) {
						writer.remove( cell );
					}

					// ...and advance to next content table slot.
					continue;
				}

				// Remove cells from anchor slots (not spanned by other cells).
				if ( !isSpanned ) {
					writer.remove( cell );
				}

				// Clone cell to insert (to duplicate its attributes and children).
				// Cloning is required to support repeating pasted table content when inserting to a bigger selection.
				const cellToInsert = pastedCell._clone( true );

				let insertPosition;

				if ( !previousCellInRow ) {
					insertPosition = writer.createPositionAt( contentTable.getChild( row ), 0 );
				} else {
					insertPosition = writer.createPositionAfter( previousCellInRow );
				}

				writer.insert( cellToInsert, insertPosition );
				cellsToSelect.push( cellToInsert );
				previousCellInRow = cellToInsert;
			}

			writer.setSelection( cellsToSelect.map( cell => writer.createRangeOn( cell ) ) );
		} );
	}
}

function getTableFromContent( content ) {
	if ( content.is( 'table' ) ) {
		return content;
	}

	for ( const child of Array.from( content ) ) {
		if ( child.is( 'table' ) ) {
			return child;
		}
	}

	return null;
}

// Returns two-dimensional array that is addressed by [ row ][ column ] that stores cells anchored at given location.
//
// At given row & column location it might be one of:
//
// * cell - cell from pasted table anchored at this location.
// * null - if no cell is anchored at this location.
//
// For instance, from a table below:
//
//		+----+----+----+----+
//		| 00 | 01 | 02 | 03 |
//		+    +----+----+----+
//		|    | 11      | 13 |
//		+----+         +----+
//		| 20 |         | 23 |
//		+----+----+----+----+
//
// The method will return an array (numbers represents cell element):
//
//	const map = [
//		[ '00', '01', '02', '03' ],
//		[ null, '11', null, '13' ],
//		[ '20', null, null, '23' ]
//	]
//
// This allows for a quick access to table at give row & column. For instance to access table cell "13" from pasted table call:
//
//		const cell = map[ 1 ][ 3 ]
//
function createLocationMap( table, width, height ) {
	// Create height x width (row x column) two-dimensional table to store cells.
	const map = new Array( height ).fill( null )
		.map( () => {
			return new Array( width ).fill( null );
		} );

	for ( const { column, row, cell } of new TableWalker( table ) ) {
		map[ row ][ column ] = cell;
	}

	return map;
}
