/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import DowncastWriter from '../../../src/view/downcastwriter.js';
import View from '../../../src/view/view.js';
import DocumentFragment from '../../../src/view/documentfragment.js';
import Element from '../../../src/view/element.js';
import ContainerElement from '../../../src/view/containerelement.js';
import AttributeElement from '../../../src/view/attributeelement.js';
import EmptyElement from '../../../src/view/emptyelement.js';
import RawElement from '../../../src/view/rawelement.js';
import UIElement from '../../../src/view/uielement.js';
import Position from '../../../src/view/position.js';
import Range from '../../../src/view/range.js';
import Text from '../../../src/view/text.js';

import { stringify, parse } from '../../../src/dev-utils/view.js';
import createViewRoot from '../_utils/createroot.js';
import Document from '../../../src/view/document.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';
import { StylesProcessor } from '../../../src/view/stylesmap.js';

describe( 'DowncastWriter', () => {
	describe( 'wrap()', () => {
		let writer, document;

		beforeEach( () => {
			document = new Document( new StylesProcessor() );
			writer = new DowncastWriter( document );
		} );

		describe( 'non-collapsed range', () => {
			/**
			 * Executes test using `parse` and `stringify` utils functions.
			 *
			 * @param {String} input
			 * @param {String} wrapAttribute
			 * @param {String} expected
			 */
			function testWrap( input, wrapAttribute, expected ) {
				const { view, selection } = parse( input );
				const newRange = writer.wrap( selection.getFirstRange(), parse( wrapAttribute ) );

				expect( stringify( view.root, newRange, { showType: true, showPriority: true, showAttributeElementId: true } ) )
					.to.equal( expected );
			}

			it( 'wraps single text node', () => {
				testWrap(
					'<container:p>[foobar]</container:p>',
					'<attribute:b view-priority="1"></attribute:b>',
					'<container:p>[<attribute:b view-priority="1">foobar</attribute:b>]</container:p>'
				);
			} );

			it( 'wraps single text node in document fragment', () => {
				testWrap(
					'{foobar}',
					'<attribute:b view-priority="1"></attribute:b>',
					'[<attribute:b view-priority="1">foobar</attribute:b>]'
				);
			} );

			it( 'should throw error when element is not instance of AttributeElement', () => {
				const container = new ContainerElement( document, 'p', null, new Text( 'foo' ) );
				const range = new Range(
					new Position( container, 0 ),
					new Position( container, 1 )
				);
				const b = new Element( document, 'b' );

				expectToThrowCKEditorError( () => {
					writer.wrap( range, b );
				}, 'view-writer-wrap-invalid-attribute', document );
			} );

			it( 'should throw error when range placed in two containers', () => {
				const container1 = new ContainerElement( document, 'p' );
				const container2 = new ContainerElement( document, 'p' );
				const range = new Range(
					new Position( container1, 0 ),
					new Position( container2, 1 )
				);
				const b = new AttributeElement( document, 'b' );

				expectToThrowCKEditorError( () => {
					writer.wrap( range, b );
				}, 'view-writer-invalid-range-container', document );
			} );

			it( 'should throw when range has no parent container', () => {
				const el = new AttributeElement( document, 'b' );
				const b = new AttributeElement( document, 'b' );

				expectToThrowCKEditorError( () => {
					writer.wrap( Range._createFromParentsAndOffsets( el, 0, el, 0 ), b );
				}, 'view-writer-invalid-range-container', document );
			} );

			it( 'wraps part of a single text node #1', () => {
				testWrap(
					'<container:p>[foo}bar</container:p>',
					'<attribute:b view-priority="1"></attribute:b>',
					'<container:p>[<attribute:b view-priority="1">foo</attribute:b>]bar</container:p>'
				);
			} );

			it( 'wraps part of a single text node #2', () => {
				testWrap(
					'<container:p>{foo}bar</container:p>',
					'<attribute:b view-priority="1"></attribute:b>',
					'<container:p>[<attribute:b view-priority="1">foo</attribute:b>]bar</container:p>'
				);
			} );

			it( 'should support unicode', () => {
				testWrap(
					'<container:p>நி{லை}க்கு</container:p>',
					'<attribute:b view-priority="1"></attribute:b>',
					'<container:p>நி[<attribute:b view-priority="1">லை</attribute:b>]க்கு</container:p>'
				);
			} );

			it( 'should join wrapping element with a nested attribute element', () => {
				testWrap(
					'<container:p>' +
						'<attribute:u view-priority="1">' +
							'<attribute:b view-priority="2" class="bar">{foo}</attribute:b>' +
						'</attribute:u>' +
					'</container:p>',

					'<attribute:b class="foo" view-priority="2"></attribute:b>',

					'<container:p>' +
						'[<attribute:u view-priority="1">' +
							'<attribute:b view-priority="2" class="bar foo">foo</attribute:b>' +
						'</attribute:u>]' +
					'</container:p>'
				);
			} );

			it( 'should join wrapping element with a part of a nested attribute element', () => {
				testWrap(
					'<container:p>' +
						'<attribute:i view-priority="1">' +
							'<attribute:b view-priority="2" class="bar">fo{ob}ar</attribute:b>' +
						'</attribute:i>' +
					'</container:p>',

					'<attribute:b class="foo" view-priority="2"></attribute:b>',

					'<container:p>' +
						'<attribute:i view-priority="1">' +
							'<attribute:b view-priority="2" class="bar">fo</attribute:b>' +
							'[<attribute:b view-priority="2" class="bar foo">ob</attribute:b>]' +
							'<attribute:b view-priority="2" class="bar">ar</attribute:b>' +
						'</attribute:i>' +
					'</container:p>'
				);
			} );

			it( 'wraps part of a single text node #3', () => {
				testWrap(
					'<container:p>foo{bar}</container:p>',
					'<attribute:b view-priority="1"></attribute:b>',
					'<container:p>foo[<attribute:b view-priority="1">bar</attribute:b>]</container:p>'
				);
			} );

			it( 'should wrap inside nested containers', () => {
				testWrap(
					'<container:div>[foobar<container:p>baz</container:p>]</container:div>',
					'<attribute:b view-priority="1"></attribute:b>',
					'<container:div>[<attribute:b view-priority="1">foobar<container:p>baz</container:p></attribute:b>]</container:div>'
				);
			} );

			it( 'wraps according to priorities', () => {
				testWrap(
					'<container:p>[<attribute:u view-priority="1">foobar</attribute:u>]</container:p>',

					'<attribute:b view-priority="2"></attribute:b>',

					'<container:p>' +
						'[<attribute:u view-priority="1"><attribute:b view-priority="2">foobar</attribute:b></attribute:u>]' +
					'</container:p>'
				);
			} );

			it( 'merges wrapped nodes #1', () => {
				testWrap(
					'<container:p>' +
						'[<attribute:b view-priority="1">foo</attribute:b>bar<attribute:b view-priority="1">baz</attribute:b>]' +
					'</container:p>',

					'<attribute:b view-priority="1"></attribute:b>',

					'<container:p>[<attribute:b view-priority="1">foobarbaz</attribute:b>]</container:p>'
				);
			} );

			it( 'merges wrapped nodes #2', () => {
				testWrap(
					'<container:p><attribute:b view-priority="1">foo</attribute:b>[bar}baz</container:p>',
					'<attribute:b view-priority="1"></attribute:b>',
					'<container:p><attribute:b view-priority="1">foo{bar</attribute:b>]baz</container:p>'
				);
			} );

			it( 'merges wrapped nodes #3', () => {
				testWrap(
					'<container:p><attribute:b view-priority="1">foobar</attribute:b>[baz]</container:p>',
					'<attribute:b view-priority="1"></attribute:b>',
					'<container:p><attribute:b view-priority="1">foobar{baz</attribute:b>]</container:p>'
				);
			} );

			it( 'merges wrapped nodes #4', () => {
				testWrap(
					'<container:p>[foo<attribute:i view-priority="1">bar</attribute:i>]baz</container:p>',

					'<attribute:b view-priority="1"></attribute:b>',

					'<container:p>' +
						'[<attribute:b view-priority="1">foo<attribute:i view-priority="1">bar</attribute:i></attribute:b>]baz' +
					'</container:p>'
				);
			} );

			it( 'merges wrapped nodes #5', () => {
				testWrap(
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

			it( 'merges wrapped nodes #6', () => {
				testWrap(
					'<container:div>f{o<attribute:strong>ob</attribute:strong>a}r</container:div>',

					'<attribute:span view-priority="1"></attribute:span>',

					'<container:div>f[' +
						'<attribute:span view-priority="1">o' +
							'<attribute:strong view-priority="10">ob</attribute:strong>' +
						'a</attribute:span>' +
					']r</container:div>'
				);
			} );

			it( 'should wrap single element by merging attributes', () => {
				testWrap(
					'<container:p>[<attribute:b view-priority="1" foo="bar" one="two"></attribute:b>]</container:p>',
					'<attribute:b view-priority="1" baz="qux" one="two"></attribute:b>',
					'<container:p>[<attribute:b view-priority="1" baz="qux" foo="bar" one="two"></attribute:b>]</container:p>'
				);
			} );

			it( 'should not merge attributes when they differ', () => {
				testWrap(
					'<container:p>[<attribute:b view-priority="1" foo="bar">text</attribute:b>]</container:p>',

					'<attribute:b view-priority="1" foo="baz"></attribute:b>',

					'<container:p>' +
						'[<attribute:b view-priority="1" foo="bar">' +
							'<attribute:b view-priority="1" foo="baz">text</attribute:b>' +
						'</attribute:b>]' +
					'</container:p>'
				);
			} );

			it( 'should wrap single element by merging classes', () => {
				testWrap(
					'<container:p>[<attribute:b view-priority="1" class="foo bar baz"></attribute:b>]</container:p>',
					'<attribute:b view-priority="1" class="foo bar qux jax"></attribute:b>',
					'<container:p>[<attribute:b view-priority="1" class="bar baz foo jax qux"></attribute:b>]</container:p>'
				);
			} );

			it( 'should wrap single element by merging styles', () => {
				testWrap(
					'<container:p>' +
						'[<attribute:b view-priority="1" style="color:red; position: absolute"></attribute:b>]' +
					'</container:p>',

					'<attribute:b view-priority="1" style="color:red; top: 20px"></attribute:b>',

					'<container:p>' +
						'[<attribute:b view-priority="1" style="color:red;position:absolute;top:20px"></attribute:b>]' +
					'</container:p>'
				);
			} );

			it( 'should not merge styles when they differ', () => {
				testWrap(
					'<container:p>[<attribute:b view-priority="1" style="color:red"></attribute:b>]</container:p>',

					'<attribute:b view-priority="1" style="color:black"></attribute:b>',

					'<container:p>' +
						'[' +
						'<attribute:b view-priority="1" style="color:black">' +
							'<attribute:b view-priority="1" style="color:red"></attribute:b>' +
						'</attribute:b>' +
						']' +
					'</container:p>'
				);
			} );

			it( 'should not merge single elements when they have different priority', () => {
				testWrap(
					'<container:p>[<attribute:b view-priority="2" style="color:red"></attribute:b>]</container:p>',

					'<attribute:b view-priority="1" style="color:red"></attribute:b>',

					'<container:p>' +
						'[' +
						'<attribute:b view-priority="1" style="color:red">' +
							'<attribute:b view-priority="2" style="color:red"></attribute:b>' +
						'</attribute:b>' +
						']' +
					'</container:p>'
				);
			} );

			it( 'should be merged with outside element when wrapping all children', () => {
				testWrap(
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

			it( 'should be merged with broken element', () => {
				testWrap(
					'<container:p>' +
						'[<attribute:b view-priority="1" foo="bar">foo}bar</attribute:b>' +
					'</container:p>',

					'<attribute:b view-priority="1" baz="qux"></attribute:b>',

					'<container:p>' +
						'[<attribute:b view-priority="1" baz="qux" foo="bar">foo</attribute:b>]' +
						'<attribute:b view-priority="1" foo="bar">bar</attribute:b>' +
					'</container:p>'
				);
			} );

			it( 'should be merged with broken element and merged with siblings', () => {
				testWrap(
					'<container:p>' +
						'<attribute:b view-priority="1" baz="qux" foo="bar">xyz</attribute:b>' +
						'[<attribute:b view-priority="1" foo="bar">foo}bar</attribute:b>' +
					'</container:p>',

					'<attribute:b view-priority="1" baz="qux"></attribute:b>',

					'<container:p>' +
						'<attribute:b view-priority="1" baz="qux" foo="bar">xyz{foo</attribute:b>]' +
						'<attribute:b view-priority="1" foo="bar">bar</attribute:b>' +
					'</container:p>'
				);
			} );

			it( 'should wrap EmptyElement', () => {
				testWrap(
					'<container:p>[<empty:img></empty:img>]</container:p>',
					'<attribute:b></attribute:b>',
					'<container:p>[<attribute:b view-priority="10"><empty:img></empty:img></attribute:b>]</container:p>'
				);
			} );

			it( 'should throw if range is inside EmptyElement', () => {
				const emptyElement = new EmptyElement( document, 'img' );
				const container = new ContainerElement( document, 'p', null, emptyElement );
				const range = Range._createFromParentsAndOffsets( emptyElement, 0, container, 1 );

				expectToThrowCKEditorError( () => {
					writer.wrap( range, new AttributeElement( document, 'b' ) );
				}, 'view-writer-cannot-break-empty-element', document );
			} );

			it( 'should wrap UIElement', () => {
				testWrap(
					'<container:p>[<ui:span></ui:span>]</container:p>',
					'<attribute:b></attribute:b>',
					'<container:p>[<attribute:b view-priority="10"><ui:span></ui:span></attribute:b>]</container:p>'
				);
			} );

			it( 'should throw if range is inside UIElement', () => {
				const uiElement = new UIElement( document, 'span' );
				const container = new ContainerElement( document, 'p', null, uiElement );
				const range = Range._createFromParentsAndOffsets( uiElement, 0, container, 1 );

				expectToThrowCKEditorError( () => {
					writer.wrap( range, new AttributeElement( document, 'b' ) );
				}, 'view-writer-cannot-break-ui-element', document );
			} );

			it( 'should wrap a RawElement', () => {
				testWrap(
					'<container:p>[<raw:span></raw:span>]</container:p>',
					'<attribute:b></attribute:b>',
					'<container:p>[<attribute:b view-priority="10"><raw:span></raw:span></attribute:b>]</container:p>'
				);
			} );

			it( 'should throw if a range is inside a RawElement', () => {
				const rawElement = new RawElement( document, 'span' );
				const container = new ContainerElement( document, 'p', null, rawElement );
				const range = Range._createFromParentsAndOffsets( rawElement, 0, container, 1 );

				expectToThrowCKEditorError( () => {
					writer.wrap( range, new AttributeElement( document, 'b' ) );
				}, 'view-writer-cannot-break-raw-element', document );
			} );

			it( 'should wrap an inline ContainerElement', () => {
				const element = new ContainerElement( document, 'span', {}, 'baz' );
				const container = new ContainerElement( document, 'p', null, [ 'foo', element, 'bar' ] );

				const wrapAttribute = new AttributeElement( document, 'b' );
				const range = Range._createFromParentsAndOffsets( container, 0, container, 3 );
				const newRange = writer.wrap( range, wrapAttribute );

				expect( stringify( container, newRange, { showType: true, showPriority: true, showAttributeElementId: true } ) ).to.equal(
					'<container:p>' +
						'[<attribute:b view-priority="10">foo<container:span>baz</container:span>bar</attribute:b>]' +
					'</container:p>'
				);
			} );

			it( 'should keep stable hierarchy when wrapping with attribute with same priority', () => {
				testWrap(
					'<container:p>[<attribute:span>foo</attribute:span>]</container:p>',

					'<attribute:b></attribute:b>',

					'<container:p>' +
						'[<attribute:b view-priority="10">' +
							'<attribute:span view-priority="10">foo</attribute:span>' +
						'</attribute:b>]' +
					'</container:p>'
				);

				testWrap(
					'<container:p>[<attribute:b>foo</attribute:b>]</container:p>',

					'<attribute:span></attribute:span>',

					'<container:p>' +
						'[<attribute:b view-priority="10">' +
							'<attribute:span view-priority="10">foo</attribute:span>' +
						'</attribute:b>]' +
					'</container:p>'
				);
			} );

			it( 'should keep stable hierarchy when wrapping with attribute with same priority that can\'t be merged', () => {
				testWrap(
					'<container:p>[<attribute:span name="foo">foo</attribute:span>]</container:p>',

					'<attribute:span name="bar"></attribute:span>',

					'<container:p>' +
						'[<attribute:span view-priority="10" name="bar">' +
							'<attribute:span view-priority="10" name="foo">foo</attribute:span>' +
						'</attribute:span>]' +
					'</container:p>'
				);

				testWrap(
					'<container:p>[<attribute:span name="bar">foo</attribute:span>]</container:p>',

					'<attribute:span name="foo"></attribute:span>',

					'<container:p>' +
						'[<attribute:span view-priority="10" name="bar">' +
							'<attribute:span view-priority="10" name="foo">foo</attribute:span>' +
						'</attribute:span>]' +
					'</container:p>'
				);
			} );

			it( 'should not join elements if element to wrap has id', () => {
				testWrap(
					'<container:p>[<attribute:span foo="foo" view-id="foo">xyz</attribute:span>]</container:p>',

					'<attribute:span bar="bar"></attribute:span>',

					'<container:p>' +
						'[<attribute:span view-priority="10" bar="bar">' +
							'<attribute:span view-priority="10" view-id="foo" foo="foo">xyz</attribute:span>' +
						'</attribute:span>]' +
					'</container:p>'
				);
			} );

			it( 'should not join elements if wrapper element has id', () => {
				testWrap(
					'<container:p>[<attribute:span foo="foo">xyz</attribute:span>]</container:p>',

					'<attribute:span bar="bar" view-id="foo"></attribute:span>',

					'<container:p>' +
						'[<attribute:span view-priority="10" view-id="foo" bar="bar">' +
							'<attribute:span view-priority="10" foo="foo">xyz</attribute:span>' +
						'</attribute:span>]' +
					'</container:p>'
				);
			} );

			it( 'should not join elements if they have different ids', () => {
				testWrap(
					'<container:p>[<attribute:span foo="foo" view-id="foo">xyz</attribute:span>]</container:p>',

					'<attribute:span bar="bar" view-id="bar"></attribute:span>',

					'<container:p>' +
						'[<attribute:span view-priority="10" view-id="bar" bar="bar">' +
							'<attribute:span view-priority="10" view-id="foo" foo="foo">xyz</attribute:span>' +
						'</attribute:span>]' +
					'</container:p>'
				);
			} );
		} );

		describe( 'collapsed range', () => {
			let view, viewDocument, viewRoot;

			beforeEach( () => {
				view = new View( new StylesProcessor() );
				viewDocument = view.document;
				viewRoot = createViewRoot( viewDocument );
			} );

			afterEach( () => {
				view.destroy();
			} );

			/**
			 * Executes test using `parse` and `stringify` utils functions.
			 *
			 * @param {String} input
			 * @param {String} wrapAttribute
			 * @param {String} expected
			 */
			function testWrap( input, wrapAttribute, expected ) {
				const { view, selection } = parse( input, { rootElement: viewRoot } );
				viewDocument.selection._setTo( selection );

				const newPosition = writer.wrap( selection.getFirstRange(), parse( wrapAttribute ) );

				// Moving parsed elements to a document fragment so the view root is not shown in `stringify`.
				const viewChildren = new DocumentFragment( viewDocument, view.getChildren() );

				expect( stringify( viewChildren, newPosition, { showType: true, showPriority: true } ) ).to.equal( expected );
			}

			it( 'should throw error when element is not instance of AttributeElement', () => {
				const container = new ContainerElement( document, 'p', null, new Text( 'foo' ) );
				const position = new Position( container, 0 );
				const b = new Element( document, 'b' );

				expectToThrowCKEditorError( () => {
					writer.wrap( new Range( position ), b );
				}, 'view-writer-wrap-invalid-attribute', document );
			} );

			it( 'should wrap position at the beginning of text node', () => {
				testWrap(
					'<container:p>{}foobar</container:p>',
					'<attribute:b view-priority="1"></attribute:b>',
					'<container:p><attribute:b view-priority="1">[]</attribute:b>foobar</container:p>'
				);
			} );

			it( 'should wrap position inside text node', () => {
				testWrap(
					'<container:p>foo{}bar</container:p>',
					'<attribute:b view-priority="1"></attribute:b>',
					'<container:p>foo<attribute:b view-priority="1">[]</attribute:b>bar</container:p>'
				);
			} );

			it( 'should support unicode', () => {
				testWrap(
					'<container:p>நிலை{}க்கு</container:p>',
					'<attribute:b view-priority="1"></attribute:b>',
					'<container:p>நிலை<attribute:b view-priority="1">[]</attribute:b>க்கு</container:p>'
				);
			} );

			it( 'should wrap position inside document fragment', () => {
				testWrap(
					'<attribute:b view-priority="1">foo</attribute:b>[]<attribute:b view-priority="3">bar</attribute:b>',

					'<attribute:b view-priority="2"></attribute:b>',

					'<attribute:b view-priority="1">foo</attribute:b>' +
					'<attribute:b view-priority="2">[]</attribute:b>' +
					'<attribute:b view-priority="3">bar</attribute:b>'
				);
			} );

			it( 'should wrap position at the end of text node', () => {
				testWrap(
					'<container:p>foobar{}</container:p>',
					'<attribute:b view-priority="1"></attribute:b>',
					'<container:p>foobar<attribute:b view-priority="1">[]</attribute:b></container:p>'
				);
			} );

			it( 'should merge with existing attributes #1', () => {
				testWrap(
					'<container:p><attribute:b view-priority="1">foo</attribute:b>[]</container:p>',
					'<attribute:b view-priority="1"></attribute:b>',
					'<container:p><attribute:b view-priority="1">foo{}</attribute:b></container:p>'
				);
			} );

			it( 'should merge with existing attributes #2', () => {
				testWrap(
					'<container:p>[]<attribute:b view-priority="1">foo</attribute:b></container:p>',
					'<attribute:b view-priority="1"></attribute:b>',
					'<container:p><attribute:b view-priority="1">{}foo</attribute:b></container:p>'
				);
			} );

			it( 'should wrap when inside nested attributes', () => {
				testWrap(
					'<container:p><attribute:b view-priority="1">foo{}bar</attribute:b></container:p>',

					'<attribute:u view-priority="1"></attribute:u>',

					'<container:p>' +
						'<attribute:b view-priority="1">' +
							'foo' +
							'<attribute:u view-priority="1">[]</attribute:u>' +
							'bar' +
						'</attribute:b>' +
					'</container:p>'
				);
			} );

			it( 'should merge when wrapping between same attribute', () => {
				testWrap(
					'<container:p>' +
						'<attribute:b view-priority="1">foo</attribute:b>[]<attribute:b view-priority="1">bar</attribute:b>' +
					'</container:p>',

					'<attribute:b view-priority="1"></attribute:b>',

					'<container:p><attribute:b view-priority="1">foo{}bar</attribute:b></container:p>'
				);
			} );

			it( 'should move position to text node if in same attribute', () => {
				testWrap(
					'<container:p><attribute:b view-priority="1">foobar[]</attribute:b></container:p>',
					'<attribute:b view-priority="1"></attribute:b>',
					'<container:p><attribute:b view-priority="1">foobar{}</attribute:b></container:p>'
				);
			} );
		} );
	} );
} );
