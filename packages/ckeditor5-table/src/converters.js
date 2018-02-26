/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/converters
 */

import Position from '@ckeditor/ckeditor5-engine/src/view/position';
import ModelRange from '@ckeditor/ckeditor5-engine/src/model/range';
import ModelPosition from '@ckeditor/ckeditor5-engine/src/model/position';

export function upcastTable() {
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
		// TODO:
		const childrenResult = _upcastTableRows( viewTable, modelTable, ModelPosition.createAt( modelTable ), conversionApi );

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
			ModelPosition.createAfter( childrenResult.modelCursor.parent )
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

export function downcastTableCell() {
	return dispatcher => dispatcher.on( 'insert:tableCell', ( evt, data, conversionApi ) => {
		const tableCell = data.item;

		if ( !conversionApi.consumable.consume( tableCell, 'insert' ) ) {
			return;
		}

		const tableCellElement = conversionApi.writer.createContainerElement( isHead( tableCell ) ? 'th' : 'td' );

		const viewPosition = conversionApi.mapper.toViewPosition( data.range.start );

		conversionApi.mapper.bindElements( tableCell, tableCellElement );
		conversionApi.writer.insert( viewPosition, tableCellElement );
	}, { priority: 'normal' } );
}

export function downcastTable() {
	return dispatcher => dispatcher.on( 'insert:table', ( evt, data, conversionApi ) => {
		const table = data.item;

		if ( !conversionApi.consumable.consume( table, 'insert' ) ) {
			return;
		}

		const tableElement = conversionApi.writer.createContainerElement( 'table' );

		const headingRows = table.getAttribute( 'headingRows' );

		const tableRows = [ ...table.getChildren() ];
		const headings = tableRows.slice( 0, headingRows );
		const bodyRows = tableRows.slice( headingRows );

		if ( headingRows ) {
			_downcastTableSection( 'thead', tableElement, headings, conversionApi );
		}

		if ( bodyRows.length ) {
			_downcastTableSection( 'tbody', tableElement, bodyRows, conversionApi );
		}

		const viewPosition = conversionApi.mapper.toViewPosition( data.range.start );

		conversionApi.mapper.bindElements( table, tableElement );
		conversionApi.writer.insert( viewPosition, tableElement );
	}, { priority: 'normal' } );
}

function _downcastTableSection( elementName, tableElement, rows, conversionApi ) {
	const tableBodyElement = conversionApi.writer.createContainerElement( elementName );
	conversionApi.writer.insert( Position.createAt( tableElement, 'end' ), tableBodyElement );

	rows.map( row => _downcastTableRow( row, conversionApi, tableBodyElement ) );
}

function _downcastTableRow( tableRow, conversionApi, parent ) {
	// Will always consume since we're converting <tableRow> element from a parent <table>.
	conversionApi.consumable.consume( tableRow, 'insert' );

	const tableRowElement = conversionApi.writer.createContainerElement( 'tr' );

	conversionApi.mapper.bindElements( tableRow, tableRowElement );
	conversionApi.writer.insert( Position.createAt( parent, 'end' ), tableRowElement );
}

function _sortRows( table, conversionApi ) {
	const rows = { header: [], body: [] };

	let firstThead;

	for ( const viewChild of Array.from( table.getChildren() ) ) {
		if ( viewChild.name === 'tbody' || viewChild.name === 'thead' || viewChild.name === 'tfoot' ) {
			if ( viewChild.name === 'thead' && !firstThead ) {
				firstThead = viewChild;
			}

			for ( const childRow of Array.from( viewChild.getChildren() ) ) {
				_createModelRow( childRow, rows, conversionApi, firstThead );
			}
		}
	}

	return rows;
}

function _upcastTableRows( table, modelTable, modelCursor, conversionApi ) {
	const modelRange = new ModelRange( modelCursor );

	const rows = _sortRows( table, conversionApi, modelCursor );

	const allRows = [ ...rows.header, ...rows.body ];

	for ( const rowDef of allRows ) {
		const rowPosition = ModelPosition.createAt( modelTable, 'end' );

		conversionApi.writer.insert( rowDef.model, rowPosition );
		conversionApi.consumable.consume( rowDef.view, { name: true } );

		const childrenCursor = ModelPosition.createAt( rowDef.model );
		conversionApi.convertChildren( rowDef.view, childrenCursor );
	}

	if ( rows.header.length ) {
		conversionApi.writer.setAttribute( 'headingRows', rows.header.length, modelTable );
	}

	if ( !allRows.length ) {
		const rowPosition = ModelPosition.createAt( modelTable, 'end' );

		const row = conversionApi.writer.createElement( 'tableRow' );

		conversionApi.writer.insert( row, rowPosition );

		const emptyCell = conversionApi.writer.createElement( 'tableCell' );

		conversionApi.writer.insert( emptyCell, ModelPosition.createAt( row, 'end' ) );
	}

	return { modelRange, modelCursor };
}

function _createModelRow( row, rows, conversionApi, firstThead ) {
	const modelRow = conversionApi.writer.createElement( 'tableRow' );

	if ( row.parent.name === 'thead' && row.parent === firstThead ) {
		rows.header.push( { model: modelRow, view: row } );
	} else {
		rows.body.push( { model: modelRow, view: row } );
	}
}

function isHead( tableCell ) {
	const row = tableCell.parent;
	const table = row.parent;
	const rowIndex = table.getChildIndex( row );
	const headingRows = table.getAttribute( 'headingRows' );
	const headingColumns = table.getAttribute( 'headingColumns' );

	const cellIndex = row.getChildIndex( tableCell );

	return ( headingRows && headingRows > rowIndex ) || ( headingColumns && headingColumns > cellIndex );
}

