/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* eslint-env node */

/**
 * This loader attaches exported modules to the global (`window`) scope.
 *
 * It touches the "main" (`package/src/index.js`) files that re-export the public API.
 *
 * Files that will be modified (re-exports):
 *   - packages/ckeditor5-enter/src/index.js
 *   - packages/ckeditor5-ui/src/index.js
 *   - packages/ckeditor5-core/src/index.js
 *   - etc.
 *
 * Files that will not be touched:
 *   - packages/ckeditor5-ui/src/focuscycler.js
 *   - packages/ckeditor5-enter/src/shiftenter.js
 *   - etc.
 *
 * The loader assumes that `window.CKEditor5.dll()` is a webpack require function.
 *
 * @param {String} source
 * @param {*} map
 */
module.exports = function dllLoader( source, map ) {
	// Touch only the ckeditor5-* files...
	if ( this.resourcePath.match( /ckeditor5?-/ ) ) {
		// ...that re-export the public API.
		if ( this.resourcePath.match( /index.js$/ ) ) {
			const scope = this.resourcePath.match( /ckeditor5?-([^/\\]+)/ )[ 1 ];
			const windowScope = scope.replace( /-([a-z])/g, ( match, p1 ) => p1.toUpperCase() );

			const attachModuleToGlobalScope = [
				// Define the global scope.
				'window.CKEditor5 = window.CKEditor5 || {};',
				// Load modules into the global scope using webpack loader.
				`window.CKEditor5.${ windowScope } = window.CKEditor5.dll( './src/${ scope }.js' );`
			].join( '' );

			source += attachModuleToGlobalScope;
		}
	}

	this.callback( null, source, map );
};
