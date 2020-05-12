/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/converters/upcasttable
 */

import { createEmptyTableCell } from '../commands/utils';

/**
 * View table element to model table element conversion helper.
 *
 * This conversion helper converts the table element as well as table rows.
 *
 * @returns {Function} Conversion helper.
 */
export default function upcastTable() {
	return dispatcher => {
		dispatcher.on( 'element:table', ( evt, data, conversionApi ) => {
			const viewTable = data.viewItem;

			// When element was already consumed then skip it.
			if ( !conversionApi.consumable.test( viewTable, { name: true } ) ) {
				return;
			}

			const { rows, headingRows, headingColumns } = scanTable( viewTable );

			// Only set attributes if values is greater then 0.
			const attributes = {};

			if ( headingColumns ) {
				attributes.headingColumns = headingColumns;
			}

			if ( headingRows ) {
				attributes.headingRows = headingRows;
			}

			const table = conversionApi.writer.createElement( 'table', attributes );

			// Insert element on allowed position.
			const splitResult = conversionApi.splitToAllowedParent( table, data.modelCursor );

			// When there is no split result it means that we can't insert element to model tree, so let's skip it.
			if ( !splitResult ) {
				return;
			}

			conversionApi.writer.insert( table, splitResult.position );
			conversionApi.consumable.consume( viewTable, { name: true } );

			// Upcast table rows in proper order (heading rows first).
			rows.forEach( row => conversionApi.convertItem( row, conversionApi.writer.createPositionAt( table, 'end' ) ) );

			// Create one row and one table cell for empty table.
			if ( table.isEmpty ) {
				const row = conversionApi.writer.createElement( 'tableRow' );
				conversionApi.writer.insert( row, conversionApi.writer.createPositionAt( table, 'end' ) );

				createEmptyTableCell( conversionApi.writer, conversionApi.writer.createPositionAt( row, 'end' ) );
			}

			// Set conversion result range.
			data.modelRange = conversionApi.writer.createRange(
				// Range should start before inserted element
				conversionApi.writer.createPositionBefore( table ),
				// Should end after but we need to take into consideration that children could split our
				// element, so we need to move range after parent of the last converted child.
				// before: <allowed>[]</allowed>
				// after: <allowed>[<converted><child></child></converted><child></child><converted>]</converted></allowed>
				conversionApi.writer.createPositionAfter( table )
			);

			// Now we need to check where the modelCursor should be.
			// If we had to split parent to insert our element then we want to continue conversion inside split parent.
			//
			// before: <allowed><notAllowed>[]</notAllowed></allowed>
			// after:  <allowed><notAllowed></notAllowed><converted></converted><notAllowed>[]</notAllowed></allowed>
			if ( splitResult.cursorParent ) {
				data.modelCursor = conversionApi.writer.createPositionAt( splitResult.cursorParent, 0 );

				// Otherwise just continue after inserted element.
			} else {
				data.modelCursor = data.modelRange.end;
			}
		} );
	};
}

/**
 * Conversion helper that skips empty <tr> from upcasting.
 *
 * Empty row is considered a table model error.
 *
 * @returns {Function} Conversion helper.
 */
export function skipEmptyTableRow() {
	return dispatcher => {
		dispatcher.on( 'element:tr', ( evt, data ) => {
			if ( data.viewItem.isEmpty ) {
				evt.stop();
			}
		}, { priority: 'high' } );
	};
}

/**
 * Converter that ensures empty paragraph is inserted in a table cell if no other content was converted.
 *
 * @returns {Function} Conversion helper.
 */
export function ensureParagraphInTableCell( elementName ) {
	return dispatcher => {
		dispatcher.on( `element:${ elementName }`, ( evt, data, conversionApi ) => {
			// The default converter will create a model range on converted table cell.
			if ( !data.modelRange ) {
				return;
			}

			const tableCell = data.modelRange.start.nodeAfter;

			// Ensure a paragraph in the model for empty table cells for converted table cells.
			if ( !tableCell.childCount ) {
				const modelCursor = conversionApi.writer.createPositionAt( tableCell, 0 );

				conversionApi.writer.insertElement( 'paragraph', modelCursor );
			}
		}, { priority: 'low' } );
	};
}

