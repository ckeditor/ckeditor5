/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecolumnresize/tablecolumnresizeediting
 */

/* istanbul ignore file */

import { throttle } from 'lodash-es';
import { global, DomEmitterMixin } from 'ckeditor5/src/utils';
import { Plugin } from 'ckeditor5/src/core';

import MouseEventsObserver from '../../src/tablemouse/mouseeventsobserver';
import TableEditing from '../tableediting';
import TableWalker from '../tablewalker';

import {
	upcastColgroupElement,
	downcastTableColumnWidthsAttribute
} from './converters';

import {
	clamp,
	fillArray,
	sumArray,
	getAffectedTables,
	getColumnIndex,
	getColumnWidthsInPixels,
	getColumnMinWidthAsPercentage,
	getElementWidthInPixels,
	getTableWidthInPixels,
	getNumberOfColumn,
	isTableRendered,
	normalizeColumnWidthsAttribute,
	toPrecision,
	insertColumnResizerElements,
	removeColumnResizerElements
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
		 * A flag indicating if the column resizing is allowed. It is not allowed if the editor is in read-only mode or the
		 * `TableColumnResize` plugin is disabled.
		 *
		 * @private
		 * @member {Boolean}
		 */
		this._isResizingAllowed = true;

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
	}

	/**
	 * @inheritDoc
	 */
	init() {
		this._extendSchema();
		this._setupConversion();
		this._setupPostFixer();
		this._setupColumnResizers();
		this._registerColgroupFixer();
		this._registerResizerInserter();

		const editor = this.editor;
		const columnResizePlugin = editor.plugins.get( 'TableColumnResize' );

		this.bind( '_isResizingAllowed' ).to(
			editor, 'isReadOnly',
			columnResizePlugin, 'isEnabled',
			( isEditorReadOnly, isPluginEnabled ) => !isEditorReadOnly && isPluginEnabled
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
	 * (1) Depending on whether the `enableResize` event is not prevented...
	 *    (1.1) ...removing the `columnWidths` attribute from the table and all the cells from column index map, or
	 *    (1.2) ...adding the `columnWidths` attribute to the table.
	 * (2) Adjusting the `columnWidths` attribute to guarantee that the sum of the widths from all columns is 100%.
	 *    (2.1) Add all cells to column index map with its column index (to properly handle column insertion and deletion).
	 * (3) Checking if columns have been added or removed...
	 *    (3.1) ... in the middle of the table, or
	 *    (3.2) ... at the table end.
	 * (4) Checking if the inline cell width has been configured and transferring its value to the appropriate column, but currently only
	 * for a cell that is not spanned horizontally.
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

			for ( const table of getAffectedTables( changes, editor.model ) ) {
				// (1.1) Remove the `columnWidths` attribute from the table and all the cells from column index map if the
				// manual width is not allowed for a given cell. There is no need to process the given table anymore.
				if ( this.fire( 'disableResize', table ) ) {
					if ( table.hasAttribute( 'columnWidths' ) ) {
						writer.removeAttribute( 'columnWidths', table );

						for ( const { cell } of new TableWalker( table ) ) {
							columnIndexMap.delete( cell );
							cellsModified.set( cell, 'remove' );
						}

						changed = true;
					}

					continue;
				}

				// (1.2) Add the `columnWidths` attribute to the table with the 'auto' special value for each column, what means that it is
				// calculated proportionally to the whole table width.
				const numberOfColumns = getNumberOfColumn( table, editor );

				if ( !table.hasAttribute( 'columnWidths' ) ) {
					const columnWidthsAttribute = fillArray( numberOfColumns, 'auto' ).join( ',' );

					writer.setAttribute( 'columnWidths', columnWidthsAttribute, table );

					changed = true;
				}

				// (2) Adjust the `columnWidths` attribute to guarantee that the sum of the widths from all columns is 100%.
				const columnWidths = normalizeColumnWidthsAttribute( table.getAttribute( 'columnWidths' ) );

				let removedColumnWidths = null;
				let isColumnInsertionHandled = false;
				let isColumnDeletionHandled = false;

				for ( const { cell, cellWidth: cellColumnWidth, column } of new TableWalker( table ) ) {
					// (2.1) Add all cells to column index map with its column index. Do not process the given cell anymore, because the
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
							const isColumnSwapped = columnIndexMap.get( cell.previousSibling ) === column;
							const columnWidthsToInsert = isColumnSwapped ?
								removedColumnWidths :
								fillArray( column - previousColumn, columnMinWidthAsPercentage );

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
							removedColumnWidths = columnWidths.splice( column, previousColumn - column );

							const isColumnSwapped = cell.nextSibling && columnIndexMap.get( cell.nextSibling ) === column;

							if ( !isColumnSwapped ) {
								const columnToExpand = column > 0 ? column - 1 : column;

								columnWidths[ columnToExpand ] += sumArray( removedColumnWidths );
							}

							isColumnDeletionHandled = true;
						}

						columnIndexMap.set( cell, column );
						cellsModified.set( cell, 'insert' );

						changed = true;
					}

					// (4) Check if the inline cell width has been configured and transfer its value to the appropriate column.
					if ( cell.hasAttribute( 'width' ) ) {
						// Currently, only the inline width from the cells that are not horizontally spanned are supported.
						if ( cellColumnWidth !== 1 ) {
							continue;
						}

						// It may happen that the table is not yet fully rendered in the editing view (i.e. it does not contain the
						// `<colgroup>` yet), but the cell has an inline width set. In that case it is not possible to properly convert the
						// inline cell width as a percentage value to the whole table width. Currently, we just ignore this case and
						// initialize the table with all the default (equal) column widths.
						if ( !isTableRendered( table, editor ) ) {
							writer.removeAttribute( 'width', cell );

							changed = true;

							continue;
						}

						const tableWidthInPixels = getTableWidthInPixels( table, editor );
						const columnWidthsInPixels = getColumnWidthsInPixels( table, editor );
						const columnMinWidthAsPercentage = getColumnMinWidthAsPercentage( table, editor );

						const cellWidth = parseFloat( cell.getAttribute( 'width' ) );

						const isWidthInPixels = cell.getAttribute( 'width' ).endsWith( 'px' );
						const isWidthAsPercentage = cell.getAttribute( 'width' ).endsWith( '%' );

						// Currently, only inline width in pixels or as percentage is supported.
						if ( !isWidthInPixels && !isWidthAsPercentage ) {
							continue;
						}

						const isRightEdge = !cell.nextSibling;

						if ( isRightEdge ) {
							const rootWidthInPixels = getElementWidthInPixels( editor.editing.view.getDomRoot() );
							const lastColumnIndex = numberOfColumns - 1;
							const lastColumnWidthInPixels = columnWidthsInPixels[ lastColumnIndex ];

							let tableWidthNew;

							if ( isWidthInPixels ) {
								const cellWidthLowerBound = COLUMN_MIN_WIDTH_IN_PIXELS;
								const cellWidthUpperBound = rootWidthInPixels - ( tableWidthInPixels - lastColumnWidthInPixels );

								columnWidthsInPixels[ lastColumnIndex ] = clamp( cellWidth, cellWidthLowerBound, cellWidthUpperBound );

								tableWidthNew = sumArray( columnWidthsInPixels );

								// Update all the column widths.
								for ( let columnIndex = 0; columnIndex <= lastColumnIndex; columnIndex++ ) {
									columnWidths[ columnIndex ] = toPrecision( columnWidthsInPixels[ columnIndex ] * 100 / tableWidthNew );
								}
							} else {
								const cellWidthLowerBound = columnMinWidthAsPercentage;
								const cellWidthUpperBound = 100 - ( tableWidthInPixels - lastColumnWidthInPixels ) * 100 /
									rootWidthInPixels;

								columnWidths[ lastColumnIndex ] = clamp( cellWidth, cellWidthLowerBound, cellWidthUpperBound );

								tableWidthNew = ( tableWidthInPixels - lastColumnWidthInPixels ) * 100 /
									( 100 - columnWidths[ lastColumnIndex ] );

								// Update all the column widths, except the last one, which has been already adjusted.
								for ( let columnIndex = 0; columnIndex <= lastColumnIndex - 1; columnIndex++ ) {
									columnWidths[ columnIndex ] = toPrecision( columnWidthsInPixels[ columnIndex ] * 100 / tableWidthNew );
								}
							}

							writer.setAttribute( 'width', `${ toPrecision( tableWidthNew * 100 / rootWidthInPixels ) }%`, table );
						} else {
							const currentColumnWidth = columnWidthsInPixels[ column ];
							const nextColumnWidth = columnWidthsInPixels[ column + 1 ];
							const bothColumnWidth = currentColumnWidth + nextColumnWidth;

							const cellMaxWidthAsPercentage = ( bothColumnWidth - COLUMN_MIN_WIDTH_IN_PIXELS ) * 100 / tableWidthInPixels;

							let cellWidthAsPercentage = isWidthInPixels ?
								cellWidth * 100 / tableWidthInPixels :
								cellWidth;

							cellWidthAsPercentage = clamp( cellWidthAsPercentage, columnMinWidthAsPercentage, cellMaxWidthAsPercentage );

							const dxAsPercentage = cellWidthAsPercentage - columnWidths[ column ];

							columnWidths[ column ] += dxAsPercentage;
							columnWidths[ column + 1 ] -= dxAsPercentage;
						}

						writer.removeAttribute( 'width', cell );

						changed = true;
					}
				}

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
	 * Initializes column resizing feature by registering mouse event handlers for `mousedown`, `mouseup` and `mousemove` events.
	 *
	 * @private
	 */
	_setupColumnResizers() {
		const editor = this.editor;
		const editingView = editor.editing.view;

		editingView.addObserver( MouseEventsObserver );
		editingView.document.on( 'mousedown', this._onMouseDownHandler.bind( this ), { priority: 'high' } );

		const domEmitter = Object.create( DomEmitterMixin );

		domEmitter.listenTo( global.window.document, 'mouseup', this._onMouseUpHandler.bind( this ) );
		domEmitter.listenTo( global.window.document, 'mousemove', throttle( this._onMouseMoveHandler.bind( this ), 50 ) );
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
		const editingView = editor.editing.view;

		if ( !domEventData.target.hasClass( 'table-column-resizer' ) ) {
			return;
		}

		if ( !this._isResizingAllowed ) {
			return;
		}

		domEventData.preventDefault();
		eventInfo.stop();

		this._isResizingActive = true;
		this._resizingData = this._getResizingData( domEventData );

		editingView.change( writer => {
			writer.addClass( 'table-column-resizer__active', this._resizingData.elements.viewResizer );
		} );
	}

	/**
	 * Handles the `mouseup` event if previously the `mousedown` event was triggered from the column resizer element.
	 *
	 * @private
	 * @param {module:utils/eventinfo~EventInfo} eventInfo
	 * @param {module:engine/view/observer/domeventdata~DomEventData} domEventData
	 */
	_onMouseUpHandler() {
		const editor = this.editor;
		const editingView = editor.editing.view;

		if ( !this._isResizingActive ) {
			return;
		}

		const {
			modelTable,
			viewColgroup,
			viewFigure,
			viewResizer
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
				editor.model.change( writer => {
					if ( isColumnWidthsAttributeChanged ) {
						writer.setAttribute( 'columnWidths', columnWidthsAttributeNew, modelTable );
					}

					if ( isTableWidthAttributeChanged ) {
						writer.setAttribute( 'tableWidth', `${ toPrecision( tableWidthAttributeNew ) }%`, modelTable );
					}
				} );
			} else {
				// In read-only mode revert all changes in the editing view. The model is not touched so it does not need to be restored.
				editingView.change( writer => {
					if ( isColumnWidthsAttributeChanged ) {
						const columnWidths = columnWidthsAttributeOld.split( ',' );

						for ( const viewCol of viewColgroup.getChildren() ) {
							writer.setStyle( 'width', columnWidths.shift(), viewCol );
						}
					}

					if ( isTableWidthAttributeChanged ) {
						if ( tableWidthAttributeOld ) {
							writer.setStyle( 'width', tableWidthAttributeOld, viewFigure );
						} else {
							writer.removeStyle( 'width', viewFigure );
						}
					}
				} );
			}
		}

		editingView.change( writer => {
			writer.removeClass( 'table-column-resizer__active', viewResizer );
		} );

		this._isResizingActive = false;
		this._resizingData = null;
	}

	/**
	 * Handles the `mousemove` event if previously the `mousedown` event was triggered from the column resizer element.
	 *
	 * @private
	 * @param {module:utils/eventinfo~EventInfo} eventInfo
	 * @param {module:engine/view/observer/domeventdata~DomEventData} domEventData
	 */
	_onMouseMoveHandler( eventInfo, domEventData ) {
		const editor = this.editor;
		const editingView = editor.editing.view;

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
				isLtrContent,
				isTableCentered
			},
			widths: {
				viewFigureParentWidth,
				tableWidth,
				leftColumnWidth,
				rightColumnWidth
			},
			elements: {
				viewFigure,
				viewLeftColumn,
				viewRightColumn
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

		editingView.change( writer => {
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
	 * Retrieves and returns required data needed to correctly calculate the widths of the resized columns.
	 *
	 * @private
	 * @param {module:engine/view/observer/domeventdata~DomEventData} domEventData
	 * @returns {Object}
	 */
	_getResizingData( domEventData ) {
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
		const tableWidth = getTableWidthInPixels( modelTable, editor );
		const columnWidths = getColumnWidthsInPixels( modelTable, editor );
		const leftColumnWidth = columnWidths[ leftColumnIndex ];
		const rightColumnWidth = isRightEdge ? undefined : columnWidths[ leftColumnIndex + 1 ];

		return {
			columnPosition,
			elements: {
				modelTable,
				viewFigure,
				viewColgroup,
				viewLeftColumn,
				viewRightColumn,
				viewResizer
			},
			widths: {
				viewFigureParentWidth,
				tableWidth,
				leftColumnWidth,
				rightColumnWidth
			},
			flags: {
				isRightEdge,
				isTableCentered,
				isLtrContent
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
	 * Registers a handler on 'render' to properly insert/remove resizers after all postfixers finished their job.
	 *
	 * @private
	 */
	_registerResizerInserter() {
		const editor = this.editor;
		const view = editor.editing.view;
		const cellsModified = this._cellsModified;

		view.on( 'render', () => {
			for ( const [ cell, operation ] of cellsModified.entries() ) {
				const viewCell = editor.editing.mapper.toViewElement( cell );

				view.change( viewWriter => {
					if ( operation === 'insert' ) {
						insertColumnResizerElements( viewWriter, viewCell );
					} else if ( operation === 'remove' ) {
						removeColumnResizerElements( viewWriter, viewCell );
					}
				} );
			}
			cellsModified.clear();
		}, { priority: 'lowest' } );
	}
}
