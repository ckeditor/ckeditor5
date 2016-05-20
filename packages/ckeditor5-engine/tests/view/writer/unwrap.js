/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: view, browser-only */

'use strict';

import Writer from '/ckeditor5/engine/view/writer.js';
import Element from '/ckeditor5/engine/view/element.js';
import ContainerElement from '/ckeditor5/engine/view/containerelement.js';
import AttributeElement from '/ckeditor5/engine/view/attributeelement.js';
import Position from '/ckeditor5/engine/view/position.js';
import Range from '/ckeditor5/engine/view/range.js';
import Text from '/ckeditor5/engine/view/text.js';
import CKEditorError from '/ckeditor5/utils/ckeditorerror.js';
import { stringify, parse } from '/tests/engine/_utils/view.js';

describe( 'Writer', () => {
	let writer;

	/**
	 * Executes test using `parse` and `stringify` utils functions.
	 *
	 * @param {String} input
	 * @param {String} unwrapAttribute
	 * @param {String} expected
	 */
	function test( input, unwrapAttribute, expected ) {
		const { view, selection } = parse( input );
		const newRange = writer.unwrap( selection.getFirstRange(), parse( unwrapAttribute ) );
		expect( stringify( view, newRange, { showType: true, showPriority: true } ) ).to.equal( expected );
	}

	beforeEach( () => {
		writer = new Writer();
	} );

	describe( 'unwrap', () => {
		it( 'should do nothing on collapsed ranges', () => {
			test(
				'<container:p>f{}oo</container:p>',
				'<attribute:b:10></attribute:b:10>',
				'<container:p>f{}oo</container:p>'
			);
		} );

		it( 'should do nothing on single text node', () => {
			test(
				'<container:p>[foobar]</container:p>',
				'<attribute:b:1></attribute:b:1>',
				'<container:p>[foobar]</container:p>'
			);
		} );

		it( 'should throw error when element is not instance of AttributeElement', () => {
			const container = new ContainerElement( 'p', null, new AttributeElement( 'b', null, new Text( 'foo' ) ) );
			const range = new Range(
				new Position( container, 0 ),
				new Position( container, 1 )
			);
			const b = new Element( 'b' );

			expect( () => {
				writer.unwrap( range, b );
			} ).to.throw( CKEditorError, 'view-writer-unwrap-invalid-attribute' );
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
				writer.unwrap( range, b, 1 );
			} ).to.throw( CKEditorError, 'view-writer-invalid-range-container' );
		} );

		it( 'should unwrap single node', () => {
			test(
				'<container:p>[<attribute:b:1>foobar</attribute:b:1>]</container:p>',
				'<attribute:b:1></attribute:b:1>',
				'<container:p>[foobar]</container:p>'
			);
		} );

		it( 'should not unwrap attributes with different priorities #1', () => {
			test(
				'<container:p>[<attribute:b:1>foobar</attribute:b:1>]</container:p>',
				'<attribute:b:2></attribute:b:2>',
				'<container:p>[<attribute:b:1>foobar</attribute:b:1>]</container:p>'
			);
		} );

		it( 'should not unwrap attributes with different priorities #2', () => {
			test(
				'<container:p>' +
				'[' +
					'<attribute:b:2>foo</attribute:b:2>' +
					'<attribute:b:1>bar</attribute:b:1>' +
					'<attribute:b:2>baz</attribute:b:2>' +
				']' +
				'</container:p>',
				'<attribute:b:2></attribute:b:2>',
				'<container:p>[foo<attribute:b:1>bar</attribute:b:1>baz]</container:p>'
			);
		} );

		it( 'should unwrap part of the node', () => {
			test(
				'<container:p>[baz<attribute:b:1>foo}bar</attribute:b:1>',
				'<attribute:b:1></attribute:b:1>',
				'<container:p>[bazfoo]<attribute:b:1>bar</attribute:b:1></container:p>'
			);
		} );

		it( 'should unwrap nested attributes', () => {
			test(
				'<container:p>[<attribute:u:1><attribute:b:1>foobar</attribute:b:1></attribute:u:1>]</container:p>',
				'<attribute:b:1></attribute:b:1>',
				'<container:p>[<attribute:u:1>foobar</attribute:u:1>]</container:p>'
			);
		} );

		it( 'should merge unwrapped nodes #1', () => {
			test(
				'<container:p>foo[<attribute:b:1>bar</attribute:b:1>]baz</container:p>',
				'<attribute:b:1></attribute:b:1>',
				'<container:p>foo{bar}baz</container:p>'
			);
		} );

		it( 'should merge unwrapped nodes #2', () => {
			const input = '<container:p>' +
			'foo' +
				'<attribute:u:1>bar</attribute:u:1>' +
				'[' +
				'<attribute:b:1>' +
					'<attribute:u:1>bazqux</attribute:u:1>' +
				'</attribute:b:1>' +
				']' +
			'</container:p>';
			const attribute = '<attribute:b:1></attribute:b:1>';
			const result = '<container:p>foo<attribute:u:1>bar{bazqux</attribute:u:1>]</container:p>';

			test( input, attribute, result );
		} );

		it( 'should merge unwrapped nodes #3', () => {
			const input = '<container:p>' +
				'foo' +
				'<attribute:u:1>bar</attribute:u:1>' +
				'[' +
				'<attribute:b:1>' +
					'<attribute:u:1>baz}qux</attribute:u:1>' +
				'</attribute:b:1>' +
			'</container:p>';
			const attribute = '<attribute:b:1></attribute:b:1>';
			const result = '<container:p>' +
				'foo' +
				'<attribute:u:1>bar{baz</attribute:u:1>]' +
				'<attribute:b:1>' +
					'<attribute:u:1>qux</attribute:u:1>' +
				'</attribute:b:1>' +
			'</container:p>';

			test( input, attribute, result );
		} );

		it( 'should merge unwrapped nodes #4', () => {
			const input = '<container:p>' +
				'foo' +
				'<attribute:u:1>bar</attribute:u:1>' +
				'[' +
				'<attribute:b:1>' +
					'<attribute:u:1>baz</attribute:u:1>' +
				'</attribute:b:1>' +
				']' +
				'<attribute:u:1>qux</attribute:u:1>' +
			'</container:p>';
			const attribute = '<attribute:b:1></attribute:b:1>';
			const result = '<container:p>' +
				'foo' +
				'<attribute:u:1>bar{baz}qux</attribute:u:1>' +
			'</container:p>';

			test( input, attribute, result );
		} );

		it( 'should merge unwrapped nodes #5', () => {
			const input = '<container:p>' +
				'[' +
				'<attribute:b:1><attribute:u:1>foo</attribute:u:1></attribute:b:1>' +
				'<attribute:b:1><attribute:u:1>bar</attribute:u:1></attribute:b:1>' +
				'<attribute:b:1><attribute:u:1>baz</attribute:u:1></attribute:b:1>' +
				']' +
			'</container:p>';
			const attribute = '<attribute:b:1></attribute:b:1>';
			const result = '<container:p>[<attribute:u:1>foobarbaz</attribute:u:1>]</container:p>';

			test( input, attribute, result );
		} );

		it( 'should unwrap mixed ranges #1', () => {
			const input = '<container:p>' +
				'[' +
				'<attribute:u:1>' +
					'<attribute:b:1>foo]</attribute:b:1>' +
				'</attribute:u:1>' +
			'</container:p>';
			const attribute = '<attribute:b:1></attribute:b:1>';
			const result = '<container:p>[<attribute:u:1>foo</attribute:u:1>]</container:p>';

			test( input, attribute, result );
		} );

		it( 'should unwrap mixed ranges #2', () => {
			test(
				'<container:p>[<attribute:u:1><attribute:b:1>foo}</attribute:b:1></attribute:u></container:p>',
				'<attribute:b:1></attribute:b:1>',
				'<container:p>[<attribute:u:1>foo</attribute:u:1>]</container:p>'
			);
		} );

		it( 'should unwrap single element by removing matching attributes', () => {
			test(
				'<container:p>[<attribute:b:1 foo="bar" baz="qux">test</attribute:b:1>]</container:p>',
				'<attribute:b:1 baz="qux"></attribute:b:1>',
				'<container:p>[<attribute:b:1 foo="bar">test</attribute:b:1>]</container:p>'
			);
		} );

		it( 'should not unwrap single element when attributes are different', () => {
			test(
				'<container:p>[<attribute:b:1 baz="qux" foo="bar">test</attribute:b:1>]</container:p>',
				'<attribute:b:1 baz="qux" test="true"></attribute:b:1>',
				'<container:p>[<attribute:b:1 baz="qux" foo="bar">test</attribute:b:1>]</container:p>'
			);
		} );

		it( 'should unwrap single element by removing matching classes', () => {
			test(
				'<container:p>[<attribute:b:1 class="foo bar baz">test</attribute:b:1>]</container:p>',
				'<attribute:b:1 class="baz foo"></attribute:b:1>',
				'<container:p>[<attribute:b:1 class="bar">test</attribute:b:1>]</container:p>'
			);
		} );

		it( 'should not unwrap single element when classes are different', () => {
			test(
				'<container:p>[<attribute:b:1 class="foo bar baz">test</attribute:b:1>]</container:p>',
				'<attribute:b:1 class="baz foo qux"></attribute:b:1>',
				'<container:p>[<attribute:b:1 class="foo bar baz">test</attribute:b:1>]</container:p>'
			);
		} );

		it( 'should unwrap single element by removing matching styles', () => {
			test(
				'<container:p>[<attribute:b:1 style="color:red;position:absolute;top:10px;">test</attribute:b:1>]</container:p>',
				'<attribute:b:1 style="position: absolute;"></attribute:b:1>',
				'<container:p>[<attribute:b:1 style="color:red;top:10px;">test</attribute:b:1>]</container:p>'
			);
		} );

		it( 'should not unwrap single element when styles are different', () => {
			test(
				'<container:p>[<attribute:b:1 style="color:red;position:absolute;top:10px;">test</attribute:b:1>]</container:p>',
				'<attribute:b:1 style="position: relative;"></attribute:b:1>',
				'<container:p>[<attribute:b:1 style="color:red;position:absolute;top:10px;">test</attribute:b:1>]</container:p>'
			);
		} );
	} );
} );
