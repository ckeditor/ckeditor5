/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tablerowresize/tablerowresizeediting
 */

import { throttle } from 'es-toolkit/compat';

import {
	global,
	DomEmitterMixin,
	Rect,
	toUnit,
	type DomEmitter,
	type EventInfo,
	type ObservableChangeEvent
} from '@ckeditor/ckeditor5-utils';
import { Plugin, type Editor, type PluginDependenciesOf } from '@ckeditor/ckeditor5-core';
import type {
	ModelElement,
	ModelWriter,
	UpcastConversionApi,
	ViewDocumentDomEventData,
	ViewElement
} from '@ckeditor/ckeditor5-engine';

import { TableEditing } from '../tableediting.js';
import { TableUtils } from '../tableutils.js';
import { TableWalker } from '../tablewalker.js';
import { downcastAttributeToStyle } from '../converters/tableproperties.js';
import {
	RESIZE_DISTANCE_THRESHOLD,
	fitResizerToTable,
	registerResizerInserter,
	resetResizerStyles,
	toPrecision,
	toggleResizingCursor,
	toggleResizingDisabledClass
} from '../utils/resize.js';
import { TableRowHeightCommand } from './commands/tablerowheightcommand.js';
import { TableRowHeightsCommand } from './commands/tablerowheightscommand.js';
import { getUnsetHeightValue, getRowEdgesIndexes, getTableRows } from './utils.js';

const toPx = /* #__PURE__ */ toUnit( 'px' );

type ResizingData = {
	startY: number;
	initialHeight: number;
	minHeight: number;
	elements: {
		viewResizer: ViewElement;
		modelRow: ModelElement;
		viewRow: ViewElement;
		viewFigure: ViewElement;
	};
	initialStyles: {
		rowHeight: string | undefined;
		cellHeights: Array<{ viewCell: ViewElement; height: string | undefined }>;
		tableHeight: string | undefined;
	};

	/**
	 * The rendered heights of the rows that replace the table height. Empty for a table without a height.
	 */
	rowHeightsReplacingTableHeight: Array<{
		modelRow: ModelElement;
		viewRow: ViewElement;
		renderedHeight: string;
		initialViewHeight: string | undefined;
	}>;
};

/**
 * The table row resize editing plugin.
 */
export class TableRowResizeEditing extends Plugin {
	/**
	 * A flag indicating if the row resizing is allowed. It is not allowed if the editor is in read-only
	 * or comments-only mode or the `TableRowResize` plugin is disabled.
	 *
	 * @observable
	 * @internal
	 */
	public declare _isResizingAllowed: boolean;

	/**
	 * A flag indicating if the row resizing is in progress.
	 *
	 * @observable
	 * @internal
	 */
	public declare _isResizingActive: boolean;

	/**
	 * A temporary storage for the data needed during the row resizing. It is set when the resizing begins and purged
	 * upon completion.
	 */
	private _resizingData: ResizingData | null = null;

	/**
	 * The `mousedown` event data, kept until the mouse moves past the threshold that starts the resizing.
	 */
	private _initialMouseEventData: ViewDocumentDomEventData | null = null;

	/**
	 * DOM emitter.
	 */
	private _domEmitter: DomEmitter;

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
		return 'TableRowResizeEditing' as const;
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

		this.set( '_isResizingAllowed', true );
		this.set( '_isResizingActive', false );
		this._domEmitter = new ( DomEmitterMixin() )();

		this.on<ObservableChangeEvent<boolean>>( 'change:_isResizingAllowed', ( evt, name, value ) => {
			toggleResizingDisabledClass( editor.editing.view, 'ck-row-resize_disabled', value );
		} );

		this.on<ObservableChangeEvent<boolean>>( 'change:_isResizingActive', ( evt, name, value ) => {
			toggleResizingCursor( 'ck-table-row-resize__resizing-cursor', 'row-resize', value );
		} );
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;

