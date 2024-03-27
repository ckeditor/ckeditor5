/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecolumnresize/tablecolumnresizeutils
 */

import { isEqual } from 'lodash-es';

import { Plugin, type Editor } from 'ckeditor5/src/core.js';

import type { DowncastWriter, Element, ViewElement, ViewNode } from 'ckeditor5/src/engine.js';
import TableUtils from '../tableutils.js';

import { COLUMN_MIN_WIDTH_IN_PIXELS } from './constants.js';
import {
	clamp, getColumnEdgesIndexes, getColumnGroupElement, getDomCellOuterWidth,
	getElementWidthInPixels,
	getTableColumnsWidths, getTableWidthInPixels, sumArray, toPrecision
} from './utils.js';

import TableWalker from '../tablewalker.js';

/**
 * The table column resize utils plugin.
 */
export default class TableColumnResizeUtils extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ TableUtils ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'TableColumnResizeUtils' as const;
	}

	/**
	 * Performs resize of specified by resizer column with specified width.
	 * It composes steps from {@link #prepareColumnResize}, {@link #assignColumnWidth} and {@link #endResize}.
	 *
	 * @param resizerElement Resize column handle view element.
	 * @param newColumnWidth New column width in pixels.
	 * @param compensateWidthWhenMoveCenteredTable
	 */
	public resizeColumnUsingResizer(
		resizerElement: ViewElement,
		newColumnWidth: number,
		compensateWidthWhenMoveCenteredTable?: boolean
	): void {
		const resizingData = this.prepareColumnResize( resizerElement );

		if ( resizingData ) {
			this.assignColumnWidth( resizingData, newColumnWidth, compensateWidthWhenMoveCenteredTable );
			this.endResize( resizingData );
		}
	}

	/**
	 * In this scenario:
	 *
	 *  +---+---+---+
	 *  | a         |
	 *  +---+---+---+
	 *  | b | c | d |
	 *  +---+---+---+
	 *  | e | f | g |
	 *  +---+---+---+
	 *
	 * When user selects column that contains `a`, `b`, `e` cells this function returns the first smallest
	 * column resize view element in that selection (`b` column). The resize view element is the blue draggable
	 * border element on the right side of selected column.
	 *
	 * @returns View element of column resizer DOM node.
	 */
	public getSmallestSelectedColumnResizer(): ViewElement | null {
		const sortedElements = getAllSelectedResizersDOMNodes( this.editor )
			.sort( ( a, b ) => Math.sign( a.getBoundingClientRect().left - b.getBoundingClientRect().left ) );

		if ( !sortedElements.length ) {
			return null;
		}

		const viewElement = this.editor.editing.view.domConverter.domToView( sortedElements[ 0 ] )!;

		return viewElement as ViewElement;
	}

	/**
	 * Starts resizing process.
	 *
	 *  * assigns resize attributes that will be used to resize table in next steps,
	 *  * calculates resizing data based on resizer element,
	 *  * applies the attributes to the `<table>` view element.
	 *
	 * @param resizerElement Resize column handle view element.
	 */
	public prepareColumnResize( resizerElement: ViewElement ): ResizingData | null {
		const { editing } = this.editor;

		const viewTable = resizerElement.findAncestor( 'table' )!;
		const editingView = editing.view;
		const columnWidthsInPx = calculateResizerColumnWidth( this.editor, resizerElement );

		if ( !columnWidthsInPx ) {
			return null;
		}

		// Insert colgroup for the table that is resized for the first time.
		if ( !Array.from( viewTable.getChildren() ).find( viewCol => viewCol.is( 'element', 'colgroup' ) ) ) {
			editingView.change( viewWriter => {
				insertColgroupElement( viewWriter, columnWidthsInPx, viewTable );
			} );
		}

		const resizingData = getResizingData( this.editor, resizerElement, columnWidthsInPx );

		// At this point we change only the editor view - we don't want other users to see our changes yet,
		// so we can't apply them in the model.
		this.editor.editing.view.change( writer => applyResizingAttributesToTable( writer, viewTable, resizingData ) );

		return resizingData;
	}

	/**
	 * This function returns the maximum and minimum dimensions to which a table column can be expanded.
	 * It also provides the current dimension of the column.
	 *
	 * @param resizingDataOrElement Resizing data or view element.
	 */
	public getPossibleResizeColumnRange( resizingDataOrElement: ResizingData | ViewElement ): PossibleResizeColumnRange | null {
		const resizingData = ( () => {
			if ( 'startDraggingPosition' in resizingDataOrElement ) {
				return resizingDataOrElement;
			}

			const columnWidthsInPx = calculateResizerColumnWidth( this.editor, resizingDataOrElement );

			if ( !columnWidthsInPx ) {
				return null;
			}

			return getResizingData( this.editor, resizingDataOrElement, columnWidthsInPx );
		} )();

		if ( !resizingData ) {
			return null;
		}

		const {
			flags: {
				isRightEdge
			},
			widths: {
				viewFigureParentWidth,
				tableWidth,
				leftColumnWidth,
				rightColumnWidth
			}
		} = resizingData;

		const dxUpperBound = isRightEdge ?
			viewFigureParentWidth - tableWidth :
			rightColumnWidth! - COLUMN_MIN_WIDTH_IN_PIXELS;

		return {
			current: leftColumnWidth,
			lower: COLUMN_MIN_WIDTH_IN_PIXELS,
			upper: leftColumnWidth + Math.max( 0, dxUpperBound )
		};
	}

	/**
	 * Update column width using provided resizing data.
	 *
	 * @param resizingData Resizing data.
	 * @param newColumnWidth New width of table column specified by resizingData.
	 * @param compensateWidthWhenMoveCenteredTable 	When the last column is resized in centered mode, the table shifts to the left
	 * 												based on the `newColumnWidth` value. However, when dragging to resize, the column width
	* 												must be multiplied because during the drag operation, the table’s left corner also moves
	* 												leftward by the same delta as the right corner. As a result, the resized table ends up
	* 												being twice as large as the provided value, but the right corner remains
	* 												under the mouse cursor.
	 */
	public assignColumnWidth(
		resizingData: ResizingData,
		newColumnWidth: number,
		compensateWidthWhenMoveCenteredTable?: boolean
	): void {
		const {
			flags: {
				isRightEdge,
				isLtrContent,
				isTableCentered
			},
			elements: {
				viewFigure,
				viewLeftColumn,
				viewRightColumn
			},
			widths: {
				viewFigureParentWidth,
				tableWidth,
				leftColumnWidth,
				rightColumnWidth
			}
		} = resizingData;

		// The multiplier is needed for calculating the proper movement offset:
		// - it should negate the sign if content language direction is right-to-left,
		// - it should double the offset if the table edge is resized and table is centered.
		const multiplier = compensateWidthWhenMoveCenteredTable ?
			( isLtrContent ? 1 : -1 ) * ( isRightEdge && isTableCentered ? 2 : 1 ) : 1;

		const possibleResizeRange = this.getPossibleResizeColumnRange( resizingData )!;

		const dx = clamp(
			( newColumnWidth - leftColumnWidth ) * multiplier,
			Math.min( 0, possibleResizeRange.lower - leftColumnWidth ),
			possibleResizeRange.upper - leftColumnWidth
		);

		if ( dx === 0 ) {
			return;
		}

		this.editor.editing.view.change( writer => {
			const leftColumnWidthAsPercentage = toPrecision( ( leftColumnWidth + dx ) * 100 / tableWidth );

			writer.setStyle( 'width', `${ leftColumnWidthAsPercentage }%`, viewLeftColumn! );

			if ( isRightEdge ) {
				const tableWidthAsPercentage = toPrecision( ( tableWidth + dx ) * 100 / viewFigureParentWidth );

				writer.setStyle( 'width', `${ tableWidthAsPercentage }%`, viewFigure );
			} else {
				const rightColumnWidthAsPercentage = toPrecision( ( rightColumnWidth! - dx ) * 100 / tableWidth );

				writer.setStyle( 'width', `${ rightColumnWidthAsPercentage }%`, viewRightColumn! );
			}
		} );
	}

	/**
	 * Stops table resizing process.
	 *
	 *  * If read only mode, it cancels the resizing process restoring the original widths.
	 *  * Otherwise it propagates the changes from view to the model by executing the adequate commands.
	 *
	 * @param resizingData Resizing data of table.
	 * @param readOnly Flag that indicates that table is read only.
	 */
	public endResize( resizingData: ResizingData, readOnly?: boolean ): void {
		const editor = this.editor;
		const editingView = editor.editing.view;

		const {
			viewResizer,
			modelTable,
			viewFigure,
			viewColgroup
		} = resizingData.elements;

		const tableColumnGroup = getColumnGroupElement( modelTable );
		const viewColumns: Array<ViewElement> = Array
			.from( viewColgroup!.getChildren() )
			.filter( ( column: ViewNode ): column is ViewElement => column.is( 'view:element' ) );

		const columnWidthsAttributeOld = tableColumnGroup ?
			getTableColumnsWidths( tableColumnGroup )! :
			null;

		const columnWidthsAttributeNew = viewColumns.map( column => column.getStyle( 'width' ) );

		const isColumnWidthsAttributeChanged = !isEqual( columnWidthsAttributeOld, columnWidthsAttributeNew );

		const tableWidthAttributeOld = modelTable.getAttribute( 'tableWidth' ) as string;
		const tableWidthAttributeNew = viewFigure.getStyle( 'width' )!;

		const isTableWidthAttributeChanged = tableWidthAttributeOld !== tableWidthAttributeNew;

		if ( isColumnWidthsAttributeChanged || isTableWidthAttributeChanged ) {
			if ( readOnly ) {
				// In read-only mode revert all changes in the editing view. The model is not touched so it does not need to be restored.
				// This case can occur if the read-only mode kicks in during the resizing process.
				editingView.change( writer => {
					// If table had resized columns before, restore the previous column widths.
					// Otherwise clean up the view from the temporary column resizing markup.
					if ( columnWidthsAttributeOld ) {
						for ( const viewCol of viewColumns ) {
							writer.setStyle( 'width', columnWidthsAttributeOld.shift()!, viewCol );
						}
					} else {
						writer.remove( viewColgroup! );
					}

					if ( isTableWidthAttributeChanged ) {
						// If the whole table was already resized before, restore the previous table width.
						// Otherwise clean up the view from the temporary table resizing markup.
						if ( tableWidthAttributeOld ) {
							writer.setStyle( 'width', tableWidthAttributeOld, viewFigure );
						} else {
							writer.removeStyle( 'width', viewFigure );
						}
					}

					// If a table and its columns weren't resized before,
					// prune the remaining common resizing markup.
					if ( !columnWidthsAttributeOld && !tableWidthAttributeOld ) {
						writer.removeClass(
							'ck-table-resized',
							[ ... viewFigure.getChildren() as IterableIterator<ViewElement> ].find( element => element.name === 'table' )!
						);
					}
				} );
			} else {
				editor.execute( 'resizeTableWidth', {
					table: modelTable,
					tableWidth: `${ toPrecision( tableWidthAttributeNew ) }%`,
					columnWidths: columnWidthsAttributeNew
				} );
			}
		}

		editingView.change( writer => {
			writer.removeClass( 'ck-table-column-resizer__active', viewResizer );
		} );
	}
}

