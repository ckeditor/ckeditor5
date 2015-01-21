/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals beforeEach, describe, it, expect, CKEDITOR, window, document */

'use strict';

beforeEach( function() {
	// Ensure that no CKEDITOR_BASEPATH global is available.
	delete window.CKEDITOR_BASEPATH;

	// Remove all script elements from the document.
	removeScripts();
} );

describe( 'basePath', function() {
	it( 'should work with script tags', function( done ) {
		CKEDITOR.require( [ 'ckeditor' ], function( CKEDITOR ) {
			addScript( 'http://bar.com/ckeditor/ckeditor.js' );
			expect( CKEDITOR._getBasePath() ).equals( 'http://bar.com/ckeditor/' );
			done();
		} );
	} );

	it( 'should work with the CKEDITOR_BASEPATH global', function( done ) {
		CKEDITOR.require( [ 'ckeditor' ], function( CKEDITOR ) {
			window.CKEDITOR_BASEPATH = 'http://foo.com/ckeditor/';
			expect( CKEDITOR._getBasePath() ).equals( 'http://foo.com/ckeditor/' );
			done();
		} );
	} );
} );

describe( 'This browser', function() {
	it( 'should not keep script URLs absolute or relative', function( done ) {
		// Browsers should convert absolute and relative URLs to full URLs.
		// If this test fails in any browser, _getBasePath() must be reviewed to deal with such case (v4 does it).

		test( '/absolute/url/ckeditor.js' );
		test( '../relative/url/ckeditor.js' );

		done();

		function test( url ) {
			removeScripts();

			var script = addScript( url );

			// Test if the src now contains '://'.
			expect( /:\/\//.test( script.src ) ).to.be.true();
		}
	} );
} );

function addScript( url ) {
	var script = document.createElement( 'script' );
	script.src = url;
	document.head.appendChild( script );

	return script;
}

function removeScripts() {
	var scripts = [].slice.call( document.getElementsByTagName( 'script' ) );
	var script;

	while ( ( script = scripts.shift() ) ) {
		script.parentNode.removeChild( script );
	}
}