		this._extendSchema();
		this._registerConverters();
		this._registerResizingListeners();
		registerResizerInserter( this.editor, 'ck-table-row-resizer' );

		const tableRowHeightsCommand = new TableRowHeightsCommand( editor );
		const tableRowHeightCommand = new TableRowHeightCommand( editor );

		editor.commands.add( 'resizeRowHeights', tableRowHeightsCommand );
		editor.commands.add( 'tableRowHeight', tableRowHeightCommand );

		// The editing plugin can be loaded without the `TableRowResize` glue plugin, so fall back to its own state.
		const rowResizePlugin: Plugin = editor.plugins.has( 'TableRowResize' ) ? editor.plugins.get( 'TableRowResize' ) : this;

		this.bind( '_isResizingAllowed' ).to(
			editor, 'isReadOnly',
			rowResizePlugin, 'isEnabled',
			tableRowHeightsCommand, 'isEnabled',
			( isEditorReadOnly, isPluginEnabled, isCommandEnabled ) => !isEditorReadOnly && isPluginEnabled && isCommandEnabled
		);
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
	 * Registers new attributes for a table row model element.
	 */
	private _extendSchema() {
		const schema = this.editor.model.schema;

		schema.extend( 'tableRow', {
			allowAttributes: [ 'rowHeight' ]
		} );

		schema.setAttributeProperties( 'rowHeight', { isFormatting: true } );
	}

	/**
	 * Registers table row resize converters.
	 */
	private _registerConverters() {
		const conversion = this.editor.conversion;

		conversion.for( 'upcast' ).attributeToAttribute( {
			view: {
				name: 'tr',
				styles: {
					height: /[\s\S]+/
				}
			},
			model: {
				key: 'rowHeight',
				value: ( viewElement: ViewElement, conversionApi: UpcastConversionApi ) => {
					const height = normalizeRowHeight( viewElement.getStyle( 'height' )! );

					// Any other value is consumed too (as the column widths are), so it is not left to General HTML Support:
					// the row resize changes the row height in the model, and a height kept elsewhere would not follow it.
					if ( !height ) {
						conversionApi.consumable.consume( viewElement, { styles: 'height' } );
					}

					return height;
				}
			}
		} );

		// The `height` attribute (set for example by Microsoft Excel) is consumed too, for the same reason. The `height` style
		// takes precedence over it, as it does for the cell heights.
		conversion.for( 'upcast' ).attributeToAttribute( {
			view: {
				name: 'tr',
				attributes: {
					height: /[\s\S]+/
				}
			},
			model: {
				key: 'rowHeight',
				value: ( viewElement: ViewElement, conversionApi: UpcastConversionApi ) => {
					const height = viewElement.hasStyle( 'height' ) ?
						undefined :
						normalizeRowHeight( `${ viewElement.getAttribute( 'height' )!.trim() }px` );

					if ( !height ) {
						conversionApi.consumable.consume( viewElement, { attributes: 'height' } );
					}

					return height;
				}
			}
		} );

		downcastAttributeToStyle( conversion, { modelElement: 'tableRow', modelAttribute: 'rowHeight', styleName: 'height' } );
	}

	/**
	 * Registers listeners to handle the resizing process.
	 */
	private _registerResizingListeners() {
		const viewDocument = this.editor.editing.view.document;

		viewDocument.on( 'mouseover', this._onMouseOverHandler.bind( this ), { priority: 'high' } );
		viewDocument.on( 'mousedown', this._onMouseDownHandler.bind( this ), { priority: 'high' } );
		viewDocument.on( 'mouseout', this._onMouseOutHandler.bind( this ), { priority: 'high' } );

		this._domEmitter.listenTo( global.window.document, 'mousemove', throttle( this._onMouseMoveHandler.bind( this ), 50 ) );
		this._domEmitter.listenTo( global.window.document, 'mouseup', this._onMouseUpHandler.bind( this ) );
	}