/**
 * Function picks all column resizer DOM nodes from provided table selection.
 *
 * @param editor Editor instance.
 * @returns Array of HTML elements.
 */
function getAllSelectedResizersDOMNodes( editor: Editor ): Array<HTMLElement> {
	const { editing, plugins, model } = editor;
	const tableUtils = plugins.get( 'TableUtils' );
	const { domConverter } = editing.view;

	return tableUtils
		.getSelectionAffectedTableCells( model.document.selection )
		.map( model => editing.mapper.toViewElement( model ) )
		.map( view => view && domConverter.viewToDom( view ) )
		.flatMap( dom => dom ? Array.from( dom.querySelectorAll( '.ck-table-column-resizer' ) ) : [] );
}

/**
 * Calculates the DOM column's width based on provided resizer element.
 * Uses {@link #_calculateDomColumnWidths} under the hood.
 *
 * @param editor Editor instance.
 * @param resizerElement Resize column handle view element.
 * @returns Widths of columns or null (if table is readonly).
 */
function calculateResizerColumnWidth( editor: Editor, resizerElement: ViewElement ): Array<number> | null {
	const { editing, model } = editor;
	const modelTable = editing.mapper.toModelElement( resizerElement.findAncestor( 'figure' )! )!;

	// Do not resize if table model is in non-editable place.
	if ( !model.canEditAt( modelTable ) ) {
		return null;
	}

	const columnWidthsInPx = calculateDomColumnWidths( modelTable, editor );

	if ( !columnWidthsInPx ) {
		return null;
	}

	return columnWidthsInPx;
}

