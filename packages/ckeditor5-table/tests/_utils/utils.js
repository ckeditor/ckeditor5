/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

function formatAttributes( attributes ) {
	let attributesString = '';

	if ( attributes ) {
		const entries = Object.entries( attributes );

		attributesString = ' ' + entries.map( entry => `${ entry[ 0 ] }="${ entry[ 1 ] }"` ).join( ' ' );
	}
	return attributesString;
}

function makeRows( tableData, cellElement, rowElement ) {
	const tableRows = tableData
		.reduce( ( previousRowsString, tableRow ) => {
			const tableRowString = tableRow.reduce( ( tableRowString, tableCellData ) => {
				let tableCell = tableCellData;

				const isObject = typeof tableCellData === 'object';

				if ( isObject ) {
					tableCell = tableCellData.contents;
					delete tableCellData.contents;
				}

				const formattedAttributes = formatAttributes( isObject ? tableCellData : '' );
				tableRowString += `<${ cellElement }${ formattedAttributes }>${ tableCell }</${ cellElement }>`;

				return tableRowString;
			}, '' );

			return `${ previousRowsString }<${ rowElement }>${ tableRowString }</${ rowElement }>`;
		}, '' );
	return tableRows;
}

/**
 * @param {Number} columns
 * @param {Array.<String>} tableData
 * @param {Object} [attributes]
 *
 * @returns {String}
 */
export function modelTable( tableData, attributes ) {
	const tableRows = makeRows( tableData, 'tableCell', 'tableRow' );

	return `<table${ formatAttributes( attributes ) }>${ tableRows }</table>`;
}

/**
 * @param {Number} columns
 * @param {Array.<String>} tableData
 * @param {Object} [attributes]
 *
 * @returns {String}
 */
export function viewTable( tableData, attributes ) {
	const tableRows = makeRows( tableData, 'td', 'tr' );

	return `<table${ formatAttributes( attributes ) }><tbody>${ tableRows }</tbody></table>`;
}

export function formatModelTable( tableString ) {
	return tableString
		.replace( /<tableRow>/g, '\n<tableRow>\n    ' )
		.replace( /<\/tableRow>/g, '\n</tableRow>' )
		.replace( /<\/table>/g, '\n</table>' );
}

export function formattedModelTable( tableData, attributes ) {
	const tableString = modelTable( tableData, attributes );

	return formatModelTable( tableString );
}
