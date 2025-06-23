#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * Note: Run this script in root of ckeditor5.
 */

import Table from 'cli-table';
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

export function logData( items, format = 'table' ) {
	if ( !items.length ) {
		console.warn( 'No entries found.' );
	}

	const headers = Object.keys( items[ 0 ] );
	const rows = items.map( item => Object.values( item ) );

	if ( format == 'table' ) {
		const table = new Table( {
			head: headers,
			style: {
				compact: true
			},
			rows
		} );

		console.log( table.toString() );
	} else if ( format == 'csv' ) {
		console.log( headers.join( ',' ) );
		console.log( rows.map( row => row.join( ',' ) ).join( '\n' ) );
	} else if ( format == 'tsv' ) {
		console.log( headers.join( '\t' ) );
		console.log( rows.map( row => row.join( '\t' ) ).join( '\n' ) );
	}
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
