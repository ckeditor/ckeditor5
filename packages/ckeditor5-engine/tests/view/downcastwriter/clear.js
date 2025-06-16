/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ViewDowncastWriter } from '../../../src/view/downcastwriter.js';
import { ViewRange } from '../../../src/view/range.js';
import { _stringifyView, _parseView } from '../../../src/dev-utils/view.js';
import { ViewContainerElement } from '../../../src/view/containerelement.js';
import { ViewAttributeElement } from '../../../src/view/attributeelement.js';
import { ViewEmptyElement } from '../../../src/view/emptyelement.js';
import { ViewUIElement } from '../../../src/view/uielement.js';
import { ViewRawElement } from '../../../src/view/rawelement.js';

import { ViewDocument } from '../../../src/view/document.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';
import { StylesProcessor } from '../../../src/view/stylesmap.js';

describe( 'DowncastWriter', () => {
	describe( 'clear()', () => {
		let writer, document;

		// Executes test using `_parseView` and `_stringifyView` utils functions. Uses range delimiters `[]{}` to create ranges.
		//
		// @param {Object} elementToRemove
		// @param {String} input
		// @param {String} expectedResult
		function testDowncast( elementToRemove, input, expectedResult ) {
			const { view, selection } = _parseView( input );

			writer.clear( selection.getFirstRange(), elementToRemove );

			expect( _stringifyView( view, null, { showType: true } ) ).to.equal( expectedResult );
		}

		beforeEach( () => {
			document = new ViewDocument( new StylesProcessor() );
			writer = new ViewDowncastWriter( document );
		} );

		it( 'should throw when range placed in two containers', () => {
			const p1 = new ViewContainerElement( document, 'p' );
			const p2 = new ViewContainerElement( document, 'p' );

			expectToThrowCKEditorError( () => {
				writer.clear( ViewRange._createFromParentsAndOffsets( p1, 0, p2, 0 ) );
			}, 'view-writer-invalid-range-container', document );
		} );

		it( 'should throw when range has no parent container', () => {
			const el = new ViewAttributeElement( document, 'b' );

			expectToThrowCKEditorError( () => {
				writer.clear( ViewRange._createFromParentsAndOffsets( el, 0, el, 0 ) );
			}, 'view-writer-invalid-range-container', document );
		} );

		it( 'should remove matched element from range', () => {
			const elementToRemove = new ViewAttributeElement( document, 'b' );

			testDowncast(
				elementToRemove,
				'<container:p>[b<attribute:b>a</attribute:b>r]</container:p>',
				'<container:p>br</container:p>'
			);
		} );

		it( 'should remove matched element from range when range is inside text node', () => {
			const elementToRemove = new ViewAttributeElement( document, 'b' );

			testDowncast(
				elementToRemove,
				'<container:p>F{o<attribute:b>o</attribute:b> ba}r</container:p>',
				'<container:p>Fo bar</container:p>'
			);
		} );

		it( 'should remove multiple matched elements from range', () => {
			const elementToRemove = new ViewAttributeElement( document, 'b' );

			testDowncast(
				elementToRemove,
				'<container:p>[Fo<attribute:b>o</attribute:b> b<attribute:b>a</attribute:b>r]</container:p>',
				'<container:p>Fo br</container:p>'
			);
		} );

		it( 'should remove multiple matched elements from range when range is inside text node', () => {
			const elementToRemove = new ViewAttributeElement( document, 'b' );

			testDowncast(
				elementToRemove,
				'<container:p>F{o<attribute:b>o</attribute:b> <attribute:b>b</attribute:b>a}r</container:p>',
				'<container:p>Fo ar</container:p>'
			);
		} );

		it( 'should remove only matched element', () => {
			const elementToRemove = new ViewAttributeElement( document, 'b' );

			testDowncast(
				elementToRemove,
				'<container:p>F{o<attribute:i>o</attribute:i> <attribute:b>b</attribute:b>a}r</container:p>',
				'<container:p>Fo<attribute:i>o</attribute:i> ar</container:p>'
			);
		} );

		it( 'should remove part of node when range ends inside this node', () => {
			const elementToRemove = new ViewAttributeElement( document, 'b' );

			testDowncast(
				elementToRemove,
				'<container:p>f{oo<attribute:b>ba}r</attribute:b></container:p>',
				'<container:p>foo<attribute:b>r</attribute:b></container:p>'
			);
		} );

		it( 'should remove part of node when range starts inside this node', () => {
			const elementToRemove = new ViewAttributeElement( document, 'b' );

			testDowncast(
				elementToRemove,
				'<container:p>foo<attribute:b>b{ar</attribute:b>bi}z</container:p>',
				'<container:p>foo<attribute:b>b</attribute:b>biz</container:p>'
			);
		} );

		it( 'should remove part of node when range starts and ends inside this node', () => {
			const elementToRemove = new ViewAttributeElement( document, 'b' );

			testDowncast(
				elementToRemove,
				'<container:p>foo<attribute:b>b{a}r</attribute:b>biz</container:p>',
				'<container:p>foo<attribute:b>br</attribute:b>biz</container:p>'
			);
		} );

		it( 'should merge after removing', () => {
			const elementToRemove = new ViewAttributeElement( document, 'b' );

			testDowncast(
				elementToRemove,
				'<container:p>' +
					'<attribute:a>fo{o</attribute:a><attribute:b>a</attribute:b><attribute:a>b}iz</attribute:a>' +
				'</container:p>',
				'<container:p><attribute:a>foobiz</attribute:a></container:p>'
			);
		} );

		it( 'should remove ViewEmptyElement', () => {
			const elementToRemove = new ViewEmptyElement( document, 'img' );

			testDowncast(
				elementToRemove,
				'<container:p>f{oo<empty:img></empty:img>ba}r</container:p>',
				'<container:p>foobar</container:p>'
			);
		} );

		it( 'should remove UIElement', () => {
			const elementToRemove = new ViewUIElement( document, 'span' );

			testDowncast(
				elementToRemove,
				'<container:p>f{oo<ui:span></ui:span>ba}r</container:p>',
				'<container:p>foobar</container:p>'
			);
		} );

		it( 'should remove a RawElement', () => {
			const elementToRemove = new ViewRawElement( document, 'span' );

			testDowncast(
				elementToRemove,
				'<container:p>f{oo<raw:span></raw:span>ba}r</container:p>',
				'<container:p>foobar</container:p>'
			);
		} );

		it( 'should remove ViewContainerElement', () => {
			const elementToRemove = new ViewContainerElement( document, 'p' );

			testDowncast(
				elementToRemove,
				'[<container:div>foo</container:div><container:p>bar</container:p><container:div>biz</container:div>]',
				'<container:div>foo</container:div><container:div>biz</container:div>'
			);
		} );
	} );
} );