	/**
	 * Handles the `mouseover` event on the row resizer element: stretches it over the whole table width.
	 */
	private _onMouseOverHandler( eventInfo: EventInfo, domEventData: ViewDocumentDomEventData ) {
		const target = domEventData.target;

		if ( !target.hasClass( 'ck-table-row-resizer' ) || !this._isResizingAllowed ) {
			return;
		}

		fitResizerToTable( this.editor.editing.view, target, 'row' );
	}

	/**
	 * Handles the `mouseout` event on the row resizer element: restores its default size.
	 */
	private _onMouseOutHandler( eventInfo: EventInfo, domEventData: ViewDocumentDomEventData ) {
		const target = domEventData.target;

		if ( !target.hasClass( 'ck-table-row-resizer' ) || !this._isResizingAllowed || this._isResizingActive ) {
			return;
		}

		resetResizerStyles( this.editor.editing.view, target, 'row' );
	}

	/**
	 * Handles the `mousedown` event on the row resizer element. The resizing itself starts once the mouse moves past
	 * a threshold, so a plain click does not change anything.
	 */
	private _onMouseDownHandler( eventInfo: EventInfo, domEventData: ViewDocumentDomEventData ) {
		const target = domEventData.target;

		if ( !target.hasClass( 'ck-table-row-resizer' ) || !this._isResizingAllowed ) {
			return;
		}

		const modelTable = this.editor.editing.mapper.toModelElement( target.findAncestor( 'figure' )! )!;

		// Do not resize if the table is in a non-editable place.
		if ( !this.editor.model.canEditAt( modelTable ) ) {
			return;
		}

		domEventData.preventDefault();
		eventInfo.stop();

		this._initialMouseEventData = domEventData;
	}

	/**
	 * Starts the resizing process after the threshold is reached: measures the row and its minimum height, and prepares
	 * the editing view for the live preview.
	 */
	private _startResizingAfterThreshold() {
		const editor = this.editor;
		const view = editor.editing.view;
		const tableUtils: TableUtils = editor.plugins.get( 'TableUtils' );
		const domEventData = this._initialMouseEventData!;
		const viewResizer = domEventData.target;

		const viewCell = viewResizer.findAncestor( element => element.is( 'element', 'td' ) || element.is( 'element', 'th' ) )!;
		const modelCell = editor.editing.mapper.toModelElement( viewCell )!;
		const modelTable = modelCell.findAncestor( 'table' )!;

		// The resizer is at the bottom edge of the cell, which for a cell spanning several rows is the edge of its last row.
		const rowIndex = getRowEdgesIndexes( modelCell, tableUtils ).bottomEdge;
		const modelRow = getTableRows( modelTable )[ rowIndex ];
		const viewRow = editor.editing.mapper.toViewElement( modelRow )!;
		const domRow = view.domConverter.mapViewToDom( viewRow )!;
		const viewFigure = editor.editing.mapper.toViewElement( modelTable )!;
		const tableHeight = viewFigure.getStyle( 'height' );

		const hasTableHeight = this._hasTableHeight( modelTable );
		const unsetCellHeight = getUnsetHeightValue( editor, modelTable, 'cell' );

		const rowHeightsReplacingTableHeight = hasTableHeight ? this._getRowHeightsReplacingTableHeight( modelTable ) : [];
		const cellHeights = this._getCellHeightsCoveringRow( modelTable, rowIndex, unsetCellHeight );
		const initialHeight = new Rect( domRow ).height;

		this._applyPreviewStyles( modelTable, viewFigure, hasTableHeight, unsetCellHeight, rowHeightsReplacingTableHeight, cellHeights );

		// Collapse the row to let the browser lay out its minimum height - the height its content requires.
		view.change( writer => {
			writer.setStyle( 'height', '0px', viewRow );
		} );

		const minHeight = new Rect( domRow ).height;

		view.change( writer => {
			writer.setStyle( 'height', toPx( toPrecision( initialHeight ) ), viewRow );
			writer.addClass( 'ck-table-row-resizer__active', viewResizer );
		} );

		this._resizingData = {
			startY: ( domEventData.domEvent as MouseEvent ).clientY,
			initialHeight,
			minHeight,
			elements: { viewResizer, modelRow, viewRow, viewFigure },
			initialStyles: {
				rowHeight: modelRow.getAttribute( 'rowHeight' ) as string | undefined,
				cellHeights,
				tableHeight
			},
			rowHeightsReplacingTableHeight
		};

		this._isResizingActive = true;
	}

