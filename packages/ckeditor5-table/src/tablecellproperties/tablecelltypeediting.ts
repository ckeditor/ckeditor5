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

		this._addTableCellTypePostfixer();
		this._addInsertedTableCellTypePostfixer();
		this._addTableCellTypeReconversionHandler();
	}

	/**
	 * Adds a postfixer that updates `tableCellType` attribute when `headingRows` or `headingColumns` attributes change
	 * on a table and ensures proper synchronization between cell types and heading section boundaries.
	 */
	private _addTableCellTypePostfixer(): void {
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
				let headingRows = element.getAttribute( 'headingRows' ) as number || 0;
				let headingColumns = element.getAttribute( 'headingColumns' ) as number || 0;

				// Check if all cells leaving the heading section still have the 'header' type.
				// This prevents unwanted type changes when the user manually changed some cells to 'data'.
				let allLeavingCellsWereHeaders = true;

				for ( const { cell, row, column } of new TableWalker( element ) ) {
					let wasInHeadingSection;

					if ( change.attributeKey === 'headingRows' ) {
						wasInHeadingSection = row < oldValue || column < headingColumns;
					} else {
						wasInHeadingSection = row < headingRows || column < oldValue;
					}

					const isInHeadingSection = row < headingRows || column < headingColumns;

					// Check only cells that are leaving the heading section.
					if ( wasInHeadingSection && !isInHeadingSection ) {
						const currentCellType = cell.getAttribute( 'tableCellType' );

						if ( currentCellType !== 'header' ) {
							allLeavingCellsWereHeaders = false;
							break;
						}
					}
				}

				// Update cell types based on whether they're entering or leaving the heading section.
				for ( const { cell, row, column } of new TableWalker( element ) ) {
					let wasInHeadingSection;

					if ( change.attributeKey === 'headingRows' ) {
						wasInHeadingSection = row < oldValue || column < headingColumns;
					} else {
						wasInHeadingSection = row < headingRows || column < oldValue;
					}

					const isInHeadingSection = row < headingRows || column < headingColumns;

					// Only update cells whose heading section status actually changed.
					if ( wasInHeadingSection !== isInHeadingSection ) {
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

				// Auto-increment headingRows if next rows contain only header cells.
				if ( change.attributeKey === 'headingRows' && headingRows > oldValue ) {
					const tableWalker = new TableWalker( element );
					const rowCount = Array.from( tableWalker ).reduce( ( max, { row } ) => Math.max( max, row + 1 ), 0 );

					while ( headingRows < rowCount ) {
						let allHeadersInRow = true;

						for ( const { cell, row } of new TableWalker( element, { row: headingRows } ) ) {
							if ( row !== headingRows ) {
								continue;
							}

							const cellType = cell.getAttribute( 'tableCellType' ) || 'data';

							if ( cellType !== 'header' ) {
								allHeadersInRow = false;
								break;
							}
						}

						if ( allHeadersInRow ) {
							headingRows++;
							writer.setAttribute( 'headingRows', headingRows, element );
							changed = true;
						} else {
							break;
						}
					}
				}

				// Auto-increment headingColumns if next columns contain only header cells.
				if ( change.attributeKey === 'headingColumns' && headingColumns > oldValue ) {
					const tableWalker = new TableWalker( element );
					const columnCount = Array.from( tableWalker ).reduce( ( max, { column } ) => Math.max( max, column + 1 ), 0 );

					while ( headingColumns < columnCount ) {
						let allHeadersInColumn = true;

						for ( const { cell, column } of new TableWalker( element, { column: headingColumns } ) ) {
							if ( column !== headingColumns ) {
								continue;
							}

							const cellType = cell.getAttribute( 'tableCellType' ) || 'data';

							if ( cellType !== 'header' ) {
								allHeadersInColumn = false;
								break;
							}
						}

						if ( allHeadersInColumn ) {
							headingColumns++;
							writer.setAttribute( 'headingColumns', headingColumns, element );
							changed = true;
						} else {
							break;
						}
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
			let changed = false;

			for ( const change of model.document.differ.getChanges() ) {
				// Check if something was inserted.
				if ( change.type !== 'insert' || change.name === '$text' || change.position.root.rootName === '$graveyard' ) {
					continue;
				}

				if ( !change.position.nodeAfter ) {
					continue;
				}

				// Create a range over the inserted element to find all tableCell elements within.
				const range = model.createRangeOn( change.position.nodeAfter );

				for ( const item of range.getItems() ) {
					if ( !item.is( 'element', 'tableCell' ) ) {
						continue;
					}

					// Check if the tableCell already has tableCellType attribute.
					if ( item.hasAttribute( 'tableCellType' ) ) {
						continue;
					}

					// Find the parent table to determine heading rows and columns.
					const table = item.findAncestor( 'table' );

					if ( !table ) {
						continue;
					}

					const headingRows = table.getAttribute( 'headingRows' ) as number || 0;
					const headingColumns = table.getAttribute( 'headingColumns' ) as number || 0;

					// Determine the position of the cell in the table.
					const tableWalker = new TableWalker( table );
					let cellRow = 0;
					let cellColumn = 0;

					for ( const { cell, row, column } of tableWalker ) {
						if ( cell === item ) {
							cellRow = row;
							cellColumn = column;
							break;
						}
					}

					// Determine the cell type based on its position.
					const cellType = ( cellRow < headingRows || cellColumn < headingColumns ) ? 'header' : 'data';

					writer.setAttribute( 'tableCellType', cellType, item );
					changed = true;
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
