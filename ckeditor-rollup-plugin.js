/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* jshint browser: false, node: true, strict: true */

'use strict';

const resolveImportPathInContext = require( './compiler-utils/resolveimportpathincontext' );
const path = require( 'path' );

function ckeditorRollupPlugin( options ) {
	return {
		resolveId( importPath, requesterPath ) {
			if ( options.useMainPackageModules ) {
				const resolvedPath = resolveImportPathInContext( requesterPath, importPath, options.mainPackagePath );

				if ( resolvedPath ) {
					return path.join( resolvedPath.packagePath, resolvedPath.filePath );
				}
			}
		}
	};
}

module.exports = ckeditorRollupPlugin;
