/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tablecolumnresize/converters
 */

import type {
	DowncastDispatcher,
	DowncastInsertEvent,
	Element,
	UpcastDispatcher,
	UpcastElementEvent,
	ViewElement
} from 'ckeditor5/src/engine.js';
import type TableUtils from '../tableutils.js';
import {
	normalizeColumnWidths,
	updateColumnElements,
	getColumnGroupElement,
	getTableColumnElements,
	translateColSpanAttribute
} from './utils.js';

/**
 * Returns a upcast helper that ensures the number of `<tableColumn>` elements corresponds to the actual number of columns in the table,
 * because the input data might have too few or too many <col> elements.
 */
export function upcastColgroupElement( tableUtilsPlugin: TableUtils ): ( dispatcher: UpcastDispatcher ) => void {
	return dispatcher => dispatcher.on<UpcastElementEvent>( 'element:colgroup', ( evt, data, conversionApi ) => {
		const modelTable = data.modelCursor.findAncestor( 'table' )!;
		const tableColumnGroup = getColumnGroupElement( modelTable );

		if ( !tableColumnGroup ) {
			return;
		}

		const columnElements = getTableColumnElements( tableColumnGroup );
		const columnsCount = tableUtilsPlugin.getColumns( modelTable );
		let columnWidths = translateColSpanAttribute( tableColumnGroup, conversionApi.writer );

		// Fill the array with 'auto' values if the number of columns is higher than number of declared values.
		columnWidths = Array.from( { length: columnsCount }, ( _, index ) => columnWidths[ index ] || 'auto' );

		if ( columnWidths.length != columnElements.length || columnWidths.includes( 'auto' ) ) {
			updateColumnElements( columnElements, tableColumnGroup, normalizeColumnWidths( columnWidths ), conversionApi.writer );
		}
	}, { priority: 'low' } );
}

/**
 * Returns downcast helper for adding `ck-table-resized` class if there is a `<tableColumnGroup>` element inside the table.
 */
export function downcastTableResizedClass(): ( dispatcher: DowncastDispatcher ) => void {
	return dispatcher => dispatcher.on<DowncastInsertEvent>( 'insert:table', ( evt, data, conversionApi ) => {
		const viewWriter = conversionApi.writer;
		const modelTable = data.item as Element;
		const viewElement: ViewElement = conversionApi.mapper.toViewElement( modelTable )!;

		const viewTable = viewElement.is( 'element', 'table' ) ?
			viewElement :
			Array.from( viewElement.getChildren() ).find( viewChild => viewChild.is( 'element', 'table' ) )!;

		const tableColumnGroup = getColumnGroupElement( modelTable );

		if ( tableColumnGroup ) {
			viewWriter.addClass( 'ck-table-resized', viewTable as ViewElement );
		} else {
			viewWriter.removeClass( 'ck-table-resized', viewTable as ViewElement );
		}
	}, { priority: 'low' } );
}
