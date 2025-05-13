#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

// This script ensures that all "dependencies" in package JSONs listed below, use the same versions of
// dependencies. It also checks that all versions are pinned, and they don't use the caret operator "^".
// If you provide the "--fix" argument, the script will automatically fix the errors for you.

import chalk from 'chalk';
import semver from 'semver';
import { globSync } from 'glob';
import fs from 'fs-extra';
import { execSync } from 'child_process';
import { CKEDITOR5_ROOT_PATH } from '../constants.mjs';
import isCKEditor5PackageFactory from '../release/utils/isckeditor5packagefactory.mjs';

const versionsCache = {};
const shouldFix = process.argv[ 2 ] === '--fix';

console.log( chalk.blue( '🔍 Starting checking dependencies versions...' ) );

/**
 * All dependencies should be pinned to the exact version. However, there are some exceptions,
 * where we want to use the caret or tilde operator. This object contains such exceptions.
 */
const versionExceptions = {
	/**
	 * CodeMirror packages are modular and depend on each other. We must use the same versions
	 * as they have in their dependencies to avoid issues with versions mismatch.
	 *
	 * See: https://github.com/cksource/ckeditor5-commercial/issues/6939.
	 */
	'@codemirror/autocomplete': '^',
	'@codemirror/lang-html': '^',
	'@codemirror/language': '^',
	'@codemirror/state': '^',
	'@codemirror/view': '^',
	'@codemirror/theme-one-dark': '^'
};

const [ packageJsons, pathMappings ] = getPackageJsons( [
	'package.json',
	'packages/*/package.json',
	'external/ckeditor5-commercial/packages/*/package.json',
	'external/ckeditor5-commercial/package.json'
] );

main().catch( err => {
	console.error( err );

	process.exit( 1 );
} );

async function main() {
	const isCkeditor5Package = await isCKEditor5PackageFactory();
	const expectedDependencies = getExpectedDepsVersions( packageJsons, isCkeditor5Package );

	if ( shouldFix ) {
		fixDependenciesVersions( expectedDependencies, packageJsons, pathMappings, isCkeditor5Package );
	} else {
		checkDependenciesMatch( expectedDependencies, packageJsons, isCkeditor5Package );
	}
}

/**
 * @param {Object.<String, String>} expectedDependencies
 * @param {Array.<Object>} packageJsons
 * @param {Object.<String, String>} pathMappings
 * @param {Function} isCkeditor5Package
 */
function fixDependenciesVersions( expectedDependencies, packageJsons, pathMappings, isCkeditor5Package ) {
	packageJsons
		.filter( packageJson => packageJson.dependencies )
		.forEach( packageJson => {
			for ( const [ dependency, version ] of Object.entries( packageJson.dependencies ) ) {
				if ( version === expectedDependencies[ dependency ] ) {
					continue;
				}

				packageJson.dependencies[ dependency ] = expectedDependencies[ dependency ];
			}

			for ( const [ dependency, version ] of Object.entries( packageJson.devDependencies ) ) {
				if ( !isCkeditor5Package( dependency ) || version === expectedDependencies[ dependency ] ) {
					continue;
				}

				packageJson.devDependencies[ dependency ] = expectedDependencies[ dependency ];
			}

			fs.writeJsonSync( pathMappings[ packageJson.name ], packageJson, { spaces: 2 } );
		} );

	console.log( chalk.green( '✅  All dependencies fixed!' ) );
}

/**
 * @param {Object.<String, String>} expectedDependencies
 * @param {Function} isCkeditor5Package
 * @param {Array.<Object>} packageJsons
 */