/**
 * Calculates the DOM columns' widths. It is done by taking the width of the widest cell
 * from each table column (we rely on the  {@link module:table/tablewalker~TableWalker}
 * to determine which column the cell belongs to).
 *
 * @param modelTable A table which columns should be measured.
 * @param editor The editor instance.
 * @returns Columns' widths expressed in pixels (without unit and if all cells are present in DOM).
 */
function calculateDomColumnWidths( modelTable: Element, editor: Editor ): Array<number> | null {
	const tableUtilsPlugin = editor.plugins.get( 'TableUtils' );
	const columnWidthsInPx = Array( tableUtilsPlugin.getColumns( modelTable ) );
	const tableWalker = new TableWalker( modelTable );

	for ( const cellSlot of tableWalker ) {
		const viewCell = editor.editing.mapper.toViewElement( cellSlot.cell )!;
		const domCell = editor.editing.view.domConverter.mapViewToDom( viewCell );

		if ( !domCell ) {
			return null;
		}

		const domCellWidth = getDomCellOuterWidth( domCell );

		if ( !columnWidthsInPx[ cellSlot.column ] || domCellWidth < columnWidthsInPx[ cellSlot.column ] ) {
			columnWidthsInPx[ cellSlot.column ] = toPrecision( domCellWidth );
		}
	}

	return columnWidthsInPx;
}

