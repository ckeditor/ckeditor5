/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/converters
 */

import Position from '@ckeditor/ckeditor5-engine/src/view/position';

export function createTable( viewElement, modelWriter ) {
	const attributes = {};

	const header = _getChildHeader( viewElement );

	if ( header ) {
		attributes.headingRows = header.childCount;
	}

	return modelWriter.createElement( 'table', attributes );
}

export function downcastTableCell( dispatcher ) {
	dispatcher.on( 'insert:tableCell', ( evt, data, conversionApi ) => {
		if ( !conversionApi.consumable.consume( data.item, 'insert' ) ) {
			return;
		}

		const viewElementName = data.item.getAttribute( 'isHeading' ) ? 'th' : 'td';
		const tableCellElement = conversionApi.writer.createContainerElement( viewElementName, {} );

		const viewPosition = conversionApi.mapper.toViewPosition( data.range.start );

		conversionApi.mapper.bindElements( data.item, tableCellElement );
		conversionApi.writer.insert( viewPosition, tableCellElement );
	}, { priority: 'normal' } );
}

export function downcastTable( dispatcher ) {
	dispatcher.on( 'insert:table', ( evt, data, conversionApi ) => {
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
			_createTableSection( 'thead', tableElement, headings, conversionApi );
		}

		if ( bodyRows.length ) {
			_createTableSection( 'tbody', tableElement, bodyRows, conversionApi );
		}

		const viewPosition = conversionApi.mapper.toViewPosition( data.range.start );

		conversionApi.mapper.bindElements( table, tableElement );
		conversionApi.writer.insert( viewPosition, tableElement );
	}, { priority: 'normal' } );
}

function _getChildHeader( table ) {
	for ( const child of Array.from( table.getChildren() ) ) {
		if ( child.name === 'thead' ) {
			return child;
		}
	}

	return false;
}

function _createTableSection( elementName, tableElement, rows, conversionApi ) {
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
