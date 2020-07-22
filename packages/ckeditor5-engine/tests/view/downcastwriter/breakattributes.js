/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import DowncastWriter from '../../../src/view/downcastwriter';
import Document from '../../../src/view/document';
import { stringify, parse } from '../../../src/dev-utils/view';
import ContainerElement from '../../../src/view/containerelement';
import AttributeElement from '../../../src/view/attributeelement';
import EmptyElement from '../../../src/view/emptyelement';
import UIElement from '../../../src/view/uielement';
import RawElement from '../../../src/view/rawelement';
import Range from '../../../src/view/range';
import Position from '../../../src/view/position';

import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';
import { StylesProcessor } from '../../../src/view/stylesmap';

describe( 'DowncastWriter', () => {
	describe( 'breakAttributes()', () => {
		let writer, document;

		beforeEach( () => {
			document = new Document( new StylesProcessor() );
			writer = new DowncastWriter( document );
		} );

		describe( 'break position', () => {
			/**
			 * Executes test using `parse` and `stringify` utils functions. Uses range delimiters `[]{}` to create and
			 * test break position.
			 *
			 * @param {String} input
			 * @param {String} expected
			 */
			function testBreakAttributes( input, expected ) {
				const { view, selection } = parse( input );

				const newPosition = writer.breakAttributes( selection.getFirstPosition() );
				expect( stringify( view.root, newPosition, {
					showType: true,
					showPriority: true
				} ) ).to.equal( expected );
			}

			it( 'should not break text nodes if they are not in attribute elements - middle', () => {
				testBreakAttributes(
					'<container:p>foo{}bar</container:p>',
					'<container:p>foo{}bar</container:p>'
				);
			} );

			it( 'should not break text nodes if they are not in attribute elements - beginning', () => {
				testBreakAttributes(
					'<container:p>{}foobar</container:p>',
					'<container:p>{}foobar</container:p>'
				);
			} );

			it( 'should not break text nodes if they are not in attribute elements #2 - end', () => {
				testBreakAttributes(
					'<container:p>foobar{}</container:p>',
					'<container:p>foobar{}</container:p>'
				);
			} );

			it( 'should split attribute element', () => {
				testBreakAttributes(
					'<container:p><attribute:b view-priority="1">foo{}bar</attribute:b></container:p>',
					'<container:p>' +
					'<attribute:b view-priority="1">foo</attribute:b>[]<attribute:b view-priority="1">bar</attribute:b>' +
					'</container:p>'
				);
			} );

			it( 'should move from beginning of the nested text node to the container', () => {
				testBreakAttributes(
					'<container:p>' +
					'<attribute:b view-priority="1"><attribute:u view-priority="1">{}foobar</attribute:u></attribute:b>' +
					'</container:p>',
					'<container:p>' +
					'[]<attribute:b view-priority="1"><attribute:u view-priority="1">foobar</attribute:u></attribute:b>' +
					'</container:p>'
				);
			} );

			it( 'should stick selection in text node if it is in container', () => {
				testBreakAttributes(
					'<container:p>foo{}<attribute:b view-priority="1">bar</attribute:b></container:p>',
					'<container:p>foo{}<attribute:b view-priority="1">bar</attribute:b></container:p>'
				);
			} );

			it( 'should split nested attributes', () => {
				testBreakAttributes(
					'<container:p>' +
					'<attribute:b view-priority="1"><attribute:u view-priority="1">foo{}bar</attribute:u></attribute:b>' +
					'</container:p>',
					'<container:p>' +
					'<attribute:b view-priority="1">' +
					'<attribute:u view-priority="1">' +
					'foo' +
					'</attribute:u>' +
					'</attribute:b>' +
					'[]' +
					'<attribute:b view-priority="1">' +
					'<attribute:u view-priority="1">' +
					'bar' +
					'</attribute:u>' +
					'</attribute:b>' +
					'</container:p>'
				);
			} );

			it( 'should move from end of the nested text node to the container', () => {
				testBreakAttributes(
					'<container:p>' +
					'<attribute:b view-priority="1"><attribute:u view-priority="1">foobar{}</attribute:u></attribute:b>' +
					'</container:p>',
					'<container:p>' +
					'<attribute:b view-priority="1"><attribute:u view-priority="1">foobar</attribute:u></attribute:b>[]' +
					'</container:p>'
				);
			} );

			it( 'should split attribute element directly in document fragment', () => {
				testBreakAttributes(
					'<attribute:b view-priority="1">foo{}bar</attribute:b>',
					'<attribute:b view-priority="1">foo</attribute:b>[]<attribute:b view-priority="1">bar</attribute:b>'
				);
			} );

			it( 'should not split text directly in document fragment', () => {
				testBreakAttributes(
					'foo{}bar',
					'foo{}bar'
				);
			} );
		} );

		describe( 'break range', () => {
			/**
			 * Executes test using `parse` and `stringify` utils functions.
			 *
			 * @param {String} input
			 * @param {String} expected
			 */
			function testBreak( input, expected ) {
				const { view, selection } = parse( input );

				const newRange = writer.breakAttributes( selection.getFirstRange() );
				expect( stringify( view.root, newRange, { showType: true } ) ).to.equal( expected );
			}

			it( 'should throw when range placed in two containers', () => {
				const p1 = new ContainerElement( document, 'p' );
				const p2 = new ContainerElement( document, 'p' );

				expectToThrowCKEditorError( () => {
					writer.breakAttributes( Range._createFromParentsAndOffsets( p1, 0, p2, 0 ) );
				}, 'view-writer-invalid-range-container', document );
			} );

			it( 'should throw when range has no parent container', () => {
				const el = new AttributeElement( document, 'b' );

				expectToThrowCKEditorError( () => {
					writer.breakAttributes( Range._createFromParentsAndOffsets( el, 0, el, 0 ) );
				}, 'view-writer-invalid-range-container', document );
			} );

			it( 'should not break text nodes if they are not in attribute elements', () => {
				testBreak(
					'<container:p>foo{}bar</container:p>',
					'<container:p>foo{}bar</container:p>'
				);
			} );

			it( 'should break at collapsed range and return collapsed one', () => {
				testBreak(
					'<container:p><attribute:b>foo{}bar</attribute:b></container:p>',
					'<container:p><attribute:b>foo</attribute:b>[]<attribute:b>bar</attribute:b></container:p>'
				);
			} );

			it( 'should break inside text node #1', () => {
				testBreak(
					'<container:p><attribute:b>foo{bar}baz</attribute:b></container:p>',
					'<container:p>' +
						'<attribute:b>foo</attribute:b>[<attribute:b>bar</attribute:b>]<attribute:b>baz</attribute:b>' +
					'</container:p>'
				);
			} );

			it( 'should break inside text node #2', () => {
				testBreak(
					'<container:p><attribute:b>foo{barbaz}</attribute:b></container:p>',
					'<container:p><attribute:b>foo</attribute:b>[<attribute:b>barbaz</attribute:b>]</container:p>'
				);
			} );

			it( 'should break inside text node #3', () => {
				testBreak(
					'<container:p><attribute:b>foo{barbaz]</attribute:b></container:p>',
					'<container:p><attribute:b>foo</attribute:b>[<attribute:b>barbaz</attribute:b>]</container:p>'
				);
			} );

			it( 'should break inside text node #4', () => {
				testBreak(
					'<container:p><attribute:b>{foo}barbaz</attribute:b></container:p>',
					'<container:p>[<attribute:b>foo</attribute:b>]<attribute:b>barbaz</attribute:b></container:p>'
				);
			} );

			it( 'should break inside text node #5', () => {
				testBreak(
					'<container:p><attribute:b>[foo}barbaz</attribute:b></container:p>',
					'<container:p>[<attribute:b>foo</attribute:b>]<attribute:b>barbaz</attribute:b></container:p>'
				);
			} );

			it( 'should break placed inside different nodes', () => {
				testBreak(
					'<container:p>foo{bar<attribute:b>baz}qux</attribute:b></container:p>',
					'<container:p>foo{bar<attribute:b>baz</attribute:b>]<attribute:b>qux</attribute:b></container:p>'
				);
			} );

			it( 'should split attribute element directly in document fragment', () => {
				testBreak(
					'<attribute:b>fo{ob}ar</attribute:b>',
					'<attribute:b>fo</attribute:b>[<attribute:b>ob</attribute:b>]<attribute:b>ar</attribute:b>'
				);
			} );

			it( 'should not split text directly in document fragment', () => {
				testBreak(
					'foo{}bar',
					'foo{}bar'
				);
			} );

			it( 'should throw if breaking inside EmptyElement #1', () => {
				const img = new EmptyElement( document, 'img' );
				new ContainerElement( document, 'p', null, img ); // eslint-disable-line no-new
				const position = new Position( img, 0 );

				expectToThrowCKEditorError( () => {
					writer.breakAttributes( position );
				}, 'view-writer-cannot-break-empty-element', writer );
			} );

			it( 'should throw if breaking inside EmptyElement #2', () => {
				const img = new EmptyElement( document, 'img' );
				const b = new AttributeElement( document, 'b' );
				new ContainerElement( document, 'p', null, [ img, b ] ); // eslint-disable-line no-new
				const range = Range._createFromParentsAndOffsets( img, 0, b, 0 );

				expectToThrowCKEditorError( () => {
					writer.breakAttributes( range );
				}, 'view-writer-cannot-break-empty-element', writer );
			} );

			it( 'should throw if breaking inside UIElement #1', () => {
				const span = new UIElement( document, 'span' );
				new ContainerElement( document, 'p', null, span ); // eslint-disable-line no-new
				const position = new Position( span, 0 );

				expectToThrowCKEditorError( () => {
					writer.breakAttributes( position );
				}, 'view-writer-cannot-break-ui-element', writer );
			} );

			it( 'should throw if breaking inside UIElement #2', () => {
				const span = new UIElement( document, 'span' );
				const b = new AttributeElement( document, 'b' );
				new ContainerElement( document, 'p', null, [ span, b ] ); // eslint-disable-line no-new
				const range = Range._createFromParentsAndOffsets( span, 0, b, 0 );

				expectToThrowCKEditorError( () => {
					writer.breakAttributes( range );
				}, 'view-writer-cannot-break-ui-element', writer );
			} );

			it( 'should throw if breaking inside a RawElement #1', () => {
				const span = new RawElement( document, 'span' );
				new ContainerElement( document, 'p', null, span ); // eslint-disable-line no-new
				const position = new Position( span, 0 );

				expectToThrowCKEditorError( () => {
					writer.breakAttributes( position );
				}, 'view-writer-cannot-break-raw-element', writer );
			} );

			it( 'should throw if breaking inside a RawElement #2', () => {
				const span = new RawElement( document, 'span' );
				const b = new AttributeElement( document, 'b' );
				new ContainerElement( document, 'p', null, [ span, b ] ); // eslint-disable-line no-new
				const range = Range._createFromParentsAndOffsets( span, 0, b, 0 );

				expectToThrowCKEditorError( () => {
					writer.breakAttributes( range );
				}, 'view-writer-cannot-break-raw-element', writer );
			} );
		} );
	} );
} );
