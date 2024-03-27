/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
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
} from 'ckeditor5/src/utils.js';

import { Plugin, type Editor } from 'ckeditor5/src/core.js';

import type {
	Differ,
	DomEventData,
	DowncastInsertEvent,
	Element,
	ViewElement
} from 'ckeditor5/src/engine.js';

import MouseEventsObserver from '../../src/tablemouse/mouseeventsobserver.js';
import TableEditing from '../tableediting.js';
import TableUtils from '../tableutils.js';

import TableWidthsCommand from './commands/tablewidthscommand.js';
import TableColumnResizeUtils, { type ResizingData } from './tablecolumnresizeutils.js';

import { downcastTableResizedClass, upcastColgroupElement } from './converters.js';

import {
	createFilledArray,
	sumArray,
	getChangedResizedTables,
	getColumnMinWidthAsPercentage,
	normalizeColumnWidths,
	updateColumnElements,
	getColumnGroupElement,
	getTableColumnElements,
	getTableColumnsWidths
} from './utils.js';

import type TableColumnResize from '../tablecolumnresize.js';

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
		return [ TableEditing, TableUtils, TableColumnResizeUtils ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'TableColumnResizeEditing' as const;
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
			const classAction = value ? 'removeClass' : 'addClass';

			editor.editing.view.change( writer => {
				for ( const root of editor.editing.view.document.roots ) {
					writer[ classAction ]( 'ck-column-resize_disabled', editor.editing.view.document.getRoot( root.rootName )! );
				}
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
			allowAttributes: [ 'columnWidth', 'colSpan' ],
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

					// 'pt' is the default unit for table column width pasted from MS Office.
					// See https://github.com/ckeditor/ckeditor5/issues/14521#issuecomment-1662102889 for more details.
					if ( !viewColWidth || ( !viewColWidth.endsWith( '%' ) && !viewColWidth.endsWith( 'pt' ) ) ) {
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
		const resizerElement = domEventData.target;

		if ( !resizerElement.hasClass( 'ck-table-column-resizer' ) || !this._isResizingAllowed ) {
			return;
		}

		this._resizingData = this._resizeUtils.prepareColumnResize( resizerElement );

		// By default, the position of the resizer is set as the startDraggingPosition element.
		// It works, but it feels much less responsive when starting to drag if you use
		// the actual cursor position instead of the element position.
		if ( this._resizingData ) {
			this._resizingData.startDraggingPosition = ( domEventData.domEvent as MouseEvent ).clientX;
			this._isResizingActive = true;
		} else {
			this._isResizingActive = false;
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

		const newColumnWidth = (
			mouseEventData.clientX - this._resizingData!.startDraggingPosition
		) + this._resizingData!.widths.leftColumnWidth;

		this._resizeUtils.assignColumnWidth( this._resizingData!, newColumnWidth, true );
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

		this._resizeUtils.endResize( this._resizingData!, !this._isResizingAllowed );
		this._isResizingActive = false;
		this._resizingData = null;
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

	/**
	 * Getter for table resize utils plugin.
	 */
	private get _resizeUtils(): TableColumnResizeUtils {
		return this.editor.plugins.get( 'TableColumnResizeUtils' );
	}
}
