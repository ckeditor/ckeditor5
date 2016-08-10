/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */
/* bender-tags: dom, browser-only */

import getDataFromElement from '/ckeditor5/utils/dom/getdatafromelement.js';

describe( 'getDataFromElement', () => {
	[ 'textarea', 'template', 'div' ].forEach( ( elementName ) => {
		it( 'should return the content of a ' + elementName, function() {
			const data = getDataFromElement( document.getElementById( 'getData-' + elementName ) );
			expect( data ).to.equal( '<b>foo</b>' );
		} );
	} );
} );
