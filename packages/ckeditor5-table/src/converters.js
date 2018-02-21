/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module tables/converters
 */

import Position from '../../ckeditor5-engine/src/view/position';

export function createTableCell( viewElement, modelWriter ) {
	const attributes = {};

	if ( viewElement.name === 'th' ) {
		attributes.isHeading = true;
	}

	return modelWriter.createElement( 'tableCell', attributes );
}

export function createTableRow( viewElement, modelWriter ) {
	const attributes = {};

	if ( viewElement.parent.name === 'tfoot' ) {
		attributes.isFooter = true;
	}

	if ( viewElement.parent.name === 'thead' ) {
		attributes.isHeading = true;
	}

	return modelWriter.createElement( 'tableRow', attributes );
}

export function downcastTableCell( dispatcher ) {
	dispatcher.on( 'insert:tableCell', ( evt, data, conversionApi ) => {
		const viewElementName = data.item.getAttribute( 'isHeading' ) ? 'th' : 'td';
		const tableCellElement = conversionApi.writer.createContainerElement( viewElementName, {} );

		if ( !tableCellElement ) {
			return;
		}

		if ( !conversionApi.consumable.consume( data.item, 'insert' ) ) {
			return;
		}

		const viewPosition = conversionApi.mapper.toViewPosition( data.range.start );

		conversionApi.mapper.bindElements( data.item, tableCellElement );
		conversionApi.writer.insert( viewPosition, tableCellElement );
	}, { priority: 'normal' } );
}

export function downcastTable( dispatcher ) {
	dispatcher.on( 'insert:table', ( evt, data, conversionApi ) => {
		const tableElement = conversionApi.writer.createContainerElement( 'table' );

		if ( !tableElement ) {
			return;
		}

		if ( !conversionApi.consumable.consume( data.item, 'insert' ) ) {
			return;
		}

		const { headings, footers, rows } = _extractSectionsRows( data.item );

		if ( headings.length ) {
			_createTableSection( 'thead', tableElement, headings, conversionApi );
		}

		if ( rows.length ) {
			_createTableSection( 'tbody', tableElement, rows, conversionApi );
		}

		if ( footers.length ) {
			_createTableSection( 'tfoot', tableElement, footers, conversionApi );
		}

		const viewPosition = conversionApi.mapper.toViewPosition( data.range.start );

		conversionApi.mapper.bindElements( data.item, tableElement );
		conversionApi.writer.insert( viewPosition, tableElement );
	}, { priority: 'normal' } );
}

function _extractSectionsRows( table ) {
	const tableRows = [ ...table.getChildren() ];

	const headings = [];
	const footers = [];
	const rows = [];

	for ( const tableRow of tableRows ) {
		if ( tableRow.getAttribute( 'isHeading' ) ) {
			headings.push( tableRow );
		} else if ( tableRow.getAttribute( 'isFooter' ) ) {
			footers.push( tableRow );
		} else {
			rows.push( tableRow );
		}
	}

	return { headings, footers, rows };
}

function _createTableSection( elementName, tableElement, rows, conversionApi ) {
	const tableBodyElement = conversionApi.writer.createContainerElement( elementName );
	conversionApi.writer.insert( Position.createAt( tableElement, 'end' ), tableBodyElement );

	rows.map( row => _downcastTableRow( row, conversionApi, tableBodyElement ) );
}

function _downcastTableRow( tableRow, conversionApi, parent ) {
	const tableRowElement = conversionApi.writer.createContainerElement( 'tr' );

	if ( !tableRowElement ) {
		return;
	}

	if ( !conversionApi.consumable.consume( tableRow, 'insert' ) ) {
		return;
	}

	conversionApi.mapper.bindElements( tableRow, tableRowElement );
	conversionApi.writer.insert( Position.createAt( parent, 'end' ), tableRowElement );
}
