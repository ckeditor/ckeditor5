/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecolumnresize/tablecolumnresizeediting
 */

import { throttle, isEqual } from 'lodash-es';

import {
	global,
	DomEmitterMixin,
	type EventInfo,
	type DomEmitter,
	type ObservableChangeEvent
} from 'ckeditor5/src/utils';

import { Plugin, type Editor } from 'ckeditor5/src/core';

import type {
	Differ,
	DomEventData,
	DowncastInsertEvent,
	DowncastWriter,
	Element,
	ViewElement,
	ViewNode
} from 'ckeditor5/src/engine';

import MouseEventsObserver from '../../src/tablemouse/mouseeventsobserver';
import TableEditing from '../tableediting';
import TableUtils from '../tableutils';
import TableWalker from '../tablewalker';

import TableWidthsCommand from './tablewidthscommand';

import { downcastTableResizedClass, upcastColgroupElement } from './converters';

import {
	clamp,
	createFilledArray,
	sumArray,
	getColumnEdgesIndexes,
	getChangedResizedTables,
	getColumnMinWidthAsPercentage,
	getElementWidthInPixels,
	getTableWidthInPixels,
	normalizeColumnWidths,
	toPrecision,
	getDomCellOuterWidth,
	updateColumnElements,
	getColumnGroupElement,
	getTableColumnElements,
	getTableColumnsWidths
} from './utils';

import { COLUMN_MIN_WIDTH_IN_PIXELS } from './constants';
import type TableColumnResize from '../tablecolumnresize';