	/**
	 * Measures the rows of a table with a height. The table height works as a minimum height: the browser spreads the surplus
	 * over the rows, so the dragged edge would not follow the mouse. The table height is replaced with the rendered heights
	 * of the rows instead (in the model, on commit).
	 */
	private _getRowHeightsReplacingTableHeight( modelTable: ModelElement ): ResizingData[ 'rowHeightsReplacingTableHeight' ] {
		return this._measureRowHeights( modelTable ).map( ( { modelRow, renderedHeight } ) => {
			const viewRow = this.editor.editing.mapper.toViewElement( modelRow )!;

			return { modelRow, viewRow, renderedHeight, initialViewHeight: viewRow.getStyle( 'height' ) };
		} );
	}

	/**
	 * Returns the cells covering a row whose heights are cleared in the preview, with their initial heights. A cell height
	 * keeps the row from shrinking, so it is cleared in the preview (and in the model on commit). A default cell height
	 * applies to every cell, so all cells covering the row are cleared then.
	 */
	private _getCellHeightsCoveringRow(
		modelTable: ModelElement,
		rowIndex: number,
		unsetCellHeight: string | null
	): ResizingData[ 'initialStyles' ][ 'cellHeights' ] {
		const cellHeights: ResizingData[ 'initialStyles' ][ 'cellHeights' ] = [];

		for ( const { cell } of new TableWalker( modelTable, { row: rowIndex, includeAllSlots: true } ) ) {
			const viewCell = this.editor.editing.mapper.toViewElement( cell )!;
			const height = viewCell.getStyle( 'height' );

			if ( height || unsetCellHeight ) {
				cellHeights.push( { viewCell, height } );
			}
		}

		return cellHeights;
	}

	/**
	 * Sets the styles that stay in the preview for the whole drag: replaces the table height with the rendered heights
	 * of the rows, and clears the heights of the cells covering the row.
	 */
	private _applyPreviewStyles(
		modelTable: ModelElement,
		viewFigure: ViewElement,
		hasTableHeight: boolean,
		unsetCellHeight: string | null,
		rowHeightsReplacingTableHeight: ResizingData[ 'rowHeightsReplacingTableHeight' ],
		cellHeights: ResizingData[ 'initialStyles' ][ 'cellHeights' ]
	): void {
		const unsetTableHeight = getUnsetHeightValue( this.editor, modelTable, 'table' );

		this.editor.editing.view.change( writer => {
			for ( const row of rowHeightsReplacingTableHeight ) {
				writer.setStyle( 'height', row.renderedHeight, row.viewRow );
			}

			if ( hasTableHeight && unsetTableHeight ) {
				writer.setStyle( 'height', unsetTableHeight, viewFigure );
			} else if ( hasTableHeight ) {
				writer.removeStyle( 'height', viewFigure );
			}

			for ( const { viewCell } of cellHeights ) {
				if ( unsetCellHeight ) {
					writer.setStyle( 'height', unsetCellHeight, viewCell );
				} else {
					writer.removeStyle( 'height', viewCell );
				}
			}
		} );
	}

