/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecolumnresize/converters
 */

import { normalizeColumnWidths } from './utils';

/**
 * Returns a helper for converting a view `<colgroup>` and `<col>` elements to the model table `columnWidths` attribute.
 *
 * Only the inline width, provided as a percentage value, in the `<col>` element is taken into account. If there are not enough `<col>`
 * elements matching this condition, the special value `auto` is returned. It indicates that the width of a column will be automatically
 * calculated in the
 * {@link module:table/tablecolumnresize/tablecolumnresizeediting~TableColumnResizeEditing#_registerPostFixer post-fixer}, depending
 * on the available table space.
 *
 * @param {module:core/plugin~Plugin} tableUtilsPlugin The {@link module:table/tableutils~TableUtils} plugin instance.
 * @returns {Function} Conversion helper.
 */
export function upcastColgroupElement( tableUtilsPlugin ) {
	return dispatcher => dispatcher.on( 'element:colgroup', ( evt, data, conversionApi ) => {
		const viewColgroupElement = data.viewItem;

		if ( !conversionApi.consumable.test( viewColgroupElement, { name: true } ) ) {
			return;
		}

		conversionApi.consumable.consume( viewColgroupElement, { name: true } );

		const modelTable = data.modelCursor.findAncestor( 'table' );
		const numberOfColumns = tableUtilsPlugin.getColumns( modelTable );

		let columnWidths = [ ...Array( numberOfColumns ).keys() ]
			.map( columnIndex => {
				const viewChild = viewColgroupElement.getChild( columnIndex );

				if ( !viewChild || !viewChild.is( 'element', 'col' ) ) {
					return 'auto';
				}

				const viewColWidth = viewChild.getStyle( 'width' );

				if ( !viewColWidth || !viewColWidth.endsWith( '%' ) ) {
					return 'auto';
				}

				return viewColWidth;
			} );

		if ( columnWidths.includes( 'auto' ) ) {
			columnWidths = normalizeColumnWidths( columnWidths ).map( width => width + '%' );
		}

		conversionApi.writer.setAttribute( 'columnWidths', columnWidths.join( ',' ), modelTable );
	} );
}

/**
 * Returns a helper for converting a model table `columnWidths` attribute to view `<colgroup>` and `<col>` elements.
 *
 * @returns {Function} Conversion helper.
 */
export function downcastTableColumnWidthsAttribute() {
	return dispatcher => dispatcher.on( 'attribute:columnWidths:table', ( evt, data, conversionApi ) => {
		const viewWriter = conversionApi.writer;
		const modelTable = data.item;
		const viewElement = conversionApi.mapper.toViewElement( modelTable );

		const viewTable = viewElement.is( 'element', 'table' ) ?
			viewElement :
			Array.from( viewElement.getChildren() ).find( viewChild => viewChild.is( 'element', 'table' ) );

		if ( data.attributeNewValue ) {
			// If new value is the same as the old, the operation is not applied (see the `writer.setAttributeOnItem()`).
			// OTOH the model element has the attribute already applied, so we can't compare the values.
			// Hence we need to just recreate the <colgroup> element every time.
			insertColgroupElement( viewWriter, viewTable, data.attributeNewValue );
			viewWriter.addClass( 'ck-table-resized', viewTable );
		} else {
			removeColgroupElement( viewWriter, viewTable );
			viewWriter.removeClass( 'ck-table-resized', viewTable );
		}
	} );
}

// Inserts the `<colgroup>` with `<col>` elements as the first child in the view table. Each `<col>` element represents a single column
// and it has the inline width style set, taken from the appropriate slot from the `columnWidths` table attribute.
//
// @private
// @param {module:engine/view/downcastwriter~DowncastWriter} viewWriter View writer instance.
// @param {module:engine/view/element~Element} viewTable View table.
// @param {String} columnWidthsAttribute Column widths attribute from model table.
function insertColgroupElement( viewWriter, viewTable, columnWidthsAttribute ) {
	const columnWidths = columnWidthsAttribute.split( ',' );

	let viewColgroupElement = [ ...viewTable.getChildren() ].find( viewElement => viewElement.is( 'element', 'colgroup' ) );

	if ( !viewColgroupElement ) {
		viewColgroupElement = viewWriter.createContainerElement( 'colgroup' );
	} else {
		for ( const viewChild of [ ...viewColgroupElement.getChildren() ] ) {
			viewWriter.remove( viewChild );
		}
	}

	for ( const columnIndex of Array( columnWidths.length ).keys() ) {
		const viewColElement = viewWriter.createEmptyElement( 'col' );

		viewWriter.setStyle( 'width', columnWidths[ columnIndex ], viewColElement );
		viewWriter.insert( viewWriter.createPositionAt( viewColgroupElement, 'end' ), viewColElement );
	}

	viewWriter.insert( viewWriter.createPositionAt( viewTable, 'start' ), viewColgroupElement );
}

// Removes the `<colgroup>` with `<col>` elements from the view table.
//
// @private
// @param {module:engine/view/downcastwriter~DowncastWriter} viewWriter View writer instance.
// @param {module:engine/view/element~Element} viewTable View table.
function removeColgroupElement( viewWriter, viewTable ) {
	const viewColgroupElement = [ ...viewTable.getChildren() ].find( viewElement => viewElement.is( 'element', 'colgroup' ) );

	viewWriter.remove( viewColgroupElement );
}
