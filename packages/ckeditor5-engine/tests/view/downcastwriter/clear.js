/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import DowncastWriter from '../../../src/view/downcastwriter.js';
import Range from '../../../src/view/range.js';
import { stringify, parse } from '../../../src/dev-utils/view.js';
import ContainerElement from '../../../src/view/containerelement.js';
import AttributeElement from '../../../src/view/attributeelement.js';
import EmptyElement from '../../../src/view/emptyelement.js';
import UIElement from '../../../src/view/uielement.js';
import RawElement from '../../../src/view/rawelement.js';

import Document from '../../../src/view/document.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';
import { StylesProcessor } from '../../../src/view/stylesmap.js';

describe( 'DowncastWriter', () => {
	describe( 'clear()', () => {
		let writer, document;

		// Executes test using `parse` and `stringify` utils functions. Uses range delimiters `[]{}` to create ranges.
		//
		// @param {Object} elementToRemove
		// @param {String} input
		// @param {String} expectedResult
		function testDowncast( elementToRemove, input, expectedResult ) {
			const { view, selection } = parse( input );

			writer.clear( selection.getFirstRange(), elementToRemove );

			expect( stringify( view, null, { showType: true } ) ).to.equal( expectedResult );
		}

		beforeEach( () => {
			document = new Document( new StylesProcessor() );
			writer = new DowncastWriter( document );
		} );

		it( 'should throw when range placed in two containers', () => {
			const p1 = new ContainerElement( document, 'p' );
			const p2 = new ContainerElement( document, 'p' );

			expectToThrowCKEditorError( () => {
				writer.clear( Range._createFromParentsAndOffsets( p1, 0, p2, 0 ) );
			}, 'view-writer-invalid-range-container', document );
		} );

		it( 'should throw when range has no parent container', () => {
			const el = new AttributeElement( document, 'b' );

			expectToThrowCKEditorError( () => {
				writer.clear( Range._createFromParentsAndOffsets( el, 0, el, 0 ) );
			}, 'view-writer-invalid-range-container', document );
		} );

		it( 'should remove matched element from range', () => {
			const elementToRemove = new AttributeElement( document, 'b' );

			testDowncast(
				elementToRemove,
				'<container:p>[b<attribute:b>a</attribute:b>r]</container:p>',
				'<container:p>br</container:p>'
			);
		} );

		it( 'should remove matched element from range when range is inside text node', () => {
			const elementToRemove = new AttributeElement( document, 'b' );

			testDowncast(
				elementToRemove,
				'<container:p>F{o<attribute:b>o</attribute:b> ba}r</container:p>',
				'<container:p>Fo bar</container:p>'
			);
		} );

		it( 'should remove multiple matched elements from range', () => {
			const elementToRemove = new AttributeElement( document, 'b' );

			testDowncast(
				elementToRemove,
				'<container:p>[Fo<attribute:b>o</attribute:b> b<attribute:b>a</attribute:b>r]</container:p>',
				'<container:p>Fo br</container:p>'
			);
		} );

		it( 'should remove multiple matched elements from range when range is inside text node', () => {
			const elementToRemove = new AttributeElement( document, 'b' );

			testDowncast(
				elementToRemove,
				'<container:p>F{o<attribute:b>o</attribute:b> <attribute:b>b</attribute:b>a}r</container:p>',
				'<container:p>Fo ar</container:p>'
			);
		} );

		it( 'should remove only matched element', () => {
			const elementToRemove = new AttributeElement( document, 'b' );

			testDowncast(
				elementToRemove,
				'<container:p>F{o<attribute:i>o</attribute:i> <attribute:b>b</attribute:b>a}r</container:p>',
				'<container:p>Fo<attribute:i>o</attribute:i> ar</container:p>'
			);
		} );

		it( 'should remove part of node when range ends inside this node', () => {
			const elementToRemove = new AttributeElement( document, 'b' );

			testDowncast(
				elementToRemove,
				'<container:p>f{oo<attribute:b>ba}r</attribute:b></container:p>',
				'<container:p>foo<attribute:b>r</attribute:b></container:p>'
			);
		} );

		it( 'should remove part of node when range starts inside this node', () => {
			const elementToRemove = new AttributeElement( document, 'b' );

			testDowncast(
				elementToRemove,
				'<container:p>foo<attribute:b>b{ar</attribute:b>bi}z</container:p>',
				'<container:p>foo<attribute:b>b</attribute:b>biz</container:p>'
			);
		} );

		it( 'should remove part of node when range starts and ends inside this node', () => {
			const elementToRemove = new AttributeElement( document, 'b' );

			testDowncast(
				elementToRemove,
				'<container:p>foo<attribute:b>b{a}r</attribute:b>biz</container:p>',
				'<container:p>foo<attribute:b>br</attribute:b>biz</container:p>'
			);
		} );

		it( 'should merge after removing', () => {
			const elementToRemove = new AttributeElement( document, 'b' );

			testDowncast(
				elementToRemove,
				'<container:p>' +
					'<attribute:a>fo{o</attribute:a><attribute:b>a</attribute:b><attribute:a>b}iz</attribute:a>' +
				'</container:p>',
				'<container:p><attribute:a>foobiz</attribute:a></container:p>'
			);
		} );

		it( 'should remove EmptyElement', () => {
			const elementToRemove = new EmptyElement( document, 'img' );

			testDowncast(
				elementToRemove,
				'<container:p>f{oo<empty:img></empty:img>ba}r</container:p>',
				'<container:p>foobar</container:p>'
			);
		} );

		it( 'should remove UIElement', () => {
			const elementToRemove = new UIElement( document, 'span' );

			testDowncast(
				elementToRemove,
				'<container:p>f{oo<ui:span></ui:span>ba}r</container:p>',
				'<container:p>foobar</container:p>'
			);
		} );

		it( 'should remove a RawElement', () => {
			const elementToRemove = new RawElement( document, 'span' );

			testDowncast(
				elementToRemove,
				'<container:p>f{oo<raw:span></raw:span>ba}r</container:p>',
				'<container:p>foobar</container:p>'
			);
		} );

		it( 'should remove ContainerElement', () => {
			const elementToRemove = new ContainerElement( document, 'p' );

			testDowncast(
				elementToRemove,
				'[<container:div>foo</container:div><container:p>bar</container:p><container:div>biz</container:div>]',
				'<container:div>foo</container:div><container:div>biz</container:div>'
			);
		} );
	} );
} );
