/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: view, browser-only */

import { breakAt } from '/ckeditor5/engine/view/writer.js';
import { stringify, parse } from '/tests/engine/_utils/view.js';

describe( 'writer', () => {
	/**
	 * Executes test using `parse` and `stringify` utils functions. Uses range delimiters `[]{}` to create and
	 * test break position.
	 *
	 * @param {String} input
	 * @param {String} expected
	 */
	function test( input, expected ) {
		let { view, selection } = parse( input );

		const newPosition = breakAt( selection.getFirstPosition() );
		expect( stringify( view.root, newPosition, { showType: true, showPriority: true } ) ).to.equal( expected );
	}

	describe( 'breakAt', () => {
		it( 'should not break text nodes if they are not in attribute elements - middle', () => {
			test(
				'<container:p>foo{}bar</container:p>',
				'<container:p>foo{}bar</container:p>'
			);
		} );

		it( 'should not break text nodes if they are not in attribute elements - beginning', () => {
			test(
				'<container:p>{}foobar</container:p>',
				'<container:p>{}foobar</container:p>'
			);
		} );

		it( 'should not break text nodes if they are not in attribute elements #2 - end', () => {
			test(
				'<container:p>foobar{}</container:p>',
				'<container:p>foobar{}</container:p>'
			);
		} );

		it( 'should split attribute element', () => {
			test(
				'<container:p><attribute:b:1>foo{}bar</attribute:b:1></container:p>',
				'<container:p><attribute:b:1>foo</attribute:b:1>[]<attribute:b:1>bar</attribute:b:1></container:p>'
			);
		} );

		it( 'should move from beginning of the nested text node to the container', () => {
			test(
				'<container:p><attribute:b:1><attribute:u:1>{}foobar</attribute:u:1></attribute:b:1></container:p>',
				'<container:p>[]<attribute:b:1><attribute:u:1>foobar</attribute:u:1></attribute:b:1></container:p>'
			);
		} );

		it( 'should stick selection in text node if it is in container', () => {
			test(
				'<container:p>foo{}<attribute:b:1>bar</attribute:b:1></container:p>',
				'<container:p>foo{}<attribute:b:1>bar</attribute:b:1></container:p>'
			);
		} );

		it( 'should split nested attributes', () => {
			test(
				'<container:p><attribute:b:1><attribute:u:1>foo{}bar</attribute:u:1></attribute:b:1></container:p>',
				'<container:p>' +
					'<attribute:b:1>' +
						'<attribute:u:1>' +
							'foo' +
						'</attribute:u:1>' +
					'</attribute:b:1>' +
					'[]' +
					'<attribute:b:1>' +
						'<attribute:u:1>' +
							'bar' +
						'</attribute:u:1>' +
					'</attribute:b:1>' +
				'</container:p>'
			);
		} );

		it( 'should move from end of the nested text node to the container', () => {
			test(
				'<container:p><attribute:b:1><attribute:u:1>foobar{}</attribute:u:1></attribute:b:1></container:p>',
				'<container:p><attribute:b:1><attribute:u:1>foobar</attribute:u:1></attribute:b:1>[]</container:p>'
			);
		} );

		it( 'should split attribute element directly in document fragment', () => {
			test(
				'<attribute:b:1>foo{}bar</attribute:b:1>',
				'<attribute:b:1>foo</attribute:b:1>[]<attribute:b:1>bar</attribute:b:1>'
			);
		} );

		it( 'should not split text directly in document fragment', () => {
			test(
				'foo{}bar',
				'foo{}bar'
			);
		} );
	} );
} );
