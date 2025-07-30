/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * Note: Run this script in root of ckeditor5.
 */

import chalk from 'chalk';

const mapBase = ( pkg, module, item ) => ( {
	'Package': pkg.packageName,
	'File name': module.relativeFileName + chalk.blackBright( '#' + item.lineNumber ),
	'Public API': module.isPublicApi ? 'public' : ''
} );

const mapExportsCommon = ( pkg, module, exportItem ) => ( {
	...mapBase( pkg, module, exportItem ),
	'Internal': exportItem.internal ? 'internal' : '',
	'Export kind': exportItem.exportKind,
	'Export type': exportItem.type
} );

export const mapper = {
	mapExports: ( pkg, module, exportItem ) => ( {
		...mapExportsCommon( pkg, module, exportItem ),
		'Local name': exportItem.localName
	} ),

	mapReExports: ( pkg, module, exportItem ) => ( {
		...mapExportsCommon( pkg, module, exportItem ),
		'Export name': exportItem.name,
		'Import from': relativeImportPath( exportItem.importFrom )
	} ),

	mapImports: ( pkg, module, importItem ) => ( {
		...mapBase( pkg, module, importItem ),
		'Import kind': importItem.importKind,
		'Name': importItem.name,
		'Local name': importItem.localName,
		'Import from': relativeImportPath( importItem.importFrom )
	} ),

	mapDeclarations: ( pkg, module, declarationItem ) => ( {
		...mapBase( pkg, module, declarationItem ),
		'Name': declarationItem.localName,
		'Type': declarationItem.type,
		'Internal': declarationItem.internal ? 'internal' : ''
	} ),

	mapReferences: ( pkg, module, item ) => {
		const references = Array
			.from( new Set( item.references ) )
			.map( ( { localName } ) => localName );

		return {
			'References': references.length ? references.reduce( ( acc, item ) => {
				const lastRowIndex = acc.length - 1;

				// Wrapping items.
				if ( acc[ lastRowIndex ].length + item.length < 80 ) {
					acc[ lastRowIndex ] += acc[ lastRowIndex ] ? ', ' + item : item;
				} else {
					acc.push( item );
				}

				return acc;
			}, [ '' ] ).join( ',\n' ) : ''
		};
	},

	mapItemsViolatingPolicies: ( pkg, module, item ) => ( {
		'Package': pkg.packageName,
		'File name': module.relativeFileName + chalk.blackBright( '#' + item.lineNumber ),
		'Local name': item.localName
	} )
};

export function logData( items ) {
	if ( !items.length ) {
		console.warn( 'No entries found.' );
	}

	const headers = Object.keys( items[ 0 ] );
	const rows = items.map( item => Object.values( item ) );

	logInTable( rows, headers );
}

function logInTable( rows, headers ) {
	// Strip ANSI color codes
	// eslint-disable-next-line no-control-regex
	const stripAnsi = str => str.replace( /\u001b\[\d+m/g, '' );

	// Clean the data
	const cleanRows = rows.map( row => row.map( cell => stripAnsi( cell ) ) );

	// Compute column widths
	const allRows = [ headers, ...cleanRows ];
	const colWidths = headers.map( ( _, colIndex ) =>
		Math.max( ...allRows.map( row => row[ colIndex ].length ) )
	);

	// Function to format a row
	const formatRow = row => '│ ' + row.map( ( cell, i ) => cell.padEnd( colWidths[ i ] ) ).join( ' │ ' ) + ' │';

	// Function to create a line
	const createLine = ( left, mid, right, fill = '─' ) =>
		left + colWidths.map( w => fill.repeat( w + 2 ) ).join( mid ) + right;

	// Build and print the table
	console.log( createLine( '┌', '┬', '┐' ) );
	console.log( formatRow( headers ) );
	console.log( createLine( '├', '┼', '┤' ) );
	cleanRows.forEach( row => console.log( formatRow( row ) ) );
	console.log( createLine( '└', '┴', '┘' ) );
}

function relativeImportPath( importFrom ) {
	if ( !importFrom ) {
		return '';
	}

	// Non-resolved module.
	if ( typeof importFrom == 'string' ) {
		return packageRelativeFileName( importFrom ) + ' (not resolved)';
	}

	// Resolved module.
	return packageRelativeFileName( importFrom.fileName );
}

function packageRelativeFileName( fileName ) {
	return fileName.replace( /.*\/packages\//, '' ).replace( /.*\/external\//, '' );
}
