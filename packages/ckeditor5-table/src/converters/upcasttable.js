/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/converters/upcasttable
 */

import ModelRange from '@ckeditor/ckeditor5-engine/src/model/range';
import ModelPosition from '@ckeditor/ckeditor5-engine/src/model/position';

export default function upcastTable() {
	const converter = ( evt, data, conversionApi ) => {
		const viewTable = data.viewItem;

		// When element was already consumed then skip it.
		const test = conversionApi.consumable.test( viewTable, { name: true } );

		if ( !test ) {
			return;
		}

		const modelTable = conversionApi.writer.createElement( 'table' );

		const splitResult = conversionApi.splitToAllowedParent( modelTable, data.modelCursor );

		// Insert element on allowed position.
		conversionApi.writer.insert( modelTable, splitResult.position );

		// Convert children and insert to element.
		_upcastTableRows( viewTable, modelTable, conversionApi );

		// Consume appropriate value from consumable values list.
		conversionApi.consumable.consume( viewTable, { name: true } );

		// Set conversion result range.
		data.modelRange = new ModelRange(
			// Range should start before inserted element
			ModelPosition.createBefore( modelTable ),
			// Should end after but we need to take into consideration that children could split our
			// element, so we need to move range after parent of the last converted child.
			// before: <allowed>[]</allowed>
			// after: <allowed>[<converted><child></child></converted><child></child><converted>]</converted></allowed>
			ModelPosition.createAfter( modelTable )
		);

		// Now we need to check where the modelCursor should be.
		// If we had to split parent to insert our element then we want to continue conversion inside split parent.
		//
		// before: <allowed><notAllowed>[]</notAllowed></allowed>
		// after:  <allowed><notAllowed></notAllowed><converted></converted><notAllowed>[]</notAllowed></allowed>
		if ( splitResult.cursorParent ) {
			data.modelCursor = ModelPosition.createAt( splitResult.cursorParent );

			// Otherwise just continue after inserted element.
		} else {
			data.modelCursor = data.modelRange.end;
		}
	};

	return dispatcher => {
		dispatcher.on( 'element:table', converter, { priority: 'normal' } );
	};
}

function _upcastTableRows( viewTable, modelTable, conversionApi ) {
	const { rows, headingRows, headingColumns } = _scanTable( viewTable );

	for ( const viewRow of rows ) {
		const modelRow = conversionApi.writer.createElement( 'tableRow' );
		conversionApi.writer.insert( modelRow, ModelPosition.createAt( modelTable, 'end' ) );
		conversionApi.consumable.consume( viewRow, { name: true } );

		const childrenCursor = ModelPosition.createAt( modelRow );
		conversionApi.convertChildren( viewRow, childrenCursor );
	}

	if ( headingRows ) {
		conversionApi.writer.setAttribute( 'headingRows', headingRows, modelTable );
	}

	if ( headingColumns ) {
		conversionApi.writer.setAttribute( 'headingColumns', headingColumns, modelTable );
	}

	if ( !rows.length ) {
		// Create empty table with one row and one table cell.
		const row = conversionApi.writer.createElement( 'tableRow' );
		conversionApi.writer.insert( row, ModelPosition.createAt( modelTable, 'end' ) );
		conversionApi.writer.insertElement( 'tableCell', ModelPosition.createAt( row, 'end' ) );
	}
}

// This one scans table rows & extracts required metadata from table:
//
// headingRows    - number of rows that goes as table header.
// headingColumns - max number of row headings.
// rows           - sorted trs as they should go into the model - ie if <thead> is inserted after <tbody> in the view.
function _scanTable( viewTable ) {
	const tableMeta = {
		headingRows: 0,
		headingColumns: 0,
		rows: {
			head: [],
			body: []
		}
	};

	let firstTheadElement;

	for ( const tableChild of Array.from( viewTable.getChildren() ) ) {
		// Only <thead>, <tbody> & <tfoot> from allowed table children can have <tr>s.
		// The else is for future purposes (mainly <caption>).
		if ( tableChild.name === 'tbody' || tableChild.name === 'thead' || tableChild.name === 'tfoot' ) {
			// Parse only the first <thead> in the table as table header - all other ones will be converted to table body rows.
			if ( tableChild.name === 'thead' && !firstTheadElement ) {
				firstTheadElement = tableChild;
			}

			for ( const childRow of Array.from( tableChild.getChildren() ) ) {
				_scanRow( childRow, tableMeta, firstTheadElement );
			}
		}
	}

	// Unify returned table meta.
	tableMeta.rows = [ ...tableMeta.rows.head, ...tableMeta.rows.body ];

	return tableMeta;
}

// Scans <tr> and it's children for metadata:
// - For heading row:
//     - either add this row to heading or body rows.
//     - updates number of heading rows.
// - For body rows:
//     - calculates number of column headings.
function _scanRow( tr, tableMeta, firstThead ) {
	if ( tr.parent.name === 'thead' && tr.parent === firstThead ) {
		// It's a table header so only update it's meta.
		tableMeta.headingRows++;
		tableMeta.rows.head.push( tr );

		return;
	}

	// For normal row check how many column headings this row has.
	tableMeta.rows.body.push( tr );

	let headingCols = 0;
	let index = 0;

	// Filter out empty text nodes from tr children.
	const children = Array.from( tr.getChildren() )
		.filter( child => child.name === 'th' || child.name === 'td' );

	// Count starting adjacent <th> elements of a <tr>.
	while ( index < children.length && children[ index ].name === 'th' ) {
		const td = children[ index ];

		// Adjust columns calculation by the number of extended columns.
		const hasAttribute = td.hasAttribute( 'colspan' );
		const tdSize = hasAttribute ? parseInt( td.getAttribute( 'colspan' ) ) : 1;

		headingCols = headingCols + tdSize;
		index++;
	}

	if ( headingCols > tableMeta.headingColumns ) {
		tableMeta.headingColumns = headingCols;
	}
}
