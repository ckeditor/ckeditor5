/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* jshint node: false, browser: true, globalstrict: true, varstmt: false */
/* globals bender, requirejs */

'use strict';

( function() {
	// This seems to be the only way to force Require.JS to load modules starting with '/' from a different path.
	var load = requirejs.load;
	requirejs.load = function( context, moduleId, url ) {
		var basePath = bender.getCKEditorModuleBasePath().replace( /\/$/, '' );

		if ( moduleId[ 0 ] == '/' ) {
			url = basePath + url;
		}

		return load( context, moduleId, url );
	};

	// Reported: https://github.com/benderjs/benderjs/issues/248
	// Ugh... make some paths cleanup, because we need to combine these fragments and we don't want to
	// duplicate '/'. BTW. if you want to touch this make sure you haven't broken Bender jobs which
	// have different bender.basePaths (no trailing '/', unnecessary 'tests/' fragment).
	bender.getCKEditorModuleBasePath = function() {
		var appBasePath = bender.basePath;
		var ckeditorBasePath = bender.config.applications.ckeditor.basePath;
		var modulebasePath;

		modulebasePath = appBasePath
			.split( '/' )
			.filter( nonEmpty )
			// When running a job we need to drop the last parth of the base path, which is "tests".
			.slice( 0, -1 )
			.concat(
				ckeditorBasePath.split( '/' ).filter( nonEmpty )
			)
			.join( '/' );

		return '/' + modulebasePath;
	};

	function nonEmpty( str ) {
		return !!str.length;
	}
} )();
