/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tablecolumnresize/tablecolumnresizeediting
 */

import { throttle, isEqual } from 'es-toolkit/compat';

import {
	global,
	DomEmitterMixin,
	Rect,
	toUnit,
	type EventInfo,
	type DomEmitter,
	type ObservableChangeEvent
} from '@ckeditor/ckeditor5-utils';

import { Plugin, type Editor, type PluginDependenciesOf } from '@ckeditor/ckeditor5-core';

import type {
	Batch,
	Differ,
	ViewDocumentDomEventData,
	DowncastInsertEvent,
	ViewDowncastWriter,
	ModelElement,
	ModelWriter,
	ViewElement,
	ViewNode
} from '@ckeditor/ckeditor5-engine';

import { MouseEventsObserver } from '../tablemouse/mouseeventsobserver.js';
import { TableEditing } from '../tableediting.js';
import { TableUtils } from '../tableutils.js';
import { TableWalker } from '../tablewalker.js';

import { TableWidthsCommand } from './tablewidthscommand.js';
import { TableColumnWidthCommand } from './commands/tablecolumnwidthcommand.js';

import { downcastTableResizedClass, upcastColgroupElement, upcastTableResizedClass } from './converters.js';

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
	getTableColumnsWidths,
	isTableWidthInPixels,
	isColumnWidthsInPixels,
	getEditableWidth
} from './utils.js';
import { getSelectionAffectedTable } from '../utils/common.js';

import {
	COLUMN_MIN_WIDTH_AS_PERCENTAGE,
	COLUMN_MIN_WIDTH_IN_PIXELS,
	COLUMN_RESIZE_DISTANCE_THRESHOLD,
	TABLE_WIDTH_GROWTH_RESISTANCE_IN_PIXELS,
	TABLE_WIDTH_SNAP_THRESHOLD_IN_PIXELS
} from './constants.js';

import type { TableColumnResize } from '../tablecolumnresize.js';

const toPx = /* #__PURE__ */ toUnit( 'px' );

type ResizingData = {
	columnPosition: number;
	flags: {
		isRightEdge: boolean;
		isTableCentered: boolean;
		isLtrContent: boolean;
		isPixelMode: boolean;
		isTableWidthWithinContainerAtDragStart: boolean;
		isTableScrollAllowed: boolean;
	};
	elements: {
		viewResizer: ViewElement;
		modelTable: ModelElement;
		viewFigure: ViewElement;
		viewTable: ViewElement;
		viewColgroup: ViewElement;
		viewLeftColumn: ViewElement;
		viewRightColumn?: ViewElement;
	};
	widths: {
		viewFigureWidth: number;
		viewFigureParentWidth: number;
		tableWidth: number;
		leftColumnWidth: number;
		rightColumnWidth?: number;
	};
};

/**
 * The table column resize editing plugin.
 */
export class TableColumnResizeEditing extends Plugin {
	/**
	 * A flag indicating if the column resizing is in progress.
	 *
	 * @observable
	 * @internal
	 */
	public declare _isResizingActive: boolean;

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
	 * Starting mouse position data used to add a threshold to the resizing process.
	 */
	private _initialMouseEventData: ViewDocumentDomEventData | null = null;

	/**
	 * @inheritDoc
	 */
	public static get requires(): PluginDependenciesOf<[ TableEditing, TableUtils ]> {
		return [ TableEditing, TableUtils ];
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'TableColumnResizeEditing' as const;
	}

