/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tablecelltype/tablecelltypeediting
 */

import { type Editor, Plugin } from 'ckeditor5/src/core.js';
import type { UpcastElementEvent, Model, EditingController, ModelElement } from 'ckeditor5/src/engine.js';

import { TableEditing } from '../tableediting.js';
import { TableCellTypeCommand } from './commands/tablecelltypecommand.js';
import { TableWalker } from '../tablewalker.js';
import { TableUtils } from '../tableutils.js';
import { groupCellsByTable } from './utils.js';

/**
 * The table cell type editing feature.
 *
 * Introduces the `tableCellType` model attribute that switches between `<td>` and `<th>` elements.
 * Also registers the `'tableCellType'` command to manipulate this attribute.
 */
export class TableCellTypeEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'TableCellTypeEditing' as const;
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
		return [ TableEditing ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const { editor } = this;
		const { model, config, editing } = editor;

		if ( !config.get( 'experimentalFlags.tableCellTypeSupport' ) ) {
			return;
		}

		this._defineSchema();
		this._defineConversion();

		registerHeadingAttributeChangePostfixer( model );
		registerAutoIncrementHeadingPostfixer( editor );
		registerInsertedCellTypePostfixer( model );

		registerTableCellTypeReconversionHandler( model, editing );

		editor.commands.add( 'tableCellType', new TableCellTypeCommand( editor ) );
	}

	/**
	 * Defines the schema for the `tableCellType` attribute.
	 */
	private _defineSchema() {
		const { schema } = this.editor.model;

		schema.extend( 'tableCell', {
			allowAttributes: [ 'tableCellType' ]
		} );

		schema.setAttributeProperties( 'tableCellType', {
			isFormatting: true
		} );
	}

	/**
	 * Defines the conversion for the `tableCellType` attribute.
	 */
	private _defineConversion() {
		const { conversion } = this.editor;

		// Upcast conversion for td/th elements.
		conversion.for( 'upcast' ).add( dispatcher => dispatcher.on<UpcastElementEvent>( 'element:th', ( evt, data, conversionApi ) => {
			const { writer } = conversionApi;
			const { modelRange } = data;
			const modelElement = modelRange?.start.nodeAfter;

			if ( modelElement?.is( 'element', 'tableCell' ) ) {
				writer.setAttribute( 'tableCellType', 'header', modelElement );
			}
		} ) );
	}
}

/**
 * Registers a postfixer that synchronizes `tableCellType` attribute with heading section boundaries.
 *
 * When `headingRows` or `headingColumns` attributes change on a table, this postfixer:
 * - Updates cell types for cells entering the heading section (always changes to 'header').
 * - Updates cell types for cells leaving the heading section (changes to 'data' only if all
 *   leaving cells were 'header', otherwise preserves current type to respect manual changes).
 *
 * This ensures that cell types stay in sync with the structural heading boundaries while
 * respecting user's manual modifications to cell types.
 *
 * @param model The editor model.
 */
