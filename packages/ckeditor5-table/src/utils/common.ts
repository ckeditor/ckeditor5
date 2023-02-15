/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/utils/common
 */

import type {
	Conversion,
	Element,
	Item,
	Position,
	Schema,
	Writer
} from 'ckeditor5/src/engine';

import { downcastAttributeToStyle, upcastStyleToAttribute } from './../converters/tableproperties';
import type TableUtils from '../tableutils';

/**
 * A common method to update the numeric value. If a value is the default one, it will be unset.
 *
 * @param key An attribute key.
 * @param value The new attribute value.
 * @param item A model item on which the attribute will be set.
 * @param defaultValue The default attribute value. If a value is lower or equal, it will be unset.
 */
export function updateNumericAttribute( key: string, value: unknown, item: Item, writer: Writer, defaultValue: unknown = 1 ): void {
	if ( value !== undefined && value !== null && defaultValue !== undefined && defaultValue !== null && value > defaultValue ) {
		writer.setAttribute( key, value, item );
	} else {
		writer.removeAttribute( key, item );
	}
}

/**
 * A common method to create an empty table cell. It creates a proper model structure as a table cell must have at least one block inside.
 *
 * @param writer The model writer.
 * @param insertPosition The position at which the table cell should be inserted.
 * @param attributes The element attributes.
 * @returns Created table cell.
 */
export function createEmptyTableCell( writer: Writer, insertPosition: Position, attributes: Record<string, unknown> = {} ): Element {
	const tableCell = writer.createElement( 'tableCell', attributes );

	writer.insertElement( 'paragraph', tableCell );
	writer.insert( tableCell, insertPosition );

	return tableCell;
}

/**
 * Checks if a table cell belongs to the heading column section.
 */
export function isHeadingColumnCell( tableUtils: TableUtils, tableCell: Element ): boolean {
	const table = tableCell.parent!.parent as Element;
	const headingColumns = parseInt( table.getAttribute( 'headingColumns' ) as string || '0' );
	const { column } = tableUtils.getCellLocation( tableCell );

	return !!headingColumns && column < headingColumns;
}

/**
 * Enables conversion for an attribute for simple view-model mappings.
 *
 * @param options.defaultValue The default value for the specified `modelAttribute`.
 */
export function enableProperty(
	schema: Schema,
	conversion: Conversion,
	options: {
		modelAttribute: string;
		styleName: string;
		defaultValue: string;
		reduceBoxSides?: boolean;
	}
): void {
	const { modelAttribute } = options;

	schema.extend( 'tableCell', {
		allowAttributes: [ modelAttribute ]
	} );

	upcastStyleToAttribute( conversion, { viewElement: /^(td|th)$/, ...options } );
	downcastAttributeToStyle( conversion, { modelElement: 'tableCell', ...options } );
}
