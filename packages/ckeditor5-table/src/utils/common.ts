/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/utils/common
 */

import type { Editor } from '@ckeditor/ckeditor5-core';
import {
	ModelDocumentSelection,
	type Conversion,
	type ModelElement,
	type ModelItem,
	type ModelPosition,
	type ModelSchema,
	type ModelWriter,
	type ViewElement
} from '@ckeditor/ckeditor5-engine';
import { _getCopyOnEnterAttributes } from '@ckeditor/ckeditor5-enter';

import { downcastAttributeToStyle, upcastStyleToAttribute } from '../converters/tableproperties.js';
import { type TableUtils } from '../tableutils.js';
import { TableWalker } from '../tablewalker.js';
import { isTableHeaderCellType, type TableCellType } from '../tablecellproperties/tablecellpropertiesutils.js';

/**
 * A common method to update the numeric value. If a value is the default one, it will be unset.
 *
 * @internal
 * @param key An attribute key.
 * @param value The new attribute value.
 * @param item A model item on which the attribute will be set.
 * @param defaultValue The default attribute value. If a value is lower or equal, it will be unset.
 */
export function updateNumericAttribute(
	key: string, value: unknown, item: ModelItem, writer: ModelWriter, defaultValue: unknown = 1
): void {
	if ( value !== undefined && value !== null && defaultValue !== undefined && defaultValue !== null && value > defaultValue ) {
		writer.setAttribute( key, value, item );
	} else {
		writer.removeAttribute( key, item );
	}
}

/**
 * A common method to create an empty table cell. It creates a proper model structure as a table cell must have at least one block inside.
 *
 * @internal
 * @param writer The model writer.
 * @param insertPosition The position at which the table cell should be inserted.
 * @param attributes The element attributes.
 * @param paragraphAttributes The attributes of the paragraph created inside the table cell.
 * @returns Created table cell.
 */
export function createEmptyTableCell(
	writer: ModelWriter,
	insertPosition: ModelPosition,
	attributes: Record<string, unknown> = {},
	paragraphAttributes: Record<string, unknown> = {}
): ModelElement {
	const tableCell = writer.createElement( 'tableCell', attributes );

	writer.insertElement( 'paragraph', paragraphAttributes, tableCell );
	writer.insert( tableCell, insertPosition );

	return tableCell;
}

/**
 * Attributes of a table cell created next to a reference table cell, inherited from that reference cell.
 *
 * @internal
 */
export interface InheritedTableCellAttributes {

	/**
	 * The formatting attributes of the table cell, for example, its border, background color, padding, or alignment.
	 */
	cellAttributes: Record<string, unknown>;

	/**
	 * The attributes of the paragraph in the table cell: its block formatting attributes (for example, alignment)
	 * and text formatting attributes stored as selection attributes, so typing in the empty paragraph continues them.
	 */
	paragraphAttributes: Record<string, unknown>;
}

/**
 * Table cell attributes that are never inherited from the reference table cell, as they describe the dimensions
 * of the table column and row.
 */
const NON_INHERITABLE_TABLE_CELL_ATTRIBUTES = new Set( [ 'tableCellWidth', 'tableCellHeight' ] );

/**
 * Returns attributes that a new table cell should inherit from the reference table cell (a neighboring cell,
 * for example, from the row or column the user inserted the new one next to):
 *
 * * Table cell formatting attributes (marked as `isFormatting` in the schema), for example, borders or background color.
 * * Block formatting attributes of the first block in the reference cell, for example, alignment.
 * * Text formatting attributes (marked as `copyOnEnter` in the schema) found at the start of the reference cell content.
 *   They are stored as selection attributes of the new paragraph so typing in the new cell continues the formatting.
 *
 * @internal
 * @param options.inheritCellType Whether the `tableCellType` attribute should be inherited. It depends on the position
 * of the cell in the table, so it should be inherited only by cells created in the same section as the reference cell,
 * for example, when splitting the reference cell.
 */
export function getInheritedTableCellAttributes(
	schema: ModelSchema,
	referenceCell: ModelElement,
	options: { inheritCellType?: boolean } = {}
): InheritedTableCellAttributes {
	const cellAttributes: Record<string, unknown> = {};
	const paragraphAttributes: Record<string, unknown> = {};

	for ( const [ key, value ] of referenceCell.getAttributes() ) {
		if (
			!NON_INHERITABLE_TABLE_CELL_ATTRIBUTES.has( key ) &&
			( key != 'tableCellType' || options.inheritCellType ) &&
			schema.getAttributeProperties( key ).isFormatting
		) {
			cellAttributes[ key ] = value;
		}
	}

	const firstBlock = referenceCell.getChild( 0 );

	if ( !firstBlock || !firstBlock.is( 'element' ) || !schema.checkChild( firstBlock, '$text' ) ) {
		return { cellAttributes, paragraphAttributes };
	}

	const paragraphContext = schema.createContext( referenceCell ).push( 'paragraph' );
	const textAttributes: Array<[ string, unknown ]> = [];

	for ( const [ key, value ] of firstBlock.getAttributes() ) {
		if ( ModelDocumentSelection._isStoreAttributeKey( key ) ) {
			// The reference cell is empty but has stored text formatting, for example, it was inserted just before.
			if ( firstBlock.isEmpty ) {
				textAttributes.push( [ ModelDocumentSelection._dropStoreAttributeKeyPrefix( key ), value ] );
			}
		} else if ( schema.getAttributeProperties( key ).isFormatting && schema.checkAttribute( paragraphContext, key ) ) {
			paragraphAttributes[ key ] = value;
		}
	}

	const firstTextNode = Array.from( firstBlock.getChildren() ).find( node => node.is( '$text' ) );

	if ( firstTextNode ) {
		textAttributes.push( ...firstTextNode.getAttributes() );
	}

	for ( const [ key, value ] of _getCopyOnEnterAttributes( schema, textAttributes ) ) {
		paragraphAttributes[ ModelDocumentSelection._getStoreAttributeKey( key ) ] = value;
	}

	return { cellAttributes, paragraphAttributes };
}

