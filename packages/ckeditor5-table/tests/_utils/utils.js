/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @param {Number} columns
 * @param {Array.<String>} tableData
 * @param {Object} [attributes]
 *
 * @returns {String}
 */
export function modelTable( columns, tableData, attributes ) {
	const tableRows = tableData
		.map( cellData => `<tableCell>${ cellData }</tableCell>` )
		.reduce( ( table, tableCell, index ) => {
			if ( index % columns === 0 ) {
				table += '<tableRow>';
			}

			table += tableCell;

			if ( index % columns === columns - 1 ) {
				table += '</tableRow>';
			}

			return table;
		}, '' );

	let attributesString = '';

	if ( attributes ) {
		const entries = Object.entries( attributes );

		attributesString = ' ' + entries.map( entry => `${ entry[ 0 ] }="${ entry[ 1 ] }"` ).join( ' ' );
	}

	return `<table${ attributesString }>${ tableRows }</table>`;
}

export function formatModelTable( tableString ) {
	return tableString
		.replace( /<tableRow>/g, '\n<tableRow>\n    ' )
		.replace( /<\/tableRow>/g, '\n</tableRow>' )
		.replace( /<\/table>/g, '\n</table>' );
}

export function formattedModelTable( columns, tableData, attributes ) {
	const tableString = modelTable( columns, tableData, attributes );

	return formatModelTable( tableString );
}
