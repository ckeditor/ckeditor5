/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import setDataInElement from '../../src/dom/setdatainelement';
import getDataFromElement from '../../src/dom/getdatafromelement';

describe( 'setDataInElement', () => {
	[ 'textarea', 'template', 'div' ].forEach( elementName => {
		it( 'should set the content of a ' + elementName, () => {
			const el = document.createElement( elementName );
			const expectedData = '<b>foo</b>';

			setDataInElement( el, expectedData );

			const actualData = getDataFromElement( el );
			expect( actualData ).to.equal( expectedData );
		} );
	} );
} );
