/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Creator from '/ckeditor5/core/creator.js';

describe( 'Creator', () => {
	describe( 'getDataFromElement', () => {
		[ 'textarea', 'template', 'div' ].forEach( ( elementName ) => {
			it( 'should return the content of a ' + elementName, function() {
				const data = Creator.getDataFromElement( document.getElementById( 'getData-' + elementName ) );
				expect( data ).to.equal( '<b>foo</b>' );
			} );
		} );
	} );

	describe( 'setDataInElement', () => {
		[ 'textarea', 'template', 'div' ].forEach( ( elementName ) => {
			it( 'should set the content of a ' + elementName, () => {
				const el = document.createElement( elementName );
				const expectedData = '<b>foo</b>';

				Creator.setDataInElement( el, expectedData );

				const actualData = Creator.getDataFromElement( el );
				expect( actualData ).to.equal( actualData );
			} );
		} );
	} );
} );
