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
import TreeWalker from '@ckeditor/ckeditor5-engine/src/model/treewalker';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import priorities from '@ckeditor/ckeditor5-utils/src/priorities';

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
		const view = this.editor.editing.view;
		const viewDocument = view.document;

		// Handle Tab key navigation.
		this.editor.keystrokes.set( 'Tab', ( ...args ) => this._handleTabOnSelectedTable( ...args ), { priority: 'low' } );
		this.editor.keystrokes.set( 'Tab', this._getTabHandler( true ), { priority: 'low' } );
		this.editor.keystrokes.set( 'Shift+Tab', this._getTabHandler( false ), { priority: 'low' } );

		// Note: This listener has the "high+1" priority because we would like to avoid collisions with other features
		// (like Widgets), which take over the keydown events with the "high" priority. Table navigation takes precedence
		// over Widgets in that matter (widget arrow handler stops propagation of event if object element was selected
		// but getNearestSelectionRange didn't returned any range).
		this.listenTo( viewDocument, 'keydown', ( ...args ) => this._onKeydown( ...args ), { priority: priorities.get( 'high' ) + 1 } );
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
	 * Handles {@link module:engine/view/document~Document#event:keydown keydown} events.
	 *
	 * @private
	 * @param {module:utils/eventinfo~EventInfo} eventInfo
	 * @param {module:engine/view/observer/domeventdata~DomEventData} domEventData
	 */
	_onKeydown( eventInfo, domEventData ) {
		const isLtrContent = this.editor.locale.contentLanguageDirection === 'ltr';
		const keyCode = domEventData.keyCode;
		let wasHandled = false;

		// Checks if the keys were handled and then prevents the default event behaviour and stops
		// the propagation.
		if ( isArrowKeyCode( keyCode ) ) {
			wasHandled = this._handleArrowKeys( getDirectionFromKeyCode( keyCode, isLtrContent ) );
		}

		if ( wasHandled ) {
			domEventData.preventDefault();
			eventInfo.stop();
		}
	}

	/**
	 * Handles arrow keys.
	 *
	 * @private
	 * @param {'left'|'up'|'right'|'down'} direction The direction of the arrow key.
	 * @returns {Boolean|undefined} Returns `true` if key was handled.
	 */
	_handleArrowKeys( direction ) {
		const model = this.editor.model;
		const selection = model.document.selection;
		const isForward = [ 'right', 'down' ].includes( direction );

		// In case one or more table cells are selected (from outside),
		// move the selection to a cell adjacent to the selected table fragment.
		const selectedCells = getSelectedTableCells( selection );

		if ( selectedCells.length ) {
			const tableCell = isForward ? selectedCells[ selectedCells.length - 1 ] : selectedCells[ 0 ];

			this._navigateFromCellInDirection( tableCell, direction );

			return true;
		}

		// Abort if we're not in a table.
		const tableCell = findAncestor( 'tableCell', selection.focus );

		if ( !tableCell ) {
			return;
		}

		const cellRange = model.createRangeIn( tableCell );

		// Let's check if the selection is at the beginning/end of the cell.
		if ( this._isSelectionAtCellEdge( cellRange, selection, isForward ) ) {
			this._navigateFromCellInDirection( tableCell, direction );

			return true;
		}

		// If there isn't any $text position between cell edge and selection then we shall move the selection to next cell.
		const textRange = this._findTextRangeFromSelection( cellRange, selection, isForward );

		if ( !textRange ) {
			this._navigateFromCellInDirection( tableCell, direction );

			return true;
		}

		// If the navigation is horizontal then we have no more custom cases.
		if ( [ 'left', 'right' ].includes( direction ) ) {
			return;
		}

		// If the range is a single line then move the selection to the beginning/end of a cell content.
		//
		// We can't move the selection directly to the another cell because of dual position at the end/beginning
		// of wrapped line (it's at the same time at the end of one line and at the start of the next line).
		if ( this._isSingleLineRange( textRange, isForward ) ) {
			model.change( writer => {
				writer.setSelection( isForward ? cellRange.end : cellRange.start );
			} );

			return true;
		}
	}

	/**
	 * Returns `true` if `selection` is at `cellRange` edge according to navigation `direction`.
	 *
	 * @private
	 * @param {module:engine/model/range~Range} cellRange The bounding cell range.
	 * @param {module:engine/model/selection~Selection} selection The current selection.
	 * @param {Boolean} isForward The expected navigation direction.
	 * @returns {Boolean}
	 */
	_isSelectionAtCellEdge( cellRange, selection, isForward ) {
		const model = this.editor.model;
		const schema = this.editor.model.schema;

		const focus = isForward ? selection.getLastPosition() : selection.getFirstPosition();

		// If the current limit element is not table cell we are for sure not at the cell edge.
		// Also `modifySelection` will not let us out of it.
		if ( !schema.getLimitElement( focus ).is( 'tableCell' ) ) {
			return false;
		}

		const probe = model.createSelection( focus );

		model.modifySelection( probe, { direction: isForward ? 'forward' : 'backward' } );

		// If there was no change in the focus position, then it's not possible to move the selection there.
		return focus.isEqual( probe.focus );
	}

	/**
	 * Returns a range from beginning/end of range up to selection closest position.
	 * Returns `null` if resulting range can't contain text element (according to schema).
	 *
	 * @private
	 * @param {module:engine/model/range~Range} range Current table cell content range.
	 * @param {module:engine/model/selection~Selection} selection The current selection.
	 * @param {Boolean} isForward The expected navigation direction.
	 * @returns {module:engine/model/range~Range|null}
	 */
	_findTextRangeFromSelection( range, selection, isForward ) {
		if ( isForward ) {
			const position = selection.getLastPosition();
			const lastRangePosition = this._getNearestTextPosition( range, 'backward' );

			if ( !lastRangePosition || position.compareWith( lastRangePosition ) != 'before' ) {
				return null;
			}

			return new ModelRange( position, lastRangePosition );
		} else {
			const position = selection.getFirstPosition();
			const firstRangePosition = this._getNearestTextPosition( range, 'forward' );

			if ( !firstRangePosition || position.compareWith( firstRangePosition ) != 'after' ) {
				return null;
			}

			return new ModelRange( firstRangePosition, position );
		}
	}

	/**
	 * Basing on provided `boundaries` range, finds first/last (depending on `direction`) element
	 * that can contain `$text` (according to schema).
	 *
	 * @param {module:engine/model/range~Range} boundaries The range to find position in.
	 * @param {'forward'|'backward'} direction Search direction.
	 * @returns {module:engine/model/position~Position|null} Nearest selection range or `null` if one cannot be found.
	 */
	_getNearestTextPosition( boundaries, direction ) {
		const schema = this.editor.model.schema;
		const startPosition = direction == 'forward' ? boundaries.start : boundaries.end;

		const treeWalker = new TreeWalker( { direction, boundaries, startPosition } );

		for ( const { nextPosition } of treeWalker ) {
			if ( schema.checkChild( nextPosition, '$text' ) ) {
				return nextPosition;
			}
		}

		return null;
	}

	/**
	 * Checks if the `modelRange` renders to a single line in the DOM.
	 *
	 * @private
	 * @param {module:engine/model/range~Range} modelRange Current table cell content range.
	 * @param {Boolean} isForward The expected navigation direction.
	 * @returns {Boolean}
	 */
	_isSingleLineRange( modelRange, isForward ) {
		const editing = this.editor.editing;
		const domConverter = editing.view.domConverter;

		if ( isForward && !modelRange.start.isAtEnd ) {
			// Wrapped lines contain exactly the same position at the end of current line
			// and at the beginning of next line. That position's client rect is at the end
			// of current line. In case of caret at first position of the last line that 'dual'
			// position would be detected as it's not the last line.
			modelRange = new ModelRange( modelRange.start.getShiftedBy( 1 ), modelRange.end );
		}

		const viewRange = editing.mapper.toViewRange( modelRange );
		const domRange = domConverter.viewRangeToDom( viewRange );
		const rects = Rect.getDomRangeRects( domRange );

		let boundaryVerticalPosition;

		for ( let i = 0; i < rects.length; i++ ) {
			const idx = isForward ? rects.length - i - 1 : i;
			const rect = rects[ idx ];

			// We need to check if current `rect` is container for following Rects.
			const nextRect = rects.find( ( rect, i ) => i > idx && rect.width > 0 );

			if ( nextRect && rect.contains( nextRect ) ) {
				continue;
			}

			if ( boundaryVerticalPosition === undefined ) {
				boundaryVerticalPosition = Math.round( isForward ? rect.top : rect.bottom );
				continue;
			}

			// Let's check if this rect is in new line.
			if ( isForward ) {
				if ( Math.round( rect.bottom ) <= boundaryVerticalPosition ) {
					return false;
				}

				boundaryVerticalPosition = Math.min( boundaryVerticalPosition, rect.top );
			} else {
				if ( Math.round( rect.top ) >= boundaryVerticalPosition ) {
					return false;
				}

				boundaryVerticalPosition = Math.max( boundaryVerticalPosition, rect.bottom );
			}
		}

		return true;
	}

	/**
	 * Moves the selection from the given table cell in the specified direction.
	 *
	 * @private
	 * @param {module:engine/model/element~Element} tableCell The table cell to start the selection navigation.
	 * @param {'left'|'up'|'right'|'down'} direction Direction in which selection should move.
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

		const cellToSelect = tableMap.find( cellInfo => cellInfo.row == row && cellInfo.column == column ).cell;
		const isForward = [ 'right', 'down' ].includes( direction );
		const positionToSelect = model.createPositionAt( cellToSelect, isForward ? 0 : 'end' );

		model.change( writer => {
			writer.setSelection( positionToSelect );
		} );
	}
}

// Returns 'true' if provided key code represents one of the arrow keys.
//
// @private
// @param {Number} keyCode
// @returns {Boolean}
function isArrowKeyCode( keyCode ) {
	return keyCode == keyCodes.arrowright ||
		keyCode == keyCodes.arrowleft ||
		keyCode == keyCodes.arrowup ||
		keyCode == keyCodes.arrowdown;
}

// Returns direction name from `keyCode`.
//
// @private
// @param {Number} keyCode
// @param {Boolean} isLtrContent The content language direction.
// @returns {'left'|'up'|'right'|'down'} Arrow direction.
function getDirectionFromKeyCode( keyCode, isLtrContent ) {
	switch ( keyCode ) {
		case keyCodes.arrowleft: return isLtrContent ? 'left' : 'right';
		case keyCodes.arrowright: return isLtrContent ? 'right' : 'left';
		case keyCodes.arrowup: return 'up';
		case keyCodes.arrowdown: return 'down';
	}
}
