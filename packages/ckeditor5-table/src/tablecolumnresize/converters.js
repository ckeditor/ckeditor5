/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecolumnresize/converters
 */

/* istanbul ignore file */

import { getNumberOfColumn } from './utils';

/**
 * Returns a helper for converting a view `<colgroup>` and `<col>` elements to the model table `columnWidths` attribute.
 *
 * Only the inline width, provided as a percentage value, in the `<col>` element is taken into account. If there are not enough `<col>`
 * elements matching this condition, the special value 'auto' is returned. It indicates that the width of a column will be automatically
 * calculated in the
 * {@link module:table/tablecolumnresize/tablecolumnresizeediting~TableColumnResizeEditing#_setupPostFixer post-fixer}, depending
 * on the available table space.
 *
 * @param {module:core/editor/editor~Editor} editor The editor instance.
 * @returns {Function} Conversion helper.
 */
export function upcastColgroupElement( editor ) {
	return dispatcher => dispatcher.on( 'element:colgroup', ( evt, data, conversionApi ) => {
		const modelTable = data.modelCursor.findAncestor( 'table' );

		if ( !modelTable ) {
			return;
		}

		const modelWriter = conversionApi.writer;
		const viewColgroupElement = data.viewItem;
		const numberOfColumns = getNumberOfColumn( modelTable, editor );

		const columnWidthsAttribute = [ ...Array( numberOfColumns ).keys() ]
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
			} )
			.join( ',' );

		modelWriter.setAttribute( 'columnWidths', columnWidthsAttribute, modelTable );
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

		const viewTable = [ ...conversionApi.mapper.toViewElement( modelTable ).getChildren() ]
			.find( viewChild => viewChild.is( 'element', 'table' ) );

		if ( data.attributeNewValue ) {
			if ( data.attributeNewValue !== data.attributeOldValue ) {
				insertColgroupElement( viewWriter, viewTable, data.attributeNewValue );
			}
		} else {
			removeColgroupElement( viewWriter, viewTable );
		}
	} );
}

// Inserts the `<colgroup>` with `<col>` elements as the first child in the view table. Each `<col>` element represents a single column
// and it has the inline width style set, taken from the appropriate slot from the `columnWidths` table attribute.
//
// @private
// @param {module:engine/view/downcastwriter~DowncastWriter} viewWriter View writer instance.
// @param {module:engine/view/element~Element} viewTable View table.
// @param {String} columnWidthsAttribute Column width attribute from model table.
function insertColgroupElement( viewWriter, viewTable, columnWidthsAttribute ) {
	const columnWidths = columnWidthsAttribute.split( ',' );

	let viewColgroupElement = [ ...viewTable.getChildren() ].find( viewElement => viewElement.is( 'element', 'colgroup' ) );

	if ( !viewColgroupElement ) {
		viewColgroupElement = viewWriter.createContainerElement( 'colgroup' );
	}

	for ( const viewChild of [ ...viewColgroupElement.getChildren() ] ) {
		viewWriter.remove( viewChild );
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

	if ( !viewColgroupElement ) {
		return;
	}

	viewWriter.remove( viewColgroupElement );
}
