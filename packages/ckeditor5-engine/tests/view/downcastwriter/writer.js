/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, vi, beforeEach, afterEach } from 'vitest';
import { ViewDowncastWriter } from '../../../src/view/downcastwriter.js';
import { ViewDocument } from '../../../src/view/document.js';
import { ViewEditableElement } from '../../../src/view/editableelement.js';
import { ViewPosition } from '../../../src/view/position.js';
import { ViewRange } from '../../../src/view/range.js';
import { createViewRoot } from '../_utils/createroot.js';
import { ViewElement } from '../../../src/view/element.js';
import { ViewSelection } from '../../../src/view/selection.js';
import { StylesProcessor } from '../../../src/view/stylesmap.js';
import { ViewDocumentFragment } from '../../../src/view/documentfragment.js';
import { HtmlDataProcessor } from '../../../src/dataprocessor/htmldataprocessor.js';

import { CKEditorError } from '@ckeditor/ckeditor5-utils';

describe( 'DowncastWriter', () => {
	let writer, attributes, root, doc;

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	beforeEach( () => {
		attributes = { foo: 'bar', baz: 'quz' };
		doc = new ViewDocument( new StylesProcessor() );
		root = createViewRoot( doc );
		writer = new ViewDowncastWriter( doc );
	} );

	describe( 'setSelection()', () => {
		it( 'should set document view selection', () => {
			const position = ViewPosition._createAt( root, 0 );
			writer.setSelection( position );

			const ranges = Array.from( doc.selection.getRanges() );

			expect( ranges.length ).toBe( 1 );
			expect( ranges[ 0 ].start.compareWith( position ) ).toBe( 'same' );
			expect( ranges[ 0 ].end.compareWith( position ) ).toBe( 'same' );
		} );

		it( 'should be able to set fake selection', () => {
			const position = ViewPosition._createAt( root, 0 );
			writer.setSelection( position, { fake: true, label: 'foo' } );

			expect( doc.selection.isFake ).toBe( true );
			expect( doc.selection.fakeSelectionLabel ).toBe( 'foo' );
		} );
	} );

	describe( 'setSelectionFocus()', () => {
		it( 'should use selection._setFocus method internally', () => {
			const position = ViewPosition._createAt( root, 0 );
			writer.setSelection( position );

			const spy = vi.spyOn( writer.document.selection, '_setFocus' );
			writer.setSelectionFocus( root, 0 );

			expect( spy ).toHaveBeenCalledExactlyOnceWith( root, 0 );
		} );
	} );

	describe( 'createDocumentFragment', () => {
		let view;

		beforeEach( () => {
			const dataProcessor = new HtmlDataProcessor( doc );

			const html = '' +
				'<h1 style="color:blue;position:fixed;">Heading <strong>1</strong></h1>' +
				'<p class="foo1 bar2" style="text-align:left;" data-attr="abc">Foo <i>Bar</i> <strong>Bold</strong></p>' +
				'<p><u>Some underlined</u> text</p>' +
				'<ul>' +
				'<li class="single">Item 1</li>' +
				'<li><span>Item <s>1</s></span></li>' +
				'<li><h2>Item 1</h2></li>' +
				'</ul>';

			view = dataProcessor.toView( html );
		} );

		it( 'should create empty document fragment', () => {
			const df = writer.createDocumentFragment();

			expect( df ).toBeInstanceOf( ViewDocumentFragment );
			expect( df.childCount ).toBe( 0 );
		} );

		it( 'should create document fragment with children', () => {
			const df = writer.createDocumentFragment( [ view.getChild( 0 ), view.getChild( 1 ) ] );

			expect( df ).toBeInstanceOf( ViewDocumentFragment );
			expect( df.childCount ).toBe( 2 );
		} );
	} );

	describe( 'createText()', () => {
		it( 'should create Text instance', () => {
			const text = writer.createText( 'foo bar' );

			expect( text.is( '$text' ) ).toBe( true );
			expect( text.data ).toBe( 'foo bar' );
		} );
	} );

	describe( 'createAttributeElement()', () => {
		it( 'should create ViewAttributeElement', () => {
			const element = writer.createAttributeElement( 'foo', attributes );

			expect( element.is( 'attributeElement' ) ).toBe( true );
			expect( element.name ).toBe( 'foo' );
			assertElementAttributes( element, attributes );
		} );

		it( 'should allow to pass additional options', () => {
			const element = writer.createAttributeElement( 'foo', attributes, {
				priority: 99,
				id: 'bar',
				renderUnsafeAttributes: [ 'baz' ]
			} );

			expect( element.is( 'attributeElement' ) ).toBe( true );
			expect( element.name ).toBe( 'foo' );
			expect( element.priority ).toBe( 99 );
			expect( element.id ).toBe( 'bar' );
			expect( element.shouldRenderUnsafeAttribute( 'baz' ) ).toBe( true );
			assertElementAttributes( element, attributes );
		} );

		it( 'should pass priority 0', () => {
			const element = writer.createAttributeElement( 'foo', attributes, { priority: 0 } );

			expect( element.priority ).toBe( 0 );
		} );
	} );

	describe( 'createContainerElement()', () => {
		it( 'should create ViewContainerElement', () => {
			const element = writer.createContainerElement( 'foo', attributes );

			expect( element.is( 'containerElement' ) ).toBe( true );
			expect( element.name ).toBe( 'foo' );
			assertElementAttributes( element, attributes );
			expect( element.childCount ).toBe( 0 );
		} );

		it( 'should allow to pass additional options', () => {
			const element = writer.createContainerElement( 'foo', attributes, {
				renderUnsafeAttributes: [ 'baz' ]
			} );

			expect( element.is( 'containerElement' ) ).toBe( true );
			expect( element.name ).toBe( 'foo' );
			expect( element.shouldRenderUnsafeAttribute( 'baz' ) ).toBe( true );
			assertElementAttributes( element, attributes );
		} );

		it( 'should create element without attributes', () => {
			const element = writer.createContainerElement( 'foo', null );

			expect( element.is( 'containerElement' ) ).toBe( true );
			expect( element.name ).toBe( 'foo' );
			expect( Array.from( element.getAttributes() ).length ).toBe( 0 );
			expect( element.childCount ).toBe( 0 );
		} );

		it( 'should create element with single child', () => {
			const child = writer.createEmptyElement( 'bar' );
			const element = writer.createContainerElement( 'foo', null, child );

			expect( element.is( 'containerElement' ) ).toBe( true );
			expect( element.name ).toBe( 'foo' );
			expect( Array.from( element.getAttributes() ).length ).toBe( 0 );
			expect( element.childCount ).toBe( 1 );
			expect( element.getChild( 0 ) ).toBe( child );
		} );

		it( 'should create element with children and attributes', () => {
			const first = writer.createEmptyElement( 'aaa' );
			const second = writer.createEmptyElement( 'bbb' );
			const element = writer.createContainerElement( 'foo', attributes, [ first, second ] );

			expect( element.is( 'containerElement' ) ).toBe( true );
			expect( element.name ).toBe( 'foo' );
			assertElementAttributes( element, attributes );
			expect( element.childCount ).toBe( 2 );
			expect( element.getChild( 0 ) ).toBe( first );
			expect( element.getChild( 1 ) ).toBe( second );
		} );

		it( 'should create element with children attributes and allow additional options', () => {
			const child = writer.createEmptyElement( 'bar' );
			const element = writer.createContainerElement( 'foo', attributes, child, { renderUnsafeAttributes: [ 'baz' ] } );

			expect( element.is( 'containerElement' ) ).toBe( true );
			expect( element.name ).toBe( 'foo' );
			expect( element.shouldRenderUnsafeAttribute( 'baz' ) ).toBe( true );
			assertElementAttributes( element, attributes );
			expect( element.childCount ).toBe( 1 );
			expect( element.getChild( 0 ) ).toBe( child );
		} );
	} );

	describe( 'createEditableElement()', () => {
		it( 'should create ViewEditableElement', () => {
			const element = writer.createEditableElement( 'foo', attributes );

			expect( element ).to.be.instanceOf( ViewEditableElement );
			expect( element.name ).toBe( 'foo' );
			assertElementAttributes( element, attributes );
		} );

		it( 'should allow to pass additional options', () => {
			const element = writer.createEditableElement( 'foo', attributes, {
				renderUnsafeAttributes: [ 'baz' ]
			} );

			expect( element.shouldRenderUnsafeAttribute( 'baz' ) ).toBe( true );
		} );
	} );

	describe( 'createEmptyElement()', () => {
		it( 'should create ViewEmptyElement', () => {
			const element = writer.createEmptyElement( 'foo', attributes );

			expect( element.is( 'emptyElement' ) ).toBe( true );
			expect( element.name ).toBe( 'foo' );
			assertElementAttributes( element, attributes );
		} );

		it( 'should allow to pass additional options', () => {
			const element = writer.createEmptyElement( 'foo', attributes, {
				renderUnsafeAttributes: [ 'baz' ]
			} );

			expect( element.is( 'emptyElement' ) ).toBe( true );
			expect( element.name ).toBe( 'foo' );
			expect( element.shouldRenderUnsafeAttribute( 'baz' ) ).toBe( true );
			assertElementAttributes( element, attributes );
		} );
	} );

	describe( 'createUIElement()', () => {
		it( 'should create UIElement', () => {
			const element = writer.createUIElement( 'foo', attributes );

			expect( element.is( 'uiElement' ) ).toBe( true );
			expect( element.name ).toBe( 'foo' );
			assertElementAttributes( element, attributes );
		} );

		it( 'should allow to pass custom rendering method', () => {
			const renderFn = function() {};
			const element = writer.createUIElement( 'foo', attributes, renderFn );

			expect( element.is( 'uiElement' ) ).toBe( true );
			expect( element.name ).toBe( 'foo' );
			expect( element.render ).toBe( renderFn );
			assertElementAttributes( element, attributes );
		} );

		it( 'should allow to pass additional options', () => {
			const renderFn = function() {};
			const element = writer.createUIElement( 'foo', attributes, renderFn );

			expect( element.is( 'uiElement' ) ).toBe( true );
			expect( element.name ).toBe( 'foo' );
			assertElementAttributes( element, attributes );
		} );
	} );

	describe( 'createRawElement()', () => {
		it( 'should create a RawElement', () => {
			const element = writer.createRawElement( 'foo', attributes );

			expect( element.is( 'rawElement' ) ).toBe( true );
			expect( element.name ).toBe( 'foo' );
			assertElementAttributes( element, attributes );

			expect( element.render ).toBeTypeOf( 'function' );
		} );

		it( 'should provide a default empty render() method', () => {
			const element = writer.createRawElement( 'foo' );

			expect( element.render ).toBeTypeOf( 'function' );

			expect( () => {
				element.render();
			} ).not.toThrow();
		} );

		it( 'should allow to pass custom rendering method', () => {
			const renderFn = function() {};
			const element = writer.createRawElement( 'foo', attributes, renderFn );

			expect( element.is( 'rawElement' ) ).toBe( true );
			expect( element.name ).toBe( 'foo' );
			expect( element.render ).toBe( renderFn );
			assertElementAttributes( element, attributes );
		} );

		it( 'should allow to pass additional options', () => {
			const renderFn = function() {};
			const element = writer.createRawElement( 'foo', attributes, renderFn, {
				renderUnsafeAttributes: [ 'baz' ]
			} );

			expect( element.is( 'rawElement' ) ).toBe( true );
			expect( element.name ).toBe( 'foo' );
			expect( element.shouldRenderUnsafeAttribute( 'baz' ) ).toBe( true );
			assertElementAttributes( element, attributes );
		} );
	} );

	describe( 'setAttribute()', () => {
		it( 'should set attribute on given element', () => {
			const element = writer.createAttributeElement( 'span' );

			writer.setAttribute( 'foo', 'bar', element );

			expect( element.getAttribute( 'foo' ) ).toBe( 'bar' );
		} );

		it( 'should add class token if reset is not set', () => {
			const element = writer.createAttributeElement( 'span' );

			writer.setAttribute( 'class', 'foo', false, element );
			writer.setAttribute( 'class', 'bar', false, element );

			expect( element.getAttribute( 'class' ) ).toBe( 'foo bar' );
			expect( element.hasClass( 'foo' ) ).toBe( true );
			expect( element.hasClass( 'bar' ) ).toBe( true );
		} );

		it( 'should add style token if reset is not set', () => {
			const element = writer.createAttributeElement( 'span' );

			writer.setAttribute( 'style', [ 'font-size', '20px' ], false, element );
			writer.setAttribute( 'style', [ 'color', 'red' ], false, element );

			expect( element.getAttribute( 'style' ) ).toBe( 'color:red;font-size:20px;' );
			expect( element.getStyle( 'font-size' ) ).toBe( '20px' );
			expect( element.getStyle( 'color' ) ).toBe( 'red' );
		} );

		it( 'should add rel attribute token if reset is not set', () => {
			const element = writer.createAttributeElement( 'a' );

			writer.setAttribute( 'rel', 'foo', false, element );
			writer.setAttribute( 'rel', 'bar', false, element );

			expect( element.getAttribute( 'rel' ) ).toBe( 'foo bar' );
		} );
	} );

	describe( 'removeAttribute()', () => {
		it( 'should remove attribute on given element', () => {
			const element = writer.createAttributeElement( 'span', { foo: 'bar' } );

			writer.removeAttribute( 'foo', element );

			expect( element.getAttribute( 'foo' ) ).toBeUndefined();
		} );

		it( 'should remove class token if remove value is set', () => {
			const element = writer.createAttributeElement( 'span', { class: 'foo bar' } );

			writer.removeAttribute( 'class', 'foo', element );
			expect( element.getAttribute( 'class' ) ).toBe( 'bar' );

			writer.removeAttribute( 'class', 'bar', element );
			expect( element.getAttribute( 'class' ) ).toBeUndefined();
		} );

		it( 'should remove style token if remove value is set', () => {
			const element = writer.createAttributeElement( 'span', { style: 'font-size: 20px; color: red' } );

			writer.removeAttribute( 'style', 'font-size', element );
			expect( element.getAttribute( 'style' ) ).toBe( 'color:red;' );

			writer.removeAttribute( 'style', 'color', element );
			expect( element.getAttribute( 'style' ) ).toBeUndefined();
		} );

		it( 'should remove rel attribute token if remove value is set', () => {
			const element = writer.createAttributeElement( 'a', { rel: 'foo bar' } );

			expect( element.getAttribute( 'rel' ) ).toBe( 'foo bar' );

			writer.removeAttribute( 'rel', 'foo', element );
			expect( element.getAttribute( 'rel' ) ).toBe( 'bar' );

			writer.removeAttribute( 'rel', 'bar', element );
			expect( element.getAttribute( 'rel' ) ).toBeUndefined();
		} );
	} );

	describe( 'addClass()', () => {
		it( 'should add class to given element', () => {
			const element = writer.createAttributeElement( 'span' );

			writer.addClass( 'foo', element );

			expect( element.hasClass( 'foo' ) ).toBe( true );
		} );

		it( 'should add multiple classes to given element', () => {
			const element = writer.createAttributeElement( 'span' );

			writer.addClass( [ 'foo', 'bar' ], element );

			expect( element.hasClass( 'foo' ) ).toBe( true );
			expect( element.hasClass( 'bar' ) ).toBe( true );
		} );
	} );

	describe( 'removeClass()', () => {
		it( 'should remove class from given element', () => {
			const element = writer.createAttributeElement( 'span', { class: 'foo bar' } );

			writer.removeClass( 'foo', element );

			expect( element.hasClass( 'foo' ) ).toBe( false );
			expect( element.hasClass( 'bar' ) ).toBe( true );
		} );

		it( 'should remove multiple classes from given element', () => {
			const element = writer.createAttributeElement( 'span', { class: 'foo bar' } );

			writer.removeClass( [ 'foo', 'bar' ], element );

			expect( element.hasClass( 'foo' ) ).toBe( false );
			expect( element.hasClass( 'bar' ) ).toBe( false );
		} );
	} );

	describe( 'addStyle()', () => {
		it( 'should add style to given element', () => {
			const element = writer.createAttributeElement( 'span' );

			writer.setStyle( 'foo', 'bar', element );

			expect( element.getStyle( 'foo' ) ).toBe( 'bar' );
		} );

		it( 'should allow to add multiple styles to given element', () => {
			const element = writer.createAttributeElement( 'span' );

			writer.setStyle( {
				foo: 'bar',
				baz: 'quiz'
			}, element );

			expect( element.getStyle( 'foo' ) ).toBe( 'bar' );
			expect( element.getStyle( 'baz' ) ).toBe( 'quiz' );
		} );
	} );

	describe( 'removeStyle()', () => {
		it( 'should remove style from given element', () => {
			const element = writer.createAttributeElement( 'span', { style: 'foo:bar;baz:quiz;' } );

			writer.removeStyle( 'foo', element );

			expect( element.hasStyle( 'foo' ) ).toBe( false );
			expect( element.hasStyle( 'baz' ) ).toBe( true );
		} );

		it( 'should remove multiple styles from given element', () => {
			const element = writer.createAttributeElement( 'span', { style: 'foo:bar;baz:quiz;' } );

			writer.removeStyle( [ 'foo', 'bar' ], element );

			expect( element.hasStyle( 'foo' ) ).toBe( false );
			expect( element.hasStyle( 'baz' ) ).toBe( true );
		} );
	} );

	describe( 'setCustomProperty()', () => {
		it( 'should set custom property to given element', () => {
			const element = writer.createAttributeElement( 'span' );

			writer.setCustomProperty( 'foo', 'bar', element );

			expect( element.getCustomProperty( 'foo' ) ).toBe( 'bar' );
		} );

		it( 'should set custom property to given document fragment', () => {
			const fragment = writer.createDocumentFragment();

			writer.setCustomProperty( 'foo', 'bar', fragment );

			expect( fragment.getCustomProperty( 'foo' ) ).toBe( 'bar' );
		} );
	} );

	describe( 'removeCustomProperty()', () => {
		it( 'should remove custom property from given element', () => {
			const element = writer.createAttributeElement( 'span' );

			writer.setCustomProperty( 'foo', 'bar', element );
			expect( element.getCustomProperty( 'foo' ) ).toBe( 'bar' );

			writer.removeCustomProperty( 'foo', element );
			expect( element.getCustomProperty( 'foo' ) ).toBeUndefined();
		} );

		it( 'should remove custom property from given document fragment', () => {
			const fragment = writer.createDocumentFragment();

			writer.setCustomProperty( 'foo', 'bar', fragment );
			expect( fragment.getCustomProperty( 'foo' ) ).toBe( 'bar' );

			writer.removeCustomProperty( 'foo', fragment );
			expect( fragment.getCustomProperty( 'foo' ) ).toBeUndefined();
		} );
	} );

	describe( 'createPositionAt()', () => {
		it( 'should return instance of Position', () => {
			doc.getRoot()._appendChild( new ViewElement( 'p' ) );

			expect( writer.createPositionAt( doc.getRoot(), 0 ) ).toBeInstanceOf( ViewPosition );
		} );
	} );

	describe( 'createPositionAfter()', () => {
		it( 'should return instance of Position', () => {
			doc.getRoot()._appendChild( new ViewElement( 'p' ) );

			expect( writer.createPositionAfter( doc.getRoot().getChild( 0 ) ) ).toBeInstanceOf( ViewPosition );
		} );
	} );

	describe( 'createPositionBefore()', () => {
		it( 'should return instance of Position', () => {
			doc.getRoot()._appendChild( new ViewElement( 'p' ) );

			expect( writer.createPositionBefore( doc.getRoot().getChild( 0 ) ) ).toBeInstanceOf( ViewPosition );
		} );
	} );

	describe( 'createRange()', () => {
		it( 'should return instance of Range', () => {
			doc.getRoot()._appendChild( new ViewElement( 'p' ) );

			expect( writer.createRange( writer.createPositionAt( doc.getRoot(), 0 ) ) ).toBeInstanceOf( ViewRange );
		} );
	} );

	describe( 'createRangeIn()', () => {
		it( 'should return instance of Range', () => {
			doc.getRoot()._appendChild( new ViewElement( 'p' ) );

			expect( writer.createRangeIn( doc.getRoot().getChild( 0 ) ) ).toBeInstanceOf( ViewRange );
		} );
	} );

	describe( 'createRangeOn()', () => {
		it( 'should return instance of Range', () => {
			doc.getRoot()._appendChild( new ViewElement( 'p' ) );

			expect( writer.createRangeOn( doc.getRoot().getChild( 0 ) ) ).toBeInstanceOf( ViewRange );
		} );
	} );

	describe( 'createSelection()', () => {
		it( 'should return instance of Selection', () => {
			doc.getRoot()._appendChild( new ViewElement( 'p' ) );

			expect( writer.createSelection() ).toBeInstanceOf( ViewSelection );
		} );
	} );

	describe( 'createSlot()', () => {
		it( 'should throw if called before slot factory is initialized', () => {
			expect( () => {
				writer.createSlot();
			} ).toThrow( CKEditorError );
		} );

		it( 'should call slot factory and pass the parameter', () => {
			const spy = vi.fn();

			writer._registerSlotFactory( spy );
			writer.createSlot( 'foo' );

			expect( spy ).toHaveBeenCalledExactlyOnceWith( writer, 'foo' );
		} );

		it( 'should throw if called after slot factory is cleared', () => {
			const spy = vi.fn();

			writer._registerSlotFactory( spy );
			writer._clearSlotFactory();

			expect( () => {
				writer.createSlot( 'foo' );
			} ).toThrow( CKEditorError );

			expect( spy ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'manages ViewAttributeElement#_clonesGroup', () => {
		it( 'should return all clones of a broken attribute element with id', () => {
			const text = writer.createText( 'abccccde' );

			writer.insert( ViewPosition._createAt( root, 0 ), text );

			const span = writer.createAttributeElement( 'span', null, { id: 'foo' } );
			span._priority = 20;

			// <div>ab<span>cccc</span>de</div>
			writer.wrap( ViewRange._createFromParentsAndOffsets( text, 2, text, 6 ), span );

			const i = writer.createAttributeElement( 'i' );

			// <div>a<i>b<span>c</span></i><span>cc</span>de</div>
			writer.wrap(
				ViewRange._createFromParentsAndOffsets(
					root.getChild( 0 ), 1,
					root.getChild( 1 ).getChild( 0 ), 1
				),
				i
			);

			// <div>a<i>b<span>c</span></i><span>c</span><i><span>cc</span>d</i>e</div>
			writer.wrap(
				ViewRange._createFromParentsAndOffsets(
					root.getChild( 2 ).getChild( 0 ), 1,
					root.getChild( 3 ), 1
				),
				i
			);

			// Find all spans.
			const allSpans = Array.from( ViewRange._createIn( root ).getItems() ).filter( element => element.is( 'element', 'span' ) );

			// For each of the spans created above...
			for ( const oneOfAllSpans of allSpans ) {
				const brokenSet = oneOfAllSpans.getElementsWithSameId();
				const brokenArray = Array.from( brokenSet );

				// Check if all spans are included.
				for ( const s of allSpans ) {
					expect( brokenSet.has( s ) ).toBe( true );
				}

				expect( brokenArray.length ).toBe( allSpans.length );
			}
		} );

		it( 'should not create groups for attribute elements that are not created in document root', () => {
			const p = writer.createContainerElement( 'p' );
			const foo = writer.createText( 'foo' );
			writer.insert( ViewPosition._createAt( p, 0 ), foo );
			// <p>foo</p>

			const span = writer.createAttributeElement( 'span', null, { id: 'span' } );

			// <p><span>foo</span></p>
			writer.wrap( ViewRange._createFromParentsAndOffsets( foo, 0, foo, 3 ), span );

			// Find the span.
			const createdSpan = p.getChild( 0 );

			expect( createdSpan.getElementsWithSameId().size ).toBe( 0 );
		} );

		it( 'should add attribute elements to clone groups deeply', () => {
			const p = writer.createContainerElement( 'p' );
			const foo = writer.createText( 'foo' );
			writer.insert( ViewPosition._createAt( p, 0 ), foo );
			// <p>foo</p>

			const span = writer.createAttributeElement( 'span', null, { id: 'span' } );

			// <p><span>foo</span></p>
			writer.wrap( ViewRange._createFromParentsAndOffsets( foo, 0, foo, 3 ), span );

			// <div><p><span>foo</span></p>
			writer.insert( ViewPosition._createAt( root, 0 ), p );

			// Find the span.
			const createdSpan = p.getChild( 0 );

			expect( Array.from( createdSpan.getElementsWithSameId() ) ).toEqual( [ createdSpan ] );
		} );

		it( 'should remove attribute elements from clone groups deeply', () => {
			const p1 = writer.createContainerElement( 'p' );
			const p2 = writer.createContainerElement( 'p' );
			const foo = writer.createText( 'foo' );
			const bar = writer.createText( 'bar' );

			writer.insert( ViewPosition._createAt( root, 0 ), p1 );
			writer.insert( ViewPosition._createAt( root, 1 ), p2 );
			writer.insert( ViewPosition._createAt( p1, 0 ), foo );
			writer.insert( ViewPosition._createAt( p2, 0 ), bar );
			// <div><p>foo</p><p>bar</p></div>

			const span = writer.createAttributeElement( 'span', null, { id: 'span' } );

			// <div><p>fo<span>o</span></p><p>bar</p></div>
			writer.wrap( ViewRange._createFromParentsAndOffsets( foo, 2, foo, 3 ), span );

			// <div><p>fo<span>o</span></p><p><span>b</span>ar</p></div>
			writer.wrap( ViewRange._createFromParentsAndOffsets( bar, 0, bar, 1 ), span );

			// <div><p><span>b</span>ar</p></div>
			writer.remove( ViewRange._createOn( p1 ) );

			// Find the span.
			const spanInTree = p2.getChild( 0 );

			expect( Array.from( spanInTree.getElementsWithSameId() ) ).toEqual( [ spanInTree ] );
		} );
	} );

	function assertElementAttributes( element, attributes ) {
		for ( const key of Object.keys( attributes ) ) {
			if ( element.getAttribute( key ) !== attributes[ key ] ) {
				throw new Error( 'Attributes in element are different that those passed to the constructor method.' );
			}
		}
	}
} );