	/**
	 * @inheritDoc
	 * @internal
	 */
	public static get licenseFeatureCode(): string {
		return 'TCR';
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
	public static override get isPremiumPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		this.set( '_isResizingActive', false );
		this.set( '_isResizingAllowed', true );
		this._resizingData = null;
		this._domEmitter = new ( DomEmitterMixin() )();
		this._tableUtilsPlugin = editor.plugins.get( 'TableUtils' );

		this.on<ObservableChangeEvent<boolean>>( 'change:_isResizingAllowed', ( evt, name, value ) => {
			// Toggling the `ck-column-resize_disabled` class shows and hides the resizers through CSS.
			const classAction = value ? 'removeClass' : 'addClass';

			editor.editing.view.change( writer => {
				for ( const root of editor.editing.view.document.roots ) {
					writer[ classAction ]( 'ck-column-resize_disabled', editor.editing.view.document.getRoot( root.rootName )! );
				}
			} );
		} );

		this.on<ObservableChangeEvent<boolean>>( 'change:_isResizingActive', ( evt, name, value ) => {
			const classAction = value ? 'add' : 'remove';

			global.document.body.classList[ classAction ]( 'ck-table-column-resize__resizing-cursor' );
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

		this.decorate( '_setResizingTableWidth' );
		this.decorate( '_getResizingTableWidth' );

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

		editor.commands.add( 'tableColumnWidth', new TableColumnWidthCommand( editor ) );

		// Currently the states of column resize and table resize (which is actually the last column resize) features
		// are bound together. They can be separated in the future by adding distinct listeners and applying
		// different CSS classes (e.g. `ck-column-resize_disabled` and `ck-table-resize_disabled`) to the editor root.
		// See https://github.com/ckeditor/ckeditor5/issues/12148 for the details.
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
	public afterInit(): void {
		const editor = this.editor;
		const tableWidthCommand = editor.commands.get( 'tableWidth' );

		// When the table width unit changes (e.g. '%' -> 'px'), convert the column widths to match, so the table
		// width stays the single source of truth. Only on this user command, never on content load.
		if ( tableWidthCommand ) {
			// The width change and the column-unit reconciliation must share one batch (a single undo step). The
			// command reads `options.batch`; if the caller passed none, create one before the command runs so both
			// use it. The table properties UI already passes its own batch, so this only covers direct executions.
			this.listenTo( tableWidthCommand, 'execute', ( evt, args ) => {
				const options = ( args[ 0 ] || ( args[ 0 ] = {} ) ) as { batch?: Batch };

				if ( !options.batch ) {
					options.batch = editor.model.createBatch();
				}
			}, { priority: 'high' } );

			this.listenTo( tableWidthCommand, 'execute', ( evt, args ) => {
				// The high-priority listener above guarantees `args[ 0 ]` (and its batch) exists.
				const options = args[ 0 ] as { batch?: Batch };

				// The command runs only when enabled, which means the selection is in a table.
				const table = getSelectionAffectedTable( editor.model.document.selection )!;

				editor.model.enqueueChange( options.batch, writer => this._reconcileColumnUnits( writer, table ) );
			}, { priority: 'low' } );
		}
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		this._domEmitter.stopListening();
		this._isResizingActive = false;

		super.destroy();
	}

	/**
	 * The table for which a column resize is currently in progress, or `null` if no resize is active.
	 * Only one table can be resized at a time.
	 */
	public get resizingTable(): ModelElement | null {
		return this._resizingData ? this._resizingData.elements.modelTable : null;
	}

	/**
	 * Returns a 'tableColumnGroup' element from the 'table'.
	 *
	 * @param element A 'table' or 'tableColumnGroup' element.
	 * @returns A 'tableColumnGroup' element.
	 */
	public getColumnGroupElement( element: ModelElement ): ModelElement | undefined {
		return getColumnGroupElement( element );
	}

	/**
	 * Returns an array of 'tableColumn' elements.
	 *
	 * @param element A 'table' or 'tableColumnGroup' element.
	 * @returns An array of 'tableColumn' elements.
	 */
	public getTableColumnElements( element: ModelElement ): Array<ModelElement> {
		return getTableColumnElements( element );
	}

	/**
	 * Returns an array of table column widths.
	 *
	 * @param element A 'table' or 'tableColumnGroup' element.
	 * @returns An array of table column widths.
	 */
	public getTableColumnsWidths( element: ModelElement ): Array<string> {
		return getTableColumnsWidths( element );
	}

	/**
	 * Returns the table and the sorted, unique indexes of the columns covered by the given cells (a `colspan` cell
	 * covers several columns). Returns `null` when the selection cannot be mapped onto columns - a non-resized table
	 * or an irregular column structure.
	 *
	 * @param cells An array of 'tableCell' model elements.
	 */
	public getColumnIndexesForCells( cells: Array<ModelElement> ): { table: ModelElement; columnIndexes: Array<number> } | null {
		const table = cells.length ? cells[ 0 ].findAncestor( 'table' ) : null;

		if ( !table ) {
			return null;
		}

		const columns = getTableColumnElements( table );

		// Bail on a non-resized table (no column group) or an irregular structure (merged columns or a column-count
		// mismatch), where a cell cannot be safely mapped onto a column.
		if (
			!columns.length ||
			columns.length !== this._tableUtilsPlugin.getColumns( table ) ||
			columns.some( column => column.hasAttribute( 'colSpan' ) )
		) {
			return null;
		}

		const columnIndexes = new Set<number>();

		for ( const cell of cells ) {
			const { leftEdge, rightEdge } = getColumnEdgesIndexes( cell, this._tableUtilsPlugin );

			for ( let index = leftEdge; index <= rightEdge; index++ ) {
				columnIndexes.add( index );
			}
		}

		return { table, columnIndexes: Array.from( columnIndexes ).sort( ( indexA, indexB ) => indexA - indexB ) };
	}

	/**
	 * Applies the given width to every column in `columnIndexes`, keeping the whole table's width mode consistent
	 * (see {@link module:table/tablecolumnresize/utils~isTableWidthInPixels}).
	 *
	 * @param writer A model writer instance.
	 * @param table A 'table' model element.
	 * @param columnIndexes Indexes of the columns the width is applied to.
	 * @param value The width to apply. May be expressed in pixels or as a percentage.
	 */
	public applyColumnWidths( writer: ModelWriter, table: ModelElement, columnIndexes: Array<number>, value: string ): void {
		if ( isTableWidthInPixels( table ) ) {
			applyPixelColumnWidths( writer, table, columnIndexes, value );
		} else {
			this._applyPercentageColumnWidths( writer, table, columnIndexes, value );
		}
	}

	/**
	 * Converts the column widths of a resized table to the unit of the table's own width (`px` or `%`), so a table
	 * width change (in the table properties) also switches the columns' unit. It is a no-op when the table is not
	 * resized or the columns already use that unit.
	 */
	private _reconcileColumnUnits( writer: ModelWriter, table: ModelElement ): void {
		const tableColumnGroup = getColumnGroupElement( table );

		if ( !tableColumnGroup ) {
			return;
		}

		const columnWidths = getTableColumnsWidths( tableColumnGroup );

		// A missing/non-pixel table width means the percentage mode (the default), so both branches read off it.
		const tableIsPixels = isTableWidthInPixels( table );

		// The columns already use the table's width unit - nothing to convert. The columns are concrete (the
		// post-fixer has normalized them) by the time a table width change reaches this point.
		if ( tableIsPixels === isColumnWidthsInPixels( columnWidths ) ) {
			return;
		}

		let reconciledWidths: Array<string>;

		if ( tableIsPixels ) {
			// '%' -> 'px': resolve each percentage against the table's pixel width.
			const tableWidthInPixels = parseFloat( table.getAttribute( 'tableWidth' ) as string );

			reconciledWidths = columnWidths.map( width => `${ toPrecision( parseFloat( width ) / 100 * tableWidthInPixels ) }px` );
		} else {
			// 'px' -> '%': express each column as a share of the columns' total width.
			const totalWidth = sumArray( columnWidths.map( width => parseFloat( width ) ) );

			reconciledWidths = columnWidths.map( width => `${ toPrecision( parseFloat( width ) / totalWidth * 100 ) }%` );
		}

		updateColumnElements( getTableColumnElements( tableColumnGroup ), tableColumnGroup, reconciledWidths, writer );
	}

	/**
	 * Applies a column width in the percentage mode: the target column gets the (clamped) percentage and the remaining
	 * columns are redistributed proportionally so that all the widths keep summing up to 100%.
	 */
	private _applyPercentageColumnWidths( writer: ModelWriter, table: ModelElement, columnIndexes: Array<number>, value: string ): void {
		const columns = getTableColumnElements( table );
		const widths = getTableColumnsWidths( table ).map( width => parseFloat( width ) );

		// Setting the last column has no next neighbor to balance against, so - like dragging the last column's right
		// edge - the table grows or shrinks while every other column keeps its width.
		if ( columnIndexes.includes( columns.length - 1 ) ) {
			this._growTableToColumnWidths( writer, table, columns, widths, columnIndexes, value );

			return;
		}

		// This path keeps the table width, so a pixel value resolves stably against the current width.
		const targetPercentage = value.trim().endsWith( '%' ) ?
			parseFloat( value ) :
			parseFloat( value ) / getTableWidthInPixels( table, this.editor ) * 100;

		// Otherwise every contiguous band of target columns is balanced against the column right after it, so the
		// table width stays the same (like dragging the border on the band's right edge). That column may not drop
		// below the minimum, which caps how wide the band columns can get.
		const nextWidths = widths.slice();

		for ( const band of getContiguousBands( columnIndexes ) ) {
			const neighbor = band.end + 1;
			const bandCount = band.indexes.length;
			const available = band.indexes.reduce( ( sum, index ) => sum + widths[ index ], widths[ neighbor ] );

			// The band and its neighbor share `available`; both must stay at or above the minimum. When there is
			// not enough room for that, split `available` evenly so no column ends up below the minimum (or negative).
			if ( available < COLUMN_MIN_WIDTH_AS_PERCENTAGE * ( bandCount + 1 ) ) {
				const equalWidth = available / ( bandCount + 1 );

				for ( const index of band.indexes ) {
					nextWidths[ index ] = equalWidth;
				}

				nextWidths[ neighbor ] = equalWidth;

				continue;
			}

			const target = clamp(
				targetPercentage,
				COLUMN_MIN_WIDTH_AS_PERCENTAGE,
				( available - COLUMN_MIN_WIDTH_AS_PERCENTAGE ) / bandCount
			);

			for ( const index of band.indexes ) {
				nextWidths[ index ] = target;
			}

			nextWidths[ neighbor ] = available - target * bandCount;
		}

		columns.forEach( ( columnElement, index ) => {
			writer.setAttribute( 'columnWidth', `${ toPrecision( nextWidths[ index ] ) }%`, columnElement );
		} );
	}

	/**
	 * Applies a width to the target columns in the percentage mode when the selection reaches the last column. As
	 * there is no next column to balance against, the table itself grows or shrinks (like dragging the last column's
	 * right edge): every other column keeps its absolute width, so expressed against the resized table their
	 * percentages scale, and the table's own width scales by the inverse.
	 */
	private _growTableToColumnWidths(
		writer: ModelWriter,
		table: ModelElement,
		columns: Array<ModelElement>,
		widths: Array<number>,
		columnIndexes: Array<number>,
		value: string
	): void {
		const targetColumns = new Set( columnIndexes );
		const targetCount = columnIndexes.length;
		const targetWidth = columnIndexes.reduce( ( sum, index ) => sum + widths[ index ], 0 );

		// Share currently taken by the other columns. If every column is selected there is nothing to grow the
		// table against, so the width is distributed equally instead.
		const otherColumnsShare = 100 - targetWidth;

		if ( otherColumnsShare <= 0 ) {
			const equalWidth = 100 / columns.length;

			columns.forEach( columnElement => {
				writer.setAttribute( 'columnWidth', `${ toPrecision( equalWidth ) }%`, columnElement );
			} );

			return;
		}

		let targetPercentage: number;

		if ( value.trim().endsWith( '%' ) ) {
			targetPercentage = parseFloat( value );
		} else {
			// Resolve px against the *resulting* table width (other columns keep their width), so re-applying is idempotent.
			const pixelWidth = parseFloat( value );
			const otherColumnsWidth = otherColumnsShare / 100 * getTableWidthInPixels( table, this.editor );

			targetPercentage = pixelWidth / ( otherColumnsWidth + targetCount * pixelWidth ) * 100;
		}

		const target = clamp(
			targetPercentage,
			COLUMN_MIN_WIDTH_AS_PERCENTAGE,
			Math.max(
				COLUMN_MIN_WIDTH_AS_PERCENTAGE,
				( 100 - COLUMN_MIN_WIDTH_AS_PERCENTAGE * ( columns.length - targetCount ) ) / targetCount
			)
		);

		const scale = ( 100 - target * targetCount ) / otherColumnsShare;

		columns.forEach( ( columnElement, index ) => {
			const next = targetColumns.has( index ) ? target : widths[ index ] * scale;

			writer.setAttribute( 'columnWidth', `${ toPrecision( next ) }%`, columnElement );
		} );

		const tableWidth = parseFloat( table.getAttribute( 'tableWidth' ) as string );

		if ( !Number.isNaN( tableWidth ) ) {
			writer.setAttribute( 'tableWidth', `${ toPrecision( tableWidth / scale ) }%`, table );
		}
	}

	/**
	 * Applies `width` to whichever element currently represents the table's actual width - by default the
	 * widget's `<figure>`. Passing `null` clears it instead of setting anything.
	 *
	 * @internal
	 */
	public _setResizingTableWidth( writer: ViewDowncastWriter, viewFigure: ViewElement, width: string | null ): void {
		if ( width === null ) {
			writer.removeStyle( 'width', viewFigure );
		} else {
			writer.setStyle( 'width', width, viewFigure );
		}
	}

	/**
	 * Returns the table's current actual width, read from whichever element holds it - by default the
	 * widget's `<figure>`.
	 *
	 * @internal
	 */
	public _getResizingTableWidth( viewFigure: ViewElement ): string {
		return viewFigure.getStyle( 'width' )!;
	}

	/**
	 * Registers new attributes for a table model element.
	 */
	private _extendSchema() {
		const schema = this.editor.model.schema;

		schema.extend( 'table', {
			allowAttributes: [ 'tableWidth' ]
		} );

		schema.register( 'tableColumnGroup', {
			allowIn: 'table',
			isLimit: true
		} );

		schema.register( 'tableColumn', {
			allowIn: 'tableColumnGroup',
			allowAttributes: [ 'columnWidth', 'colSpan' ],
			isLimit: true
		} );

		schema.setAttributeProperties( 'columnWidth', { isFormatting: true } );
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

				// The columns' own unit picks the path: a pixel group is resolved to concrete pixels, a percentage/auto
				// group is normalized to sum to 100%. So a pixel table with preserved percentage columns is left as-is.
				const isPixelMode = isColumnWidthsInPixels( columnWidths );

				let normalizedWidths = isPixelMode ?
					normalizePixelColumnWidths( columnWidths, table ) :
					normalizeColumnWidths( columnWidths );

				// If the number of columns has changed, then we need to adjust the widths of the affected columns.
				normalizedWidths = adjustColumnWidths( normalizedWidths, table, this );

				if ( isPixelMode && normalizedWidths.length !== columnWidths.length ) {
					// In the pixel mode, inserting a column grows the table to the columns' new total instead of
					// scaling the existing columns down to a fixed width - so the widths the user already set are
					// kept and the new column gets the minimum width.
					writer.setAttribute( 'tableWidth', `${ toPrecision( sumArray( normalizedWidths ) ) }px`, table );
				} else {
					// Otherwise (for example after a manual table width change) the columns scale proportionally so
					// that they keep summing up to the table width.
					normalizedWidths = scalePixelColumnsToTableWidth( normalizedWidths, table );
				}

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
		function adjustColumnWidths( columnWidths: Array<string>, table: ModelElement, plugin: TableColumnResizeEditing ): Array<string> {
			const newTableColumnsCount = plugin._tableUtilsPlugin.getColumns( table );
			const columnsCountDelta = newTableColumnsCount - columnWidths.length;

			if ( columnsCountDelta === 0 ) {
				return columnWidths;
			}

			// The columns' own unit (not the table's) decides the mode, so a pixel table with percentage columns
			// keeps them as percentages instead of relabelling e.g. '20%' as '20px'.
			const isPixelMode = isColumnWidthsInPixels( columnWidths );
			const widths: Array<number> = columnWidths.map( width => parseFloat( width ) );

			// Collect all cells that are affected by the change.
			const cellSet = getAffectedCells( plugin.editor.model.document.differ, table ) as Set<ModelElement>;

			for ( const cell of cellSet ) {
				const currentColumnsDelta = newTableColumnsCount - widths.length;

				if ( currentColumnsDelta === 0 ) {
					continue;
				}

				// If the column count in the table changed, adjust the widths of the affected columns.
				const hasMoreColumns = currentColumnsDelta > 0;
				const currentColumnIndex = plugin._tableUtilsPlugin.getCellLocation( cell ).column;

				if ( hasMoreColumns ) {
					// Inserted columns get the minimum width in the table's current unit.
					const insertedColumnWidth = isPixelMode ?
						COLUMN_MIN_WIDTH_IN_PIXELS :
						getColumnMinWidthAsPercentage( table, plugin.editor );
					const columnWidthsToInsert = createFilledArray( currentColumnsDelta, insertedColumnWidth );

					widths.splice( currentColumnIndex, 0, ...columnWidthsToInsert );
				} else {
					// Moves the widths of the removed columns to the preceding one.
					// Other editors either reduce the width of the whole table or adjust the widths
					// proportionally, so change of this behavior can be considered in the future.
					const removedColumnWidths = widths.splice( currentColumnIndex, Math.abs( currentColumnsDelta ) );

					widths[ currentColumnIndex ] += sumArray( removedColumnWidths );
				}
			}

			return widths.map( width => `${ width }${ isPixelMode ? 'px' : '%' }` );
		}

		/**
		 * Returns a set of cells that have been changed in a given table.
		 */
		function getAffectedCells( differ: Differ, table: ModelElement ): Set<ModelElement> {
			const cellSet = new Set<ModelElement>();

			for ( const change of differ.getChanges() ) {
				if (
					change.type == 'insert' &&
					change.position.nodeAfter &&
					( change.position.nodeAfter as ModelElement ).name == 'tableCell' &&
					change.position.nodeAfter.getAncestors().includes( table )
				) {
					cellSet.add( change.position.nodeAfter as ModelElement );
				} else if ( change.type == 'remove' ) {
					// If the first cell was removed, use the node after the change position instead.
					const referenceNode = ( change.position.nodeBefore || change.position.nodeAfter ) as ModelElement;

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
				name: /^(figure|table)$/,
				styles: {
					width: /[\s\S]+/
				}
			},
			model: {
				key: 'tableWidth',
				value: ( viewElement: ViewElement ) => {
					const parent = viewElement.parent!;

					if ( parent.is( 'element', 'figure' ) ) {
						return;
					}

					return viewElement.getStyle( 'width' );
				}
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

		conversion.for( 'upcast' ).add( upcastTableResizedClass() );
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

					// 'pt' is the default unit for table column width pasted from MS Office.
					// See https://github.com/ckeditor/ckeditor5/issues/14521#issuecomment-1662102889 for more details.
					// 'px' is accepted only when the whole table is sized in pixels - the table width is the single
					// source of truth for the width mode, so a stray pixel column in a non-pixel table is dropped
					// and falls back to an even share, just like any other unsupported unit.
					if (
						!viewColWidth ||
						( !viewColWidth.endsWith( '%' ) && !viewColWidth.endsWith( 'pt' ) &&
							!( viewColWidth.endsWith( 'px' ) && isViewTableWidthInPixels( viewElement ) ) )
					) {
						return 'auto';
					}

					return viewColWidth;
				}
			}
		} );

		// The `col[span]` attribute is present in tables pasted from MS Excel. We use it to set the temporary `colSpan` model attribute,
		// which is consumed during the `colgroup` element upcast.
		// See https://github.com/ckeditor/ckeditor5/issues/14521#issuecomment-1662102889 for more details.
		conversion.for( 'upcast' ).attributeToAttribute( {
			view: {
				name: 'col',
				key: 'span'
			},
			model: 'colSpan'
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
		editingView.document.on( 'mouseover', this._onMouseOverHandler.bind( this ), { priority: 'high' } );
		editingView.document.on( 'mousedown', this._onMouseDownHandler.bind( this ), { priority: 'high' } );
		editingView.document.on( 'mouseout', this._onMouseOutHandler.bind( this ), { priority: 'high' } );

		this._domEmitter.listenTo( global.window.document, 'mousemove', throttle( this._onMouseMoveHandler.bind( this ), 50 ) );
		this._domEmitter.listenTo( global.window.document, 'mouseup', this._onMouseUpHandler.bind( this ) );
	}

	/**
	 * Calculate and set `top` and `bottom` styles to the column resizer element to fit the height of the table.
	 *
	 * @param viewResizer The column resizer element.
	 */
	private _recalculateResizerElement( viewResizer: ViewElement ): void {
		const editor = this.editor;
		const domConverter = editor.editing.view.domConverter;

		// Get DOM target figure ancestor element.
		const domTable = domConverter.mapViewToDom( viewResizer.findAncestor( 'table' )! )!;

		// Get DOM table cell element.
		const domCell = domConverter.mapViewToDom(
			viewResizer.findAncestor( item => [ 'td', 'th' ].includes( item.name ) )!
		)!;

		const rectTable = new Rect( domTable );
		const rectCell = new Rect( domCell );

		// Calculate the top, and bottom positions of the column resizer element.
		const targetTopPosition = toPx( Number( ( rectTable.top - rectCell.top ).toFixed( 4 ) ) );
		const targetBottomPosition = toPx( Number( ( rectCell.bottom - rectTable.bottom ).toFixed( 4 ) ) );

		// Set `top` and `bottom` styles to the column resizer element.
		editor.editing.view.change( viewWriter => {
			viewWriter.setStyle( 'top', targetTopPosition, viewResizer );
			viewWriter.setStyle( 'bottom', targetBottomPosition, viewResizer );
		} );
	}

	/**
	 * Remove `top` and `bottom` styles of the column resizer element.
	 *
	 * @param viewResizer The column resizer element.
	 */
	private _resetResizerStyles( viewResizer: ViewElement ): void {
		this.editor.editing.view.change( viewWriter => {
			viewWriter.removeStyle( 'top', viewResizer );
			viewWriter.removeStyle( 'bottom', viewResizer );
		} );
	}

	/**
	 * Handles the `mouseover` event on column resizer element.
	 * Recalculates the `top` and `bottom` styles of the column resizer element to fit the height of the table.
	 *
	 * @param eventInfo An object containing information about the fired event.
	 * @param domEventData The data related to the DOM event.
	 */
	private _onMouseOverHandler( eventInfo: EventInfo, domEventData: ViewDocumentDomEventData ) {
		const target = domEventData.target;

		if ( !target.hasClass( 'ck-table-column-resizer' ) ) {
			return;
		}

		if ( !this._isResizingAllowed ) {
			return;
		}

		this._recalculateResizerElement( target );
	}

	/**
	 * Handles the `mouseout` event on column resizer element.
	 * When resizing is not active, it resets the `top` and `bottom` styles of the column resizer element.
	 *
	 * @param eventInfo An object containing information about the fired event.
	 * @param domEventData The data related to the DOM event.
	 */
	private _onMouseOutHandler( eventInfo: EventInfo, domEventData: ViewDocumentDomEventData ) {
		const target = domEventData.target;

		if ( !target.hasClass( 'ck-table-column-resizer' ) ) {
			return;
		}

		if ( !this._isResizingAllowed ) {
			return;
		}

		if ( this._isResizingActive ) {
			return;
		}

		this._resetResizerStyles( target );
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
	private _onMouseDownHandler( eventInfo: EventInfo, domEventData: ViewDocumentDomEventData ) {
		const target = domEventData.target;

		if ( !target.hasClass( 'ck-table-column-resizer' ) ) {
			return;
		}

		if ( !this._isResizingAllowed ) {
			return;
		}

		const editor = this.editor;
		const modelTable = editor.editing.mapper.toModelElement( target.findAncestor( 'figure' )! )!;

		// Do not resize if table model is in non-editable place.
		if ( !editor.model.canEditAt( modelTable ) ) {
			return;
		}

		domEventData.preventDefault();
		eventInfo.stop();

		this._initialMouseEventData = domEventData;
	}

	/**
	 * Starts the resizing process after the threshold is reached.
	 */
	private _startResizingAfterThreshold() {
		const domEventData = this._initialMouseEventData!;
		const { target } = domEventData;

		const modelTable = this.editor.editing.mapper.toModelElement( target.findAncestor( 'figure' )! )!;
		const viewTable = target.findAncestor( 'table' )!;
		const viewFigure = target.findAncestor( 'figure' ) as ViewElement;

		// The table width unit decides whether the resize works in pixels or percentages.
		const isPixelMode = isTableWidthInPixels( modelTable );

		// Calculate the initial column widths in pixels.
		const columnWidthsInPx = _calculateDomColumnWidths( modelTable, this._tableUtilsPlugin, this.editor );

		// Insert colgroup for the table that is resized for the first time.
		if ( !Array.from( viewTable.getChildren() ).find( viewCol => viewCol.is( 'element', 'colgroup' ) ) ) {
			this.editor.editing.view.change( viewWriter => {
				_insertColgroupElement( viewWriter, columnWidthsInPx, viewTable, isPixelMode );
			} );
		}

		this._isResizingActive = true;
		this._resizingData = this._getResizingData( domEventData, columnWidthsInPx );

		// At this point we change only the editor view - we don't want other users to see our changes yet,
		// so we can't apply them in the model.
		this.editor.editing.view.change( writer => {
			const initialWidth = _applyResizingAttributesToTable( writer, viewTable, this._resizingData! );

			this._setResizingTableWidth( writer, viewFigure, initialWidth );
		} );

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
		function _calculateDomColumnWidths( modelTable: ModelElement, tableUtilsPlugin: TableUtils, editor: Editor ) {
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
		function _insertColgroupElement(
			viewWriter: ViewDowncastWriter,
			columnWidthsInPx: Array<number>,
			viewTable: ViewElement,
			isPixelMode: boolean
		) {
			const colgroup = viewWriter.createContainerElement( 'colgroup' );

			for ( let i = 0; i < columnWidthsInPx.length; i++ ) {
				const viewColElement = viewWriter.createEmptyElement( 'col' );

				// In the pixel mode keep the measured absolute widths; otherwise express them as percentages.
				const columnWidth = isPixelMode ?
					`${ toPrecision( columnWidthsInPx[ i ] ) }px` :
					`${ toPrecision( columnWidthsInPx[ i ] / sumArray( columnWidthsInPx ) * 100 ) }%`;

				viewWriter.setStyle( 'width', columnWidth, viewColElement );
				viewWriter.insert( viewWriter.createPositionAt( colgroup, 'end' ), viewColElement );
			}

			viewWriter.insert( viewWriter.createPositionAt( viewTable, 0 ), colgroup );
		}

		/**
		 * Applies the classes to the view table as the resizing begun, and computes the initial live width.
		 *
		 * @param viewWriter A writer instance.
		 * @param viewTable A table containing the clicked resizer.
		 * @param resizingData Data related to the resizing.
		 * @returns The table's current width as a `%` string, e.g. for seeding {@link #_setResizingTableWidth}.
		 */
		function _applyResizingAttributesToTable(
			viewWriter: ViewDowncastWriter,
			viewTable: ViewElement,
			resizingData: ResizingData
		): string {
			viewWriter.addClass( 'ck-table-resized', viewTable );
			viewWriter.addClass( 'ck-table-column-resizer__active', resizingData.elements.viewResizer );

			// Seed from the exact model width, not a re-measurement: the rendered figure is ~1px wider than its
			// declared width, which would otherwise inflate the table on every inner-column drag.
			if ( resizingData.flags.isPixelMode ) {
				return `${ toPrecision( parseFloat( resizingData.elements.modelTable.getAttribute( 'tableWidth' ) as string ) ) }px`;
			}

			// A percentage width is a share of the parent; the figure may be capped under `TableScroll`, so use the larger.
			const figureWidth = Math.max( resizingData.widths.tableWidth, resizingData.widths.viewFigureWidth );

			return `${ toPrecision( figureWidth / resizingData.widths.viewFigureParentWidth * 100 ) }%`;
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
		if ( this._initialMouseEventData ) {
			const mouseEvent = this._initialMouseEventData.domEvent as MouseEvent;
			const distanceX = Math.abs( mouseEventData.clientX - mouseEvent.clientX );

			if ( distanceX >= COLUMN_RESIZE_DISTANCE_THRESHOLD ) {
				this._startResizingAfterThreshold();
				this._initialMouseEventData = null;
			} else {
				return;
			}
		}

		if ( !this._isResizingActive ) {
			return;
		}

		if ( !this._isResizingAllowed ) {
			this._onMouseUpHandler();

			return;
		}

		const { plugins } = this.editor;
		const {
			columnPosition,
			flags: {
				isRightEdge,
				isTableCentered,
				isLtrContent,
				isPixelMode,
				isTableWidthWithinContainerAtDragStart,
				isTableScrollAllowed
			},
			elements: {
				modelTable,
				viewFigure,
				viewLeftColumn,
				viewRightColumn,
				viewResizer
			},
			widths: {
				viewFigureParentWidth,
				tableWidth,
				leftColumnWidth,
				rightColumnWidth
			}
		} = this._resizingData!;

		const dxLowerBound = -leftColumnWidth + COLUMN_MIN_WIDTH_IN_PIXELS;
		const tableScrollPlugin = plugins.has( 'TableScrollEditing' ) ? plugins.get( 'TableScrollEditing' ) : null;
		const isTableScrollActive = !!tableScrollPlugin && isTableScrollAllowed;
		const containerWidth = getEditableWidth( this.editor, modelTable.root.rootName! )!;

		let dxUpperBound: number;

		if ( isRightEdge ) {
			dxUpperBound = isTableScrollActive ? Infinity : viewFigureParentWidth - tableWidth;
		} else {
			dxUpperBound = rightColumnWidth! - COLUMN_MIN_WIDTH_IN_PIXELS;
		}

		const rawDx = mouseEventData.clientX - columnPosition;
		const ltrSign = isLtrContent ? 1 : -1;
		const isCenteredRightEdge = isRightEdge && isTableCentered;

		let dx: number;

		// A centered table grows symmetrically (both margins shrink), so dragging by 1px widens it by 2px -
		// until it fills the container. Past that point it can't stay centered (margins can't go negative),
		// so it sits flush and grows 1:1 instead. In other words, width as a function of mouse movement is
		// a single line that changes slope (2 before the crossover, 1 after) exactly where the table's
		// width equals the container's width.
		if ( isTableScrollActive && isCenteredRightEdge ) {
			const mouseDelta = rawDx * ltrSign;

			let newTableWidth: number;

			if ( isTableWidthWithinContainerAtDragStart ) {
				// Starts within the container: doubled growth up to the crossover, then 1:1 past it.
				const crossoverPoint = ( containerWidth - tableWidth ) / 2;

				newTableWidth = mouseDelta <= crossoverPoint ?
					tableWidth + 2 * mouseDelta :
					containerWidth + ( mouseDelta - crossoverPoint );
			} else {
				// Starts already overflowing: 1:1 until shrunk back under the crossover, then doubled past it.
				const crossoverPoint = containerWidth - tableWidth;

				newTableWidth = mouseDelta >= crossoverPoint ?
					tableWidth + mouseDelta :
					containerWidth + 2 * ( mouseDelta - crossoverPoint );
			}

			dx = newTableWidth - tableWidth;
		} else {
			const multiplier = ltrSign * ( isCenteredRightEdge ? 2 : 1 );

			dx = rawDx * multiplier;
		}

		dx = clamp(
			dx,
			Math.min( dxLowerBound, 0 ),
			Math.max( dxUpperBound, 0 )
		);

		// Snap onto exactly 100% of the container width when close, and make it deliberately hard (but not
		// impossible) to drag the table's right edge past that point.
		if ( isTableScrollActive && isRightEdge ) {
			const resistedTableWidth = applyContainerWidthResistance( tableWidth + dx, containerWidth );

			dx = clamp(
				resistedTableWidth - tableWidth,
				Math.min( dxLowerBound, 0 ),
				Math.max( dxUpperBound, 0 )
			);
		}

		if ( dx === 0 ) {
			return;
		}

		this.editor.editing.view.change( writer => {
			// In the pixel mode widths stay absolute; in the percentage mode they are expressed relative to a basis
			// (the table width for columns, the figure parent width for the table itself).
			const toWidthValue = ( widthInPx: number, basisInPx: number ): string => isPixelMode ?
				`${ toPrecision( widthInPx ) }px` :
				`${ toPrecision( widthInPx * 100 / basisInPx ) }%`;

			writer.setStyle( 'width', toWidthValue( leftColumnWidth + dx, tableWidth ), viewLeftColumn );

			if ( isRightEdge ) {
				// A pixel-mode table keeps its absolute width; otherwise the width is a percentage of the parent.
				const tableFigureWidth = isPixelMode ?
					`${ toPrecision( tableWidth + dx ) }px` :
					`${ toPrecision( ( tableWidth + dx ) * 100 / viewFigureParentWidth ) }%`;

				this._setResizingTableWidth( writer, viewFigure, tableFigureWidth );
			} else {
				writer.setStyle( 'width', toWidthValue( rightColumnWidth! - dx, tableWidth ), viewRightColumn! );
			}
		} );

		this._recalculateResizerElement( viewResizer );
	}

	/**
	 * Handles the `mouseup` event.
	 *  * If resizing process is not in progress, it does nothing.
	 *  * If resizing is active but not allowed, it cancels the resizing process restoring the original widths.
	 *  * Otherwise it propagates the changes from view to the model by executing the adequate commands.
	 */
	private _onMouseUpHandler() {
		this._initialMouseEventData = null;

		if ( !this._isResizingActive ) {
			return;
		}

		const {
			viewResizer,
			modelTable,
			viewFigure,
			viewTable,
			viewColgroup
		} = this._resizingData!.elements;

		const { isPixelMode } = this._resizingData!.flags;

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
		const tableWidthAttributeNew = this._getResizingTableWidth( viewFigure );

		const isTableWidthAttributeChanged = tableWidthAttributeOld !== tableWidthAttributeNew;

		if ( isColumnWidthsAttributeChanged || isTableWidthAttributeChanged ) {
			if ( this._isResizingAllowed ) {
				const tableWidthInPixels = toPrecision( tableWidthAttributeNew );

				// In the pixel mode the drag rewrites only the adjacent columns to pixels; the rest may still be
				// percentages (a valid loaded state). Resolve them against the *pre-drag* table width (their
				// untouched absolute width) so the model stays all-pixel and the columns still sum to the table.
				const tableWidthInPixelsBeforeResize = toPrecision( tableWidthAttributeOld );

				const columnWidths = isPixelMode ?
					columnWidthsAttributeNew.map( width =>
						typeof width === 'string' && !width.endsWith( 'px' ) ?
							`${ toPrecision( parseFloat( width ) / 100 * tableWidthInPixelsBeforeResize ) }px` :
							width
					) :
					columnWidthsAttributeNew;

				editor.execute( 'resizeTableWidth', {
					table: modelTable,
					tableWidth: isPixelMode ?
						`${ toPrecision( tableWidthInPixels ) }px` :
						`${ toPrecision( tableWidthAttributeNew ) }%`,
					columnWidths
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
						this._setResizingTableWidth( writer, viewFigure, tableWidthAttributeOld || null );
					}

					// If a table and its columns weren't resized before,
					// prune the remaining common resizing markup.
					if ( !columnWidthsAttributeOld && !tableWidthAttributeOld ) {
						writer.removeClass( 'ck-table-resized', viewTable );
					}
				} );
			}
		}

		editingView.change( writer => {
			writer.removeClass( 'ck-table-column-resizer__active', viewResizer );
		} );

		const element = editingView.domConverter.mapViewToDom( viewResizer )!;

		if ( !element.matches( ':hover' ) ) {
			this._resetResizerStyles( viewResizer );
		}

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
	private _getResizingData( domEventData: ViewDocumentDomEventData, columnWidths: Array<number> ): ResizingData {
		const editor = this.editor;

		const columnPosition = ( domEventData.domEvent as Event & { clientX: number } ).clientX;

		const viewResizer = domEventData.target;
		const viewLeftCell = viewResizer.findAncestor( 'td' )! || viewResizer.findAncestor( 'th' )!;
		const modelLeftCell = editor.editing.mapper.toModelElement( viewLeftCell )!;
		const modelTable = modelLeftCell.findAncestor( 'table' )!;

		const leftColumnIndex = getColumnEdgesIndexes( modelLeftCell, this._tableUtilsPlugin ).rightEdge;
		const lastColumnIndex = this._tableUtilsPlugin.getColumns( modelTable ) - 1;

		let tableAlignment = modelTable.getAttribute( 'tableAlignment' ) as string | undefined;

		if ( modelTable.getAttribute( 'tableType' ) !== 'layout' ) {
			tableAlignment ||= editor.config.get( 'table.tableProperties.defaultProperties.alignment' );
			tableAlignment ||= 'center';
		}

		const isRightEdge = leftColumnIndex === lastColumnIndex;
		const isLtrContent = editor.locale.contentLanguageDirection !== 'rtl';
		const isTableCentered = tableAlignment === 'center';
		const isPixelMode = isTableWidthInPixels( modelTable );

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
		const isTableWidthWithinContainerAtDragStart = tableWidth <= getEditableWidth( editor, modelTable.root.rootName! )!;

		// Whether the `TableScrollEditing` plugin considers this specific table eligible to overflow its
		// container (see `TableScrollEditing#_isTableScrollable`). Computed once, at the start of the drag,
		// since a table's type or position in the document doesn't change mid-resize.
		const tableScrollPlugin = editor.plugins.has( 'TableScrollEditing' ) ? editor.plugins.get( 'TableScrollEditing' ) : null;
		const isTableScrollAllowed = !!tableScrollPlugin && tableScrollPlugin._isTableScrollable( modelTable );

		return {
			columnPosition,
			flags: {
				isRightEdge,
				isTableCentered,
				isLtrContent,
				isPixelMode,
				isTableWidthWithinContainerAtDragStart,
				isTableScrollAllowed
			},
			elements: {
				viewResizer,
				modelTable,
				viewFigure,
				viewTable,
				viewColgroup,
				viewLeftColumn,
				viewRightColumn
			},
			widths: {
				viewFigureWidth,
				viewFigureParentWidth,
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
			dispatcher.on<DowncastInsertEvent<ModelElement>>( 'insert:tableCell', ( evt, data, conversionApi ) => {
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

/**
 * Tells whether the table wrapping the given view `<col>` element is sized in pixels. The width is read from the
 * column's own table (or its wrapping `<figure>`), never from an ancestor further up, so a width-less table nested
 * inside a wider one is not mistaken for a pixel table.
 */
function isViewTableWidthInPixels( viewColElement: ViewElement ): boolean {
	const viewTable = viewColElement.findAncestor( element => element.is( 'element', 'table' ) )!;
	const viewParent = viewTable.parent!;
	const viewWidthHolder = viewParent.is( 'element', 'figure' ) ? viewParent : viewTable;
	const width = viewWidthHolder.getStyle( 'width' );

	return typeof width === 'string' && width.trim().endsWith( 'px' );
}

/**
 * In the pixel mode keeps the sum of the column widths equal to the table width. If they differ (for example after a
 * manual table width change), the columns are scaled proportionally so that they sum up to the table width. In the
 * percentage mode (or when the columns already sum to the table width) it is a no-op.
 */
function scalePixelColumnsToTableWidth( columnWidths: Array<string>, table: ModelElement ): Array<string> {
	if ( !isTableWidthInPixels( table ) || !isColumnWidthsInPixels( columnWidths ) ) {
		return columnWidths;
	}

	const tableWidthInPixels = parseFloat( table.getAttribute( 'tableWidth' ) as string );
	const totalWidth = sumArray( columnWidths );

	if ( !totalWidth || Math.abs( totalWidth - tableWidthInPixels ) < 0.5 ) {
		return columnWidths;
	}

	const factor = tableWidthInPixels / totalWidth;

	return columnWidths.map( width => `${ toPrecision( parseFloat( width ) * factor ) }px` );
}

/**
 * Normalizes a pixel-mode column group to concrete pixel widths. It mirrors {@link ~normalizeColumnWidths} (the
 * percentage path): percentages are resolved against the table width, and missing (`auto`/`undefined`) columns are
 * filled from the width left over in the table - so the column group never keeps `auto` widths or mixes units, and
 * downstream arithmetic never sees a non-pixel value.
 */
function normalizePixelColumnWidths( columnWidths: Array<string>, table: ModelElement ): Array<string> {
	const tableWidthInPixels = parseFloat( table.getAttribute( 'tableWidth' ) as string );

	// Resolve each column to a pixel value; a percentage is taken against the table width, while an
	// `auto`/`undefined` column is deferred (marked as `null`) until the remaining width is known.
	const pixelWidths = columnWidths.map( width => {
		if ( width === 'auto' || width === undefined ) {
			return null;
		}

		return width.endsWith( '%' ) ? parseFloat( width ) / 100 * tableWidthInPixels : parseFloat( width );
	} );

	const missingColumns = pixelWidths.filter( width => width === null ).length;

	if ( missingColumns ) {
		const knownWidth = pixelWidths.reduce( ( sum: number, width ) => width === null ? sum : sum + width, 0 );
		const widthForMissingColumn = Math.max(
			( tableWidthInPixels - knownWidth ) / missingColumns,
			COLUMN_MIN_WIDTH_IN_PIXELS
		);

		return pixelWidths.map( width => `${ toPrecision( width === null ? widthForMissingColumn : width ) }px` );
	}

	return pixelWidths.map( width => `${ toPrecision( width! ) }px` );
}

/**
 * Applies a column width in the pixel mode: the target column gets the absolute width and the table's own width
 * grows or shrinks to the sum of all column widths.
 */
function applyPixelColumnWidths( writer: ModelWriter, table: ModelElement, columnIndexes: Array<number>, value: string ): void {
	const columns = getTableColumnElements( table );
	const tableWidthInPixels = parseFloat( table.getAttribute( 'tableWidth' ) as string );

	// Express every column width in pixels. A column may still be a percentage (a pixel-width table can be
	// loaded/pasted with percentage columns, as widths are not converted on load), so a percentage is resolved
	// against the table width instead of being read as a raw pixel value.
	const toPixels = ( width: string ): number => width.trim().endsWith( '%' ) ?
		parseFloat( width ) / 100 * tableWidthInPixels :
		parseFloat( width );

	const targetPixels = Math.max( toPixels( value ), COLUMN_MIN_WIDTH_IN_PIXELS );
	const widths = getTableColumnsWidths( table ).map( toPixels );

	for ( const index of columnIndexes ) {
		widths[ index ] = targetPixels;
	}

	// Round each column once and derive the table width from those rounded values, so the table width always
	// equals the sum of the written column widths exactly (no sub-pixel drift from rounding each separately).
	const roundedWidths = widths.map( width => toPrecision( width ) );

	// Rewrite all the columns (not only the target ones) so the column group never mixes '%' and 'px', and grow
	// or shrink the table to the sum of the pixel widths.
	columns.forEach( ( columnElement, index ) => {
		writer.setAttribute( 'columnWidth', `${ roundedWidths[ index ] }px`, columnElement );
	} );

	writer.setAttribute( 'tableWidth', `${ toPrecision( sumArray( roundedWidths ) ) }px`, table );
}

/**
 * Splits a sorted list of column indexes into maximal contiguous bands, for example `[ 0, 1, 3 ]` into `[ 0, 1 ]`
 * and `[ 3 ]`.
 */
function getContiguousBands( columnIndexes: Array<number> ): Array<{ indexes: Array<number>; end: number }> {
	const bands: Array<{ indexes: Array<number>; end: number }> = [];

	for ( const index of columnIndexes ) {
		const lastBand = bands[ bands.length - 1 ];

		if ( lastBand && index === lastBand.end + 1 ) {
			lastBand.indexes.push( index );
			lastBand.end = index;
		} else {
			bands.push( { indexes: [ index ], end: index } );
		}
	}

	return bands;
}

/**
 * Given the table width a drag would naturally produce, returns the width that should actually be applied
 * once snapping and growth resistance around the container's width are taken into account:
 *
 *  * if the natural width lands close to the container's width (on either side), it's pulled to exactly
 *    match it,
 *  * if the natural width is past the container's width, it stays pinned at the container's width until the
 *    drag has gone far enough beyond it (the "resistance" zone) - past that point it keeps growing 1:1,
 *    continuing smoothly from where the resistance was overcome instead of jumping,
 *  * shrinking below the container's width is never resisted, only snapped when close.
 *
 * @internal
 */
export function applyContainerWidthResistance( naturalTableWidth: number, containerWidth: number ): number {
	const distance = naturalTableWidth - containerWidth;

	if ( distance < 0 ) {
		return -distance <= TABLE_WIDTH_SNAP_THRESHOLD_IN_PIXELS ? containerWidth : naturalTableWidth;
	}

	const resistanceZone = TABLE_WIDTH_SNAP_THRESHOLD_IN_PIXELS + TABLE_WIDTH_GROWTH_RESISTANCE_IN_PIXELS;

	return distance <= resistanceZone ? containerWidth : containerWidth + ( distance - resistanceZone );
}
