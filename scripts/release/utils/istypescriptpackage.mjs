/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import fs from 'fs-extra';
import path from 'upath';
import { glob } from 'glob';

/**
 * @param {String} packagePath
 * @returns {Promise.<Boolean>}
 */
export default async function isTypeScriptPackage( packagePath ) {
	const packageJsonPath = path.join( packagePath, 'package.json' );
	const packageJson = await fs.readJson( packageJsonPath );

	// Almost all CKEditor 5 packages define an entry point. When it points to a TypeScript file,
	// the package is written in TS.
	if ( packageJson.main && packageJson.main.includes( '.ts' ) ) {
		return true;
	}

	// In step two, Let's check if the package contains a `tsconfig.json` file.
	if ( await checkFileExists( path.join( packagePath, 'tsconfig.json' ) ) ) {
		return true;
	}

	// In the last step check if any typescript files are present in the src directory.
	const tsFiles = await glob( 'src/**/*.ts', { cwd: packagePath } );

	return tsFiles.length > 0;
}

function checkFileExists( file ) {
	return fs.access( file, fs.constants.F_OK )
		.then( () => true )
		.catch( () => false );
}
