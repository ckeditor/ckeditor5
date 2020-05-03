/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import viewToPlainText from '../../src/utils/viewtoplaintext';

import { parse as parseView } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

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
				'<container:li>B</container:li>' +
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
} );
