/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tablekeyboard
 */

import TableSelection from './tableselection.js';
import TableWalker from './tablewalker.js';
import TableUtils from './tableutils.js';

import { Plugin } from 'ckeditor5/src/core.js';
import {
	getLocalizedArrowKeyCodeDirection,
	type EventInfo,
	type ArrowKeyCodeDirection,
	type KeystrokeInfo
} from 'ckeditor5/src/utils.js';

import type {
	BubblingEventInfo,
	DocumentSelection,
	DomEventData,
	Element,
	Selection,
	ViewDocumentArrowKeyEvent,
	ViewDocumentTabEvent
} from 'ckeditor5/src/engine.js';

/**
 * This plugin enables keyboard navigation for tables.
 * It is loaded automatically by the {@link module:table/table~Table} plugin.
 */
export default class TableKeyboard extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'TableKeyboard' as const;
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
	public static get requires() {
		return [ TableSelection, TableUtils ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const view = editor.editing.view;
		const viewDocument = view.document;
		const t = editor.t;

		this.listenTo<ViewDocumentArrowKeyEvent>(
			viewDocument,
			'arrowKey',
			( ...args ) => this._onArrowKey( ...args ),
			{ context: 'table' }
		);

		this.listenTo<ViewDocumentTabEvent>(
			viewDocument,
			'tab',
			( ...args ) => this._handleTabOnSelectedTable( ...args ),
			{ context: 'figure' }
		);

		this.listenTo<ViewDocumentTabEvent>(
			viewDocument,
			'tab',
			( ...args ) => this._handleTab( ...args ),
			{ context: [ 'th', 'td' ] }
		);

		// Add the information about the keystrokes to the accessibility database.
		editor.accessibility.addKeystrokeInfoGroup( {
			id: 'table',
			label: t( 'Keystrokes that can be used in a table cell' ),
			keystrokes: [
				{
					label: t( 'Move the selection to the next cell' ),
					keystroke: 'Tab'
				},
				{
					label: t( 'Move the selection to the previous cell' ),
					keystroke: 'Shift+Tab'
				},
				{
					label: t( 'Insert a new table row (when in the last cell of a table)' ),
					keystroke: 'Tab'
				},
				{
					label: t( 'Navigate through the table' ),
					keystroke: [ [ 'arrowup' ], [ 'arrowright' ], [ 'arrowdown' ], [ 'arrowleft' ] ]
				}
			]
		} );
	}

	/**
	 * Handles {@link module:engine/view/document~Document#event:tab tab} events for the <kbd>Tab</kbd> key executed
	 * when the table widget is selected.
	 */
	private _handleTabOnSelectedTable( bubblingEventInfo: BubblingEventInfo, domEventData: DomEventData ) {
		const editor = this.editor;
		const selection = editor.model.document.selection;
		const selectedElement = selection.getSelectedElement();

		if ( !selectedElement || !selectedElement.is( 'element', 'table' ) ) {
			return;
		}

		domEventData.preventDefault();
		domEventData.stopPropagation();
		bubblingEventInfo.stop();

		editor.model.change( writer => {
			writer.setSelection( writer.createRangeIn( ( selectedElement.getChild( 0 ) as Element ).getChild( 0 ) as Element ) );
		} );
	}

	/**
	 * Handles {@link module:engine/view/document~Document#event:tab tab} events for the <kbd>Tab</kbd> key executed
	 * inside table cells.
	 */
	private _handleTab( bubblingEventInfo: BubblingEventInfo, domEventData: DomEventData & KeystrokeInfo ) {
		const editor = this.editor;
		const tableUtils: TableUtils = this.editor.plugins.get( TableUtils );
		const tableSelection: TableSelection = this.editor.plugins.get( 'TableSelection' );

		const selection = editor.model.document.selection;
		const isForward = !domEventData.shiftKey;

		let tableCell: Element | null = tableUtils.getTableCellsContainingSelection( selection )[ 0 ];

		if ( !tableCell ) {
			tableCell = tableSelection.getFocusCell();
		}

		if ( !tableCell ) {
			return;
		}

		domEventData.preventDefault();
		domEventData.stopPropagation();
		bubblingEventInfo.stop();

		const tableRow = tableCell.parent as Element;
		const table = tableRow.parent as Element;

		const currentRowIndex = table.getChildIndex( tableRow )!;
		const currentCellIndex = tableRow.getChildIndex( tableCell )!;

		const isFirstCellInRow = currentCellIndex === 0;

		if ( !isForward && isFirstCellInRow && currentRowIndex === 0 ) {
			// Set the selection over the whole table if the selection was in the first table cell.
			editor.model.change( writer => {
				writer.setSelection( writer.createRangeOn( table ) );
			} );

			return;
		}

		const isLastCellInRow = currentCellIndex === tableRow.childCount - 1;
		const isLastRow = currentRowIndex === tableUtils.getRows( table ) - 1;

		if ( isForward && isLastRow && isLastCellInRow ) {
			editor.execute( 'insertTableRowBelow' );

			// Check if the command actually added a row. If `insertTableRowBelow` execution didn't add a row (because it was disabled
			// or it got overwritten) set the selection over the whole table to mirror the first cell case.
			if ( currentRowIndex === tableUtils.getRows( table ) - 1 ) {
				editor.model.change( writer => {
					writer.setSelection( writer.createRangeOn( table ) );
				} );

				return;
			}
		}

		let cellToFocus: Element;

		// Move to the first cell in the next row.
		if ( isForward && isLastCellInRow ) {
			const nextRow = table.getChild( currentRowIndex + 1 ) as Element;

			cellToFocus = nextRow.getChild( 0 ) as Element;
		}
		// Move to the last cell in the previous row.
		else if ( !isForward && isFirstCellInRow ) {
			const previousRow = table.getChild( currentRowIndex - 1 ) as Element;

			cellToFocus = previousRow.getChild( previousRow.childCount - 1 ) as Element;
		}
		// Move to the next/previous cell.
		else {
			cellToFocus = tableRow.getChild( currentCellIndex + ( isForward ? 1 : -1 ) ) as Element;
		}

		editor.model.change( writer => {
			writer.setSelection( writer.createRangeIn( cellToFocus ) );
		} );
	}

	/**
	 * Handles {@link module:engine/view/document~Document#event:keydown keydown} events.
	 */
	private _onArrowKey( eventInfo: EventInfo, domEventData: DomEventData & KeystrokeInfo ) {
		const editor = this.editor;
		const keyCode = domEventData.keyCode;

		const direction = getLocalizedArrowKeyCodeDirection( keyCode, editor.locale.contentLanguageDirection )!;
		const wasHandled = this._handleArrowKeys( direction, domEventData.shiftKey );

		if ( wasHandled ) {
			domEventData.preventDefault();
			domEventData.stopPropagation();
			eventInfo.stop();
		}
	}

	/**
	 * Handles arrow keys to move the selection around the table.
	 *
	 * @param direction The direction of the arrow key.
	 * @param expandSelection If the current selection should be expanded.
	 * @returns Returns `true` if key was handled.
	 */
	private _handleArrowKeys( direction: ArrowKeyCodeDirection, expandSelection: boolean ) {
		const tableUtils = this.editor.plugins.get( TableUtils );
		const tableSelection: TableSelection = this.editor.plugins.get( 'TableSelection' );
		const model = this.editor.model;
		const selection = model.document.selection;
		const isForward = [ 'right', 'down' ].includes( direction );

		// In case one or more table cells are selected (from outside),
		// move the selection to a cell adjacent to the selected table fragment.
		const selectedCells = tableUtils.getSelectedTableCells( selection );

		if ( selectedCells.length ) {
			let focusCell;

			if ( expandSelection ) {
				focusCell = tableSelection.getFocusCell();
			} else {
				focusCell = isForward ? selectedCells[ selectedCells.length - 1 ] : selectedCells[ 0 ];
			}

			this._navigateFromCellInDirection( focusCell!, direction, expandSelection );

			return true;
		}

		// Abort if we're not in a table cell.
		const tableCell = selection.focus!.findAncestor( 'tableCell' );

		/* istanbul ignore if: paranoid check -- @preserve */
		if ( !tableCell ) {
			return false;
		}

		// When the selection is not collapsed.
		if ( !selection.isCollapsed ) {
			if ( expandSelection ) {
				// Navigation is in the opposite direction than the selection direction so this is shrinking of the selection.
				// Selection for sure will not approach cell edge.
				//
				// With a special case when all cell content is selected - then selection should expand to the other cell.
				// Note: When the entire cell gets selected using CTRL+A, the selection is always forward.
				if ( selection.isBackward == isForward && !selection.containsEntireContent( tableCell ) ) {
					return false;
				}
			} else {
				const selectedElement = selection.getSelectedElement();

				// It will collapse for non-object selected so it's not going to move to other cell.
				if ( !selectedElement || !model.schema.isObject( selectedElement ) ) {
					return false;
				}
			}
		}

		// Let's check if the selection is at the beginning/end of the cell.
		if ( this._isSelectionAtCellEdge( selection, tableCell, isForward ) ) {
			this._navigateFromCellInDirection( tableCell, direction, expandSelection );

			return true;
		}

		return false;
	}

	/**
	 * Returns `true` if the selection is at the boundary of a table cell according to the navigation direction.
	 *
	 * @param selection The current selection.
	 * @param tableCell The current table cell element.
	 * @param isForward The expected navigation direction.
	 */
	private _isSelectionAtCellEdge( selection: Selection | DocumentSelection, tableCell: Element, isForward: boolean ) {
		const model = this.editor.model;
		const schema = this.editor.model.schema;

		const focus = isForward ? selection.getLastPosition()! : selection.getFirstPosition()!;

		// If the current limit element is not table cell we are for sure not at the cell edge.
		// Also `modifySelection` will not let us out of it.
		if ( !schema.getLimitElement( focus ).is( 'element', 'tableCell' ) ) {
			const boundaryPosition = model.createPositionAt( tableCell, isForward ? 'end' : 0 );

			return boundaryPosition.isTouching( focus );
		}

		const probe = model.createSelection( focus );

		model.modifySelection( probe, { direction: isForward ? 'forward' : 'backward' } );

		// If there was no change in the focus position, then it's not possible to move the selection there.
		return focus.isEqual( probe.focus! );
	}

	/**
	 * Moves the selection from the given table cell in the specified direction.
	 *
	 * @param focusCell The table cell that is current multi-cell selection focus.
	 * @param direction Direction in which selection should move.
	 * @param expandSelection If the current selection should be expanded. Default value is false.
	 */
	protected _navigateFromCellInDirection( focusCell: Element, direction: ArrowKeyCodeDirection, expandSelection = false ): void {
		const model = this.editor.model;

		const table = focusCell.findAncestor( 'table' )!;
		const tableMap = [ ...new TableWalker( table, { includeAllSlots: true } ) ];
		const { row: lastRow, column: lastColumn } = tableMap[ tableMap.length - 1 ];

		const currentCellInfo = tableMap.find( ( { cell } ) => cell == focusCell )!;
		let { row, column } = currentCellInfo;

		switch ( direction ) {
			case 'left':
				column--;
				break;

			case 'up':
				row--;
				break;

			case 'right':
				column += currentCellInfo.cellWidth;
				break;

			case 'down':
				row += currentCellInfo.cellHeight;
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

		const cellToSelect = tableMap.find( cellInfo => cellInfo.row == row && cellInfo.column == column )!.cell;
		const isForward = [ 'right', 'down' ].includes( direction );
		const tableSelection: TableSelection = this.editor.plugins.get( 'TableSelection' );

		if ( expandSelection && tableSelection.isEnabled ) {
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