/**
 * Creates a `<colgroup>` element with `<col>`s and inserts it into a given view table.
 *
 * @internal
 * @param viewWriter A writer instance.
 * @param columnWidthsInPx Column widths.
 * @param viewTable A table view element.
 */
function insertColgroupElement(
	viewWriter: DowncastWriter,
	columnWidthsInPx: Array<number>,
	viewTable: ViewElement
): void {
	const colgroup = viewWriter.createContainerElement( 'colgroup' );

	for ( let i = 0; i < columnWidthsInPx.length; i++ ) {
		const viewColElement = viewWriter.createEmptyElement( 'col' );
		const columnWidthInPc = `${ toPrecision( columnWidthsInPx[ i ] / sumArray( columnWidthsInPx ) * 100 ) }%`;

		viewWriter.setStyle( 'width', columnWidthInPc, viewColElement );
		viewWriter.insert( viewWriter.createPositionAt( colgroup, 'end' ), viewColElement );
	}

	viewWriter.insert( viewWriter.createPositionAt( viewTable, 0 ), colgroup );
}

/**
 * Applies the style and classes to the view table as the resizing begun.
 *
 * @param viewWriter A writer instance.
 * @param viewTable A table containing the clicked resizer.
 * @param resizingData Data related to the resizing.
 */
function applyResizingAttributesToTable(
	viewWriter: DowncastWriter,
	viewTable: ViewElement,
	resizingData: ResizingData
): void {
	const figureInitialPcWidth = resizingData.widths.viewFigureWidth / resizingData.widths.viewFigureParentWidth;

	viewWriter.addClass( 'ck-table-resized', viewTable );
	viewWriter.addClass( 'ck-table-column-resizer__active', resizingData.elements.viewResizer );
	viewWriter.setStyle( 'width', `${ toPrecision( figureInitialPcWidth * 100 ) }%`, viewTable.findAncestor( 'figure' )! );
}

