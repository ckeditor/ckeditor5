/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecolumnresize/converters
 */

import { normalizeColumnWidths, updateColumnElements } from './utils';

/**
 * Returns a upcast helper that ensures the number of `<tableColumn>` elements corresponds to the actual number of columns in the table,
 * because the input data might have too few or too many <col> elements.
 *
 * @param {module:core/plugin~Plugin} tableUtilsPlugin
 * @param {module:table/tablecolumnresize/tablecolumnresizeediting~TableColumnResizeEditing} resizePlugin
 * @returns {Function} Conversion helper.
 */
export function upcastColgroupElement( tableUtilsPlugin, resizePlugin ) {
	return dispatcher => dispatcher.on( 'element:colgroup', ( evt, data, conversionApi ) => {
		const modelTable = data.modelCursor.findAncestor( 'table' );
		const tableColumnGroup = resizePlugin.getColumnGroupElement( modelTable );

		if ( !tableColumnGroup ) {
			return;
		}

		const columnElements = resizePlugin.getTableColumnElements( tableColumnGroup );
		let columnWidths = resizePlugin.getTableColumnsWidths( tableColumnGroup );
		const columnsCount = tableUtilsPlugin.getColumns( modelTable );

		columnWidths = Array.from( { length: columnsCount }, ( _, index ) => columnWidths[ index ] || 'auto' );

		if ( columnWidths.length != columnElements.length || columnWidths.includes( 'auto' ) ) {
			updateColumnElements( columnElements, tableColumnGroup, normalizeColumnWidths( columnWidths ), conversionApi.writer );
		}
	}, { priority: 'low' } );
}

/**
 * Returns downcast helper for adding `ck-table-resized` class if there is a `<tableColumnGroup>` element inside the table.
 *
 * @param {module:table/tablecolumnresize/tablecolumnresizeediting~TableColumnResizeEditing} resizePlugin
 * @returns {Function} Conversion helper.
 */
export function downcastTableResizedClass( resizePlugin ) {
	return dispatcher => dispatcher.on( 'insert:table', ( evt, data, conversionApi ) => {
		const viewWriter = conversionApi.writer;
		const modelTable = data.item;
		const viewElement = conversionApi.mapper.toViewElement( modelTable );

		const viewTable = viewElement.is( 'element', 'table' ) ?
			viewElement :
			Array.from( viewElement.getChildren() ).find( viewChild => viewChild.is( 'element', 'table' ) );

		const tableColumnGroup = resizePlugin.getColumnGroupElement( data.item );

		if ( tableColumnGroup ) {
			viewWriter.addClass( 'ck-table-resized', viewTable );
		} else {
			viewWriter.removeClass( 'ck-table-resized', viewTable );
		}
	}, { priority: 'low' } );
}
