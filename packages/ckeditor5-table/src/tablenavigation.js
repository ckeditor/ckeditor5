/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablenavigation
 */

import TableSelection from './tableselection';
import TableWalker from './tablewalker';
import { findAncestor } from './commands/utils';
import { getSelectedTableCells, getTableCellsContainingSelection } from './utils';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Rect from '@ckeditor/ckeditor5-utils/src/dom/rect';
import priorities from '@ckeditor/ckeditor5-utils/src/priorities';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';

/**
 * This plugin enables keyboard navigation for tables.
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
	static get requires() {
		return [ TableSelection ];
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
	 * @param {module:engine/view/observer/keyobserver~KeyEventData} data Key event data.
	 * @param {Function} cancel The stop/stopPropagation/preventDefault function.
	 */
	_handleTabOnSelectedTable( data, cancel ) {
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

			// Move to the first cell in the next row.
			if ( isForward && isLastCellInRow ) {
				const nextRow = table.getChild( currentRowIndex + 1 );

				cellToFocus = nextRow.getChild( 0 );
			}
			// Move to the last cell in the previous row.
			else if ( !isForward && isFirstCellInRow ) {
				const previousRow = table.getChild( currentRowIndex - 1 );

				cellToFocus = previousRow.getChild( previousRow.childCount - 1 );
			}
			// Move to the next/previous cell.
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
		const keyCode = domEventData.keyCode;

		if ( !isArrowKeyCode( keyCode ) ) {
			return;
		}

		const direction = getDirectionFromKeyCode( keyCode, this.editor.locale.contentLanguageDirection );
		const wasHandled = this._handleArrowKeys( direction, domEventData.shiftKey );

		if ( wasHandled ) {
			domEventData.preventDefault();
			domEventData.stopPropagation();
			eventInfo.stop();
		}
	}

	/**
	 * Handles arrow keys to move the selection around a table.
	 *
	 * @private
	 * @param {'left'|'up'|'right'|'down'} direction The direction of the arrow key.
	 * @param {Boolean} expandSelection If the current selection should be expanded.
	 * @returns {Boolean} Returns `true` if key was handled.
	 */
	_handleArrowKeys( direction, expandSelection ) {
		const model = this.editor.model;
		const selection = model.document.selection;
		const isForward = [ 'right', 'down' ].includes( direction );

		// In case one or more table cells are selected (from outside),
		// move the selection to a cell adjacent to the selected table fragment.
		const selectedCells = getSelectedTableCells( selection );

		if ( selectedCells.length ) {
			if ( expandSelection ) {
				const tableSelection = this.editor.plugins.get( 'TableSelection' );
				const focusCell = tableSelection.getFocusCell();

				this._navigateFromCellInDirection( focusCell, direction, expandSelection );
			} else {
				const tableCell = isForward ? selectedCells[ selectedCells.length - 1 ] : selectedCells[ 0 ];

				this._navigateFromCellInDirection( tableCell, direction, expandSelection );
			}

			return true;
		}

		// Abort if we're not in a table cell.
		const tableCell = findAncestor( 'tableCell', selection.focus );

		if ( !tableCell ) {
			return false;
		}

		const cellRange = model.createRangeIn( tableCell );

		// Let's check if the selection is at the beginning/end of the cell.
		if ( this._isSelectionAtCellEdge( selection, isForward ) ) {
			this._navigateFromCellInDirection( tableCell, direction, expandSelection );

			return true;
		}

		// If this is an object selected and it's not at the start or the end of cell content
		// then let's allow widget handler to take care of it.
		const objectElement = selection.getSelectedElement();

		if ( objectElement && model.schema.isObject( objectElement ) ) {
			return false;
		}

		// If next to the selection there is an object then this is not the cell boundary (widget handler should handle this).
		if ( this._isObjectElementNextToSelection( selection, isForward ) ) {
			return false;
		}

		// If there isn't any $text position between cell edge and selection then we shall move the selection to next cell.
		const textRange = this._findTextRangeFromSelection( cellRange, selection, isForward );

		if ( !textRange ) {
			this._navigateFromCellInDirection( tableCell, direction, expandSelection );

			return true;
		}

		// If the navigation is horizontal then we have no more custom cases.
		if ( [ 'left', 'right' ].includes( direction ) ) {
			return false;
		}

		// If the range is a single line then move the selection to the beginning/end of a cell content.
		//
		// We can't move the selection directly to the another cell because of dual position at the end/beginning
		// of wrapped line (it's at the same time at the end of one line and at the start of the next line).
		if ( this._isSingleLineRange( textRange, isForward ) ) {
			model.change( writer => {
				const newPosition = isForward ? cellRange.end : cellRange.start;

				if ( expandSelection ) {
					const newSelection = model.createSelection( selection.anchor );
					newSelection.setFocus( newPosition );

					writer.setSelection( newSelection );
				} else {
					writer.setSelection( newPosition );
				}
			} );

			return true;
		}
	}

	/**
	 * Returns true if the selection is at the boundary of a table cell according to the navigation direction.
	 *
	 * @private
	 * @param {module:engine/model/selection~Selection} selection The current selection.
	 * @param {Boolean} isForward The expected navigation direction.
	 * @returns {Boolean}
	 */
	_isSelectionAtCellEdge( selection, isForward ) {
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
	 * Checks if there is an {@link module:engine/model/element~Element element} next to the current
	 * {@link module:engine/model/selection~Selection model selection} marked in
	 * {@link module:engine/model/schema~Schema schema} as an `object`.
	 *
	 * @private
	 * @param {module:engine/model/selection~Selection} modelSelection The selection.
	 * @param {Boolean} isForward Direction of checking.
	 * @returns {Boolean}
	 */
	_isObjectElementNextToSelection( modelSelection, isForward ) {
		const model = this.editor.model;
		const schema = model.schema;

		const probe = model.createSelection( modelSelection );
		model.modifySelection( probe, { direction: isForward ? 'forward' : 'backward' } );
		const objectElement = isForward ? probe.focus.nodeBefore : probe.focus.nodeAfter;

		return objectElement && schema.isObject( objectElement );
	}

	/**
	 * Truncates the range so that it spans from the last selection position
	 * to the last allowed $text position (mirrored if isForward is false).
	 *
	 * Returns `null` if resulting range can't contain $text element (according to schema).
	 *
	 * @private
	 * @param {module:engine/model/range~Range} range Current table cell content range.
	 * @param {module:engine/model/selection~Selection} selection The current selection.
	 * @param {Boolean} isForward The expected navigation direction.
	 * @returns {module:engine/model/range~Range|null}
	 */
	_findTextRangeFromSelection( range, selection, isForward ) {
		const model = this.editor.model;

		if ( isForward ) {
			const position = selection.getLastPosition();
			const lastRangePosition = this._getNearestVisibleTextPosition( range, 'backward' );

			if ( lastRangePosition && position.isBefore( lastRangePosition ) ) {
				return model.createRange( position, lastRangePosition );
			}

			return null;
		} else {
			const position = selection.getFirstPosition();
			const firstRangePosition = this._getNearestVisibleTextPosition( range, 'forward' );

			if ( firstRangePosition && position.isAfter( firstRangePosition ) ) {
				return model.createRange( firstRangePosition, position );
			}

			return null;
		}
	}

	/**
	 * Basing on provided range, finds first/last (depending on `direction`) position inside the range
	 * that can contain `$text` (according to schema) and is visible in the view.
	 *
	 * @private
	 * @param {module:engine/model/range~Range} range The range to find position in.
	 * @param {'forward'|'backward'} direction Search direction.
	 * @returns {module:engine/model/position~Position} Nearest selection range.
	 */
	_getNearestVisibleTextPosition( range, direction ) {
		const schema = this.editor.model.schema;
		const mapper = this.editor.editing.mapper;

		for ( const { nextPosition, item } of range.getWalker( { direction } ) ) {
			if ( schema.checkChild( nextPosition, '$text' ) ) {
				const viewElement = mapper.toViewElement( item );

				if ( viewElement && !viewElement.hasClass( 'ck-hidden' ) ) {
					return nextPosition;
				}
			}
		}
	}

	/**
	 * Checks if the DOM range corresponding to provided model range renders as a single line by analyzing DOMRects
	 * (verifying if they visually wrap content to the next line).
	 *
	 * @private
	 * @param {module:engine/model/range~Range} modelRange Current table cell content range.
	 * @param {Boolean} isForward The expected navigation direction.
	 * @returns {Boolean}
	 */
	_isSingleLineRange( modelRange, isForward ) {
		const model = this.editor.model;
		const editing = this.editor.editing;
		const domConverter = editing.view.domConverter;

		// Wrapped lines contain exactly the same position at the end of current line
		// and at the beginning of next line. That position's client rect is at the end
		// of current line. In case of caret at first position of the last line that 'dual'
		// position would be detected as it's not the last line.
		if ( isForward ) {
			const probe = model.createSelection( modelRange.start );

			model.modifySelection( probe );

			// If the new position is at the end of the container then we can't use this position
			// because it would provide incorrect result for eg caption of image and selection
			// just before end of it. Also in this case there is no "dual" position.
			if ( !probe.focus.isAtEnd && !modelRange.start.isEqual( probe.focus ) ) {
				modelRange = model.createRange( probe.focus, modelRange.end );
			}
		}

		const viewRange = editing.mapper.toViewRange( modelRange );
		const domRange = domConverter.viewRangeToDom( viewRange );
		const rects = Rect.getDomRangeRects( domRange );

		let boundaryVerticalPosition;

		for ( const rect of rects ) {
			if ( boundaryVerticalPosition === undefined ) {
				boundaryVerticalPosition = Math.round( rect.bottom );
				continue;
			}

			// Let's check if this rect is in new line.
			if ( Math.round( rect.top ) >= boundaryVerticalPosition ) {
				return false;
			}

			boundaryVerticalPosition = Math.max( boundaryVerticalPosition, Math.round( rect.bottom ) );
		}

		return true;
	}

	/**
	 * Moves the selection from the given table cell in the specified direction.
	 *
	 * @protected
	 * @param {module:engine/model/element~Element} focusCell The table cell that is current multi-cell selection focus.
	 * @param {'left'|'up'|'right'|'down'} direction Direction in which selection should move.
	 * @param {Boolean} expandSelection If the current selection should be expanded.
	 */
	_navigateFromCellInDirection( focusCell, direction, expandSelection ) {
		const model = this.editor.model;

		const table = findAncestor( 'table', focusCell );
		const tableMap = [ ...new TableWalker( table, { includeSpanned: true } ) ];
		const { row: lastRow, column: lastColumn } = tableMap[ tableMap.length - 1 ];

		const currentCellInfo = tableMap.find( ( { cell } ) => cell == focusCell );
		let { row, column } = currentCellInfo;

		switch ( direction ) {
			case 'left':
				column--;
				break;

			case 'up':
				row--;
				break;

			case 'right':
				column += currentCellInfo.colspan;
				break;

			case 'down':
				row += currentCellInfo.rowspan;
				break;
		}

		const isOutsideVertically = row < 0 || row > lastRow;
		const isBeforeFirstCell = column < 0 && row <= 0;
		const isAfterLastCell = column > lastColumn && row >= lastRow;

		// Note that if the table cell at the end of a row is row-spanned then isAfterLastCell will never be true.
		// However, we don't know if user was navigating on the last row or not, so let's stay in the table.

		if ( isOutsideVertically || isBeforeFirstCell || isAfterLastCell ) {
			model.change( writer => {
				writer.setSelection( writer.createRangeOn( table ) );
			} );

			return;
		}

		if ( column < 0 ) {
			column = expandSelection ? 0 : lastColumn;
			row--;
		} else if ( column > lastColumn ) {
			column = expandSelection ? lastColumn : 0;
			row++;
		}

		const cellToSelect = tableMap.find( cellInfo => cellInfo.row == row && cellInfo.column == column ).cell;
		const isForward = [ 'right', 'down' ].includes( direction );

		if ( expandSelection ) {
			const tableSelection = this.editor.plugins.get( 'TableSelection' );
			const anchorCell = tableSelection.getAnchorCell() || focusCell;

			tableSelection.setCellSelection( anchorCell, cellToSelect );
		} else {
			const positionToSelect = model.createPositionAt( cellToSelect, isForward ? 0 : 'end' );

			model.change( writer => {
				writer.setSelection( positionToSelect );
			} );
		}
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
// @param {String} contentLanguageDirection The content language direction.
// @returns {'left'|'up'|'right'|'down'} Arrow direction.
function getDirectionFromKeyCode( keyCode, contentLanguageDirection ) {
	const isLtrContent = contentLanguageDirection === 'ltr';

	switch ( keyCode ) {
		case keyCodes.arrowleft:
			return isLtrContent ? 'left' : 'right';

		case keyCodes.arrowright:
			return isLtrContent ? 'right' : 'left';

		case keyCodes.arrowup:
			return 'up';

		case keyCodes.arrowdown:
			return 'down';
	}
}