function registerHeadingAttributeChangePostfixer( model: Model ): void {
	model.document.registerPostFixer( writer => {
		let changed = false;

		for ( const change of model.document.differ.getChanges() ) {
			if ( change.type !== 'attribute' || change.range.root.rootName === '$graveyard' ) {
				continue;
			}

			const table = change.range.start.nodeAfter;

			if ( !table?.is( 'element', 'table' ) ) {
				continue;
			}

			const attributeKey = change.attributeKey;

			if ( attributeKey !== 'headingRows' && attributeKey !== 'headingColumns' ) {
				continue;
			}

			const oldValue = change.attributeOldValue as number || 0;
			const newValue = change.attributeNewValue as number || 0;

			// If if heading rows attribute changed, get the columns rows limit and vice versa.
			const otherHeadingLimit = table.getAttribute(
				attributeKey === 'headingRows' ? 'headingColumns' : 'headingRows'
			) as number || 0;

			// Range of rows/columns that are changing status.
			const start = Math.min( oldValue, newValue );
			const end = Math.max( oldValue, newValue );
			const isExpanding = newValue > oldValue;

			const walkerOptions = attributeKey === 'headingRows' ?
				{ startRow: start, endRow: end - 1, startColumn: otherHeadingLimit } :
				{ startColumn: start, endColumn: end - 1, startRow: otherHeadingLimit };

			if ( walkerOptions.startRow >= table.childCount ) {
				continue;
			}

			// If shrinking, we need to decide whether to convert cells back to 'data'.
			// We only convert back to 'data' if ALL cells in the leaving range were 'header'.
			// If the user manually changed some to 'data' (mixed content), we preserve the state.
			let shouldDropCellTypeAttribute = false;

			if ( !isExpanding ) {
				let allLeavingCellsAreHeaders = true;

				for ( const { cell } of new TableWalker( table, walkerOptions ) ) {
					const cellType = cell.getAttribute( 'tableCellType' );

					if ( cellType !== 'header' ) {
						allLeavingCellsAreHeaders = false;
						break;
					}
				}

				shouldDropCellTypeAttribute = allLeavingCellsAreHeaders;
			}

			// No need to change anything if we're shrinking but not dropping cell type attributes.
			if ( !isExpanding && !shouldDropCellTypeAttribute ) {
				continue;
			}

			// Apply changes.
			for ( const { cell } of new TableWalker( table, walkerOptions ) ) {
				if ( isExpanding ) {
					// Entering heading section -> always 'header'.
					if ( !cell.hasAttribute( 'tableCellType' ) ) {
						writer.setAttribute( 'tableCellType', 'header', cell );
						changed = true;
					}
				} else if ( shouldDropCellTypeAttribute ) {
					// Leaving heading section and safe remove attribute.
					if ( cell.hasAttribute( 'tableCellType' ) ) {
						writer.removeAttribute( 'tableCellType', cell );
						changed = true;
					}
				}
			}
		}

		return changed;
	} );
}

/**
 * Registers a postfixer that automatically expands heading section when adjacent rows/columns contain only headers.
 *
 * When `headingRows` or `headingColumns` increase (e.g., via table header commands), this postfixer
 * checks if the immediately following rows/columns consist entirely of header cells. If so, it
 * automatically increments the heading attribute to include those rows/columns.
 *
 * This creates intuitive behavior where manually changing multiple cells to 'header' and then
 * toggling the heading section will include all consecutive header rows/columns.
 *
 * @param editor The editor instance.
 */
function registerAutoIncrementHeadingPostfixer( editor: Editor ): void {
	const { model } = editor;
	const tableUtils = editor.plugins.get( TableUtils );

	model.document.registerPostFixer( writer => {
		let changed = false;

		for ( const change of model.document.differ.getChanges() ) {
			if ( change.type !== 'attribute' || change.range.root.rootName === '$graveyard' ) {
				continue;
			}

			const table = change.range.start.nodeAfter;

			if ( !table?.is( 'element', 'table' ) ) {
				continue;
			}

			const attributeKey = change.attributeKey;

			if ( attributeKey !== 'headingRows' && attributeKey !== 'headingColumns' ) {
				continue;
			}

			const oldValue = change.attributeOldValue as number || 0;
			const newValue = change.attributeNewValue as number || 0;

			// Only trigger on increase.
			if ( newValue <= oldValue ) {
				continue;
			}

			const isRow = attributeKey === 'headingRows';
			const maxDimension = isRow ? tableUtils.getRows( table ) : tableUtils.getColumns( table );

			// Check consecutive rows/columns.
			let currentValue = newValue;

			while ( currentValue < maxDimension ) {
				let hasCells = false;
				let allHeaders = true;

				// Check the row/column at `currentValue`.
				const walkerOptions = isRow ? { row: currentValue } : { column: currentValue };

				for ( const { cell } of new TableWalker( table, walkerOptions ) ) {
					const cellType = cell.getAttribute( 'tableCellType' );

					hasCells = true;

					if ( cellType !== 'header' ) {
						allHeaders = false;
						break;
					}
				}

				// If we found a row/column and it's all headers, increment and continue.
				if ( hasCells && allHeaders ) {
					currentValue++;
					writer.setAttribute( attributeKey, currentValue, table );
					changed = true;
				} else {
					break;
				}
			}
		}

		return changed;
	} );
}