type ResizingData = {
	columnPosition: number;
	flags: {
		isRightEdge: boolean;
		isTableCentered: boolean;
		isLtrContent: boolean;
	};
	elements: {
		viewResizer: ViewElement;
		modelTable: Element;
		viewFigure: ViewElement;
		viewColgroup: ViewElement;
		viewLeftColumn: ViewElement;
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

/**
 * The table column resize editing plugin.
 */
export default class TableColumnResizeEditing extends Plugin {
	/**
	 * A flag indicating if the column resizing is in progress.
	 */
	private _isResizingActive: boolean;

	/**
	 * A flag indicating if the column resizing is allowed. It is not allowed if the editor is in read-only
	 * or comments-only mode or the `TableColumnResize` plugin is disabled.
	 *
	 * @observable
	 * @internal
	 */
	public declare _isResizingAllowed: boolean;

	/**
	 * A temporary storage for the required data needed to correctly calculate the widths of the resized columns. This storage is
	 * initialized when column resizing begins, and is purged upon completion.
	 */
	private _resizingData: ResizingData | null;

	/**
	 * DOM emitter.
	 */
	private _domEmitter: DomEmitter;

	/**
	 * A local reference to the {@link module:table/tableutils~TableUtils} plugin.
	 */
	private _tableUtilsPlugin: TableUtils;

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ TableEditing, TableUtils ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'TableColumnResizeEditing' {
		return 'TableColumnResizeEditing';
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		this._isResizingActive = false;
		this.set( '_isResizingAllowed', true );
		this._resizingData = null;
		this._domEmitter = new ( DomEmitterMixin() )();
		this._tableUtilsPlugin = editor.plugins.get( 'TableUtils' );

		this.on<ObservableChangeEvent<boolean>>( 'change:_isResizingAllowed', ( evt, name, value ) => {
			// Toggling the `ck-column-resize_disabled` class shows and hides the resizers through CSS.
			editor.editing.view.change( writer => {
				writer[ value ? 'removeClass' : 'addClass' ]( 'ck-column-resize_disabled', editor.editing.view.document.getRoot()! );
			} );
		} );
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		this._extendSchema();
		this._registerPostFixer();
		this._registerConverters();
		this._registerResizingListeners();
		this._registerResizerInserter();

		const editor = this.editor;
		const columnResizePlugin: TableColumnResize = editor.plugins.get( 'TableColumnResize' );
		const tableEditing: TableEditing = editor.plugins.get( 'TableEditing' );

		tableEditing.registerAdditionalSlot( {
			filter: element => element.is( 'element', 'tableColumnGroup' ),
			positionOffset: 0
		} );

		const tableWidthsCommand = new TableWidthsCommand( editor );

		// For backwards compatibility we have two commands that perform exactly the same operation.
		editor.commands.add( 'resizeTableWidth', tableWidthsCommand );
		editor.commands.add( 'resizeColumnWidths', tableWidthsCommand );

		// Currently the states of column resize and table resize (which is actually the last column resize) features
		// are bound together. They can be separated in the future by adding distinct listeners and applying
		// different CSS classes (e.g. `ck-column-resize_disabled` and `ck-table-resize_disabled`) to the editor root.
		// See #12148 for the details.
		this.bind( '_isResizingAllowed' ).to(
			editor, 'isReadOnly',
			columnResizePlugin, 'isEnabled',
			tableWidthsCommand, 'isEnabled',
			( isEditorReadOnly, isPluginEnabled, isTableWidthsCommandCommandEnabled ) =>
				!isEditorReadOnly && isPluginEnabled && isTableWidthsCommandCommandEnabled
		);
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		this._domEmitter.stopListening();
		super.destroy();
	}

	/**
	 * Returns a 'tableColumnGroup' element from the 'table'.
	 *
	 * @param element A 'table' or 'tableColumnGroup' element.
	 * @returns A 'tableColumnGroup' element.
	 */
	public getColumnGroupElement( element: Element ): Element | undefined {
		return getColumnGroupElement( element );
	}

	/**
	 * Returns an array of 'tableColumn' elements.
	 *
	 * @param element A 'table' or 'tableColumnGroup' element.
	 * @returns An array of 'tableColumn' elements.
	 */
	public getTableColumnElements( element: Element ): Array<Element> {
		return getTableColumnElements( element );
	}

	/**
	 * Returns an array of table column widths.
	 *
	 * @param element A 'table' or 'tableColumnGroup' element.
	 * @returns An array of table column widths.
	 */
	public getTableColumnsWidths( element: Element ): Array<string> {
		return getTableColumnsWidths( element );
	}

	/**
	 * Registers new attributes for a table model element.
	 */
	private _extendSchema() {
		this.editor.model.schema.extend( 'table', {
			allowAttributes: [ 'tableWidth' ]
		} );

		this.editor.model.schema.register( 'tableColumnGroup', {
			allowIn: 'table',
			isLimit: true
		} );

		this.editor.model.schema.register( 'tableColumn', {
			allowIn: 'tableColumnGroup',
			allowAttributes: [ 'columnWidth' ],
			isLimit: true
		} );
	}

	/**
	 * Registers table column resize post-fixer.
	 *
	 * It checks if the change from the differ concerns a table-related element or attribute. For detected changes it:
	 *  * Adjusts the `columnWidths` attribute to guarantee that the sum of the widths from all columns is 100%.
	 *  * Checks if the `columnWidths` attribute gets updated accordingly after columns have been added or removed.
	 */
	private _registerPostFixer() {
		const editor = this.editor;
		const model = editor.model;

		model.document.registerPostFixer( writer => {
			let changed = false;

			for ( const table of getChangedResizedTables( model ) ) {
				const tableColumnGroup = this.getColumnGroupElement( table )!;
				const columns = this.getTableColumnElements( tableColumnGroup );
				const columnWidths = this.getTableColumnsWidths( tableColumnGroup );

				// Adjust the `columnWidths` attribute to guarantee that the sum of the widths from all columns is 100%.
				let normalizedWidths = normalizeColumnWidths( columnWidths );

				// If the number of columns has changed, then we need to adjust the widths of the affected columns.
				normalizedWidths = adjustColumnWidths( normalizedWidths, table, this );

				if ( isEqual( columnWidths, normalizedWidths ) ) {
					continue;
				}

				updateColumnElements( columns, tableColumnGroup, normalizedWidths, writer );

				changed = true;
			}

			return changed;
		} );

		/**
		 * Adjusts if necessary the `columnWidths` in case if the number of column has changed.
		 *
		 * @param columnWidths Note: this array **may be modified** by the function.
		 * @param table Table to be checked.
		 */
		function adjustColumnWidths( columnWidths: Array<string>, table: Element, plugin: TableColumnResizeEditing ): Array<string> {
			const newTableColumnsCount = plugin._tableUtilsPlugin.getColumns( table );
			const columnsCountDelta = newTableColumnsCount - columnWidths.length;

			if ( columnsCountDelta === 0 ) {
				return columnWidths;
			}

			const widths: Array<number> = columnWidths.map( width => Number( width.replace( '%', '' ) ) );

			// Collect all cells that are affected by the change.
			const cellSet = getAffectedCells( plugin.editor.model.document.differ, table ) as Set<Element>;

			for ( const cell of cellSet ) {
				const currentColumnsDelta = newTableColumnsCount - widths.length;

				if ( currentColumnsDelta === 0 ) {
					continue;
				}

				// If the column count in the table changed, adjust the widths of the affected columns.
				const hasMoreColumns = currentColumnsDelta > 0;
				const currentColumnIndex = plugin._tableUtilsPlugin.getCellLocation( cell ).column;

				if ( hasMoreColumns ) {
					const columnMinWidthAsPercentage = getColumnMinWidthAsPercentage( table, plugin.editor );
					const columnWidthsToInsert = createFilledArray( currentColumnsDelta, columnMinWidthAsPercentage );

					widths.splice( currentColumnIndex, 0, ...columnWidthsToInsert );
				} else {
					// Moves the widths of the removed columns to the preceding one.
					// Other editors either reduce the width of the whole table or adjust the widths
					// proportionally, so change of this behavior can be considered in the future.
					const removedColumnWidths = widths.splice( currentColumnIndex, Math.abs( currentColumnsDelta ) );

					widths[ currentColumnIndex ] += sumArray( removedColumnWidths );
				}
			}

			return widths.map( width => width + '%' );
		}

		/**
		 * Returns a set of cells that have been changed in a given table.
		 */
		function getAffectedCells( differ: Differ, table: Element ): Set<Element> {
			const cellSet = new Set<Element>();

			for ( const change of differ.getChanges() ) {
				if (
					change.type == 'insert' &&
					change.position.nodeAfter &&
					( change.position.nodeAfter as Element ).name == 'tableCell' &&
					change.position.nodeAfter.getAncestors().includes( table )
				) {
					cellSet.add( change.position.nodeAfter as Element );
				} else if ( change.type == 'remove' ) {
					// If the first cell was removed, use the node after the change position instead.
					const referenceNode = ( change.position.nodeBefore || change.position.nodeAfter ) as Element;

					if ( referenceNode.name == 'tableCell' && referenceNode.getAncestors().includes( table ) ) {
						cellSet.add( referenceNode );
					}
				}
			}

			return cellSet;
		}
	}

	/**
	 * Registers table column resize converters.
	 */
	private _registerConverters() {
		const editor = this.editor;
		const conversion = editor.conversion;

		// Table width style
		conversion.for( 'upcast' ).attributeToAttribute( {
			view: {
				name: 'figure',
				key: 'style',
				value: {
					width: /[\s\S]+/
				}
			},
			model: {
				name: 'table',
				key: 'tableWidth',
				value: ( viewElement: ViewElement ) => viewElement.getStyle( 'width' )
			}
		} );

		conversion.for( 'downcast' ).attributeToAttribute( {
			model: {
				name: 'table',
				key: 'tableWidth'
			},
			view: ( width: string ) => ( {
				name: 'figure',
				key: 'style',
				value: {
					width
				}
			} )
		} );

		conversion.elementToElement( { model: 'tableColumnGroup', view: 'colgroup' } );
		conversion.elementToElement( { model: 'tableColumn', view: 'col' } );
		conversion.for( 'downcast' ).add( downcastTableResizedClass() );
		conversion.for( 'upcast' ).add( upcastColgroupElement( this._tableUtilsPlugin ) );

		conversion.for( 'upcast' ).attributeToAttribute( {
			view: {
				name: 'col',
				styles: {
					width: /.*/
				}
			},
			model: {
				key: 'columnWidth',
				value: ( viewElement: ViewElement ) => {
					const viewColWidth = viewElement.getStyle( 'width' );

					if ( !viewColWidth || !viewColWidth.endsWith( '%' ) ) {
						return 'auto';
					}

					return viewColWidth;
				}
			}
		} );
		conversion.for( 'downcast' ).attributeToAttribute( {
			model: {
				name: 'tableColumn',
				key: 'columnWidth'
			},
			view: width => ( { key: 'style', value: { width } } )
		} );
	}

	/**
	 * Registers listeners to handle resizing process.
	 */
	private _registerResizingListeners() {
		const editingView = this.editor.editing.view;

		editingView.addObserver( MouseEventsObserver );
		editingView.document.on( 'mousedown', this._onMouseDownHandler.bind( this ), { priority: 'high' } );

		this._domEmitter.listenTo( global.window.document, 'mousemove', throttle( this._onMouseMoveHandler.bind( this ), 50 ) );
		this._domEmitter.listenTo( global.window.document, 'mouseup', this._onMouseUpHandler.bind( this ) );
	}

	/**
	 * Handles the `mousedown` event on column resizer element:
	 *  * calculates the initial column pixel widths,
	 *  * inserts the `<colgroup>` element if it is not present in the `<table>`,
	 *  * puts the necessary data in the temporary storage,
	 *  * applies the attributes to the `<table>` view element.
	 *
	 * @param eventInfo An object containing information about the fired event.
	 * @param domEventData The data related to the DOM event.
	 */
	private _onMouseDownHandler( eventInfo: EventInfo, domEventData: DomEventData ) {
		const target = domEventData.target;

		if ( !target.hasClass( 'ck-table-column-resizer' ) ) {
			return;
		}

		if ( !this._isResizingAllowed ) {
			return;
		}

		domEventData.preventDefault();
		eventInfo.stop();

		const editor = this.editor;
		const modelTable = editor.editing.mapper.toModelElement( target.findAncestor( 'figure' )! )!;

		// The column widths are calculated upon mousedown to allow lazy applying the `columnWidths` attribute on the table.
		const columnWidthsInPx = _calculateDomColumnWidths( modelTable, this._tableUtilsPlugin, editor );
		const viewTable = target.findAncestor( 'table' )!;
		const editingView = editor.editing.view;

		// Insert colgroup for the table that is resized for the first time.
		if ( !Array.from( viewTable.getChildren() ).find( viewCol => viewCol.is( 'element', 'colgroup' ) ) ) {
			editingView.change( viewWriter => {
				_insertColgroupElement( viewWriter, columnWidthsInPx, viewTable );
			} );
		}

		this._isResizingActive = true;
		this._resizingData = this._getResizingData( domEventData, columnWidthsInPx );

		// At this point we change only the editor view - we don't want other users to see our changes yet,
		// so we can't apply them in the model.
		editingView.change( writer => _applyResizingAttributesToTable( writer, viewTable, this._resizingData! ) );

		/**
		 * Calculates the DOM columns' widths. It is done by taking the width of the widest cell
		 * from each table column (we rely on the  {@link module:table/tablewalker~TableWalker}
		 * to determine which column the cell belongs to).
		 *
		 * @param modelTable A table which columns should be measured.
		 * @param tableUtils The Table Utils plugin instance.
		 * @param editor The editor instance.
		 * @returns Columns' widths expressed in pixels (without unit).
		 */
		function _calculateDomColumnWidths( modelTable: Element, tableUtilsPlugin: TableUtils, editor: Editor ) {
			const columnWidthsInPx = Array( tableUtilsPlugin.getColumns( modelTable ) );
			const tableWalker = new TableWalker( modelTable );

			for ( const cellSlot of tableWalker ) {
				const viewCell = editor.editing.mapper.toViewElement( cellSlot.cell )!;
				const domCell = editor.editing.view.domConverter.mapViewToDom( viewCell )!;
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
		 * @param viewWriter A writer instance.
		 * @param columnWidthsInPx Column widths.
		 * @param viewTable A table view element.
		 */
		function _insertColgroupElement( viewWriter: DowncastWriter, columnWidthsInPx: Array<number>, viewTable: ViewElement ) {
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
		function _applyResizingAttributesToTable( viewWriter: DowncastWriter, viewTable: ViewElement, resizingData: ResizingData ) {
			const figureInitialPcWidth = resizingData.widths.viewFigureWidth / resizingData.widths.viewFigureParentWidth;

			viewWriter.addClass( 'ck-table-resized', viewTable );
			viewWriter.addClass( 'ck-table-column-resizer__active', resizingData.elements.viewResizer );
			viewWriter.setStyle( 'width', `${ toPrecision( figureInitialPcWidth * 100 ) }%`, viewTable.findAncestor( 'figure' )! );
		}
	}

	/**
	 * Handles the `mousemove` event.
	 *  * If resizing process is not in progress, it does nothing.
	 *  * If resizing is active but not allowed, it stops the resizing process instantly calling the `mousedown` event handler.
	 *  * Otherwise it dynamically updates the widths of the resized columns.
	 *
	 * @param eventInfo An object containing information about the fired event.
	 * @param mouseEventData The native DOM event.
	 */
	private _onMouseMoveHandler( eventInfo: EventInfo, mouseEventData: MouseEvent ) {
		if ( !this._isResizingActive ) {
			return;
		}

		if ( !this._isResizingAllowed ) {
			this._onMouseUpHandler();

			return;
		}

		const {
			columnPosition,
			flags: {
				isRightEdge,
				isTableCentered,
				isLtrContent
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
		} = this._resizingData!;

		const dxLowerBound = -leftColumnWidth + COLUMN_MIN_WIDTH_IN_PIXELS;

		const dxUpperBound = isRightEdge ?
			viewFigureParentWidth - tableWidth :
			rightColumnWidth! - COLUMN_MIN_WIDTH_IN_PIXELS;

		// The multiplier is needed for calculating the proper movement offset:
		// - it should negate the sign if content language direction is right-to-left,
		// - it should double the offset if the table edge is resized and table is centered.
		const multiplier = ( isLtrContent ? 1 : -1 ) * ( isRightEdge && isTableCentered ? 2 : 1 );

		const dx = clamp(
			( mouseEventData.clientX - columnPosition ) * multiplier,
			Math.min( dxLowerBound, 0 ),
			Math.max( dxUpperBound, 0 )
		);

		if ( dx === 0 ) {
			return;
		}

		this.editor.editing.view.change( writer => {
			const leftColumnWidthAsPercentage = toPrecision( ( leftColumnWidth + dx ) * 100 / tableWidth );

			writer.setStyle( 'width', `${ leftColumnWidthAsPercentage }%`, viewLeftColumn );

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
	 * Handles the `mouseup` event.
	 *  * If resizing process is not in progress, it does nothing.
	 *  * If resizing is active but not allowed, it cancels the resizing process restoring the original widths.
	 *  * Otherwise it propagates the changes from view to the model by executing the adequate commands.
	 */
	private _onMouseUpHandler() {
		if ( !this._isResizingActive ) {
			return;
		}

		const {
			viewResizer,
			modelTable,
			viewFigure,
			viewColgroup
		} = this._resizingData!.elements;

		const editor = this.editor;
		const editingView = editor.editing.view;

		const tableColumnGroup = this.getColumnGroupElement( modelTable );
		const viewColumns: Array<ViewElement> = Array
			.from( viewColgroup.getChildren() )
			.filter( ( column: ViewNode ): column is ViewElement => column.is( 'view:element' ) );

		const columnWidthsAttributeOld = tableColumnGroup ?
			this.getTableColumnsWidths( tableColumnGroup )! :
			null;

		const columnWidthsAttributeNew = viewColumns.map( column => column.getStyle( 'width' ) );

		const isColumnWidthsAttributeChanged = !isEqual( columnWidthsAttributeOld, columnWidthsAttributeNew );

		const tableWidthAttributeOld = modelTable.getAttribute( 'tableWidth' ) as string;
		const tableWidthAttributeNew = viewFigure.getStyle( 'width' )!;

		const isTableWidthAttributeChanged = tableWidthAttributeOld !== tableWidthAttributeNew;

		if ( isColumnWidthsAttributeChanged || isTableWidthAttributeChanged ) {
			if ( this._isResizingAllowed ) {
				editor.execute( 'resizeTableWidth', {
					table: modelTable,
					tableWidth: `${ toPrecision( tableWidthAttributeNew ) }%`,
					columnWidths: columnWidthsAttributeNew
				} );
			} else {
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
						writer.remove( viewColgroup );
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
			}
		}

		editingView.change( writer => {
			writer.removeClass( 'ck-table-column-resizer__active', viewResizer );
		} );

		this._isResizingActive = false;
		this._resizingData = null;
	}

	/**
	 * Retrieves and returns required data needed for the resizing process.
	 *
	 * @param domEventData The data of the `mousedown` event.
	 * @param columnWidths The current widths of the columns.
	 * @returns The data needed for the resizing process.
	 */
	private _getResizingData( domEventData: DomEventData, columnWidths: Array<number> ): ResizingData {
		const editor = this.editor;

		const columnPosition = ( domEventData.domEvent as Event & { clientX: number } ).clientX;

		const viewResizer = domEventData.target;
		const viewLeftCell = viewResizer.findAncestor( 'td' )! || viewResizer.findAncestor( 'th' )!;
		const modelLeftCell = editor.editing.mapper.toModelElement( viewLeftCell )!;
		const modelTable = modelLeftCell.findAncestor( 'table' )!;

		const leftColumnIndex = getColumnEdgesIndexes( modelLeftCell, this._tableUtilsPlugin ).rightEdge;
		const lastColumnIndex = this._tableUtilsPlugin.getColumns( modelTable ) - 1;

		const isRightEdge = leftColumnIndex === lastColumnIndex;
		const isTableCentered = !modelTable.hasAttribute( 'tableAlignment' );
		const isLtrContent = editor.locale.contentLanguageDirection !== 'rtl';

		const viewTable = viewLeftCell.findAncestor( 'table' )!;
		const viewFigure = viewTable.findAncestor( 'figure' ) as ViewElement;
		const viewColgroup = [ ...viewTable.getChildren() as IterableIterator<ViewElement> ]
			.find( viewCol => viewCol.is( 'element', 'colgroup' ) )!;
		const viewLeftColumn = viewColgroup.getChild( leftColumnIndex ) as ViewElement;
		const viewRightColumn = isRightEdge ? undefined : viewColgroup.getChild( leftColumnIndex + 1 ) as ViewElement;

		const viewFigureParentWidth = getElementWidthInPixels(
			editor.editing.view.domConverter.mapViewToDom( viewFigure.parent! ) as HTMLElement
		);
		const viewFigureWidth = getElementWidthInPixels( editor.editing.view.domConverter.mapViewToDom( viewFigure )! );
		const tableWidth = getTableWidthInPixels( modelTable, editor );
		const leftColumnWidth = columnWidths[ leftColumnIndex ];
		const rightColumnWidth = isRightEdge ? undefined : columnWidths[ leftColumnIndex + 1 ];

		return {
			columnPosition,
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
	 * Registers a listener ensuring that each resizable cell have a resizer handle.
	 */
	private _registerResizerInserter() {
		this.editor.conversion.for( 'editingDowncast' ).add( dispatcher => {
			dispatcher.on<DowncastInsertEvent<Element>>( 'insert:tableCell', ( evt, data, conversionApi ) => {
				const modelElement = data.item;
				const viewElement = conversionApi.mapper.toViewElement( modelElement );
				const viewWriter = conversionApi.writer;

				viewWriter.insert(
					viewWriter.createPositionAt( viewElement!, 'end' ),
					viewWriter.createUIElement( 'div', { class: 'ck-table-column-resizer' } )
				);
			}, { priority: 'lowest' } );
		} );
	}
}
