/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablenavigation
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { getSelectedTableCells, getTableCellsContainingSelection } from './utils';
import { findAncestor } from './commands/utils';
import TableWalker from './tablewalker';
import Rect from '@ckeditor/ckeditor5-utils/src/dom/rect';
import ModelRange from '@ckeditor/ckeditor5-engine/src/model/range';

/**
 * This plugin enables a keyboard navigation for tables.
 * It is loaded automatically by the {@link module:table/table~Table} plugin.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TableNavigation extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'TableNavigation';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		// Handle Tab key navigation.
		this.editor.keystrokes.set( 'Tab', ( ...args ) => this._handleTabOnSelectedTable( ...args ), { priority: 'low' } );
		this.editor.keystrokes.set( 'Tab', this._getTabHandler( true ), { priority: 'low' } );
		this.editor.keystrokes.set( 'Shift+Tab', this._getTabHandler( false ), { priority: 'low' } );

		// Handle arrows navigation.
		this.editor.keystrokes.set( 'ArrowLeft', this._getArrowHandler( 'left' ), { priority: 'low' } );
		this.editor.keystrokes.set( 'ArrowRight', this._getArrowHandler( 'right' ), { priority: 'low' } );
		this.editor.keystrokes.set( 'ArrowUp', this._getArrowHandler( 'up' ), { priority: 'low' } );
		this.editor.keystrokes.set( 'ArrowDown', this._getArrowHandler( 'down' ), { priority: 'low' } );
	}

	/**
	 * Handles {@link module:engine/view/document~Document#event:keydown keydown} events for the <kbd>Tab</kbd> key executed
	 * when the table widget is selected.
	 *
	 * @private
	 * @param {module:utils/eventinfo~EventInfo} eventInfo
	 * @param {module:engine/view/observer/domeventdata~DomEventData} domEventData
	 */
	_handleTabOnSelectedTable( domEventData, cancel ) {
		const editor = this.editor;
		const selection = editor.model.document.selection;

		if ( !selection.isCollapsed && selection.rangeCount === 1 && selection.getFirstRange().isFlat ) {
			const selectedElement = selection.getSelectedElement();

			if ( !selectedElement || !selectedElement.is( 'table' ) ) {
				return;
			}

			cancel();

			editor.model.change( writer => {
				writer.setSelection( writer.createRangeIn( selectedElement.getChild( 0 ).getChild( 0 ) ) );
			} );
		}
	}

	/**
	 * Returns a handler for {@link module:engine/view/document~Document#event:keydown keydown} events for the <kbd>Tab</kbd> key executed
	 * inside table cell.
	 *
	 * @private
	 * @param {Boolean} isForward Whether this handler will move the selection to the next or the previous cell.
	 */
	_getTabHandler( isForward ) {
		const editor = this.editor;

		return ( domEventData, cancel ) => {
			const selection = editor.model.document.selection;
			const tableCell = getTableCellsContainingSelection( selection )[ 0 ];

			if ( !tableCell ) {
				return;
			}

			cancel();

			const tableRow = tableCell.parent;
			const table = tableRow.parent;

			const currentRowIndex = table.getChildIndex( tableRow );
			const currentCellIndex = tableRow.getChildIndex( tableCell );

			const isFirstCellInRow = currentCellIndex === 0;

			if ( !isForward && isFirstCellInRow && currentRowIndex === 0 ) {
				// It's the first cell of the table - don't do anything (stay in the current position).
				return;
			}

			const isLastCellInRow = currentCellIndex === tableRow.childCount - 1;
			const isLastRow = currentRowIndex === table.childCount - 1;

			if ( isForward && isLastRow && isLastCellInRow ) {
				editor.execute( 'insertTableRowBelow' );

				// Check if the command actually added a row. If `insertTableRowBelow` execution didn't add a row (because it was disabled
				// or it got overwritten) do not change the selection.
				if ( currentRowIndex === table.childCount - 1 ) {
					return;
				}
			}

			let cellToFocus;

			// Move to first cell in next row.
			if ( isForward && isLastCellInRow ) {
				const nextRow = table.getChild( currentRowIndex + 1 );

				cellToFocus = nextRow.getChild( 0 );
			}
			// Move to last cell in a previous row.
			else if ( !isForward && isFirstCellInRow ) {
				const previousRow = table.getChild( currentRowIndex - 1 );

				cellToFocus = previousRow.getChild( previousRow.childCount - 1 );
			}
			// Move to next/previous cell.
			else {
				cellToFocus = tableRow.getChild( currentCellIndex + ( isForward ? 1 : -1 ) );
			}

			editor.model.change( writer => {
				writer.setSelection( writer.createRangeIn( cellToFocus ) );
			} );
		};
	}

	/**
	 * Returns a handler for {@link module:engine/view/document~Document#event:keydown keydown} events for the arrow keys executed
	 * inside table cell.
	 *
	 * @private
	 * @param {String} direction The direction of navigation relative to the cell in which the caret is located.
	 * Possible values: `"left"`, `"right"`, `"up"` and `"down"`.
	 */
	_getArrowHandler( direction ) {
		return ( data, cancel ) => {
			const model = this.editor.model;
			const selection = model.document.selection;

			// At first let's check if there are some cells that are fully selected (from the outside).
			const selectedCells = getSelectedTableCells( selection );

			if ( selectedCells.length ) {
				const tableCell = [ 'left', 'up' ].includes( direction ) ? selectedCells[ 0 ] : selectedCells.pop();

				this._navigateFromCellInDirection( tableCell, direction );

				cancel();
				return;
			}

			// So we fall back to selection inside the table cell.
			const tableCell = findAncestor( 'tableCell', selection.focus );

			// But the selection is outside the table.
			if ( !tableCell ) {
				return;
			}

			const cellRange = model.createRangeIn( tableCell );

			// Let's check if the selection is at the beginning/end of the cell.
			if ( isSelectionAtCellEdge( cellRange, selection, direction ) ) {
				this._navigateFromCellInDirection( tableCell, direction );

				cancel();
				return;
			}

			// Ok, so easiest cases didn't solved the problem, let's try to find out if we are in the first/last
			// line of the cell content, and if so we will move the caret to beginning/end.

			if ( [ 'up', 'down' ].includes( direction ) && this._isNavigationInEdgeLine( cellRange, direction ) ) {
				model.change( writer => {
					writer.setSelection( direction == 'up' ? cellRange.start : cellRange.end );
				} );

				cancel();
			}
		};
	}

	/**
	 * Detects if a keyboard navigation is on the first/last row of the table cell.
	 *
	 * @private
	 * @param {module:engine/model/range~Range} cellRange Current table cell content range.
	 * @param {String} direction The direction of navigation relative to the cell in which the caret is located.
	 * Possible values: `"up"` and `"down"`.
	 * @returns {Boolean} Whether navigation was handled.
	 */
	_isNavigationInEdgeLine( cellRange, direction ) {
		const model = this.editor.model;
		const selection = model.document.selection;
		const editing = this.editor.editing;
		const domConverter = editing.view.domConverter;

		let modelRange;

		if ( direction == 'up' ) {
			modelRange = new ModelRange( cellRange.start, selection.getFirstPosition() );
		} else {
			// Wrapped lines contain exactly the same position at the end of current line
			// and at the beginning of next line. That position's client rect is at the end
			// of current line. In case of caret at first position of the last line that 'dual'
			// position would be detected as it's not the last line.
			const position = selection.getLastPosition();
			modelRange = new ModelRange( position.isAtEnd ? position : position.getShiftedBy( 1 ), cellRange.end );
		}

		const viewRange = editing.mapper.toViewRange( modelRange );
		const domRange = domConverter.viewRangeToDom( viewRange );
		const rects = Rect.getDomRangeRects( domRange );

		const isForward = direction == 'up';
		let boundaryVerticalPosition = undefined;

		for ( let i = 0; i < rects.length; i++ ) {
			const idx = isForward ? i : rects.length - i - 1;
			const rect = rects[ idx ];

			const nextRect = rects.find( ( rect, i ) => i > idx && rect.width > 0 );

			// First let's skip container Rects.
			if ( nextRect && rect.contains( nextRect ) ) {
				continue;
			}

			if ( boundaryVerticalPosition === undefined ) {
				boundaryVerticalPosition = Math.round( isForward ? rect.bottom : rect.top );
				continue;
			}

			// Let's check if this rect is in new line.
			if ( isForward ) {
				if ( Math.round( rect.top ) >= boundaryVerticalPosition ) {
					return false;
				}

				boundaryVerticalPosition = Math.max( boundaryVerticalPosition, rect.bottom );
			} else {
				if ( Math.round( rect.bottom ) <= boundaryVerticalPosition ) {
					return false;
				}

				boundaryVerticalPosition = Math.min( boundaryVerticalPosition, rect.top );
			}
		}

		return true;
	}

	/**
	 * Moves the selection from given `tableCell` in the specified `direction`.
	 *
	 * @private
	 * @param {module:engine/model/element~Element} tableCell The table cell to start the selection navigation.
	 * @param {String} direction Direction in which selection should move.
	 */
	_navigateFromCellInDirection( tableCell, direction ) {
		const model = this.editor.model;

		const table = findAncestor( 'table', tableCell );
		const tableMap = [ ...new TableWalker( table, { includeSpanned: true } ) ];
		const { row: lastRow, column: lastColumn } = tableMap[ tableMap.length - 1 ];

		const currentCellInfo = tableMap.find( ( { cell } ) => cell == tableCell );
		let { row, column } = currentCellInfo;

		switch ( direction ) {
			case 'left':
				column--;
				break;

			case 'up':
				row--;
				break;

			case 'right':
				column += currentCellInfo.colspan || 1;
				break;

			case 'down':
				row += currentCellInfo.rowspan || 1;
				break;
		}

		const isOutsideVertically = row < 0 || row > lastRow;
		const isBeforeFirstCell = column < 0 && row <= 0;
		const isAfterLastCell = column > lastColumn && row >= lastRow;

		// Note that if the last table cell is row-spanned then isAfterLastCell will never be true but we don't know
		// if user was navigating on the last row or not, so let's allow him to stay in the table.

		if ( isOutsideVertically || isBeforeFirstCell || isAfterLastCell ) {
			model.change( writer => {
				writer.setSelection( writer.createRangeOn( table ) );
			} );

			return;
		}

		if ( column < 0 ) {
			column = lastColumn;
			row--;
		} else if ( column > lastColumn ) {
			column = 0;
			row++;
		}

		const cellToFocus = tableMap.find( cellInfo => cellInfo.row == row && cellInfo.column == column ).cell;
		const rangeToFocus = model.createRangeIn( cellToFocus );
		const positionToFocus = [ 'left', 'up' ].includes( direction ) ? rangeToFocus.end : rangeToFocus.start;

		model.change( writer => {
			writer.setSelection( positionToFocus );
		} );
	}
}

function isSelectionAtCellEdge( cellRange, selection, direction ) {
	switch ( direction ) {
		case 'left': return selection.isCollapsed && selection.focus.isTouching( cellRange.start );
		case 'right': return selection.isCollapsed && selection.focus.isTouching( cellRange.end );
		case 'up': return selection.focus.isTouching( cellRange.start );
		case 'down': return selection.focus.isTouching( cellRange.end );
	}
}
