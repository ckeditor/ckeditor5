#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const CUSTOM_EXPORT_NAMES = {
	'CKFinderUploadAdapter': 'UploadAdapter'
};

const fs = require( 'fs-extra' );
const upath = require( 'upath' );
const parser = require( '@babel/parser' );
const minimist = require( 'minimist' );
const { glob } = require( 'glob' );
const { red, green, magenta } = require( 'chalk' );

main()
	.catch( err => {
		console.error( err );

		process.exit( 1 );
	} );

async function main() {
	const options = getOptions( process.argv.slice( 2 ) );

	console.log( magenta( '\nValidating plugins\' metadata...' ) );

	const packagesGlobPattern = upath.join( options.cwd, 'packages', '*' );
	const packagesPaths = ( await glob( packagesGlobPattern ) ).map( upath.toUnix );
	const packagesData = await Promise.all( packagesPaths.map( getPackageData ) );
	const packagesWithMetadata = packagesData.filter( p => p.metadata );

	const invalidMetadata = [];

	for ( const packageData of packagesWithMetadata ) {
		const missingExports = getMissingExports( packageData );
		const missingIcons = getMissingIcons( packageData, options );

		if ( ![ ...missingExports, ...missingIcons ].length ) {
			continue;
		}

		invalidMetadata.push( {
			name: packageData.name,
			missingExports,
			missingIcons
		} );
	}

	if ( !invalidMetadata.length ) {
		console.log( green( 'Validation successful.' ) );

		return;
	}

	for ( const { name, missingExports, missingIcons } of invalidMetadata ) {
		console.log( red( `\nPackage "${ name }" has invalid metadata entries:` ) );

		if ( missingExports.length ) {
			console.log( red( [
				'Missing exports:',
				...missingExports.map( missingExport => ` - ${ missingExport }` )
			].join( '\n' ) ) );
		}

		if ( missingIcons.length ) {
			console.log( red( [
				'Missing icons:',
				...missingIcons.map( missingIcon => ` - ${ missingIcon }` )
			].join( '\n' ) ) );
		}
	}

	process.exit( 1 );
}

/**
 * Gets plugins from metadata file at provided path.
 * Additionally, adds `packageName` of the plugin to returned data.
 */
async function getPackageData( packagePath ) {
	const name = packagePath.split( '/' ).at( -1 );

	const pkgJsonPath = upath.join( packagePath, 'package.json' );
	const pkgJsonContent = await fs.readJSON( pkgJsonPath );

	const metadataPath = upath.join( packagePath, 'ckeditor5-metadata.json' );
	const indexPath = upath.join( packagePath, pkgJsonContent.main );

	const metadata = await fs.exists( metadataPath ) ? await fs.readJSON( metadataPath ) : null;
	const index = await fs.exists( indexPath ) ? await fs.readFile( indexPath, 'utf-8' ) : null;

	return { name, metadata, index };
}

function getMissingExports( packageData ) {
	if ( !packageData.index ) {
		throw new Error( 'missing index' );
	}

	const requiredExports = packageData.metadata.plugins.map( plugin => CUSTOM_EXPORT_NAMES[ plugin.className ] || plugin.className );

	const ast = parser.parse( packageData.index, {
		sourceType: 'module',
		ranges: true,
		plugins: [ 'typescript' ]
	} );

	const exports = ast.program.body
		.filter( node => node.type.startsWith( 'Export' ) )
		.flatMap( node => {
			if ( node.specifiers ) {
				return node.specifiers.map( specifier => specifier.exported.loc.identifierName );
			}
		} );

	return requiredExports.filter( requiredExport => !exports.includes( requiredExport ) );
}

function getMissingIcons( packageData, options ) {
	return packageData.metadata.plugins
		.filter( plugin => plugin.uiComponents )
		.flatMap( plugin => plugin.uiComponents.map( uiComponent => uiComponent.iconPath ) )
		.filter( Boolean )
		.map( iconPath => {
			if ( iconPath.startsWith( '@ckeditor/' ) ) {
				return iconPath;
			}

			return upath.join( options.cwd, 'packages', packageData.name, iconPath );
		} )
		.filter( isIconMissing );
}

function isIconMissing( iconPath ) {
	try {
		require.resolve( iconPath );

		return false;
	} catch ( err ) {
		return true;
	}
}

/**
 * @param {Array.<String>} argv
 * @returns {Object} options
 * @returns {String} options.cwd
 */
function getOptions( argv ) {
	return minimist( argv, {
		string: [
			'cwd'
		],
		default: {
			cwd: process.cwd()
		}
	} );
}