	/**
	 * Handles the `mousemove` event: starts the resizing once the threshold is reached and updates the live preview.
	 */
	private _onMouseMoveHandler( eventInfo: EventInfo, mouseEventData: MouseEvent ) {
		if ( this._initialMouseEventData ) {
			const mouseEvent = this._initialMouseEventData.domEvent as MouseEvent;
			const distanceY = Math.abs( mouseEventData.clientY - mouseEvent.clientY );

			if ( distanceY < RESIZE_DISTANCE_THRESHOLD ) {
				return;
			}

			this._startResizingAfterThreshold();
			this._initialMouseEventData = null;
		}

		if ( !this._isResizingActive ) {
			return;
		}

		if ( !this._isResizingAllowed ) {
			this._onMouseUpHandler();

			return;
		}

		const { startY, initialHeight, minHeight, elements: { viewRow } } = this._resizingData!;
		const height = Math.max( initialHeight + mouseEventData.clientY - startY, minHeight );

		this.editor.editing.view.change( writer => {
			writer.setStyle( 'height', toPx( toPrecision( height ) ), viewRow );
		} );
	}

	/**
	 * Handles the `mouseup` event: commits the new row height to the model (as a single undo step), or restores the
	 * editing view if nothing changed or the resizing is no longer allowed.
	 */
	private _onMouseUpHandler() {
		this._initialMouseEventData = null;

		if ( !this._isResizingActive ) {
			return;
		}

		const editor = this.editor;
		const { initialHeight, elements: { viewResizer, modelRow, viewRow } } = this._resizingData!;

		const newHeight = viewRow.getStyle( 'height' )!;

		// Compared with the rendered height rather than the `rowHeight` attribute, which can be lower than the content.
		const isHeightChanged = newHeight !== toPx( toPrecision( initialHeight ) );

		// The row (or the whole table) could have been removed by another user in the meantime.
		const isRowAttached = modelRow.root.rootName !== '$graveyard';

		if ( isRowAttached && this._isResizingAllowed && isHeightChanged ) {
			this._commitRowHeight( newHeight );
		} else {
			this._revertPreview();
		}

		editor.editing.view.change( writer => {
			writer.removeClass( 'ck-table-row-resizer__active', viewResizer );
		} );

		const domResizer = editor.editing.view.domConverter.mapViewToDom( viewResizer );

		if ( !domResizer || !domResizer.matches( ':hover' ) ) {
			resetResizerStyles( this.editor.editing.view, viewResizer, 'row' );
		}

		this._isResizingActive = false;
		this._resizingData = null;
	}

	/**
	 * Commits the new height of the dragged row to the model with the `resizeRowHeights` command, which also replaces
	 * a table height with the rendered heights of the other rows from the start of the drag.
	 */
	private _commitRowHeight( newHeight: string ): void {
		const editor = this.editor;
		const { elements: { modelRow }, rowHeightsReplacingTableHeight } = this._resizingData!;

		// The row is found by its current position rather than by its index from the start of the drag, as another user
		// could have added or removed rows above it in the meantime.
		const table = modelRow.parent as ModelElement;
		const rowHeights: Array<string | undefined> = [];

		rowHeights[ getTableRows( table ).indexOf( modelRow ) ] = newHeight;

		// The rows measured at the start of the drag, as the table could have been re-rendered without the preview in the meantime.
		editor.execute( 'resizeRowHeights', { table, rowHeights, _renderedRowHeights: rowHeightsReplacingTableHeight } );
	}

	/**
	 * Reverts the preview styles. The model was not touched, so it does not need to be restored. It is reverted also when
	 * the row was removed, as the other rows and the cells spanning over the removed one keep the preview styles.
	 */
	private _revertPreview(): void {
		const { elements: { viewRow, viewFigure }, initialStyles, rowHeightsReplacingTableHeight } = this._resizingData!;

		this.editor.editing.view.change( writer => {
			for ( const row of rowHeightsReplacingTableHeight ) {
				if ( row.initialViewHeight ) {
					writer.setStyle( 'height', row.initialViewHeight, row.viewRow );
				} else {
					writer.removeStyle( 'height', row.viewRow );
				}
			}

			if ( initialStyles.tableHeight ) {
				writer.setStyle( 'height', initialStyles.tableHeight, viewFigure );
			} else {
				writer.removeStyle( 'height', viewFigure );
			}

			if ( initialStyles.rowHeight ) {
				writer.setStyle( 'height', initialStyles.rowHeight, viewRow );
			} else {
				writer.removeStyle( 'height', viewRow );
			}

			for ( const { viewCell, height } of initialStyles.cellHeights ) {
				if ( height ) {
					writer.setStyle( 'height', height, viewCell );
				} else {
					writer.removeStyle( 'height', viewCell );
				}
			}
		} );
	}