/**
 * Registers a postfixer that ensures newly added table cells have the correct `tableCellType` attribute
 * based on the table's `headingRows` and `headingColumns` attributes.
 *
 * @param model The editor model.
 */
function registerInsertedCellTypePostfixer( model: Model ): void {
	model.document.registerPostFixer( writer => {
		const addedCells = new Set<ModelElement>();

		for ( const change of model.document.differ.getChanges() ) {
			if ( change.type !== 'insert' || change.name === '$text' || !change.position.nodeAfter ) {
				continue;
			}

			for ( const { item } of model.createRangeOn( change.position.nodeAfter ) ) {
				if ( item.is( 'element', 'tableCell' ) ) {
					addedCells.add( item );
				}
			}
		}

		if ( !addedCells.size ) {
			return false;
		}

		const cellsByTable = groupCellsByTable( Array.from( addedCells ) );
		let changed = false;

		for ( const [ table, cells ] of cellsByTable ) {
			const headingRows = table.getAttribute( 'headingRows' ) as number || 0;
			const headingColumns = table.getAttribute( 'headingColumns' ) as number || 0;

			if ( !headingRows && !headingColumns ) {
				continue;
			}

			const cellsSet = new Set( cells );
			const rowIndices = cells.map( cell => ( cell.parent as ModelElement ).index! );
			const startRow = Math.min( ...rowIndices );
			const endRow = Math.max( ...rowIndices );

			for ( const { cell, row, column } of new TableWalker( table, { startRow, endRow } ) ) {
				if ( !cellsSet.has( cell ) ) {
					continue;
				}

				const shouldBeHeader = row < headingRows || column < headingColumns;
				const currentType = cell.getAttribute( 'tableCellType' );

				if ( shouldBeHeader && currentType !== 'header' ) {
					writer.setAttribute( 'tableCellType', 'header', cell );
					changed = true;
				}

				cellsSet.delete( cell );

				if ( !cellsSet.size ) {
					break;
				}
			}
		}

		return changed;
	} );
}

/**
 * Registers a handler that forces reconversion of table cells when their `tableCellType` attribute changes.
 * This is necessary because changing from `<td>` to `<th>` (or vice versa) requires rebuilding the element.
 *
 * @param model The editor model.
 * @param editing The editing controller.
 */
function registerTableCellTypeReconversionHandler( model: Model, editing: EditingController ): void {
	model.document.on( 'change:data', () => {
		const cellsToReconvert: Set<ModelElement> = new Set();
		const { differ } = model.document;

		for ( const change of differ.getChanges() ) {
			// Only process attribute changes.
			if ( change.type !== 'attribute' || change.attributeKey !== 'tableCellType' ) {
				continue;
			}

			// Get the table cell element and get the view element for this table cell.
			const tableCell = change.range.start.nodeAfter as ModelElement;
			const viewElement = editing.mapper.toViewElement( tableCell )!;

			// Determine the expected element name based on the new attribute value.
			const cellType = tableCell.getAttribute( 'tableCellType' );
			const expectedElementName = cellType === 'header' ? 'th' : 'td';

			// Only reconvert if the element name actually needs to change.
			if ( viewElement?.name !== expectedElementName ) {
				cellsToReconvert.add( tableCell );
			}
		}

		for ( const cell of cellsToReconvert ) {
			editing.reconvertItem( cell );
		}
	} );
}
