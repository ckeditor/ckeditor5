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

/**
 * @param {Number} columns
 * @param {Array.<String>} tableData
 * @param {Object} [attributes]
 *
 * @returns {String}
 */
export function modelTable( tableData, attributes ) {
	const tableRows = tableData
		.reduce( ( previousRowsString, tableRow ) => {
			const tableRowString = tableRow.reduce( ( tableRowString, tableCellData ) => {
				let tableCell = tableCellData;

				const isObject = typeof tableCellData === 'object';

				if ( isObject ) {
					tableCell = tableCellData.contents;
					delete tableCellData.contents;
				}

				tableRowString += `<tableCell${ formatAttributes( isObject ? tableCellData : '' ) }>${ tableCell }</tableCell>`;

				return tableRowString;
			}, '' );

			return `${ previousRowsString }<tableRow>${ tableRowString }</tableRow>`;
		}, '' );

	return `<table${ formatAttributes( attributes ) }>${ tableRows }</table>`;
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
