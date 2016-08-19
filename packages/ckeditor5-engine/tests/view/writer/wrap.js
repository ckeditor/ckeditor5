/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: view, browser-only */

import { wrap } from '/ckeditor5/engine/view/writer.js';
import Element from '/ckeditor5/engine/view/element.js';
import ContainerElement from '/ckeditor5/engine/view/containerelement.js';
import AttributeElement from '/ckeditor5/engine/view/attributeelement.js';
import Position from '/ckeditor5/engine/view/position.js';
import Range from '/ckeditor5/engine/view/range.js';
import Text from '/ckeditor5/engine/view/text.js';
import { stringify, parse } from '/tests/engine/_utils/view.js';

describe( 'writer', () => {
	/**
	 * Executes test using `parse` and `stringify` utils functions.
	 *
	 * @param {String} input
	 * @param {String} wrapAttribute
	 * @param {String} expected
	 */
	function test( input, wrapAttribute, expected ) {
		let { view, selection } = parse( input );
		const newRange = wrap( selection.getFirstRange(), parse( wrapAttribute ) );

		expect( stringify( view.root, newRange, { showType: true, showPriority: true } ) ).to.equal( expected );
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
				'<attribute:b view-priority="1"></attribute:b>',
				'<container:p>[<attribute:b view-priority="1">foobar</attribute:b>]</container:p>'
			);
		} );

		it( 'wraps single text node in document fragment', () => {
			test(
				'{foobar}',
				'<attribute:b view-priority="1"></attribute:b>',
				'[<attribute:b view-priority="1">foobar</attribute:b>]'
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
			} ).to.throwCKEditorError( 'view-writer-wrap-invalid-attribute' );
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
				wrap( range, b );
			} ).to.throwCKEditorError( 'view-writer-invalid-range-container' );
		} );

		it( 'should throw when range has no parent container', () => {
			const el = new AttributeElement( 'b' );
			const b = new AttributeElement( 'b' );

			expect( () => {
				wrap( Range.createFromParentsAndOffsets( el, 0, el, 0 ), b );
			} ).to.throwCKEditorError( 'view-writer-invalid-range-container' );
		} );

		it( 'wraps part of a single text node #1', () => {
			test(
				'<container:p>[foo}bar</container:p>',
				'<attribute:b view-priority="1"></attribute:b>',
				'<container:p>[<attribute:b view-priority="1">foo</attribute:b>]bar</container:p>'
			);
		} );

		it( 'wraps part of a single text node #2', () => {
			test(
				'<container:p>{foo}bar</container:p>',
				'<attribute:b view-priority="1"></attribute:b>',
				'<container:p>[<attribute:b view-priority="1">foo</attribute:b>]bar</container:p>'
			);
		} );

		it( 'should support unicode', () => {
			test(
				'<container:p>நி{லை}க்கு</container:p>',
				'<attribute:b view-priority="1"></attribute:b>',
				'<container:p>நி[<attribute:b view-priority="1">லை</attribute:b>]க்கு</container:p>'
			);
		} );

		it( 'wraps part of a single text node #3', () => {
			test(
				'<container:p>foo{bar}</container:p>',
				'<attribute:b view-priority="1"></attribute:b>',
				'<container:p>foo[<attribute:b view-priority="1">bar</attribute:b>]</container:p>'
			);
		} );

		it( 'should not wrap inside nested containers', () => {
			test(
				'<container:div>[foobar<container:p>baz</container:p>]</container:div>',
				'<attribute:b view-priority="1"></attribute:b>',
				'<container:div>[<attribute:b view-priority="1">foobar</attribute:b><container:p>baz</container:p>]</container:div>'
			);
		} );

		it( 'wraps according to priorities', () => {
			test(
				'<container:p>[<attribute:u view-priority="1">foobar</attribute:u>]</container:p>',
				'<attribute:b view-priority="2"></attribute:b>',
				'<container:p>' +
					'[<attribute:u view-priority="1"><attribute:b view-priority="2">foobar</attribute:b></attribute:u>]' +
				'</container:p>'
			);
		} );

		it( 'merges wrapped nodes #1', () => {
			test(
				'<container:p>' +
					'[<attribute:b view-priority="1">foo</attribute:b>bar<attribute:b view-priority="1">baz</attribute:b>]' +
				'</container:p>',
				'<attribute:b view-priority="1"></attribute:b>',
				'<container:p>[<attribute:b view-priority="1">foobarbaz</attribute:b>]</container:p>'
			);
		} );

		it( 'merges wrapped nodes #2', () => {
			test(
				'<container:p><attribute:b view-priority="1">foo</attribute:b>[bar}baz</container:p>',
				'<attribute:b view-priority="1"></attribute:b>',
				'<container:p><attribute:b view-priority="1">foo{bar</attribute:b>]baz</container:p>'
			);
		} );

		it( 'merges wrapped nodes #3', () => {
			test(
				'<container:p><attribute:b view-priority="1">foobar</attribute:b>[baz]</container:p>',
				'<attribute:b view-priority="1"></attribute:b>',
				'<container:p><attribute:b view-priority="1">foobar{baz</attribute:b>]</container:p>'
			);
		} );

		it( 'merges wrapped nodes #4', () => {
			test(
				'<container:p>[foo<attribute:i view-priority="1">bar</attribute:i>]baz</container:p>',
				'<attribute:b view-priority="1"></attribute:b>',
				'<container:p>' +
					'[<attribute:b view-priority="1">foo<attribute:i view-priority="1">bar</attribute:i></attribute:b>]baz' +
				'</container:p>'
			);
		} );

		it( 'merges wrapped nodes #5', () => {
			test(
				'<container:p>[foo<attribute:i view-priority="1">bar</attribute:i>baz]</container:p>',
				'<attribute:b view-priority="2"></attribute:b>',
				'<container:p>' +
				'[' +
					'<attribute:b view-priority="2">foo</attribute:b>' +
					'<attribute:i view-priority="1">' +
						'<attribute:b view-priority="2">bar</attribute:b>' +
					'</attribute:i>' +
					'<attribute:b view-priority="2">baz</attribute:b>' +
				']' +
				'</container:p>'
			);
		} );

		it( 'should wrap single element by merging attributes', () => {
			test(
				'<container:p>[<attribute:b view-priority="1" foo="bar" one="two"></attribute:b>]</container:p>',
				'<attribute:b view-priority="1" baz="qux" one="two"></attribute:b>',
				'<container:p>[<attribute:b view-priority="1" baz="qux" foo="bar" one="two"></attribute:b>]</container:p>'
			);
		} );

		it( 'should not merge attributes when they differ', () => {
			test(
				'<container:p>[<attribute:b view-priority="1" foo="bar"></attribute:b>]</container:p>',
				'<attribute:b view-priority="1" foo="baz"></attribute:b>',
				'<container:p>' +
					'[<attribute:b view-priority="1" foo="baz"><attribute:b view-priority="1" foo="bar"></attribute:b></attribute:b>]' +
				'</container:p>'
			);
		} );

		it( 'should wrap single element by merging classes', () => {
			test(
				'<container:p>[<attribute:b view-priority="1" class="foo bar baz"></attribute:b>]</container:p>',
				'<attribute:b view-priority="1" class="foo bar qux jax"></attribute:b>',
				'<container:p>[<attribute:b view-priority="1" class="foo bar baz qux jax"></attribute:b>]</container:p>'
			);
		} );

		it( 'should wrap single element by merging styles', () => {
			test(
				'<container:p>[<attribute:b view-priority="1" style="color:red; position: absolute;"></attribute:b>]</container:p>',
				'<attribute:b view-priority="1" style="color:red; top: 20px;"></attribute:b>',
				'<container:p>[<attribute:b view-priority="1" style="color:red;position:absolute;top:20px;"></attribute:b>]</container:p>'
			);
		} );

		it( 'should not merge styles when they differ', () => {
			test(
				'<container:p>[<attribute:b view-priority="1" style="color:red;"></attribute:b>]</container:p>',
				'<attribute:b view-priority="1" style="color:black;"></attribute:b>',
				'<container:p>' +
				'[' +
					'<attribute:b view-priority="1" style="color:black;">' +
						'<attribute:b view-priority="1" style="color:red;"></attribute:b>' +
					'</attribute:b>' +
				']' +
				'</container:p>'
			);
		} );

		it( 'should not merge single elements when they have different priority', () => {
			test(
				'<container:p>[<attribute:b view-priority="2" style="color:red;"></attribute:b>]</container:p>',
				'<attribute:b view-priority="1" style="color:red;"></attribute:b>',
				'<container:p>' +
				'[' +
					'<attribute:b view-priority="1" style="color:red;">' +
						'<attribute:b view-priority="2" style="color:red;"></attribute:b>' +
					'</attribute:b>' +
				']</container:p>'
			);
		} );

		it( 'should be merged with outside element when wrapping all children', () => {
			test(
				'<container:p>' +
					'<attribute:b view-priority="1" foo="bar">[foobar<attribute:i view-priority="1">baz</attribute:i>]</attribute:b>' +
				'</container:p>',
				'<attribute:b view-priority="1" baz="qux"></attribute:b>',
				'<container:p>' +
				'[' +
					'<attribute:b view-priority="1" baz="qux" foo="bar">' +
						'foobar' +
						'<attribute:i view-priority="1">baz</attribute:i>' +
					'</attribute:b>' +
				']' +
				'</container:p>'
			);
		} );
	} );
} );
