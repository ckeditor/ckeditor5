/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: browser-only */

'use strict';

import path from '/ckeditor5/path.js';

beforeEach( () => {
	// Ensure that no CKEDITOR_BASEPATH global is available.
	delete window.CKEDITOR_BASEPATH;

	// Remove all script elements from the document.
	removeScripts();
} );

describe( 'basePath', () => {
	testGetBasePathFromTag( 'http://bar.com/ckeditor/ckeditor.js', 'http://bar.com/ckeditor/' );
	testGetBasePathFromTag( '/ckeditor/ckeditor.js', /\/ckeditor\/$/ );
	testGetBasePathFromTag( '/ckeditor/ckeditor.js?foo=1#bar', /\/ckeditor\/$/ );
	testGetBasePathFromTag( '/ckeditor/ckeditor.js;id=foo-bar', /\/ckeditor\/$/ );
	testGetBasePathFromTag( '/ckeditor/CKEDITOR.JS', /\/ckeditor\/$/ );
	testGetBasePathFromTag( '../ckeditor/foo/ckeditor.JS', /\/ckeditor\/foo\/$/ );

	it( 'should work with the CKEDITOR_BASEPATH global', () => {
		window.CKEDITOR_BASEPATH = 'http://foo.com/ckeditor/';
		expect( path._getBasePath() ).to.equal( 'http://foo.com/ckeditor/' );
	} );

	function testGetBasePathFromTag( url, expectedBasePath ) {
		it( 'should work with script tags - ' + url, () => {
			addScript( url );

			if ( typeof expectedBasePath == 'string' ) {
				expect( path._getBasePath() ).to.equal( expectedBasePath );
			} else {
				expect( path._getBasePath() ).to.match( expectedBasePath );
			}
		} );
	}
} );

describe( 'This browser', () => {
	testUrlIsFull( '/absolute/url/ckeditor.js' );
	testUrlIsFull( '../relative/url/ckeditor.js' );

	// Browsers should convert absolute and relative URLs to full URLs.
	// If this test fails in any browser, _getBasePath() must be reviewed to deal with such case (v4 does it).
	function testUrlIsFull( url ) {
		it( 'should not keep script URLs absolute or relative - ' + url, () => {
			removeScripts();

			const script = addScript( url );

			// Test if the src now contains '://'.
			expect( script.src ).to.match( /:\/\// );
		} );
	}
} );

function addScript( url ) {
	const script = document.createElement( 'script' );

	script.src = url;
	document.head.appendChild( script );

	return script;
}

function removeScripts() {
	const scripts = [].slice.call( document.getElementsByTagName( 'script' ) );
	let script;

	while ( ( script = scripts.shift() ) ) {
		script.parentNode.removeChild( script );
	}
}