/**
 * Retrieves and returns required data needed for the resizing process.
 *
 * @param viewResizer Resize column handle element.
 * @param columnWidths The current widths of the columns.
 * @returns The data needed for the resizing process.
 */
function getResizingData( editor: Editor, viewResizer: ViewElement, columnWidths: Array<number> ): ResizingData {
	const { domConverter } = editor.editing.view;
	const resizerRect = domConverter.mapViewToDom( viewResizer )!.getBoundingClientRect();

	const tableUtilsPlugin = editor.plugins.get( 'TableUtils' );
	const startDraggingPosition = resizerRect.left + resizerRect.width / 2;

	const viewLeftCell = viewResizer.findAncestor( 'td' )! || viewResizer.findAncestor( 'th' )!;
	const modelLeftCell = editor.editing.mapper.toModelElement( viewLeftCell )!;
	const modelTable = modelLeftCell.findAncestor( 'table' )!;

	const leftColumnIndex = getColumnEdgesIndexes( modelLeftCell, tableUtilsPlugin ).rightEdge;
	const lastColumnIndex = tableUtilsPlugin.getColumns( modelTable ) - 1;

	const isRightEdge = leftColumnIndex === lastColumnIndex;
	const isTableCentered = !modelTable.hasAttribute( 'tableAlignment' );
	const isLtrContent = editor.locale.contentLanguageDirection !== 'rtl';

	const viewTable = viewLeftCell.findAncestor( 'table' )!;
	const viewFigure = viewTable.findAncestor( 'figure' ) as ViewElement;

	const viewFigureParentWidth = getElementWidthInPixels(
		domConverter.mapViewToDom( viewFigure.parent! ) as HTMLElement
	);
	const viewFigureWidth = getElementWidthInPixels( domConverter.mapViewToDom( viewFigure )! );
	const tableWidth = getTableWidthInPixels( modelTable, editor );
	const leftColumnWidth = columnWidths[ leftColumnIndex ];
	const rightColumnWidth = isRightEdge ? undefined : columnWidths[ leftColumnIndex + 1 ];

	const viewColgroup = [ ...viewTable.getChildren() as IterableIterator<ViewElement> ]
		.find( viewCol => viewCol.is( 'element', 'colgroup' ) )!;

	const viewLeftColumn = viewColgroup && viewColgroup.getChild( leftColumnIndex ) as ViewElement;
	const viewRightColumn = !viewColgroup || isRightEdge ? undefined : viewColgroup.getChild( leftColumnIndex + 1 ) as ViewElement;

	return {
		startDraggingPosition,
		startColumnWidths: columnWidths,
		flags: {
			isRightEdge,
			isTableCentered,
			isLtrContent
		},
		elements: {
			viewResizer,
			modelTable,
			viewFigure,
			viewColgroup,
			viewLeftColumn,
			viewRightColumn
		},
		widths: {
			viewFigureParentWidth,
			viewFigureWidth,
			tableWidth,
			leftColumnWidth,
			rightColumnWidth
		}
	};
}

/**
 * @internal
 */
export type PossibleResizeColumnRange = {
	upper: number;
	lower: number;
	current: number;
};

/**
 * @internal
 */
export type ResizingData = {
	startDraggingPosition: number;
	startColumnWidths: Array<number>;
	flags: {
		isRightEdge: boolean;
		isTableCentered: boolean;
		isLtrContent: boolean;
	};
	elements: {
		viewResizer: ViewElement;
		modelTable: Element;
		viewFigure: ViewElement;
		viewColgroup?: ViewElement;
		viewLeftColumn?: ViewElement;
		viewRightColumn?: ViewElement;
	};
	widths: {
		viewFigureParentWidth: number;
		viewFigureWidth: number;
		tableWidth: number;
		leftColumnWidth: number;
		rightColumnWidth?: number;
	};
};
