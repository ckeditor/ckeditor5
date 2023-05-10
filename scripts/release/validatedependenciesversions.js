#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const { sync } = require( 'glob' );
const fs = require( 'fs' );
const isCKEditor5Package = require( './isckeditor5package' );
const chalk = require( 'chalk' );

/**
 * Validates the versions of the dependencies in package.json file for the root ckeditor5 package and its packages.
 *
 * @param {Object} options
 * @param {String} options.version Version that all pacakges need to match.
 */
module.exports = function validateDependenciesVersions( { version } ) {
	const globPatterns = '{package.json,packages/*/package.json}';
	const pkgJsonPaths = sync( globPatterns, { absolute: true, nodir: true } );

	const errors = pkgJsonPaths.flatMap( pkgJsonPath => {
		const pkgJson = JSON.parse( fs.readFileSync( pkgJsonPath, 'utf8' ) );

		return validateDependenciesMatchVersion( version, pkgJson );
	} );

	if ( errors.length ) {
		throw new Error( 'Found version mismatches for specified packages\n' + errors.join( '\n' ) );
	}

	console.log( chalk.green.bold( '✨ All packages versions are valid.' ) );
};

/**
 * @param {String} version
 * @param {Object} pkgJson
 * @returns {Array.<String>}
 */
function validateDependenciesMatchVersion( version, pkgJson ) {
	const dependencies = pkgJson.dependencies || {};
	const devDependencies = pkgJson.devDependencies || {};
	const peerDependencies = pkgJson.peerDependencies || {};
	const allDependencies = { ...dependencies, ...devDependencies, ...peerDependencies };
	const ckeditor5Dependencies = Object.entries( allDependencies )
		.filter( ( [ depName ] ) => isCKEditor5Package( depName ) );

	return ckeditor5Dependencies.reduce( ( accum, [ depName, depVersion ] ) =>
		depVersion !== version ?
			[ ...accum, `${ pkgJson.name }: ${ depName } is expected to be ${ version } but is ${ depVersion }.` ] :
			accum
	, [] );
}
