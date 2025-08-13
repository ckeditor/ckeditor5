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
import { validateCommandExports } from './exports/policy/validate-command-exports.mjs';
import { validatePluginExports } from './exports/policy/validate-plugin-exports.mjs';
import { Export } from './exports/utils/export.mjs';
import { logData, mapper } from './exports/utils/logger.mjs';
import chalk from 'chalk';
import { validateNaming } from './exports/policy/naming.mjs';

const INCORRECT_EXPORTS_MESSAGE = '❌ Detected incorrect exports in some modules or index.ts files.\n';

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
	const commandExportErrors = validateCommandExports( library );
	const pluginExportErrors = validatePluginExports( library );
	const dataToLogUnwrapped = [
		...declarationsWithMissingExports,
		...exportsToFix,
		...commandExportErrors,
		...pluginExportErrors
	];

	// Do not log exceptions that are expected as errors.
	const data = removeExpectedExceptions( dataToLogUnwrapped );

	const hasErrors = printErrorsToTheConsole( data, library );

	// Throw error after all possible errors have been printed.
	if ( hasErrors ) {
		throw new Error( INCORRECT_EXPORTS_MESSAGE );
	}

	console.log( chalk.green( '\n✅ All packages exports are valid.\n' ) );
}

function printErrorsToTheConsole( data, library ) {
	let hasErrors = false;

	// Check for validation errors in index.ts files.
	if ( data.length !== 0 ) {
		hasErrors = true;
		logData( data );

		console.log( chalk.yellow(
			'\n⚠️ If you want to exclude an export and mark it as valid, add it ' +
			'to the `removeExpectedExceptions()` function in `validate-module-re-exports.mjs`.\n'
		) );
	}

	// Check for any errors collected during module loading.
	if ( library.errorCollector.hasErrors() ) {
		hasErrors = true;
		library.errorCollector.printReport();
	}

	return hasErrors;
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

	const namingCheck = validateNaming( { pkg, module, item: exportItem } );

	if ( !namingCheck.ok ) {
		return `Rename: ${ namingCheck.warning }`;
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

function memberExistInRecord( record, packageName, memberName ) {
	return record.Package === packageName && record[ 'Local name' ] === memberName;
}

function removeExpectedExceptions( data ) {
	return data
		// TODO: Remove after WProofReader has been adjusted.
		.filter( record => !memberExistInRecord( record, '@ckeditor/ckeditor5-ui', 'UIModel' ) )
		// TODO: Remove after MathType has been adjusted.
		.filter( record => !memberExistInRecord( record, '@ckeditor/ckeditor5-engine', 'ViewUpcastWriter' ) )
		// TODO Remove after it is moved to the clipboard package.
		.filter( record => !memberExistInRecord( record, '@ckeditor/ckeditor5-image', 'isHtmlInDataTransfer' ) )
		.filter( record => !memberExistInRecord( record, '@ckeditor/ckeditor5-find-and-replace', 'FindReplaceCommandBase' ) )
		.filter( record => !memberExistInRecord( record, '@ckeditor/ckeditor5-utils', 'globalVar' ) );
}
