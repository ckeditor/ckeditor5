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
			columnWidths = normalizeColumnWidths( columnWidths ).map( width => `${ width }%` );
		}

		const colGroupElement = conversionApi.writer.createElement( 'tableColumnGroup' );
		columnWidths.forEach( columnWidth => conversionApi.writer.appendElement( 'tableColumn', { columnWidth }, colGroupElement ) );
		conversionApi.writer.append( colGroupElement, modelTable );
	} );
}
