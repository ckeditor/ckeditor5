/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecolumnresize/tablecolumnresizeediting
 */

import { throttle } from 'lodash-es';
import { global, DomEmitterMixin } from 'ckeditor5/src/utils';
import { Plugin } from 'ckeditor5/src/core';

import MouseEventsObserver from '../../src/tablemouse/mouseeventsobserver';
import TableEditing from '../tableediting';
import TableWalker from '../tablewalker';

import TableWidthResizeCommand from './tablewidthresizecommand';
import TableColumnWidthsCommand from './tablecolumnwidthscommand';

import {
	upcastColgroupElement,
	downcastTableColumnWidthsAttribute
} from './converters';

import {
	clamp,
	fillArray,
	sumArray,
	getChangedTables,
	getColumnIndex,
	getColumnMinWidthAsPercentage,
	getElementWidthInPixels,
	getTableWidthInPixels,
	getNumberOfColumn,
	normalizeColumnWidths,
	toPrecision,
	insertColumnResizerElement,
	getDomCellOuterWidth
} from './utils';

import { COLUMN_MIN_WIDTH_IN_PIXELS } from './constants';

/**
 * The table column resize editing plugin.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TableColumnResizeEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ TableEditing ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'TableColumnResizeEditing';
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		/**
		 * A flag indicating if the column resizing is in progress.
		 *
		 * @private
		 * @member {Boolean}
		 */
		this._isResizingActive = false;

		/**
		 * A flag indicating if the column resizing is allowed. It is not allowed if the editor is in read-only
		 * or comments-only mode or the `TableColumnResize` plugin is disabled.
		 *
		 * @private
		 * @observable
		 * @member {Boolean}
		 */
		this.set( '_isResizingAllowed', true );

		/**
		 * A temporary storage for the required data needed to correctly calculate the widths of the resized columns. This storage is
		 * initialized when column resizing begins, and is purged upon completion.
		 *
		 * @private
		 * @member {Object|null}
		 */
		this._resizingData = null;

		/**
		 * Internal map to store reference between a cell and its columnIndex. This information is required in postfixer to properly
		 * recognize if the cell was inserted or deleted.
		 *
		 * @private
		 * @member {Map}
		 */
		this._columnIndexMap = new Map();

		/**
		 * Internal map to store reference between a cell and operation that was performed on it (insert/remove). This is required
		 * in order to add/remove resizers based on operation performed (which is done on 'render').
		 *
		 * @private
		 * @member {Map}
		 */
		this._cellsModified = new Map();

		this.on( 'change:_isResizingAllowed', ( evt, name, value ) => {
			// Toggling the `ck-column-resize_disabled` class shows and hides the resizers through CSS.
			editor.editing.view.change( writer => {
				writer[ value ? 'removeClass' : 'addClass' ]( 'ck-column-resize_disabled', editor.editing.view.document.getRoot() );
			} );
		} );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		this._extendSchema();
		this._setupPostFixer();
		this._setupConversion();
		this._setupResizingListeners();
		this._registerColgroupFixer();
		this._registerResizerInserter();

		const editor = this.editor;
		const columnResizePlugin = editor.plugins.get( 'TableColumnResize' );

		editor.commands.add( 'resizeTableWidth', new TableWidthResizeCommand( editor ) );
		editor.commands.add( 'resizeColumnWidths', new TableColumnWidthsCommand( editor ) );

		const resizeTableWidthCommand = editor.commands.get( 'resizeTableWidth' );
		const resizeColumnWidthsCommand = editor.commands.get( 'resizeColumnWidths' );

		// Currently the states of column resize and table resize (which is actually the last column resize) features
		// are bound together. They can be separated in the future by adding distinct listeners and applying
		// different CSS classes (e.g. `ck-column-resize_disabled` and `ck-table-resize_disabled`) to the editor root.
		// See #12148 for the details.
		this.bind( '_isResizingAllowed' ).to(
			editor, 'isReadOnly',
			columnResizePlugin, 'isEnabled',
			resizeTableWidthCommand, 'isEnabled',
			resizeColumnWidthsCommand, 'isEnabled',
			( isEditorReadOnly, isPluginEnabled, isResizeTableWidthCommandEnabled, isResizeColumnWidthsCommandEnabled ) =>
				!isEditorReadOnly && isPluginEnabled && isResizeTableWidthCommandEnabled && isResizeColumnWidthsCommandEnabled
		);
	}

	/**
	 * Registers new attributes for a table and a table cell model elements.
	 *
	 * @private
	 */
	_extendSchema() {
		const editor = this.editor;
		const schema = editor.model.schema;

		schema.extend( 'table', {
			allowAttributes: [ 'tableWidth', 'columnWidths' ]
		} );
	}

	/**
	 * Registers table column resizer converters.
	 *
	 * @private
	 */
	_setupConversion() {
		const editor = this.editor;
		const conversion = editor.conversion;

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
				value: viewElement => viewElement.getStyle( 'width' )
			}
		} );

		conversion.for( 'downcast' ).attributeToAttribute( {
			model: {
				name: 'table',
				key: 'tableWidth'
			},
			view: width => ( {
				name: 'figure',
				key: 'style',
				value: {
					width
				}
			} )
		} );

		conversion.for( 'upcast' ).add( upcastColgroupElement( editor ) );
		conversion.for( 'downcast' ).add( downcastTableColumnWidthsAttribute() );
	}

	/**
	 * Registers table column resizer post-fixer.
	 *
	 * It checks if the change from the differ concerns a table-related element or an attribute. If yes, then it is responsible for the
	 * following:
	 * (1) Adjusting the `columnWidths` attribute to guarantee that the sum of the widths from all columns is 100%.
	 * (2) Add all cells to column index map with its column index (to properly handle column insertion and deletion).
	 * (3) Checking if columns have been added or removed...
	 *    (3.1) ... in the middle of the table, or
	 *    (3.2) ... at the table end.
	 *
	 * @private
	 */
	_setupPostFixer() {
		const editor = this.editor;
		const columnIndexMap = this._columnIndexMap;
		const cellsModified = this._cellsModified;

		editor.model.document.registerPostFixer( writer => {
			const changes = editor.model.document.differ.getChanges();

			let changed = false;

			for ( const table of getChangedTables( changes, editor.model ) ) {
				// (1) Adjust the `columnWidths` attribute to guarantee that the sum of the widths from all columns is 100%.
				// It's an array at this point.
				const columnWidths = normalizeColumnWidths( table.getAttribute( 'columnWidths' ).split( ',' ) );

				let removedColumnWidths = null;
				let isColumnInsertionHandled = false;
				let isColumnDeletionHandled = false;

				for ( const { cell, column } of new TableWalker( table ) ) {
					// (2) Add all cells to column index map with its column index. Do not process the given cell anymore, because the
					// `columnIndex` reference in the map is required to properly handle column insertion and deletion.
					if ( !columnIndexMap.has( cell ) ) {
						columnIndexMap.set( cell, column );
						cellsModified.set( cell, 'insert' );

						changed = true;

						continue;
					}

					const previousColumn = columnIndexMap.get( cell );

					const isColumnInsertion = previousColumn < column;
					const isColumnDeletion = previousColumn > column;

					// (3.1) Handle column insertion and update the `columnIndex` references in column index map for affected cells.
					if ( isColumnInsertion ) {
						if ( !isColumnInsertionHandled ) {
							const columnMinWidthAsPercentage = getColumnMinWidthAsPercentage( table, editor );
							const columnWidthsToInsert = fillArray( column - previousColumn, columnMinWidthAsPercentage );

							columnWidths.splice( previousColumn, 0, ...columnWidthsToInsert );

							isColumnInsertionHandled = true;
						}

						columnIndexMap.set( cell, column );
						cellsModified.set( cell, 'insert' );

						changed = true;
					}

					// (3.1) Handle column deletion and update the `columnIndex` references in column index map for affected cells.
					if ( isColumnDeletion ) {
						if ( !isColumnDeletionHandled ) {
							const columnToExpand = column > 0 ? column - 1 : column;

							removedColumnWidths = columnWidths.splice( column, previousColumn - column );
							columnWidths[ columnToExpand ] += sumArray( removedColumnWidths );
							isColumnDeletionHandled = true;
						}

						columnIndexMap.set( cell, column );
						cellsModified.set( cell, 'insert' );

						changed = true;
					}
				}

				const numberOfColumns = getNumberOfColumn( table, editor );
				const isColumnInsertionAtEnd = numberOfColumns > columnWidths.length;
				const isColumnDeletionAtEnd = numberOfColumns < columnWidths.length;

				// (3.2) Handle column insertion at table end.
				if ( isColumnInsertionAtEnd ) {
					const columnMinWidthAsPercentage = getColumnMinWidthAsPercentage( table, editor );
					const numberOfInsertedColumns = numberOfColumns - columnWidths.length;
					const insertedColumnWidths = fillArray( numberOfInsertedColumns, columnMinWidthAsPercentage );

					columnWidths.splice( columnWidths.length, 0, ...insertedColumnWidths );
				}

				// (3.2) Handle column deletion at table end.
				if ( isColumnDeletionAtEnd ) {
					const removedColumnWidths = columnWidths.splice( numberOfColumns );

					columnWidths[ numberOfColumns - 1 ] += sumArray( removedColumnWidths );
				}

				const columnWidthsAttribute = columnWidths.map( width => `${ width }%` ).join( ',' );

				if ( table.getAttribute( 'columnWidths' ) === columnWidthsAttribute ) {
					continue;
				}

				writer.setAttribute( 'columnWidths', columnWidthsAttribute, table );

				changed = true;
			}

			return changed;
		} );
	}

	/**
	 * Registers the mouse event listeners for `mousedown`, `mousemove` and `mouseup` events.
	 *
	 * @private
	 */
	_setupResizingListeners() {
		const editingView = this.editor.editing.view;

		editingView.addObserver( MouseEventsObserver );
		editingView.document.on( 'mousedown', this._onMouseDownHandler.bind( this ), { priority: 'high' } );

		const domEmitter = Object.create( DomEmitterMixin );

		domEmitter.listenTo( global.window.document, 'mousemove', throttle( this._onMouseMoveHandler.bind( this ), 50 ) );
		domEmitter.listenTo( global.window.document, 'mouseup', this._onMouseUpHandler.bind( this ) );
	}

	/**
	 * Handles the `mousedown` event on column resizer element.
	 *
	 * @private
	 * @param {module:utils/eventinfo~EventInfo} eventInfo
	 * @param {module:engine/view/observer/domeventdata~DomEventData} domEventData
	 */
	_onMouseDownHandler( eventInfo, domEventData ) {
		const editor = this.editor;
		const target = domEventData.target;

		if ( !target.hasClass( 'ck-table-column-resizer' ) ) {
			return;
		}

		if ( !this._isResizingAllowed ) {
			return;
		}

		domEventData.preventDefault();
		eventInfo.stop();

		const modelTable = editor.editing.mapper.toModelElement( target.findAncestor( 'figure' ) );
		const viewTable = target.findAncestor( 'table' );
		const editingView = editor.editing.view;

		// The column widths are calculated upon mousedown to allow lazy applying the `columnWidths` attribute on the table.
		const columnWidthsInPx = this._calculateDomColumnWidths( modelTable );

		// Insert colgroup for the table that is resized for the first time.
		if ( ![ ...viewTable.getChildren() ].find( viewCol => viewCol.is( 'element', 'colgroup' ) ) ) {
			editingView.change( viewWriter => {
				this._insertColgroupElement( viewWriter, modelTable, columnWidthsInPx, viewTable );
			} );
		}

		this._isResizingActive = true;
		this._resizingData = this._getResizingData( domEventData, columnWidthsInPx );

		// At this point we change only the editor view - we don't want other users to see our changes yet,
		// so we can't apply them in the model.
		editingView.change( writer => this._applyResizingAttributesToTable( writer, target, viewTable ) );
	}

	/**
	 * Calculate the dom column widths. It is done by taking the width of the widest cell
	 * from each table column (we rely on the TableWalker to determine
	 * which column the cell belongs to).
	 *
	 * @private
	 * @param {module:engine/model/element~Element} modelTable A table which columns should be measured.
	 * @returns {Array.<Number>} Widths expressed in pixels (without unit).
	 */
	_calculateDomColumnWidths( modelTable ) {
		const editor = this.editor;
		const columnWidthsInPx = Array( getNumberOfColumn( modelTable, editor ) );
		const tableWalker = new TableWalker( modelTable );

		for ( const cellSlot of tableWalker ) {
			const viewCell = editor.editing.mapper.toViewElement( cellSlot.cell );
			const domCell = editor.editing.view.domConverter.mapViewToDom( viewCell );
			const domCellWidth = getDomCellOuterWidth( domCell );

			if ( !this._columnIndexMap.has( cellSlot.cell ) ) {
				this._columnIndexMap.set( cellSlot.cell, cellSlot.column );
			}

			if ( !columnWidthsInPx[ cellSlot.column ] || domCellWidth < columnWidthsInPx[ cellSlot.column ] ) {
				columnWidthsInPx[ cellSlot.column ] = toPrecision( domCellWidth );
			}
		}

		return columnWidthsInPx;
	}

	/**
	 * Creates a `<colgroup>` element with `<col>`s and inserts it into a given view table.
	 *
	 * @private
	 * @param {module:engine/view/downcastwriter~DowncastWriter} viewWriter A writer instance.
	 * @param {module:engine/model/element~Element} modelTable A table model element.
	 * @param {Array.<Number>} columnWidthsInPx Column widths.
	 * @param {module:engine/view/element~Element} viewTable A table view element.
	 */
	_insertColgroupElement( viewWriter, modelTable, columnWidthsInPx, viewTable ) {
		const colgroup = viewWriter.createContainerElement( 'colgroup' );

		const numberOfColumns = getNumberOfColumn( modelTable, this.editor );

		for ( let i = 0; i < numberOfColumns; i++ ) {
			const viewColElement = viewWriter.createEmptyElement( 'col' );
			const columnWidthInPc = `${ toPrecision( columnWidthsInPx[ i ] / sumArray( columnWidthsInPx ) * 100 ) }%`;

			viewWriter.setStyle( 'width', columnWidthInPc, viewColElement );
			viewWriter.insert( viewWriter.createPositionAt( colgroup, 'end' ), viewColElement );
		}

		viewWriter.insert( viewWriter.createPositionAt( viewTable, 'start' ), colgroup );
	}

	/**
	 * Applies the style and classes to the view table as the resizing begun.
	 *
	 * @private
	 * @param {module:engine/view/downcastwriter~DowncastWriter} viewWriter A writer instance.
	 * @param {HTMLElement} activeResizer The clicked resizer.
	 * @param {module:engine/view/element~Element} viewTable A table containing the clicked resizer.
	 */
	_applyResizingAttributesToTable( writer, activeResizer, viewTable ) {
		const figureInitialPcWidth = this._resizingData.widths.viewFigureWidth / this._resizingData.widths.viewFigureParentWidth;

		writer.setStyle( 'width', `${ toPrecision( figureInitialPcWidth * 100 ) }%`, activeResizer.findAncestor( 'figure' ) );
		writer.addClass( 'ck-table-column-resizer__active', this._resizingData.elements.viewResizer );
		writer.addClass( 'ck-table-resized', viewTable );
	}

	/**
	 * Handles the `mousemove` event if previously the `mousedown` event was triggered from the column resizer element.
	 *
	 * @private
	 * @param {module:utils/eventinfo~EventInfo} eventInfo
	 * @param {module:engine/view/observer/domeventdata~DomEventData} domEventData
	 */
	_onMouseMoveHandler( eventInfo, domEventData ) {
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
		} = this._resizingData;

		const dxLowerBound = -leftColumnWidth + COLUMN_MIN_WIDTH_IN_PIXELS;

		const dxUpperBound = isRightEdge ?
			viewFigureParentWidth - tableWidth :
			rightColumnWidth - COLUMN_MIN_WIDTH_IN_PIXELS;

		// The multiplier is needed for calculating the proper movement offset:
		// - it should negate the sign if content language direction is right-to-left,
		// - it should double the offset if the table edge is resized and table is centered.
		const multiplier = ( isLtrContent ? 1 : -1 ) * ( isRightEdge && isTableCentered ? 2 : 1 );

		const dx = clamp(
			( domEventData.clientX - columnPosition ) * multiplier,
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
				const rightColumnWidthAsPercentage = toPrecision( ( rightColumnWidth - dx ) * 100 / tableWidth );

				writer.setStyle( 'width', `${ rightColumnWidthAsPercentage }%`, viewRightColumn );
			}
		} );
	}

	/**
	 * Handles the `mouseup` event if previously the `mousedown` event was triggered from the column resizer element.
	 *
	 * @private
	 * @param {module:utils/eventinfo~EventInfo} eventInfo
	 * @param {module:engine/view/observer/domeventdata~DomEventData} domEventData // not true, its native dom event - same for mousemove
	 */
	_onMouseUpHandler() {
		const editor = this.editor;
		const editingView = editor.editing.view;

		if ( !this._isResizingActive ) {
			return;
		}

		const {
			viewResizer,
			modelTable,
			viewFigure,
			viewColgroup
		} = this._resizingData.elements;

		const columnWidthsAttributeOld = modelTable.getAttribute( 'columnWidths' );
		const columnWidthsAttributeNew = [ ...viewColgroup.getChildren() ]
			.map( viewCol => viewCol.getStyle( 'width' ) )
			.join( ',' );

		const isColumnWidthsAttributeChanged = columnWidthsAttributeOld !== columnWidthsAttributeNew;

		const tableWidthAttributeOld = modelTable.getAttribute( 'tableWidth' );
		const tableWidthAttributeNew = viewFigure.getStyle( 'width' );

		const isTableWidthAttributeChanged = tableWidthAttributeOld !== tableWidthAttributeNew;

		if ( isColumnWidthsAttributeChanged || isTableWidthAttributeChanged ) {
			if ( this._isResizingAllowed ) {
				// Commit all changes to the model.
				if ( isTableWidthAttributeChanged ) {
					editor.execute(
						'resizeTableWidth',
						{
							table: modelTable,
							tableWidth: `${ toPrecision( tableWidthAttributeNew ) }%`,
							columnWidths: columnWidthsAttributeNew
						}
					);
				} else {
					editor.execute( 'resizeColumnWidths', { columnWidths: columnWidthsAttributeNew, table: modelTable } );
				}
			} else {
				// In read-only mode revert all changes in the editing view. The model is not touched so it does not need to be restored.
				// This case can occur if the read-only mode kicks in during the resizing process.
				editingView.change( writer => {
					// If table was already resized before, restore the previous column widths.
					// Otherwise clean up the view from the temporary resizing markup.
					if ( columnWidthsAttributeOld ) {
						const columnWidths = columnWidthsAttributeOld.split( ',' );

						for ( const viewCol of viewColgroup.getChildren() ) {
							writer.setStyle( 'width', columnWidths.shift(), viewCol );
						}
					} else {
						writer.remove( viewColgroup );
					}

					if ( isTableWidthAttributeChanged ) {
						// If table was already resized before, restore the previous table width.
						// Otherwise clean up the view from the temporary resizing markup.
						if ( tableWidthAttributeOld ) {
							writer.setStyle( 'width', tableWidthAttributeOld, viewFigure );
						} else {
							writer.removeStyle( 'width', viewFigure );
						}
					}

					if ( !columnWidthsAttributeOld && !tableWidthAttributeOld ) {
						writer.removeClass(
							'ck-table-resized',
							[ ...viewFigure.getChildren() ].find( element => element.name === 'table' )
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
	 * Retrieves and returns required data needed to correctly calculate the widths of the resized columns.
	 *
	 * @private
	 * @param {module:engine/view/observer/domeventdata~DomEventData} domEventData
	 * @param {Array.<Number>} columnWidths
	 * @returns {Object}
	 */
	_getResizingData( domEventData, columnWidths ) {
		const editor = this.editor;

		const columnPosition = domEventData.domEvent.clientX;

		const viewResizer = domEventData.target;
		const viewLeftCell = viewResizer.findAncestor( 'td' ) || viewResizer.findAncestor( 'th' );
		const modelLeftCell = editor.editing.mapper.toModelElement( viewLeftCell );
		const modelTable = modelLeftCell.findAncestor( 'table' );

		const leftColumnIndex = getColumnIndex( modelLeftCell, this._columnIndexMap ).rightEdge;
		const lastColumnIndex = getNumberOfColumn( modelTable, editor ) - 1;

		const isRightEdge = leftColumnIndex === lastColumnIndex;
		const isTableCentered = !modelTable.hasAttribute( 'tableAlignment' );
		const isLtrContent = editor.locale.contentLanguageDirection !== 'rtl';

		const viewTable = viewLeftCell.findAncestor( 'table' );
		const viewFigure = viewTable.findAncestor( 'figure' );
		const viewColgroup = [ ...viewTable.getChildren() ].find( viewCol => viewCol.is( 'element', 'colgroup' ) );
		const viewLeftColumn = viewColgroup.getChild( leftColumnIndex );
		const viewRightColumn = isRightEdge ? undefined : viewColgroup.getChild( leftColumnIndex + 1 );

		const viewFigureParentWidth = getElementWidthInPixels( editor.editing.view.domConverter.mapViewToDom( viewFigure.parent ) );
		const viewFigureWidth = getElementWidthInPixels( editor.editing.view.domConverter.mapViewToDom( viewFigure ) );
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
	 * Inserts colgroup if it is missing from table (e.g. after table insertion into table).
	 *
	 * @private
	 */
	_registerColgroupFixer() {
		const editor = this.editor;

		this.listenTo( editor.editing.view.document, 'layoutChanged', () => {
			const table = editor.model.document.selection.getFirstPosition().findAncestor( 'table' );
			const tableView = editor.editing.view.document.selection.getFirstPosition().getAncestors().reverse().find(
				element => element.name === 'table'
			);
			const tableViewContainsColgroup = tableView && [ ...tableView.getChildren() ].find(
				viewElement => viewElement.is( 'element', 'colgroup' )
			);

			if ( table && table.hasAttribute( 'columnWidths' ) && tableView && !tableViewContainsColgroup ) {
				editor.editing.reconvertItem( table );
			}
		}, { priority: 'low' } );
	}

	/**
	 * Registers a handler on 'render' event to properly insert missing resizers after all postfixers finished their job.
	 *
	 * @private
	 */
	_registerResizerInserter() {
		const view = this.editor.editing.view;

		view.on( 'render', () => {
			for ( const item of view.createRangeIn( view.document.getRoot() ) ) {
				if ( ![ 'td', 'th' ].includes( item.item.name ) ) {
					continue;
				}

				view.change( viewWriter => {
					insertColumnResizerElement( viewWriter, item.item );
				} );
			}
		}, { priority: 'lowest' } );
	}
}
