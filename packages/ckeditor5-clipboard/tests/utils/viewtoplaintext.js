/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import viewToPlainText from '../../src/utils/viewtoplaintext.js';

import { parse as parseView } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';

describe( 'viewToPlainText()', () => {
	function testViewToPlainText( viewString, expectedText ) {
		const view = parseView( viewString );
		const text = viewToPlainText( view );

		expect( text ).to.equal( expectedText );
	}

	it( 'should output text contents of given view', () => {
		testViewToPlainText(
			'<container:p>Foo<strong>Bar</strong>Xyz</container:p>',
			'FooBarXyz'
		);
	} );

	it( 'should put empty line between container elements', () => {
		testViewToPlainText(
			'<container:h1>Header</container:h1>' +
			'<container:p>Foo</container:p>' +
			'<container:p>Bar</container:p>' +
			'Abc' +
			'<container:div>Xyz</container:div>',

			'Header\n\nFoo\n\nBar\n\nAbc\n\nXyz'
		);
	} );

	it( 'should not put empty line before or after the element with `dataPipeline:transparentRendering` property', () => {
		const viewString = 'Abc <container:h1>Header</container:h1> xyz';
		const expectedText = 'Abc Header xyz';

		const view = parseView( viewString );
		view.getChild( 1 )._setCustomProperty( 'dataPipeline:transparentRendering', true );

		const text = viewToPlainText( view );

		expect( text ).to.equal( expectedText );
	} );

	it( 'should turn a soft break into a single empty line', () => {
		testViewToPlainText(
			'<container:p>Foo<empty:br />Bar</container:p>',

			'Foo\nBar'
		);
	} );

	it( 'should turn multiple soft breaks into empty lines', () => {
		testViewToPlainText(
			'<container:p>Foo<empty:br /><empty:br />Bar</container:p>',

			'Foo\n\nBar'
		);
	} );

	it( 'should output alt attribute of image elements', () => {
		testViewToPlainText(
			'<container:p>Foo</container:p>' +
			'<img src="foo.jpg" alt="Alt" />',

			'Foo\n\nAlt'
		);
	} );

	it( 'should not put empty line after li (if not needed)', () => {
		testViewToPlainText(
			'<container:p>Foo</container:p>' +
			'<container:ul>' +
				'<container:li>A</container:li>' +
				'<container:li><strong>B</strong></container:li>' +
				'<container:li>C</container:li>' +
			'</container:ul>' +
			'<container:p>Bar</container:p>',

			'Foo\n\nA\nB\nC\n\nBar'
		);
	} );

	it( 'should not put empty line before/after figcaption (if not needed)', () => {
		testViewToPlainText(
			'<container:p>Foo</container:p>' +
			'<container:figure>' +
				'<img src="foo.jpg" alt="Alt" />' +
				'<container:figcaption>Caption</container:figcaption>' +
			'</container:figure>' +
			'<container:p>Bar</container:p>',

			'Foo\n\nAlt\nCaption\n\nBar'
		);
	} );

	it( 'should add two line breaks between document list items', () => {
		testViewToPlainText(
			'<container:p>Foo</container:p>' +
			'<ul>' +
				'<li><container:p>A</container:p></li>' +
				'<li><container:p>B</container:p></li>' +
				'<li><container:p>C</container:p></li>' +
			'</ul>' +
			'<container:p>Bar</container:p>',

			'Foo\n\nA\n\nB\n\nC\n\nBar'
		);
	} );

	it( 'should add line breaks between two document lists with one item each', () => {
		testViewToPlainText(
			'<container:p>Foo</container:p>' +
			'<ul>' +
				'<li><span>A</span></li>' +
			'</ul>' +
			'<ol>' +
				'<li><span>B</span></li>' +
			'</ol>' +
			'<container:p>Bar</container:p>',

			'Foo\n\nA\n\nB\n\nBar'
		);
	} );
} );