/**
 * Checks if a table cell belongs to the heading column section.
 *
 * @internal
 */
export function isHeadingColumnCell( tableUtils: TableUtils, tableCell: ModelElement ): boolean {
	const table = tableCell.parent!.parent as ModelElement;
	const headingColumns = parseInt( table.getAttribute( 'headingColumns' ) as string || '0' );
	const { column } = tableUtils.getCellLocation( tableCell );

	return !!headingColumns && column < headingColumns;
}

/**
 * Enables conversion for an attribute for simple view-model mappings.
 *
 * @internal
 * @param options.defaultValue The default value for the specified `modelAttribute`.
 */
export function enableProperty(
	schema: ModelSchema,
	conversion: Conversion,
	options: {
		modelAttribute: string;
		styleName: string;
		attributeName?: string;
		attributeType?: 'length' | 'color';
		defaultValue: string;
		reduceBoxSides?: boolean;
	}
): void {
	const { modelAttribute } = options;

	schema.extend( 'tableCell', {
		allowAttributes: [ modelAttribute ]
	} );

	schema.setAttributeProperties( modelAttribute, { isFormatting: true } );

	upcastStyleToAttribute( conversion, { viewElement: /^(td|th)$/, ...options } );
	downcastAttributeToStyle( conversion, { modelElement: 'tableCell', ...options } );
}

/**
 * Enables conversion for an attribute for simple view (figure) to model (table) mappings.
 *
 * @internal
 * @param options.defaultValue The default value for the specified `modelAttribute`.
 */
export function enableTableToFigureProperty(
	schema: ModelSchema,
	conversion: Conversion,
	options: {
		modelAttribute: string;
		styleName: string;
		attributeName?: string;
		attributeType?: 'length' | 'color';
		defaultValue: string;
	}
): void {
	const { modelAttribute } = options;

	schema.extend( 'table', {
		allowAttributes: [ modelAttribute ]
	} );

	schema.setAttributeProperties( modelAttribute, { isFormatting: true } );

	upcastStyleToAttribute( conversion, {
		viewElement: /^(table|figure)$/,
		shouldUpcast: ( viewElement: ViewElement ) => !(
			viewElement.name == 'table' && viewElement.parent!.name == 'figure' ||
			viewElement.name == 'figure' && !viewElement.hasClass( 'table' )
		),
		...options
	} );

	downcastAttributeToStyle( conversion, { modelElement: 'table', ...options } );
}

/**
 * Depending on the position of the selection we either return the table under cursor or look for the table higher in the hierarchy.
 *
 * @internal
 */
export function getSelectionAffectedTable( selection: ModelDocumentSelection ): ModelElement {
	const selectedElement = selection.getSelectedElement();

	// Is the command triggered from the `tableToolbar`?
	if ( selectedElement && selectedElement.is( 'element', 'table' ) ) {
		return selectedElement;
	}

	return selection.getFirstPosition()!.findAncestor( 'table' )!;
}

/**
 * Groups table cells by their parent table.
 *
 * @internal
 */
export function groupCellsByTable( tableCells: Array<ModelElement> ): Map<ModelElement, Array<ModelElement>> {
	const tableMap = new Map<ModelElement, Array<ModelElement>>();

	for ( const tableCell of tableCells ) {
		const table = tableCell.findAncestor( 'table' ) as ModelElement;

		if ( !tableMap.has( table ) ) {
			tableMap.set( table, [] );
		}

		tableMap.get( table )!.push( tableCell );
	}

	return tableMap;
}

/**
 * Checks if all cells in a given row or column are header cells.
 *
 * @internal
 */
export function isEntireCellsLineHeader(
	{
		table,
		row,
		column
	}: {
		table: ModelElement;
		row?: number;
		column?: number;
	}
): boolean {
	const tableWalker = new TableWalker( table, { row, column } );

	for ( const { cell } of tableWalker ) {
		const cellType = cell.getAttribute( 'tableCellType' ) as TableCellType;

		if ( !isTableHeaderCellType( cellType ) ) {
			return false;
		}
	}

	return true;
}

/**
 * Checks whether the `tableCellType` attribute is enabled in the editor schema and the experimental flag is set.
 *
 * @internal
 */
export function isTableCellTypeEnabled( editor: Editor ): boolean {
	return editor.model.schema.checkAttribute( 'tableCell', 'tableCellType' );
}

/**
 * Yields every empty block (typically a `paragraph`) found inside the given table's cells.
 *
 * @internal
 */
export function* getEmptyTableCellBlocks( table: ModelElement ): IterableIterator<ModelElement> {
	for ( const row of table.getChildren() ) {
		if ( !row.is( 'element', 'tableRow' ) ) {
			continue;
		}

		for ( const cell of row.getChildren() ) {
			if ( !cell.is( 'element', 'tableCell' ) ) {
				continue;
			}

			for ( const block of cell.getChildren() ) {
				if ( block.is( 'element' ) && block.isEmpty ) {
					yield block as ModelElement;
				}
			}
		}
	}
}