function checkDependenciesMatch( expectedDependencies, packageJsons, isCkeditor5Package ) {
	const errors = packageJsons
		.flatMap( packageJson => {
			const depsErrors = Object.entries( packageJson.dependencies || {} )
				.map( ( [ dependency, version ] ) => {
					if ( version === expectedDependencies[ dependency ] ) {
						return '';
					}

					return getWrongVersionErrorMsg( dependency, packageJson.name, version, expectedDependencies );
				} )
				.filter( Boolean );

			const devDepsErrors = Object.entries( packageJson.devDependencies || {} )
				.map( ( [ dependency, version ] ) => {
					if ( !isCkeditor5Package( dependency ) || version === expectedDependencies[ dependency ] ) {
						return '';
					}

					return getWrongVersionErrorMsg( dependency, packageJson.name, version, expectedDependencies );
				} )
				.filter( Boolean );

			return [ ...depsErrors, devDepsErrors ].flat();
		} );

	if ( errors.length ) {
		console.error( chalk.red( '❌  Errors found. Run this script with an argument: `--fix` to resolve the issues automatically:' ) );
		console.error( chalk.red( errors.join( '\n' ) ) );
		process.exit( 1 );
	}

	console.log( chalk.green( '✅  All dependencies are correct!' ) );
}

/**
 * @param {String} dependency
 * @param {String} name
 * @param {String} version
 * @param {Object.<String, String>} expectedDependencies
 * @return {String}
 */
function getWrongVersionErrorMsg( dependency, name, version, expectedDependencies ) {
	return `"${ dependency }" in "${ name }" in version "${ version }" should be set to "${ expectedDependencies[ dependency ] }".`;
}

/**
 * @param {Array.<Object>} packageJsons
 * @param {Function} isCkeditor5Package
 * @return {Object.<String, String>} expectedDependencies
 */
function getExpectedDepsVersions( packageJsons, isCkeditor5Package ) {
	return packageJsons
		.reduce( ( expectedDependencies, packageJson ) => {
			for ( const [ dependency, version ] of Object.entries( packageJson.dependencies || {} ) ) {
				expectedDependencies[ dependency ] = getNewestVersion( dependency, version, expectedDependencies[ dependency ] );
			}

			for ( const [ dependency, version ] of Object.entries( packageJson.devDependencies || {} ) ) {
				if ( !isCkeditor5Package( dependency ) ) {
					continue;
				}

				expectedDependencies[ dependency ] = getNewestVersion( dependency, version, expectedDependencies[ dependency ] );
			}

			return expectedDependencies;
		}, {} );
}

/**
 * @param {String} packageName
 * @param {String} [newVersion='0.0.0']
 * @param {String} [currentMaxVersion='0.0.0']
 * @return {String}
 */
function getNewestVersion( packageName, newVersion = '0.0.0', currentMaxVersion = '0.0.0' ) {
	if ( versionExceptions[ packageName ] ) {
		return newVersion;
	}

	const newMaxVersion = semver.valid( newVersion ) ?
		newVersion :
		semver.maxSatisfying( getVersionsList( packageName ), newVersion );

	return semver.gt( newMaxVersion, currentMaxVersion ) ? newMaxVersion : currentMaxVersion;
}

/**
 * @param {String} packageName
 * @return {Object.<String, String>}
 */
function getVersionsList( packageName ) {
	if ( !versionsCache[ packageName ] ) {
		console.log( chalk.blue( `⬇️ Downloading "${ packageName }" versions from npm...` ) );
		const versionsJson = execSync( `npm view ${ packageName } versions --json`, { encoding: 'utf8' } );
		versionsCache[ packageName ] = JSON.parse( versionsJson );
	}

	return versionsCache[ packageName ];
}

/**
 * @param {Array.<String>} directories
 * @return {[Array.<Object>, Object.<String, String>]}
 */
function getPackageJsons( directories ) {
	const packageJsonPaths = globSync( directories, { absolute: true, cwd: CKEDITOR5_ROOT_PATH } );
	const packageJsons = packageJsonPaths.map( packageJsonPath => fs.readJsonSync( packageJsonPath ) );
	const nameToPathMappings = packageJsonPaths
		.reduce( ( accum, packageJsonPath ) => ( { ...accum, [ fs.readJsonSync( packageJsonPath ).name ]: packageJsonPath } ), {} );

	return [ packageJsons, nameToPathMappings ];
}
