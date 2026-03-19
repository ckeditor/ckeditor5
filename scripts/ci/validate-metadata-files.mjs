#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import fs from 'fs-extra';
import upath from 'upath';
import parser from '@babel/parser';
import minimist from 'minimist';
import { glob } from 'glob';
import chalk from 'chalk';

await main()
	.catch( err => {
		console.error( err );

		process.exit( 1 );
	} );

async function main() {
	const options = getOptions( process.argv.slice( 2 ) );

	console.log( chalk.magenta( '\nValidating plugins\' metadata and entry points...' ) );

	const packagesGlobPattern = upath.join( options.cwd, 'packages', '*' );
	const packagesPaths = ( await glob( packagesGlobPattern ) ).map( upath.toUnix );
	const packagesData = await Promise.all( packagesPaths.map( getPackageData ) );
	const packagesWithMetadata = packagesData.filter( p => p.metadata );

	const validIconNames = getValidIconNames( options );

	const invalidMetadata = [];

	for ( const packageData of packagesWithMetadata ) {
		const { hasEntryPoint, missingExports } = getMissingExports( packageData );
		const invalidIconNames = getInvalidIconNames( packageData, validIconNames );

		if ( hasEntryPoint && ![ ...missingExports, ...invalidIconNames ].length ) {
			continue;
		}

		invalidMetadata.push( {
			name: packageData.name,
			hasEntryPoint,
			missingExports,
			invalidIconNames
		} );
	}

	if ( !invalidMetadata.length ) {
		console.log( chalk.green( 'Validation successful.' ) );

		return;
	}

	for ( const { name, hasEntryPoint, missingExports, invalidIconNames } of invalidMetadata ) {
		console.log( chalk.red( `\nPackage "${ name }" has failed validation:` ) );

		if ( !hasEntryPoint ) {
			console.log( chalk.red( 'The "main" field in "package.json" file is either missing or has invalid path.' ) );
		}

		if ( missingExports.length ) {
			console.log( chalk.red( [
				'Missing exports:',
				...missingExports.map( missingExport => ` - ${ missingExport }` )
			].join( '\n' ) ) );
		}

		if ( invalidIconNames.length ) {
			console.log( chalk.red( [
				'Invalid icon names:',
				...invalidIconNames.map( invalidIconName => ` - ${ invalidIconName }` )
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
	const name = upath.basename( packagePath );

	const pkgJsonPath = upath.join( packagePath, 'package.json' );
	const pkgJsonContent = await fs.readJSON( pkgJsonPath );

	const metadataPath = upath.join( packagePath, 'ckeditor5-metadata.json' );
	const metadata = await fs.exists( metadataPath ) ? await fs.readJSON( metadataPath ) : null;

	if ( !pkgJsonContent.main ) {
		return { name, metadata, index: null };
	}

	const indexPath = upath.join( packagePath, pkgJsonContent.main );
	const index = await fs.exists( indexPath ) ? await fs.readFile( indexPath, 'utf-8' ) : null;

	return { name, metadata, index };
}

function getMissingExports( packageData ) {
	const output = {
		hasEntryPoint: true,
		missingExports: []
	};

	if ( !packageData.index ) {
		output.hasEntryPoint = false;

		return output;
	}

	const requiredExports = packageData.metadata.plugins.map( plugin => plugin.className );

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
	output.missingExports = requiredExports.filter( requiredExport => !exports.includes( requiredExport ) );

	return output;
}

function getValidIconNames( options ) {
	const iconsIndexPath = upath.join( options.cwd, 'packages', 'ckeditor5-icons', 'src', 'index.ts' );
	const iconsIndexContent = fs.readFileSync( iconsIndexPath, 'utf-8' );
	const iconNames = new Set();

	for ( const match of iconsIndexContent.matchAll( /export\s*\{\s*default\s+as\s+(\w+)\s*\}/g ) ) {
		iconNames.add( match[ 1 ] );
	}

	return iconNames;
}

function getInvalidIconNames( packageData, validIconNames ) {
	return packageData.metadata.plugins
		.filter( plugin => plugin.uiComponents )
		.flatMap( plugin => plugin.uiComponents.map( uiComponent => ( {
			pluginName: plugin.name,
			iconName: uiComponent.iconName,
			uiComponentName: uiComponent.name
		} ) ) )
		.filter( ( { iconName } ) => iconName !== undefined )
		.filter( ( { iconName } ) => {
			if ( iconName === '' ) {
				return true;
			}

			return !validIconNames.has( iconName );
		} )
		.map( ( { iconName, pluginName, uiComponentName } ) => {
			if ( iconName === '' ) {
				return `${ pluginName } (\`${ uiComponentName }\`) has an empty \`iconName\` value. Either define or remove it.`;
			}

			return `${ pluginName } (\`${ uiComponentName }\`) has an invalid \`iconName\`: "${ iconName }". ` +
				'It must match an export name from @ckeditor/ckeditor5-icons.';
		} );
}

/**
 * @param {Array.<String>} argv
 * @returns {Object} options
 * @returns {String} options.cwd
 */
function getOptions( argv ) {
	const config = {
		string: [
			'cwd'
		],
		default: {
			cwd: process.cwd()
		}
	};

	const options = minimist( argv, config );

	options.cwd = upath.resolve( options.cwd );

	return options;
}