	/**
	 * Replaces the table height with the rendered heights of its rows, if the table has a height. The table height works as
	 * a minimum height and the browser spreads the surplus over the rows, so the rows would not get the heights they are set to.
	 *
	 * @internal
	 * @param renderedRowHeights The rendered heights of the rows measured earlier, used instead of measuring the rows now.
	 * An empty array means the table had no height. A row removed from the table in the meantime is skipped.
	 */
	public _replaceTableHeightWithRowHeights(
		writer: ModelWriter,
		table: ModelElement,
		renderedRowHeights?: Array<{ modelRow: ModelElement; renderedHeight: string }>
	): void {
		if ( renderedRowHeights ? !renderedRowHeights.length : !this._hasTableHeight( table ) ) {
			return;
		}

		for ( const { modelRow, renderedHeight } of renderedRowHeights || this._measureRowHeights( table ) ) {
			if ( modelRow.parent === table ) {
				writer.setAttribute( 'rowHeight', renderedHeight, modelRow );
			}
		}

		this._clearTableHeight( writer, table );
	}

	/**
	 * Tells whether the table height works as a minimum height of the table: the table height set in the model, or the default
	 * table height from the configuration, which is set in the content styles only. A table height of `auto` does not.
	 */
	private _hasTableHeight( table: ModelElement ): boolean {
		const tableHeight = table.getAttribute( 'tableHeight' ) as string | undefined;

		return tableHeight ? tableHeight !== 'auto' : !!getUnsetHeightValue( this.editor, table, 'table' );
	}

	/**
	 * Unsets the table height in the model: sets it to `'auto'` or removes it.
	 */
	private _clearTableHeight( writer: ModelWriter, table: ModelElement ): void {
		const unsetTableHeight = getUnsetHeightValue( this.editor, table, 'table' );

		if ( unsetTableHeight ) {
			writer.setAttribute( 'tableHeight', unsetTableHeight, table );
		} else {
			writer.removeAttribute( 'tableHeight', table );
		}
	}

	/**
	 * Returns the rendered heights of the rows of the table, in pixels. A row that is not rendered (yet) is skipped.
	 *
	 * @param modelTable The table to measure.
	 */
	private _measureRowHeights( modelTable: ModelElement ): Array<{ modelRow: ModelElement; renderedHeight: string }> {
		const { mapper, view } = this.editor.editing;

		return getTableRows( modelTable ).flatMap( modelRow => {
			const viewRow = mapper.toViewElement( modelRow );
			const domRow = viewRow && view.domConverter.mapViewToDom( viewRow );

			return domRow ? [ { modelRow, renderedHeight: toPx( toPrecision( new Rect( domRow ).height ) ) } ] : [];
		} );
	}
}

/**
 * Returns the row height to store in the model for a `height` style of a row: a height in pixels as it is, and a height
 * in points (for example pasted from Microsoft Word, Microsoft Excel, or Google Docs) converted to pixels. Any other value,
 * and a zero height, give `undefined`.
 */
function normalizeRowHeight( height: string ): string | undefined {
	const match = height.match( /^(\d+(?:\.\d+)?|\.\d+)(px|pt)$/ );
	const pixels = match ? parseFloat( match[ 1 ] ) * ( match[ 2 ] == 'pt' ? 4 / 3 : 1 ) : 0;

	return pixels ? toPx( toPrecision( pixels ) ) : undefined;
}
