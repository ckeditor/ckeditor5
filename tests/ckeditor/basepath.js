/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals beforeEach, describe, it, expect, window, document */

'use strict';

var modules = bender.amd.require( 'ckeditor' );

beforeEach( function() {
	// Ensure that no CKEDITOR_BASEPATH global is available.
	delete window.CKEDITOR_BASEPATH;

	// Remove all script elements from the document.
	removeScripts();
} );

describe( 'basePath', function() {
	testGetBasePathFromTag( 'http://bar.com/ckeditor/ckeditor.js', 'http://bar.com/ckeditor/' );
	testGetBasePathFromTag( '/ckeditor/ckeditor.js', /\/ckeditor\/$/ );
	testGetBasePathFromTag( '\\ckeditor\\ckeditor.js', /[\\\/]ckeditor[\\\/]$/ );
	testGetBasePathFromTag( '/ckeditor/ckeditor.js?foo=1#bar', /\/ckeditor\/$/ );
	testGetBasePathFromTag( '/ckeditor/ckeditor.js;id=foo-bar', /\/ckeditor\/$/ );
	testGetBasePathFromTag( '/ckeditor/CKEDITOR.JS', /\/ckeditor\/$/ );
	testGetBasePathFromTag( '../ckeditor/foo/ckeditor.JS', /\/ckeditor\/foo\/$/ );

	it( 'should work with the CKEDITOR_BASEPATH global', function() {
		var CKEDITOR = modules.ckeditor;

		window.CKEDITOR_BASEPATH = 'http://foo.com/ckeditor/';
		expect( CKEDITOR._getBasePath() ).to.equal( 'http://foo.com/ckeditor/' );
	} );

	function testGetBasePathFromTag( url, expectedBasePath ) {
		it( 'should work with script tags - ' + url, function() {
			var CKEDITOR = modules.ckeditor;

			addScript( url );

			if ( typeof expectedBasePath == 'string' ) {
				expect( CKEDITOR._getBasePath() ).to.equal( expectedBasePath );
			} else {
				expect( CKEDITOR._getBasePath() ).to.match( expectedBasePath );
			}
		} );
	}
} );

describe( 'This browser', function() {
	it( 'should not keep script URLs absolute or relative', function() {
		// Browsers should convert absolute and relative URLs to full URLs.
		// If this test fails in any browser, _getBasePath() must be reviewed to deal with such case (v4 does it).

		test( '/absolute/url/ckeditor.js' );
		test( '../relative/url/ckeditor.js' );

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
