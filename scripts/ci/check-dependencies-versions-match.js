#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

// This script ensures that all "dependencies" in package JSONs listed below, use the same versions of
// dependencies. It also checks that all versions are pinned, and they don't use the caret operator "^".
// If you provide the "--fix" argument, the script will automatically fix the errors for you.

const chalk = require( 'chalk' );
const semver = require( 'semver' );
const { globSync } = require( 'glob' );
const fs = require( 'fs-extra' );
const upath = require( 'upath' );
const { execSync } = require( 'child_process' );

const versionsCache = {};
const shouldFix = process.argv[ 2 ] === '--fix';

console.log( chalk.blue( '🔍 Starting checking dependencies versions...' ) );

const [ packageJsons, pathMappings ] = getPackageJsons( [
	'package.json',
	'packages/*/package.json',
	'external/ckeditor5-commercial/packages/*/package.json',
	'external/ckeditor5-commercial/package.json'
] );

const expectedDependencies = getExpectedDepsVersions( packageJsons );

if ( shouldFix ) {
	fixDependenciesVersions( expectedDependencies, packageJsons, pathMappings );
} else {
	checkDependenciesMatch( expectedDependencies, packageJsons );
}

/**
 * @param {Object.<String, String>} expectedDependencies
 * @param {Array.<Object>} packageJsons
 * @param {Object.<String, String>} pathMappings
 */
function fixDependenciesVersions( expectedDependencies, packageJsons, pathMappings ) {
	packageJsons
		.filter( packageJson => packageJson.dependencies )
		.forEach( packageJson => {
			Object.entries( packageJson.dependencies )
				.forEach( ( [ dependency, version ] ) => {
					if ( version !== expectedDependencies[ dependency ] ) {
						packageJson.dependencies[ dependency ] = expectedDependencies[ dependency ];
					}
				} );

			fs.writeJsonSync( pathMappings[ packageJson.name ], packageJson, { spaces: 2 } );
		} );

	console.log( chalk.green( '✅  All dependencies fixed!' ) );
}

/**
 * @param {Object.<String, String>} expectedDependencies
 * @param {Array.<Object>} packageJsons
 */
function checkDependenciesMatch( expectedDependencies, packageJsons ) {
	const errors = packageJsons
		.filter( packageJson => packageJson.dependencies )
		.flatMap( packageJson => Object.entries( packageJson.dependencies )
			.map( ( [ dependency, version ] ) => {
				if ( version !== expectedDependencies[ dependency ] ) {
					return getWrongVersionErrorMsg( dependency, packageJson.name, version, expectedDependencies );
				}
			} )
			.filter( Boolean )
		);

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
 * @return {Object.<String, String>} expectedDependencies
 */
function getExpectedDepsVersions( packageJsons ) {
	return packageJsons
		.map( packageJson => packageJson.dependencies )
		.filter( Boolean )
		.reduce( ( expectedDependencies, dependencies ) => {
			Object.entries( dependencies ).forEach( ( [ dependency, version ] ) => {
				expectedDependencies[ dependency ] = getNewestVersion( dependency, version, expectedDependencies[ dependency ] );
			} );

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
	if ( !semver.valid( newVersion ) ) {
		const versions = getVersionsList( packageName );
		const newMaxVersion = semver.maxSatisfying( versions, newVersion );

		return semver.gt( newMaxVersion, currentMaxVersion ) ? newMaxVersion : currentMaxVersion;
	}

	return semver.gt( newVersion, currentMaxVersion ) ? newVersion : currentMaxVersion;
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
	const packageJsonPaths = globSync( directories, { absolute: true, cwd: upath.join( __dirname, '..', '..' ) } );
	const packageJsons = packageJsonPaths.map( packageJsonPath => require( packageJsonPath ) );
	const nameToPathMappings = packageJsonPaths
		.reduce( ( accum, packageJsonPath ) => ( { ...accum, [ require( packageJsonPath ).name ]: packageJsonPath } ), {} );

	return [ packageJsons, nameToPathMappings ];
}
