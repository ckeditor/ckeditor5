/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Library } from './exports/utils/library.mjs';
import { getFilePaths } from './exports/utils/getfilepaths.mjs';
import { publicTree } from './exports/policy/public-tree.mjs';
import { isCommandClass } from './exports/policy/is-command.mjs';
import { isPluginClass } from './exports/policy/is-plugin.mjs';
import { isEvent } from './exports/policy/is-event.mjs';
import { Export } from './exports/utils/export.mjs';
import { logData, mapper } from './exports/utils/logger.mjs';
import chalk from 'chalk';

const INCORRECT_EXPORTS_MESSAGE = '❌ Some modules have incorrect exports in the index.ts file. See the table above to see the details.';

main().catch( err => {
	if ( err.message.includes( INCORRECT_EXPORTS_MESSAGE ) ) {
		console.log( chalk.red( err.message ) );
	} else {
		console.error( err );
	}

	process.exit( 1 );
} );

async function main() {
	// Load all the modules and analyze imports, exports, declarations, and their references to one another.
	const filePaths = getFilePaths();
	const library = new Library().loadModules( filePaths );

	publicTree( library );
	isCommandClass( library );
	isPluginClass( library );
	isEvent( library );

	const exportsToFix = getExportsToFix( library );
	const declarationsWithMissingExports = getDeclarationsWithMissingExports( library );
	const dataToLogUnwrapped = [ ...declarationsWithMissingExports, ...exportsToFix ];

	if ( dataToLogUnwrapped.length !== 0 ) {
		logData( dataToLogUnwrapped, 'table' );

		throw new Error( INCORRECT_EXPORTS_MESSAGE + '\n' );
	}

	console.log( chalk.green( '✅ Packages use correct reexport names.' ) );
}

function getExportsToFix( library ) {
	return library.packages.values()
		.flatMap( getModules )
		.filter( ( { module } ) => module.isPublicApi )
		.flatMap( getExports )
		.map( ( { pkg, module, exportItem } ) => (
			{
				pkg,
				module,
				exportItem,
				fixingAction: getFixingAction( pkg, module, exportItem )
			}
		) )
		.filter( ( { fixingAction } ) => fixingAction )
		.map( ( { pkg, module, exportItem, fixingAction } ) => ( {
			...mapper.mapItemsViolatingPolicies( pkg, module, exportItem ),
			'Action': fixingAction
		} ) );
}

function getDeclarationsWithMissingExports( library ) {
	return library.packages.values()
		.flatMap( getModules )
		.flatMap( getDeclarations )
		.filter( ( { declaration } ) => declaration.isPublicTree )
		.filter( ( { declaration } ) => !declaration.isAugmentation )
		.filter( ( { declaration } ) => !declaration.referenceGlobalThisProperty )
		.filter( ( { declaration } ) =>
			!declaration.references.find( ref => ref instanceof Export && ref.localName === declaration.localName )
		)
		.map( ( { pkg, module, declaration } ) => ( {
			...mapper.mapItemsViolatingPolicies( pkg, module, declaration ),
			'Action': 'Add export & re-export'
		} ) );
}

function getFixingAction( pkg, module, exportItem ) {
	const isReExported = exportItem.reExported.length > 0;
	const isRenamed = isReExported && exportItem.reExported.some( re => re.name !== exportItem.localName );
	const isMissingReExport = !isReExported && exportItem.isPublicTree;
	const isInternal = exportItem.internal;
	const reExportStartsWithUnderscore = exportItem.reExported.every( re => re.name.startsWith( '_' ) );

	if ( isRenamed && !isInternal && !reExportStartsWithUnderscore ) {
		return 'Unify local name with re-exported name';
	}

	if ( isMissingReExport ) {
		return 'Add re-export';
	}

	if ( !exportItem.isPublicTree && !isInternal && !reExportStartsWithUnderscore ) {
		return 'Add @internal and re-export with `_` suffix';
	}

	return null;
}

function getModules( pkg ) {
	return pkg.modules.map( module => ( { pkg, module } ) );
}

function getExports( { pkg, module } ) {
	return module.exports.map( exportItem => ( { pkg, module, exportItem } ) );
}

function getDeclarations( { pkg, module } ) {
	return module.declarations.map( declaration => ( { pkg, module, declaration } ) );
}