// Scans table rows and extracts required metadata from the table:
//
// headingRows    - The number of rows that go as table headers.
// headingColumns - The maximum number of row headings.
// rows           - Sorted `<tr>` elements as they should go into the model - ie. if `<thead>` is inserted after `<tbody>` in the view.
//
// @param {module:engine/view/element~Element} viewTable
// @returns {{headingRows, headingColumns, rows}}
function scanTable( viewTable ) {
	const tableMeta = {
		headingRows: 0,
		headingColumns: 0
	};

	// The `<tbody>` and `<thead>` sections in the DOM do not have to be in order `<thead>` -> `<tbody>` and there might be more than one
	// of them.
	// As the model does not have these sections, rows from different sections must be sorted.
	// For example, below is a valid HTML table:
	//
	//		<table>
	//			<tbody><tr><td>2</td></tr></tbody>
	//			<thead><tr><td>1</td></tr></thead>
	//			<tbody><tr><td>3</td></tr></tbody>
	//		</table>
	//
	// But browsers will render rows in order as: 1 as heading and 2 and 3 as the body.
	const headRows = [];
	const bodyRows = [];

	// Currently the editor does not support more then one <thead> section.
	// Only the first <thead> from the view will be used as heading rows and others will be converted to body rows.
	let firstTheadElement;

	for ( const tableChild of Array.from( viewTable.getChildren() ) ) {
		// Only <thead>, <tbody> & <tfoot> from allowed table children can have <tr>s.
		// The else is for future purposes (mainly <caption>).
		if ( tableChild.name === 'tbody' || tableChild.name === 'thead' || tableChild.name === 'tfoot' ) {
			// Save the first <thead> in the table as table header - all other ones will be converted to table body rows.
			if ( tableChild.name === 'thead' && !firstTheadElement ) {
				firstTheadElement = tableChild;
			}

			// There might be some extra empty text nodes between the `tr`s.
			// Make sure further code operates on `tr`s only. (#145)
			const trs = Array.from( tableChild.getChildren() ).filter( el => el.is( 'element', 'tr' ) );

			for ( const tr of trs ) {
				// This <tr> is a child of a first <thead> element.
				if ( tr.parent.name === 'thead' && tr.parent === firstTheadElement ) {
					tableMeta.headingRows++;
					headRows.push( tr );
				} else {
					bodyRows.push( tr );
					// For other rows check how many column headings this row has.

					const headingCols = scanRowForHeadingColumns( tr, tableMeta, firstTheadElement );

					if ( headingCols > tableMeta.headingColumns ) {
						tableMeta.headingColumns = headingCols;
					}
				}
			}
		}
	}

	tableMeta.rows = [ ...headRows, ...bodyRows ];

	return tableMeta;
}

// Scans a `<tr>` element and its children for metadata:
// - For heading row:
//     - Adds this row to either the heading or the body rows.
//     - Updates the number of heading rows.
// - For body rows:
//     - Calculates the number of column headings.
//
// @param {module:engine/view/element~Element} tr
// @returns {Number}
function scanRowForHeadingColumns( tr ) {
	let headingColumns = 0;
	let index = 0;

	// Filter out empty text nodes from tr children.
	const children = Array.from( tr.getChildren() )
		.filter( child => child.name === 'th' || child.name === 'td' );

	// Count starting adjacent <th> elements of a <tr>.
	while ( index < children.length && children[ index ].name === 'th' ) {
		const th = children[ index ];

		// Adjust columns calculation by the number of spanned columns.
		const colspan = parseInt( th.getAttribute( 'colspan' ) || 1 );

		headingColumns = headingColumns + colspan;
		index++;
	}

	return headingColumns;
}
