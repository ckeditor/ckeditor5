/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ViewDowncastWriter } from '../../../src/view/downcastwriter.js';
import { ViewDocument } from '../../../src/view/document.js';
import { _stringifyView, _parseView } from '../../../src/dev-utils/view.js';
import { ViewContainerElement } from '../../../src/view/containerelement.js';
import { ViewAttributeElement } from '../../../src/view/attributeelement.js';
import { ViewEmptyElement } from '../../../src/view/emptyelement.js';
import { ViewUIElement } from '../../../src/view/uielement.js';
import { ViewRawElement } from '../../../src/view/rawelement.js';
import { ViewRange } from '../../../src/view/range.js';
import { ViewPosition } from '../../../src/view/position.js';

import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';
import { StylesProcessor } from '../../../src/view/stylesmap.js';

describe( 'DowncastWriter', () => {
	describe( 'breakAttributes()', () => {
		let writer, document;

		beforeEach( () => {
			document = new ViewDocument( new StylesProcessor() );
			writer = new ViewDowncastWriter( document );
		} );

		describe( 'break position', () => {
			/**
			 * Executes test using `_parseView` and `_stringifyView` utils functions. Uses range delimiters `[]{}` to create and
			 * test break position.
			 *
			 * @param {String} input
			 * @param {String} expected
			 */
			function testBreakAttributes( input, expected ) {
				const { view, selection } = _parseView( input );

				const newPosition = writer.breakAttributes( selection.getFirstPosition() );
				expect( _stringifyView( view.root, newPosition, {
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
			 * Executes test using `_parseView` and `_stringifyView` utils functions.
			 *
			 * @param {String} input
			 * @param {String} expected
			 */
			function testBreak( input, expected ) {
				const { view, selection } = _parseView( input );

				const newRange = writer.breakAttributes( selection.getFirstRange() );
				expect( _stringifyView( view.root, newRange, { showType: true } ) ).to.equal( expected );
			}

			it( 'should throw when range placed in two containers', () => {
				const p1 = new ViewContainerElement( document, 'p' );
				const p2 = new ViewContainerElement( document, 'p' );

				expectToThrowCKEditorError( () => {
					writer.breakAttributes( ViewRange._createFromParentsAndOffsets( p1, 0, p2, 0 ) );
				}, 'view-writer-invalid-range-container', document );
			} );

			it( 'should throw when range has no parent container', () => {
				const el = new ViewAttributeElement( document, 'b' );

				expectToThrowCKEditorError( () => {
					writer.breakAttributes( ViewRange._createFromParentsAndOffsets( el, 0, el, 0 ) );
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

			it( 'should throw if breaking inside ViewEmptyElement #1', () => {
				const img = new ViewEmptyElement( document, 'img' );
				new ViewContainerElement( document, 'p', null, img ); // eslint-disable-line no-new
				const position = new ViewPosition( img, 0 );

				expectToThrowCKEditorError( () => {
					writer.breakAttributes( position );
				}, 'view-writer-cannot-break-empty-element', writer );
			} );

			it( 'should throw if breaking inside ViewEmptyElement #2', () => {
				const img = new ViewEmptyElement( document, 'img' );
				const b = new ViewAttributeElement( document, 'b' );
				new ViewContainerElement( document, 'p', null, [ img, b ] ); // eslint-disable-line no-new
				const range = ViewRange._createFromParentsAndOffsets( img, 0, b, 0 );

				expectToThrowCKEditorError( () => {
					writer.breakAttributes( range );
				}, 'view-writer-cannot-break-empty-element', writer );
			} );

			it( 'should throw if breaking inside UIElement #1', () => {
				const span = new ViewUIElement( document, 'span' );
				new ViewContainerElement( document, 'p', null, span ); // eslint-disable-line no-new
				const position = new ViewPosition( span, 0 );

				expectToThrowCKEditorError( () => {
					writer.breakAttributes( position );
				}, 'view-writer-cannot-break-ui-element', writer );
			} );

			it( 'should throw if breaking inside UIElement #2', () => {
				const span = new ViewUIElement( document, 'span' );
				const b = new ViewAttributeElement( document, 'b' );
				new ViewContainerElement( document, 'p', null, [ span, b ] ); // eslint-disable-line no-new
				const range = ViewRange._createFromParentsAndOffsets( span, 0, b, 0 );

				expectToThrowCKEditorError( () => {
					writer.breakAttributes( range );
				}, 'view-writer-cannot-break-ui-element', writer );
			} );

			it( 'should throw if breaking inside a RawElement #1', () => {
				const span = new ViewRawElement( document, 'span' );
				new ViewContainerElement( document, 'p', null, span ); // eslint-disable-line no-new
				const position = new ViewPosition( span, 0 );

				expectToThrowCKEditorError( () => {
					writer.breakAttributes( position );
				}, 'view-writer-cannot-break-raw-element', writer );
			} );

			it( 'should throw if breaking inside a RawElement #2', () => {
				const span = new ViewRawElement( document, 'span' );
				const b = new ViewAttributeElement( document, 'b' );
				new ViewContainerElement( document, 'p', null, [ span, b ] ); // eslint-disable-line no-new
				const range = ViewRange._createFromParentsAndOffsets( span, 0, b, 0 );

				expectToThrowCKEditorError( () => {
					writer.breakAttributes( range );
				}, 'view-writer-cannot-break-raw-element', writer );
			} );
		} );
	} );
} );
