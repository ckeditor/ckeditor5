/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ViewDowncastWriter } from '../../../src/view/downcastwriter.js';
import { ViewElement } from '../../../src/view/element.js';
import { ViewContainerElement } from '../../../src/view/containerelement.js';
import { ViewAttributeElement } from '../../../src/view/attributeelement.js';
import { ViewEmptyElement } from '../../../src/view/emptyelement.js';
import { UIElement } from '../../../src/view/uielement.js';
import { RawElement } from '../../../src/view/rawelement.js';
import { ViewPosition } from '../../../src/view/position.js';
import { ViewRange } from '../../../src/view/range.js';
import { Text } from '../../../src/view/text.js';

import { _stringifyView, _parseView } from '../../../src/dev-utils/view.js';
import { ViewDocument } from '../../../src/view/document.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';
import { StylesProcessor } from '../../../src/view/stylesmap.js';

describe( 'DowncastWriter', () => {
	describe( 'unwrap()', () => {
		let writer, document;

		// Executes test using `parse` and `stringify` utils functions.
		//
		// @param {String} input
		// @param {String} unwrapAttribute
		// @param {String} expected
		function testUnwrap( input, unwrapAttribute, expected ) {
			const { view, selection } = _parseView( input );

			const newRange = writer.unwrap( selection.getFirstRange(), _parseView( unwrapAttribute ) );
			expect( _stringifyView( view.root, newRange, { showType: true, showPriority: true } ) ).to.equal( expected );
		}

		beforeEach( () => {
			document = new ViewDocument( new StylesProcessor() );
			writer = new ViewDowncastWriter( document );
		} );

		it( 'should do nothing on collapsed ranges', () => {
			testUnwrap(
				'<container:p>f{}oo</container:p>',
				'<attribute:b view-priority="10"></attribute:b>',
				'<container:p>f{}oo</container:p>'
			);
		} );

		it( 'should do nothing on single text node', () => {
			testUnwrap(
				'<container:p>[foobar]</container:p>',
				'<attribute:b view-priority="1"></attribute:b>',
				'<container:p>[foobar]</container:p>'
			);
		} );

		it( 'should throw error when element is not instance of ViewAttributeElement', () => {
			const container = new ViewContainerElement(
				document, 'p', null, new ViewAttributeElement( document, 'b', null, new Text( 'foo' ) )
			);

			const range = new ViewRange(
				new ViewPosition( container, 0 ),
				new ViewPosition( container, 1 )
			);
			const b = new ViewElement( document, 'b' );

			expectToThrowCKEditorError( () => {
				writer.unwrap( range, b );
			}, 'view-writer-unwrap-invalid-attribute', document );
		} );

		it( 'should throw error when range placed in two containers', () => {
			const container1 = new ViewContainerElement( document, 'p' );
			const container2 = new ViewContainerElement( document, 'p' );
			const range = new ViewRange(
				new ViewPosition( container1, 0 ),
				new ViewPosition( container2, 1 )
			);
			const b = new ViewAttributeElement( document, 'b' );

			expectToThrowCKEditorError( () => {
				writer.unwrap( range, b );
			}, 'view-writer-invalid-range-container', document );
		} );

		it( 'should throw when range has no parent container', () => {
			const el = new ViewAttributeElement( document, 'b' );
			const b = new ViewAttributeElement( document, 'b' );

			expectToThrowCKEditorError( () => {
				writer.unwrap( ViewRange._createFromParentsAndOffsets( el, 0, el, 0 ), b );
			}, 'view-writer-invalid-range-container', document );
		} );

		it( 'should unwrap single node', () => {
			testUnwrap(
				'<container:p>[<attribute:b view-priority="1">foobar</attribute:b>]</container:p>',
				'<attribute:b view-priority="1"></attribute:b>',
				'<container:p>[foobar]</container:p>'
			);
		} );

		it( 'should not unwrap attributes with different priorities #1', () => {
			testUnwrap(
				'<container:p>[<attribute:b view-priority="1">foobar</attribute:b>]</container:p>',
				'<attribute:b view-priority="2"></attribute:b>',
				'<container:p>[<attribute:b view-priority="1">foobar</attribute:b>]</container:p>'
			);
		} );

		it( 'should not unwrap attributes with different priorities #2', () => {
			testUnwrap(
				'<container:p>' +
				'[' +
					'<attribute:b view-priority="2">foo</attribute:b>' +
					'<attribute:b view-priority="1">bar</attribute:b>' +
					'<attribute:b view-priority="2">baz</attribute:b>' +
				']' +
				'</container:p>',
				'<attribute:b view-priority="2"></attribute:b>',
				'<container:p>[foo<attribute:b view-priority="1">bar</attribute:b>baz]</container:p>'
			);
		} );

		it( 'should unwrap part of the node', () => {
			testUnwrap(
				'<container:p>[baz<attribute:b view-priority="1">foo}bar</attribute:b></container:p>',
				'<attribute:b view-priority="1"></attribute:b>',
				'<container:p>[bazfoo]<attribute:b view-priority="1">bar</attribute:b></container:p>'
			);
		} );

		it( 'should support unicode', () => {
			testUnwrap(
				'<container:p>[நிலை<attribute:b view-priority="1">க்}கு</attribute:b></container:p>',
				'<attribute:b view-priority="1"></attribute:b>',
				'<container:p>[நிலைக்]<attribute:b view-priority="1">கு</attribute:b></container:p>'
			);
		} );

		it( 'should unwrap nested attributes', () => {
			testUnwrap(
				'<container:p>' +
					'[<attribute:u view-priority="1"><attribute:b view-priority="1">foobar</attribute:b></attribute:u>]' +
				'</container:p>',
				'<attribute:b view-priority="1"></attribute:b>',
				'<container:p>[<attribute:u view-priority="1">foobar</attribute:u>]</container:p>'
			);
		} );

		it( 'should unwrap a part of a nested attribute', () => {
			testUnwrap(
				'<container:p>' +
					'<attribute:u view-priority="1"><attribute:b view-priority="1">fo{ob}ar</attribute:b></attribute:u>' +
				'</container:p>',
				'<attribute:b view-priority="1"></attribute:b>',
				'<container:p>' +
					'<attribute:u view-priority="1">' +
						'<attribute:b view-priority="1">fo</attribute:b>' +
						'[ob]' +
						'<attribute:b view-priority="1">ar</attribute:b>' +
					'</attribute:u>' +
				'</container:p>'
			);
		} );

		it( 'should merge unwrapped nodes #1', () => {
			testUnwrap(
				'<container:p>foo[<attribute:b view-priority="1">bar</attribute:b>]baz</container:p>',
				'<attribute:b view-priority="1"></attribute:b>',
				'<container:p>foo{bar}baz</container:p>'
			);
		} );

		it( 'should merge unwrapped nodes #2', () => {
			const input = '<container:p>' +
			'foo' +
				'<attribute:u view-priority="1">bar</attribute:u>' +
				'[' +
				'<attribute:b view-priority="1">' +
					'<attribute:u view-priority="1">bazqux</attribute:u>' +
				'</attribute:b>' +
				']' +
			'</container:p>';
			const attribute = '<attribute:b view-priority="1"></attribute:b>';
			const result = '<container:p>foo<attribute:u view-priority="1">bar{bazqux</attribute:u>]</container:p>';

			testUnwrap( input, attribute, result );
		} );

		it( 'should merge unwrapped nodes #3', () => {
			const input = '<container:p>' +
				'foo' +
				'<attribute:u view-priority="1">bar</attribute:u>' +
				'[' +
				'<attribute:b view-priority="1">' +
					'<attribute:u view-priority="1">baz}qux</attribute:u>' +
				'</attribute:b>' +
			'</container:p>';
			const attribute = '<attribute:b view-priority="1"></attribute:b>';
			const result = '<container:p>' +
				'foo' +
				'<attribute:u view-priority="1">bar{baz</attribute:u>]' +
				'<attribute:b view-priority="1">' +
					'<attribute:u view-priority="1">qux</attribute:u>' +
				'</attribute:b>' +
			'</container:p>';

			testUnwrap( input, attribute, result );
		} );

		it( 'should merge unwrapped nodes #4', () => {
			const input = '<container:p>' +
				'foo' +
				'<attribute:u view-priority="1">bar</attribute:u>' +
				'[' +
				'<attribute:b view-priority="1">' +
					'<attribute:u view-priority="1">baz</attribute:u>' +
				'</attribute:b>' +
				']' +
				'<attribute:u view-priority="1">qux</attribute:u>' +
			'</container:p>';
			const attribute = '<attribute:b view-priority="1"></attribute:b>';
			const result = '<container:p>' +
				'foo' +
				'<attribute:u view-priority="1">bar{baz}qux</attribute:u>' +
			'</container:p>';

			testUnwrap( input, attribute, result );
		} );

		it( 'should merge unwrapped nodes #5', () => {
			const input = '<container:p>' +
				'[' +
				'<attribute:b view-priority="1"><attribute:u view-priority="1">foo</attribute:u></attribute:b>' +
				'<attribute:b view-priority="1"><attribute:u view-priority="1">bar</attribute:u></attribute:b>' +
				'<attribute:b view-priority="1"><attribute:u view-priority="1">baz</attribute:u></attribute:b>' +
				']' +
			'</container:p>';
			const attribute = '<attribute:b view-priority="1"></attribute:b>';
			const result = '<container:p>[<attribute:u view-priority="1">foobarbaz</attribute:u>]</container:p>';

			testUnwrap( input, attribute, result );
		} );

		it( 'should unwrap mixed ranges #1', () => {
			const input = '<container:p>' +
				'[' +
				'<attribute:u view-priority="1">' +
					'<attribute:b view-priority="1">foo]</attribute:b>' +
				'</attribute:u>' +
			'</container:p>';
			const attribute = '<attribute:b view-priority="1"></attribute:b>';
			const result = '<container:p>[<attribute:u view-priority="1">foo</attribute:u>]</container:p>';

			testUnwrap( input, attribute, result );
		} );

		it( 'should unwrap mixed ranges #2', () => {
			testUnwrap(
				'<container:p>' +
					'[<attribute:u view-priority="1"><attribute:b view-priority="1">foo}</attribute:b></attribute:u>' +
				'</container:p>',
				'<attribute:b view-priority="1"></attribute:b>',
				'<container:p>[<attribute:u view-priority="1">foo</attribute:u>]</container:p>'
			);
		} );

		it( 'should unwrap single element by removing matching attributes', () => {
			testUnwrap(
				'<container:p>[<attribute:b view-priority="1" foo="bar" baz="qux">test</attribute:b>]</container:p>',
				'<attribute:b view-priority="1" baz="qux"></attribute:b>',
				'<container:p>[<attribute:b view-priority="1" foo="bar">test</attribute:b>]</container:p>'
			);
		} );

		it( 'should not unwrap single element when attributes are different', () => {
			testUnwrap(
				'<container:p>[<attribute:b view-priority="1" baz="qux" foo="bar">test</attribute:b>]</container:p>',
				'<attribute:b view-priority="1" baz="qux" test="true"></attribute:b>',
				'<container:p>[<attribute:b view-priority="1" baz="qux" foo="bar">test</attribute:b>]</container:p>'
			);
		} );

		it( 'should unwrap single element by removing matching classes', () => {
			testUnwrap(
				'<container:p>[<attribute:b view-priority="1" class="bar baz foo">test</attribute:b>]</container:p>',
				'<attribute:b view-priority="1" class="baz foo"></attribute:b>',
				'<container:p>[<attribute:b view-priority="1" class="bar">test</attribute:b>]</container:p>'
			);
		} );

		it( 'should not unwrap single element when classes are different', () => {
			testUnwrap(
				'<container:p>[<attribute:b view-priority="1" class="bar baz foo">test</attribute:b>]</container:p>',
				'<attribute:b view-priority="1" class="baz foo qux"></attribute:b>',
				'<container:p>[<attribute:b view-priority="1" class="bar baz foo">test</attribute:b>]</container:p>'
			);
		} );

		it( 'should unwrap single element by removing matching styles', () => {
			testUnwrap(
				'<container:p>' +
					'[<attribute:b view-priority="1" style="color:red;position:absolute;top:10px;">test</attribute:b>]' +
				'</container:p>',
				'<attribute:b view-priority="1" style="position: absolute;"></attribute:b>',
				'<container:p>[<attribute:b view-priority="1" style="color:red;top:10px">test</attribute:b>]</container:p>'
			);
		} );

		it( 'should not unwrap single element when styles are different', () => {
			testUnwrap(
				'<container:p>' +
					'[<attribute:b view-priority="1" style="color:red;position:absolute;top:10px">test</attribute:b>]' +
				'</container:p>',
				'<attribute:b view-priority="1" style="position: relative;"></attribute:b>',
				'<container:p>' +
					'[<attribute:b view-priority="1" style="color:red;position:absolute;top:10px">test</attribute:b>]' +
				'</container:p>'
			);
		} );

		it( 'should not unwrap single element when styles are same but classes different', () => {
			testUnwrap(
				'<container:p>' +
					'[<attribute:b view-priority="1" class="foo" style="color:red">test</attribute:b>]' +
				'</container:p>',
				'<attribute:b view-priority="1" style="color: red;"></attribute:b>',
				'<container:p>' +
					'[<attribute:b view-priority="1" class="foo">test</attribute:b>]' +
				'</container:p>'
			);
		} );

		it( 'should not unwrap single element when classes are same but styles different', () => {
			testUnwrap(
				'<container:p>' +
					'[<attribute:b view-priority="1" class="foo bar" style="color:red">test</attribute:b>]' +
				'</container:p>',
				'<attribute:b view-priority="1" class="foo bar"></attribute:b>',
				'<container:p>' +
					'[<attribute:b view-priority="1" style="color:red">test</attribute:b>]' +
				'</container:p>'
			);
		} );

		it( 'should not unwrap single element when classes and styles are same but other attributes have different values', () => {
			testUnwrap(
				'<container:p>' +
					'[<attribute:b view-priority="1" foo="bar" class="abc" style="color:red">test</attribute:b>]' +
				'</container:p>',
				'<attribute:b view-priority="1" foo="123" class="abc" style="color: red;"></attribute:b>',
				'<container:p>' +
					'[<attribute:b view-priority="1" class="abc" foo="bar" style="color:red">test</attribute:b>]' +
				'</container:p>'
			);
		} );

		it( 'should partially unwrap part of a node', () => {
			testUnwrap(
				'<container:p>' +
					'[<attribute:b view-priority="1" baz="qux" foo="bar">foo}bar</attribute:b>' +
				'</container:p>',
				'<attribute:b view-priority="1" foo="bar"></attribute:b>',
				'<container:p>' +
					'[<attribute:b view-priority="1" baz="qux">foo</attribute:b>]' +
					'<attribute:b view-priority="1" baz="qux" foo="bar">bar</attribute:b>' +
				'</container:p>'
			);
		} );

		it( 'should partially unwrap a nested attribute', () => {
			testUnwrap(
				'<container:p>' +
					'[<attribute:i view-priority="1">' +
						'<attribute:b view-priority="1" style="color:red;position:absolute;top:10px;">test</attribute:b>' +
					'</attribute:i>]' +
				'</container:p>',
				'<attribute:b view-priority="1" style="position: absolute;"></attribute:b>',
				'<container:p>' +
					'[<attribute:i view-priority="1">' +
						'<attribute:b view-priority="1" style="color:red;top:10px">test</attribute:b>' +
					'</attribute:i>]' +
				'</container:p>'
			);
		} );

		it( 'should partially unwrap a part of a nested attribute', () => {
			testUnwrap(
				'<container:p>' +
					'<attribute:i view-priority="1">' +
						'<attribute:b view-priority="1" style="color:red;position:absolute;top:10px;">t{es}t</attribute:b>' +
					'</attribute:i>' +
				'</container:p>',
				'<attribute:b view-priority="1" style="position: absolute;"></attribute:b>',
				'<container:p>' +
					'<attribute:i view-priority="1">' +
						'<attribute:b view-priority="1" style="color:red;position:absolute;top:10px">t</attribute:b>' +
						'[<attribute:b view-priority="1" style="color:red;top:10px">es</attribute:b>]' +
						'<attribute:b view-priority="1" style="color:red;position:absolute;top:10px">t</attribute:b>' +
					'</attribute:i>' +
				'</container:p>'
			);
		} );

		it( 'should be merged after being partially unwrapped', () => {
			testUnwrap(
				'<container:p>' +
					'<attribute:b view-priority="1" baz="qux">xyz</attribute:b>' +
					'[<attribute:b view-priority="1" baz="qux" foo="bar">foo}bar</attribute:b>' +
				'</container:p>',
				'<attribute:b view-priority="1" foo="bar"></attribute:b>',
				'<container:p>' +
					'<attribute:b view-priority="1" baz="qux">xyz{foo</attribute:b>]' +
					'<attribute:b view-priority="1" baz="qux" foo="bar">bar</attribute:b>' +
				'</container:p>'
			);
		} );

		it( 'should unwrap single node in document fragment', () => {
			testUnwrap(
				'<container:p>[<attribute:b view-priority="1">foobar</attribute:b>]</container:p>',
				'<attribute:b view-priority="1"></attribute:b>',
				'<container:p>[foobar]</container:p>'
			);
		} );

		it( 'should unwrap ViewEmptyElement', () => {
			testUnwrap(
				'<container:p>[<attribute:b><empty:img></empty:img></attribute:b>]</container:p>',
				'<attribute:b></attribute:b>',
				'<container:p>[<empty:img></empty:img>]</container:p>'
			);
		} );

		it( 'should throw if range is inside ViewEmptyElement', () => {
			const empty = new ViewEmptyElement( document, 'img' );
			const attribute = new ViewAttributeElement( document, 'b' );
			const container = new ViewContainerElement( document, 'p', null, [ empty, attribute ] );
			const range = ViewRange._createFromParentsAndOffsets( empty, 0, container, 2 );

			expectToThrowCKEditorError( () => {
				writer.unwrap( range, attribute );
			}, 'view-writer-cannot-break-empty-element', document );
		} );

		it( 'should unwrap UIElement', () => {
			testUnwrap(
				'<container:p>[<attribute:b><ui:span></ui:span></attribute:b>]</container:p>',
				'<attribute:b></attribute:b>',
				'<container:p>[<ui:span></ui:span>]</container:p>'
			);
		} );

		it( 'should throw if range is placed inside UIElement', () => {
			const uiElement = new UIElement( document, 'span' );
			const attribute = new ViewAttributeElement( document, 'b' );
			const container = new ViewContainerElement( document, 'p', null, [ uiElement, attribute ] );
			const range = ViewRange._createFromParentsAndOffsets( uiElement, 0, container, 2 );

			expectToThrowCKEditorError( () => {
				writer.unwrap( range, attribute );
			}, 'view-writer-cannot-break-ui-element', document );
		} );

		it( 'should unwrap a RawElement', () => {
			testUnwrap(
				'<container:p>[<attribute:b><raw:span></raw:span></attribute:b>]</container:p>',
				'<attribute:b></attribute:b>',
				'<container:p>[<raw:span></raw:span>]</container:p>'
			);
		} );

		it( 'should throw if a range is placed inside a RawElement', () => {
			const rawElement = new RawElement( document, 'span' );
			const attribute = new ViewAttributeElement( document, 'b' );
			const container = new ViewContainerElement( document, 'p', null, [ rawElement, attribute ] );
			const range = ViewRange._createFromParentsAndOffsets( rawElement, 0, container, 2 );

			expectToThrowCKEditorError( () => {
				writer.unwrap( range, attribute );
			}, 'view-writer-cannot-break-raw-element', document );
		} );

		it( 'should unwrap if both elements have same id', () => {
			const unwrapper = writer.createAttributeElement( 'span', null, { id: 'foo' } );
			const attribute = writer.createAttributeElement( 'span', null, { id: 'foo' } );
			const container = writer.createContainerElement( 'div' );

			writer.insert( writer.createPositionAt( container, 0 ), attribute );
			writer.unwrap( ViewRange._createOn( attribute ), unwrapper );

			expect( _stringifyView( container, null, { showType: false, showPriority: false } ) ).to.equal( '<div></div>' );
		} );

		it( 'should always unwrap whole element if both elements have same id', () => {
			const unwrapper = writer.createAttributeElement( 'b', null, { id: 'foo' } );
			const attribute = writer.createAttributeElement( 'span', { foo: 'foo' }, { id: 'foo' } );
			const container = writer.createContainerElement( 'div' );

			writer.insert( writer.createPositionAt( container, 0 ), attribute );
			writer.unwrap( writer.createRangeOn( attribute ), unwrapper );

			expect( _stringifyView( container, null, { showType: false, showPriority: false } ) ).to.equal( '<div></div>' );
		} );

		// Below are tests for elements with different ids.
		// Only partial unwrapping is tested because elements with different ids are never similar.
		// This means that unwrapping of whole element is not possible in this case.
		it( 'should not unwrap matching attributes if the element to unwrap has id', () => {
			const unwrapper = writer.createAttributeElement( 'span', { foo: 'foo' } );
			const attribute = writer.createAttributeElement( 'span', { foo: 'foo', bar: 'bar' }, { id: 'id' } );
			const container = writer.createContainerElement( 'div' );

			writer.insert( writer.createPositionAt( container, 0 ), attribute );
			writer.unwrap( writer.createRangeOn( attribute ), unwrapper );

			const view = _stringifyView( container, null, { showType: false, showPriority: false } );
			expect( view ).to.equal( '<div><span bar="bar" foo="foo"></span></div>' );
		} );

		it( 'should not unwrap matching attributes if the unwrapping element has id', () => {
			const unwrapper = writer.createAttributeElement( 'span', { foo: 'foo' }, { id: 'id' } );
			const attribute = writer.createAttributeElement( 'span', { foo: 'foo', bar: 'bar' } );
			const container = writer.createContainerElement( 'div' );

			writer.insert( writer.createPositionAt( container, 0 ), attribute );
			writer.unwrap( writer.createRangeOn( attribute ), unwrapper );

			const view = _stringifyView( container, null, { showType: false, showPriority: false } );
			expect( view ).to.equal( '<div><span bar="bar" foo="foo"></span></div>' );
		} );

		it( 'should not unwrap matching attributes if the elements have different id', () => {
			const unwrapper = writer.createAttributeElement( 'span', { foo: 'foo' }, { id: 'a' } );
			const attribute = writer.createAttributeElement( 'span', { foo: 'foo', bar: 'bar' }, { id: 'b' } );
			const container = writer.createContainerElement( 'div' );

			writer.insert( writer.createPositionAt( container, 0 ), attribute );
			writer.unwrap( writer.createRangeOn( attribute ), unwrapper );

			const view = _stringifyView( container, null, { showType: false, showPriority: false } );
			expect( view ).to.equal( '<div><span bar="bar" foo="foo"></span></div>' );
		} );
	} );
} );
