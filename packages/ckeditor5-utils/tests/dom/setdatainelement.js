/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import setDataInElement from '../../src/dom/setdatainelement.js';
import getDataFromElement from '../../src/dom/getdatafromelement.js';

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
