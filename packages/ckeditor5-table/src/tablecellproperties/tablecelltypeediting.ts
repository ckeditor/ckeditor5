/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tablecellproperties/tablecelltypeediting
 */

import { Plugin } from 'ckeditor5/src/core.js';
import type { UpcastElementEvent } from 'ckeditor5/src/engine.js';

import { TableEditing } from '../tableediting.js';
import { TableCellTypeCommand } from './commands/tablecelltypecommand.js';
import { TableWalker } from '../tablewalker.js';

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
		const editor = this.editor;
		const { conversion, model } = editor;
		const { schema } = model;

		schema.extend( 'tableCell', {
			allowAttributes: [ 'tableCellType' ]
		} );

		schema.setAttributeProperties( 'tableCellType', {
			isFormatting: true
		} );

		// Upcast conversion for td/th elements.
		conversion.for( 'upcast' ).add( dispatcher => dispatcher.on<UpcastElementEvent>( 'element', ( evt, data, conversionApi ) => {
			const { writer } = conversionApi;
			const { viewItem, modelRange } = data;

			if ( !viewItem.is( 'element', 'td' ) && !viewItem.is( 'element', 'th' ) ) {
				return;
			}

			const modelElement = modelRange?.start.nodeAfter;

			if ( modelElement && modelElement.is( 'element', 'tableCell' ) ) {
				const cellType = viewItem.name === 'th' ? 'header' : 'data';

				writer.setAttribute( 'tableCellType', cellType, modelElement );
			}
		} ) );

		// Set tableCellType based on headingRows/headingColumns during upcast.
		conversion.for( 'upcast' ).add( dispatcher => dispatcher.on<UpcastElementEvent>( 'element:table', ( evt, data, conversionApi ) => {
			const { writer } = conversionApi;
			const { modelRange } = data;

			const table = modelRange?.start?.nodeAfter;

			if ( !table?.is( 'element', 'table' ) ) {
				return;
			}

			const headingRows = table.getAttribute( 'headingRows' ) as number;
			const headingColumns = table.getAttribute( 'headingColumns' ) as number || 0;

			if ( headingRows + headingColumns === 0 ) {
				return;
			}

			for ( const { cell, row, column } of new TableWalker( table ) ) {
				if ( row < headingRows || column < headingColumns ) {
					writer.setAttribute( 'tableCellType', 'header', cell );
				}
			}
		} ) );

		editor.commands.add( 'tableCellType', new TableCellTypeCommand( editor ) );

		this._addHeadingAttributeChangePostfixer();
		this._addAutoIncrementHeadingPostfixer();
		this._addInsertedTableCellTypePostfixer();
		this._addTableCellTypeReconversionHandler();
	}

	/**
	 * Adds a postfixer that synchronizes `tableCellType` attribute with heading section boundaries.
	 *
	 * When `headingRows` or `headingColumns` attributes change on a table, this postfixer:
	 * - Updates cell types for cells entering the heading section (always changes to 'header')
	 * - Updates cell types for cells leaving the heading section (changes to 'data' only if all
	 *   leaving cells were 'header', otherwise preserves current type to respect manual changes)
	 *
	 * This ensures that cell types stay in sync with the structural heading boundaries while
	 * respecting user's manual modifications to cell types.
	 */
	private _addHeadingAttributeChangePostfixer(): void {
		const model = this.editor.model;

		model.document.registerPostFixer( writer => {
			let changed = false;

			for ( const change of model.document.differ.getChanges() ) {
				// Check if headingRows or headingColumns attribute changed on a table.
				if ( change.type !== 'attribute' || change.range.root.rootName === '$graveyard' ) {
					continue;
				}

				const element = change.range.start.nodeAfter;

				if ( !element?.is( 'element', 'table' ) ) {
					continue;
				}

				if ( change.attributeKey !== 'headingRows' && change.attributeKey !== 'headingColumns' ) {
					continue;
				}

				const oldValue = change.attributeOldValue as number || 0;
				const headingRows = element.getAttribute( 'headingRows' ) as number || 0;
				const headingColumns = element.getAttribute( 'headingColumns' ) as number || 0;

				// Helper function to determine if a cell was in the heading section before the change.
				const wasInHeadingSection = ( row: number, column: number ): boolean => {
					if ( change.attributeKey === 'headingRows' ) {
						return row < oldValue || column < headingColumns;
					} else {
						return row < headingRows || column < oldValue;
					}
				};

				// Check if all cells leaving the heading section still have the 'header' type.
				// This prevents unwanted type changes when the user manually changed some cells to 'data'.
				let allLeavingCellsWereHeaders = true;

				for ( const { cell, row, column } of new TableWalker( element ) ) {
					const isInHeadingSection = row < headingRows || column < headingColumns;

					// Check only cells that are leaving the heading section.
					if ( wasInHeadingSection( row, column ) && !isInHeadingSection ) {
						const currentCellType = cell.getAttribute( 'tableCellType' );

						if ( currentCellType !== 'header' ) {
							allLeavingCellsWereHeaders = false;
							break;
						}
					}
				}

				// Update cell types based on whether they're entering or leaving the heading section.
				for ( const { cell, row, column } of new TableWalker( element ) ) {
					const isInHeadingSection = row < headingRows || column < headingColumns;

					// Only update cells whose heading section status actually changed.
					if ( wasInHeadingSection( row, column ) !== isInHeadingSection ) {
						const currentCellType = cell.getAttribute( 'tableCellType' );
						let expectedCellType;

						if ( isInHeadingSection ) {
							// Cell is entering heading section - always change to 'header'.
							expectedCellType = 'header';
						} else {
							// Cell is leaving heading section.
							// Only change to 'data' if ALL leaving cells were 'header' (no manual changes by user).
							// Otherwise preserve the current type to respect user's manual modifications.
							expectedCellType = allLeavingCellsWereHeaders ? 'data' : currentCellType;
						}

						if ( currentCellType !== expectedCellType ) {
							writer.setAttribute( 'tableCellType', expectedCellType, cell );
							changed = true;
						}
					}
				}
			}

			return changed;
		} );
	}

	/**
	 * Adds a postfixer that automatically expands heading section when adjacent rows/columns contain only headers.
	 *
	 * When `headingRows` or `headingColumns` increase (e.g., via table header commands), this postfixer
	 * checks if the immediately following rows/columns consist entirely of header cells. If so, it
	 * automatically increments the heading attribute to include those rows/columns.
	 *
	 * This creates intuitive behavior where manually changing multiple cells to 'header' and then
	 * toggling the heading section will include all consecutive header rows/columns.
	 */
	private _addAutoIncrementHeadingPostfixer(): void {
		const model = this.editor.model;

		model.document.registerPostFixer( writer => {
			let changed = false;

			for ( const change of model.document.differ.getChanges() ) {
				// Check if headingRows or headingColumns attribute changed on a table.
				if ( change.type !== 'attribute' || change.range.root.rootName === '$graveyard' ) {
					continue;
				}

				const element = change.range.start.nodeAfter;

				if ( !element?.is( 'element', 'table' ) ) {
					continue;
				}

				if ( change.attributeKey !== 'headingRows' && change.attributeKey !== 'headingColumns' ) {
					continue;
				}

				const oldValue = change.attributeOldValue as number || 0;
				const newValue = element.getAttribute( change.attributeKey ) as number || 0;

				if ( newValue <= oldValue ) {
					continue;
				}

				const isRow = change.attributeKey === 'headingRows';
				let currentValue = newValue;

				// Calculate the limit (row count or column count).
				const tableWalker = new TableWalker( element );
				const limit = Array.from( tableWalker )
					.reduce( ( max, { row, column } ) => Math.max( max, ( isRow ? row : column ) + 1 ), 0 );

				while ( currentValue < limit ) {
					let allHeaders = true;

					const walkerOptions = isRow ? { row: currentValue } : { column: currentValue };

					for ( const { cell, row, column } of new TableWalker( element, walkerOptions ) ) {
						const currentDimension = isRow ? row : column;

						if ( currentDimension !== currentValue ) {
							continue;
						}

						const cellType = cell.getAttribute( 'tableCellType' ) || 'data';

						if ( cellType !== 'header' ) {
							allHeaders = false;
							break;
						}
					}

					if ( allHeaders ) {
						currentValue++;
						writer.setAttribute( change.attributeKey, currentValue, element );
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
	 * Adds a postfixer that ensures newly inserted `tableCell` elements have the `tableCellType` attribute set.
	 */
	private _addInsertedTableCellTypePostfixer(): void {
		const model = this.editor.model;

		model.document.registerPostFixer( writer => {
			const tablesToUpdate = new Set<any>();

			for ( const change of model.document.differ.getChanges() ) {
				// Check if something was inserted.
				if ( change.type !== 'insert' || change.name === '$text' || change.position.root.rootName === '$graveyard' ) {
					continue;
				}

				const node = change.position.nodeAfter;

				if ( !node ) {
					continue;
				}

				// Check if the inserted node is a table or is inside a table.
				if ( node.is( 'element', 'table' ) ) {
					tablesToUpdate.add( node );
				} else {
					const table = ( node as any ).findAncestor( 'table' );

					if ( table ) {
						// Check if the inserted range contains any table cells.
						const range = model.createRangeOn( node );

						for ( const item of range.getItems() ) {
							if ( item.is( 'element', 'tableCell' ) ) {
								tablesToUpdate.add( table );
								break;
							}
						}
					}
				}
			}

			let changed = false;

			for ( const table of tablesToUpdate ) {
				const headingRows = table.getAttribute( 'headingRows' ) as number || 0;
				const headingColumns = table.getAttribute( 'headingColumns' ) as number || 0;

				for ( const { cell, row, column } of new TableWalker( table ) ) {
					if ( !cell.hasAttribute( 'tableCellType' ) ) {
						const cellType = ( row < headingRows || column < headingColumns ) ? 'header' : 'data';

						writer.setAttribute( 'tableCellType', cellType, cell );
						changed = true;
					}
				}
			}

			return changed;
		} );
	}

	/**
	 * Adds a handler that forces reconversion of table cells when their `tableCellType` attribute changes.
	 * This is necessary because changing from `<td>` to `<th>` (or vice versa) requires rebuilding the element.
	 */
	private _addTableCellTypeReconversionHandler(): void {
		const model = this.editor.model;
		const editing = this.editor.editing;

		model.document.on( 'change:data', () => {
			const differ = model.document.differ;

			for ( const change of differ.getChanges() ) {
				// Only process attribute changes.
				if ( change.type !== 'attribute' ) {
					continue;
				}

				// Check if tableCellType attribute changed.
				if ( change.attributeKey !== 'tableCellType' ) {
					continue;
				}

				// Get the table cell element.
				const tableCell = change.range.start.nodeAfter;

				if ( !tableCell || !tableCell.is( 'element', 'tableCell' ) ) {
					continue;
				}

				// Get the view element for this table cell.
				const viewElement = editing.mapper.toViewElement( tableCell );

				if ( !viewElement || !viewElement.is( 'element' ) ) {
					continue;
				}

				// Determine the expected element name based on the new attribute value.
				const cellType = tableCell.getAttribute( 'tableCellType' );
				const expectedElementName = cellType === 'header' ? 'th' : 'td';

				// Only reconvert if the element name actually needs to change.
				if ( viewElement.name !== expectedElementName ) {
					editing.reconvertItem( tableCell );
				}
			}
		} );
	}
}
