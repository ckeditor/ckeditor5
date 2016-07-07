/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: view, browser-only */

'use strict';

import { wrap } from '/ckeditor5/engine/view/writer.js';
import Element from '/ckeditor5/engine/view/element.js';
import ContainerElement from '/ckeditor5/engine/view/containerelement.js';
import AttributeElement from '/ckeditor5/engine/view/attributeelement.js';
import DocumentFragment from '/ckeditor5/engine/view/documentfragment.js';
import Position from '/ckeditor5/engine/view/position.js';
import Range from '/ckeditor5/engine/view/range.js';
import Text from '/ckeditor5/engine/view/text.js';
import CKEditorError from '/ckeditor5/utils/ckeditorerror.js';
import { stringify, parse } from '/tests/engine/_utils/view.js';

describe( 'writer', () => {
	/**
	 * Executes test using `parse` and `stringify` utils functions.
	 *
	 * @param {String} input
	 * @param {String} unwrapAttribute
	 * @param {String} expected
	 */
	function test( input, unwrapAttribute, expected ) {
		let { view, selection } = parse( input );

		if ( view instanceof AttributeElement || view instanceof Text ) {
			view = new DocumentFragment( view );
		}

		const newRange = wrap( selection.getFirstRange(), parse( unwrapAttribute ) );
		expect( stringify( view, newRange, { showType: true, showPriority: true } ) ).to.equal( expected );
	}

	describe( 'wrap', () => {
		it( 'should do nothing on collapsed ranges', () => {
			test(
				'<container:p>f{}oo</container:p>',
				'<attribute:b></attribute:b>',
				'<container:p>f{}oo</container:p>'
			);
		} );

		it( 'wraps single text node', () => {
			test(
				'<container:p>[foobar]</container:p>',
				'<attribute:b:1></attribute:b:1>',
				'<container:p>[<attribute:b:1>foobar</attribute:b:1>]</container:p>'
			);
		} );

		it( 'wraps single text node in document fragment', () => {
			test(
				'{foobar}',
				'<attribute:b:1></attribute:b:1>',
				'[<attribute:b:1>foobar</attribute:b:1>]'
			);
		} );

		it( 'should throw error when element is not instance of AttributeElement', () => {
			const container = new ContainerElement( 'p', null, new Text( 'foo' ) );
			const range = new Range(
				new Position( container, 0 ),
				new Position( container, 1 )
			);
			const b = new Element( 'b' );

			expect( () => {
				wrap( range, b );
			} ).to.throw( CKEditorError, 'view-writer-wrap-invalid-attribute' );
		} );

		it( 'should throw error when range placed in two containers', () => {
			const container1 = new ContainerElement( 'p' );
			const container2 = new ContainerElement( 'p' );
			const range = new Range(
				new Position( container1, 0 ),
				new Position( container2, 1 )
			);
			const b = new AttributeElement( 'b' );

			expect( () => {
				wrap( range, b, 1 );
			} ).to.throw( CKEditorError, 'view-writer-invalid-range-container' );
		} );

		it( 'wraps part of a single text node #1', () => {
			test(
				'<container:p>[foo}bar</container:p>',
				'<attribute:b:1></attribute:b:1>',
				'<container:p>[<attribute:b:1>foo</attribute:b:1>]bar</container:p>'
			);
		} );

		it( 'wraps part of a single text node #2', () => {
			test(
				'<container:p>{foo}bar</container:p>',
				'<attribute:b:1></attribute:b:1>',
				'<container:p>[<attribute:b:1>foo</attribute:b:1>]bar</container:p>'
			);
		} );

		it( 'wraps part of a single text node #3', () => {
			test(
				'<container:p>foo{bar}</container:p>',
				'<attribute:b:1></attribute:b:1>',
				'<container:p>foo[<attribute:b:1>bar</attribute:b:1>]</container:p>'
			);
		} );

		it( 'should not wrap inside nested containers', () => {
			test(
				'<container:div>[foobar<container:p>baz</container:p>]</container:div>',
				'<attribute:b:1></attribute:b:1>',
				'<container:div>[<attribute:b:1>foobar</attribute:b:1><container:p>baz</container:p>]</container:div>'
			);
		} );

		it( 'wraps according to priorities', () => {
			test(
				'<container:p>[<attribute:u:1>foobar</attribute:u:1>]</container:p>',
				'<attribute:b:2></attribute:b:2>',
				'<container:p>[<attribute:u:1><attribute:b:2>foobar</attribute:b:2></attribute:u:1>]</container:p>'
			);
		} );

		it( 'merges wrapped nodes #1', () => {
			test(
				'<container:p>[<attribute:b:1>foo</attribute:b:1>bar<attribute:b:1>baz</attribute:b:1>]</container:p>',
				'<attribute:b:1></attribute:b:1>',
				'<container:p>[<attribute:b:1>foobarbaz</attribute:b:1>]</container:p>'
			);
		} );

		it( 'merges wrapped nodes #2', () => {
			test(
				'<container:p><attribute:b:1>foo</attribute:b:1>[bar}baz</container:p>',
				'<attribute:b:1></attribute:b:1>',
				'<container:p><attribute:b:1>foo{bar</attribute:b:1>]baz</container:p>'
			);
		} );

		it( 'merges wrapped nodes #3', () => {
			test(
				'<container:p><attribute:b:1>foobar</attribute:b:1>[baz]</container:p>',
				'<attribute:b:1></attribute:b:1>',
				'<container:p><attribute:b:1>foobar{baz</attribute:b:1>]</container:p>'
			);
		} );

		it( 'merges wrapped nodes #4', () => {
			test(
				'<container:p>[foo<attribute:i:1>bar</attribute:i:1>]baz</container:p>',
				'<attribute:b:1></attribute:b:1>',
				'<container:p>[<attribute:b:1>foo<attribute:i:1>bar</attribute:i:1></attribute:b:1>]baz</container:p>'
			);
		} );

		it( 'merges wrapped nodes #5', () => {
			test(
				'<container:p>[foo<attribute:i:1>bar</attribute:i:1>baz]</container:p>',
				'<attribute:b:2></attribute:b:2>',
				'<container:p>' +
				'[' +
					'<attribute:b:2>foo</attribute:b:2>' +
					'<attribute:i:1>' +
						'<attribute:b:2>bar</attribute:b:2>' +
					'</attribute:i:1>' +
					'<attribute:b:2>baz</attribute:b:2>' +
				']' +
				'</container:p>'
			);
		} );

		it( 'should wrap single element by merging attributes', () => {
			test(
				'<container:p>[<attribute:b:1 foo="bar" one="two"></attribute:b:1>]</container:p>',
				'<attribute:b:1 baz="qux" one="two"></attribute:b:1>',
				'<container:p>[<attribute:b:1 baz="qux" foo="bar" one="two"></attribute:b:1>]</container:p>'
			);
		} );

		it( 'should not merge attributes when they differ', () => {
			test(
				'<container:p>[<attribute:b:1 foo="bar"></attribute:b:1>]</container:p>',
				'<attribute:b:1 foo="baz"></attribute:b:1>',
				'<container:p>[<attribute:b:1 foo="baz"><attribute:b:1 foo="bar"></attribute:b:1></attribute:b:1>]</container:p>'
			);
		} );

		it( 'should wrap single element by merging classes', () => {
			test(
				'<container:p>[<attribute:b:1 class="foo bar baz"></attribute:b:1>]</container:p>',
				'<attribute:b:1 class="foo bar qux jax"></attribute:b:1>',
				'<container:p>[<attribute:b:1 class="foo bar baz qux jax"></attribute:b:1>]</container:p>'
			);
		} );

		it( 'should wrap single element by merging styles', () => {
			test(
				'<container:p>[<attribute:b:1 style="color:red; position: absolute;"></attribute:b:1>]</container:p>',
				'<attribute:b:1 style="color:red; top: 20px;"></attribute:b:1>',
				'<container:p>[<attribute:b:1 style="color:red;position:absolute;top:20px;"></attribute:b:1>]</container:p>'
			);
		} );

		it( 'should not merge styles when they differ', () => {
			test(
				'<container:p>[<attribute:b:1 style="color:red;"></attribute:b:1>]</container:p>',
				'<attribute:b:1 style="color:black;"></attribute:b:1>',
				'<container:p>' +
				'[' +
					'<attribute:b:1 style="color:black;">' +
						'<attribute:b:1 style="color:red;"></attribute:b:1>' +
					'</attribute:b:1>' +
				']' +
				'</container:p>'
			);
		} );

		it( 'should not merge single elements when they have different priority', () => {
			test(
				'<container:p>[<attribute:b:2 style="color:red;"></attribute:b:2>]</container:p>',
				'<attribute:b:1 style="color:red;"></attribute:b:1>',
				'<container:p>' +
				'[' +
					'<attribute:b:1 style="color:red;">' +
						'<attribute:b:2 style="color:red;"></attribute:b:2>' +
					'</attribute:b:1>' +
				']</container:p>'
			);
		} );

		it( 'should be merged with outside element when wrapping all children', () => {
			test(
				'<container:p><attribute:b:1 foo="bar">[foobar<attribute:i:1>baz</attribute:i:1>]</attribute:b:1></container:p>',
				'<attribute:b:1 baz="qux"></attribute:b:1>',
				'<container:p>' +
				'[' +
					'<attribute:b:1 baz="qux" foo="bar">' +
						'foobar' +
						'<attribute:i:1>baz</attribute:i:1>' +
					'</attribute:b:1>' +
				']' +
				'</container:p>'
			);
		} );
	} );
} );
