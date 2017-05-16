/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { clear } from '../../../src/view/writer';
import Range from '../../../src/view/range';
import { stringify, parse } from '../../../src/dev-utils/view';
import ContainerElement from '../../../src/view/containerelement';
import AttributeElement from '../../../src/view/attributeelement';
import EmptyElement from '../../../src/view/emptyelement';
import UIElement from '../../../src/view/uielement';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

describe( 'writer', () => {
	// Executes test using `parse` and `stringify` utils functions. Uses range delimiters `[]{}` to create ranges.
	//
	// @param {Object} elementToRemove
	// @param {String} input
	// @param {String} expectedResult
	function test( elementToRemove, input, expectedResult ) {
		const { view, selection } = parse( input );

		clear( selection.getFirstRange(), elementToRemove );

		expect( stringify( view, null, { showType: true } ) ).to.equal( expectedResult );
	}

	describe( 'clear', () => {
		it( 'should throw when range placed in two containers', () => {
			const p1 = new ContainerElement( 'p' );
			const p2 = new ContainerElement( 'p' );

			expect( () => {
				clear( Range.createFromParentsAndOffsets( p1, 0, p2, 0 ) );
			} ).to.throw( CKEditorError, 'view-writer-invalid-range-container' );
		} );

		it( 'should throw when range has no parent container', () => {
			const el = new AttributeElement( 'b' );

			expect( () => {
				clear( Range.createFromParentsAndOffsets( el, 0, el, 0 ) );
			} ).to.throw( CKEditorError, 'view-writer-invalid-range-container' );
		} );

		it( 'should remove matched element from range', () => {
			const elementToRemove = new AttributeElement( 'b' );

			test(
				elementToRemove,
				'<container:p>[b<attribute:b>a</attribute:b>r]</container:p>',
				'<container:p>br</container:p>'
			);
		} );

		it( 'should remove matched element from range when range is inside text node', () => {
			const elementToRemove = new AttributeElement( 'b' );

			test(
				elementToRemove,
				'<container:p>F{o<attribute:b>o</attribute:b> ba}r</container:p>',
				'<container:p>Fo bar</container:p>'
			);
		} );

		it( 'should remove multiple matched elements from range', () => {
			const elementToRemove = new AttributeElement( 'b' );

			test(
				elementToRemove,
				'<container:p>[Fo<attribute:b>o</attribute:b> b<attribute:b>a</attribute:b>r]</container:p>',
				'<container:p>Fo br</container:p>'
			);
		} );

		it( 'should remove multiple matched elements from range when range is inside text node', () => {
			const elementToRemove = new AttributeElement( 'b' );

			test(
				elementToRemove,
				'<container:p>F{o<attribute:b>o</attribute:b> <attribute:b>b</attribute:b>a}r</container:p>',
				'<container:p>Fo ar</container:p>'
			);
		} );

		it( 'should remove only matched element', () => {
			const elementToRemove = new AttributeElement( 'b' );

			test(
				elementToRemove,
				'<container:p>F{o<attribute:i>o</attribute:i> <attribute:b>b</attribute:b>a}r</container:p>',
				'<container:p>Fo<attribute:i>o</attribute:i> ar</container:p>'
			);
		} );

		it( 'should remove part of node when range ends inside this node', () => {
			const elementToRemove = new AttributeElement( 'b' );

			test(
				elementToRemove,
				'<container:p>f{oo<attribute:b>ba}r</attribute:b></container:p>',
				'<container:p>foo<attribute:b>r</attribute:b></container:p>'
			);
		} );

		it( 'should remove part of node when range starts inside this node', () => {
			const elementToRemove = new AttributeElement( 'b' );

			test(
				elementToRemove,
				'<container:p>foo<attribute:b>b{ar</attribute:b>bi}z</container:p>',
				'<container:p>foo<attribute:b>b</attribute:b>biz</container:p>'
			);
		} );

		it( 'should remove part of node when range starts and ends inside this node', () => {
			const elementToRemove = new AttributeElement( 'b' );

			test(
				elementToRemove,
				'<container:p>foo<attribute:b>b{a}r</attribute:b>biz</container:p>',
				'<container:p>foo<attribute:b>br</attribute:b>biz</container:p>'
			);
		} );

		it( 'should merge after removing', () => {
			const elementToRemove = new AttributeElement( 'b' );

			test(
				elementToRemove,
				'<container:p>' +
					'<attribute:a>fo{o</attribute:a><attribute:b>a</attribute:b><attribute:a>b}iz</attribute:a>' +
				'</container:p>',
				'<container:p><attribute:a>foobiz</attribute:a></container:p>'
			);
		} );

		it( 'should remove EmptyElement', () => {
			const elementToRemove = new EmptyElement( 'img' );

			test(
				elementToRemove,
				'<container:p>f{oo<empty:img></empty:img>ba}r</container:p>',
				'<container:p>foobar</container:p>'
			);
		} );

		it( 'should remove UIElement', () => {
			const elementToRemove = new UIElement( 'span' );

			test(
				elementToRemove,
				'<container:p>f{oo<ui:span></ui:span>ba}r</container:p>',
				'<container:p>foobar</container:p>'
			);
		} );

		it( 'should remove ContainerElement', () => {
			const elementToRemove = new ContainerElement( 'p' );

			test(
				elementToRemove,
				'[<container:div>foo</container:div><container:p>bar</container:p><container:div>biz</container:div>]',
				'<container:div>foo</container:div><container:div>biz</container:div>'
			);
		} );
	} );
} );
