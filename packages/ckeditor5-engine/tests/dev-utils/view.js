/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { _parseView, _stringifyView, _getViewData, _setViewData } from '../../src/dev-utils/view.js';
import { ViewDocument } from '../../src/view/document.js';
import { ViewDocumentFragment } from '../../src/view/documentfragment.js';
import { ViewPosition } from '../../src/view/position.js';
import { ViewElement } from '../../src/view/element.js';
import { ViewAttributeElement } from '../../src/view/attributeelement.js';
import { ViewContainerElement } from '../../src/view/containerelement.js';
import { ViewEmptyElement } from '../../src/view/emptyelement.js';
import { ViewUIElement } from '../../src/view/uielement.js';
import { ViewRawElement } from '../../src/view/rawelement.js';
import { ViewText } from '../../src/view/text.js';
import { ViewDocumentSelection } from '../../src/view/documentselection.js';
import { ViewRange } from '../../src/view/range.js';
import { EditingView } from '../../src/view/view.js';
import { XmlDataProcessor } from '../../src/dataprocessor/xmldataprocessor.js';
import { createViewRoot } from '../view/_utils/createroot.js';
import { StylesProcessor } from '../../src/view/stylesmap.js';

describe( 'view test utils', () => {
	describe( '_getViewData, _setViewData', () => {
		describe( '_getViewData', () => {
			it( 'should use stringify method', () => {
				const element = document.createElement( 'div' );
				const stringifySpy = vi.spyOn( _getViewData, '_stringify' );
				const view = new EditingView( new StylesProcessor() );
				const viewDocument = view.document;
				const options = {
					showType: false,
					showPriority: false,
					withoutSelection: true,
					renderUIElements: false
				};
				const root = createAttachedRoot( viewDocument, element );
				root._appendChild( new ViewElement( viewDocument, 'p' ) );

				expect( _getViewData( view, options ) ).toBe( '<p></p>' );
				expect( stringifySpy ).toHaveBeenCalledOnce();
				expect( stringifySpy.mock.calls[ 0 ][ 0 ] ).toBe( root );
				expect( stringifySpy.mock.calls[ 0 ][ 1 ] ).toBe( null );
				const stringifyOptions = stringifySpy.mock.calls[ 0 ][ 2 ];
				expect( stringifyOptions ).toHaveProperty( 'showType', false );
				expect( stringifyOptions ).toHaveProperty( 'showPriority', false );
				expect( stringifyOptions ).toHaveProperty( 'ignoreRoot', true );
				expect( stringifyOptions ).toHaveProperty( 'renderUIElements', false );

				view.destroy();
			} );

			it( 'should use stringify method with selection', () => {
				const element = document.createElement( 'div' );
				const stringifySpy = vi.spyOn( _getViewData, '_stringify' );
				const view = new EditingView( new StylesProcessor() );
				const viewDocument = view.document;
				const options = { showType: false, showPriority: false };
				const root = createAttachedRoot( viewDocument, element );
				root._appendChild( new ViewElement( viewDocument, 'p' ) );

				view.change( writer => {
					writer.setSelection( ViewRange._createFromParentsAndOffsets( root, 0, root, 1 ) );
				} );

				expect( _getViewData( view, options ) ).toBe( '[<p></p>]' );
				expect( stringifySpy ).toHaveBeenCalledOnce();
				expect( stringifySpy.mock.calls[ 0 ][ 0 ] ).toBe( root );
				expect( stringifySpy.mock.calls[ 0 ][ 1 ] ).toBe( viewDocument.selection );
				const stringifyOptions = stringifySpy.mock.calls[ 0 ][ 2 ];
				expect( stringifyOptions ).toHaveProperty( 'showType', false );
				expect( stringifyOptions ).toHaveProperty( 'showPriority', false );
				expect( stringifyOptions ).toHaveProperty( 'ignoreRoot', true );

				view.destroy();
			} );

			it( 'should throw an error when passing invalid document', () => {
				expect( () => {
					_getViewData( { invalid: 'view' } );
				} ).toThrow( /View needs to be an instance of module:engine\/view\/view~EditingView/ );
			} );
		} );

		describe( '_setViewData', () => {
			it( 'should use parse method', () => {
				const view = new EditingView( new StylesProcessor() );
				const viewDocument = view.document;
				const data = 'foobar<b>baz</b>';
				const parseSpy = vi.spyOn( _setViewData, '_parse' );

				createAttachedRoot( viewDocument, document.createElement( 'div' ) );
				_setViewData( view, data );

				expect( _getViewData( view ) ).toBe( 'foobar<b>baz</b>' );
				expect( parseSpy ).toHaveBeenCalledOnce();
				const args = parseSpy.mock.calls[ 0 ];
				expect( args[ 0 ] ).toBe( data );
				expect( args[ 1 ] ).toBeTypeOf( 'object' );
				expect( args[ 1 ].rootElement ).toBe( viewDocument.getRoot() );

				view.destroy();
			} );

			it( 'should use parse method with selection', () => {
				const view = new EditingView( new StylesProcessor() );
				const viewDocument = view.document;
				const data = '[<b>baz</b>]';
				const parseSpy = vi.spyOn( _setViewData, '_parse' );

				createAttachedRoot( viewDocument, document.createElement( 'div' ) );
				_setViewData( view, data );

				expect( _getViewData( view ) ).toBe( '[<b>baz</b>]' );
				const args = parseSpy.mock.calls[ 0 ];
				expect( args[ 0 ] ).toBe( data );
				expect( args[ 1 ] ).toBeTypeOf( 'object' );
				expect( args[ 1 ].rootElement ).toBe( viewDocument.getRoot() );

				view.destroy();
			} );

			it( 'should throw an error when passing invalid document', () => {
				expect( () => {
					_setViewData( { invalid: 'view' } );
				} ).toThrow( /View needs to be an instance of module:engine\/view\/view~EditingView/ );
			} );
		} );
	} );

	describe( 'stringify', () => {
		let viewDocument;

		beforeEach( () => {
			viewDocument = new ViewDocument( new StylesProcessor() );
		} );

		it( 'should write text', () => {
			const text = new ViewText( viewDocument, 'foobar' );
			expect( _stringifyView( text ) ).toBe( 'foobar' );
		} );

		it( 'should write elements and texts', () => {
			const text = new ViewText( viewDocument, 'foobar' );
			const b = new ViewElement( viewDocument, 'b', null, text );
			const p = new ViewElement( viewDocument, 'p', null, b );

			expect( _stringifyView( p ) ).toBe( '<p><b>foobar</b></p>' );
		} );

		it( 'should write elements with attributes (attributes in alphabetical order)', () => {
			const text = new ViewText( viewDocument, 'foobar' );
			const b = new ViewElement( viewDocument, 'b', {
				foo: 'bar'
			}, text );
			const p = new ViewElement( viewDocument, 'p', {
				baz: 'qux',
				bar: 'taz',
				class: 'short wide'
			}, b );

			expect( _stringifyView( p ) ).toBe( '<p bar="taz" baz="qux" class="short wide"><b foo="bar">foobar</b></p>' );
		} );

		it( 'should write elements with attributes which values include double quotes', () => {
			const text = new ViewText( viewDocument, 'foobar' );
			const p = new ViewElement( viewDocument, 'p', {
				style: 'font-family: Calibri, "Times New Roman", sans-serif'
			}, text );

			expect( _stringifyView( p ) ).toBe( '<p style="font-family:Calibri, &quot;Times New Roman&quot;, sans-serif">foobar</p>' );
		} );

		it( 'should write selection ranges inside elements', () => {
			const text1 = new ViewText( viewDocument, 'foobar' );
			const text2 = new ViewText( viewDocument, 'bazqux' );
			const b1 = new ViewElement( viewDocument, 'b', null, text1 );
			const b2 = new ViewElement( viewDocument, 'b', null, text2 );
			const p = new ViewElement( viewDocument, 'p', null, [ b1, b2 ] );
			const range = ViewRange._createFromParentsAndOffsets( p, 1, p, 2 );
			const selection = new ViewDocumentSelection( [ range ] );
			expect( _stringifyView( p, selection ) ).toBe( '<p><b>foobar</b>[<b>bazqux</b>]</p>' );
		} );

		it( 'should support unicode', () => {
			const text = new ViewText( viewDocument, 'நிலைக்கு' );
			const b = new ViewElement( viewDocument, 'b', null, text );
			const p = new ViewElement( viewDocument, 'p', null, b );
			const range = ViewRange._createFromParentsAndOffsets( p, 0, text, 4 );
			const selection = new ViewDocumentSelection( [ range ] );

			expect( _stringifyView( p, selection ) ).toBe( '<p>[<b>நிலை}க்கு</b></p>' );
		} );

		it( 'should write collapsed selection ranges inside elements', () => {
			const text = new ViewText( viewDocument, 'foobar' );
			const p = new ViewElement( viewDocument, 'p', null, text );
			const range = ViewRange._createFromParentsAndOffsets( p, 0, p, 0 );
			const selection = new ViewDocumentSelection( [ range ] );
			expect( _stringifyView( p, selection ) ).toBe( '<p>[]foobar</p>' );
		} );

		it( 'should write selection ranges inside text', () => {
			const text1 = new ViewText( viewDocument, 'foobar' );
			const text2 = new ViewText( viewDocument, 'bazqux' );
			const b1 = new ViewElement( viewDocument, 'b', null, text1 );
			const b2 = new ViewElement( viewDocument, 'b', null, text2 );
			const p = new ViewElement( viewDocument, 'p', null, [ b1, b2 ] );
			const range = ViewRange._createFromParentsAndOffsets( text1, 1, text1, 5 );
			const selection = new ViewDocumentSelection( [ range ] );
			expect( _stringifyView( p, selection ) ).toBe( '<p><b>f{ooba}r</b><b>bazqux</b></p>' );
		} );

		it( 'should write selection ranges inside text represented by `[` and `]` characters', () => {
			const text1 = new ViewText( viewDocument, 'foobar' );
			const text2 = new ViewText( viewDocument, 'bazqux' );
			const b1 = new ViewElement( viewDocument, 'b', null, text1 );
			const b2 = new ViewElement( viewDocument, 'b', null, text2 );
			const p = new ViewElement( viewDocument, 'p', null, [ b1, b2 ] );
			const range = ViewRange._createFromParentsAndOffsets( text1, 1, text1, 5 );
			const selection = new ViewDocumentSelection( [ range ] );
			expect( _stringifyView( p, selection, { sameSelectionCharacters: true } ) )
				.toBe( '<p><b>f[ooba]r</b><b>bazqux</b></p>' );
		} );

		it( 'should write collapsed selection ranges inside texts', () => {
			const text = new ViewText( viewDocument, 'foobar' );
			const p = new ViewElement( viewDocument, 'p', null, text );
			const range = ViewRange._createFromParentsAndOffsets( text, 0, text, 0 );
			const selection = new ViewDocumentSelection( [ range ] );
			expect( _stringifyView( p, selection ) ).toBe( '<p>{}foobar</p>' );
		} );

		it( 'should write ranges that start inside text end ends between elements', () => {
			const text1 = new ViewText( viewDocument, 'foobar' );
			const text2 = new ViewText( viewDocument, 'bazqux' );
			const b1 = new ViewElement( viewDocument, 'b', null, text1 );
			const b2 = new ViewElement( viewDocument, 'b', null, text2 );
			const p = new ViewElement( viewDocument, 'p', null, [ b1, b2 ] );
			const range = ViewRange._createFromParentsAndOffsets( p, 0, text2, 5 );
			const selection = new ViewDocumentSelection( [ range ] );
			expect( _stringifyView( p, selection ) ).toBe( '<p>[<b>foobar</b><b>bazqu}x</b></p>' );
		} );

		it( 'should write elements types as namespaces when needed', () => {
			const text = new ViewText( viewDocument, 'foobar' );
			const b = new ViewAttributeElement( viewDocument, 'b', null, text );
			const p = new ViewContainerElement( viewDocument, 'p', null, b );

			expect( _stringifyView( p, null, { showType: true } ) )
				.toBe( '<container:p><attribute:b>foobar</attribute:b></container:p>' );
		} );

		it( 'should not write element type when type is not specified', () => {
			const p = new ViewElement( viewDocument, 'p' );
			expect( _stringifyView( p, null, { showType: true } ) ).toBe( '<p></p>' );
		} );

		it( 'should write elements priorities when needed', () => {
			const text = new ViewText( viewDocument, 'foobar' );
			const b = new ViewAttributeElement( viewDocument, 'b', null, text );
			const p = new ViewContainerElement( viewDocument, 'p', null, b );

			expect( _stringifyView( p, null, { showPriority: true } ) )
				.toBe( '<p><b view-priority="10">foobar</b></p>' );
		} );

		it( 'should write elements id when needed', () => {
			const text = new ViewText( viewDocument, 'foobar' );
			const span = new ViewAttributeElement( viewDocument, 'span', null, text );
			span._id = 'foo';
			const p = new ViewContainerElement( viewDocument, 'p', null, span );

			expect( _stringifyView( p, null, { showAttributeElementId: true } ) )
				.toBe( '<p><span view-id="foo">foobar</span></p>' );
		} );

		it( 'should parse DocumentFragment as root', () => {
			const text1 = new ViewText( viewDocument, 'foobar' );
			const text2 = new ViewText( viewDocument, 'bazqux' );
			const b1 = new ViewElement( viewDocument, 'b', null, text1 );
			const b2 = new ViewElement( viewDocument, 'b', null, text2 );
			const fragment = new ViewDocumentFragment( viewDocument, [ b1, b2 ] );
			expect( _stringifyView( fragment, null ) ).toBe( '<b>foobar</b><b>bazqux</b>' );
		} );

		it( 'should not write ranges outside elements - end position outside element', () => {
			const text = new ViewText( viewDocument, 'foobar' );
			const b = new ViewElement( viewDocument, 'b', null, text );
			const p = new ViewElement( viewDocument, 'p', null, b );
			const range = ViewRange._createFromParentsAndOffsets( p, 0, p, 5 );

			expect( _stringifyView( p, range ) ).toBe( '<p>[<b>foobar</b></p>' );
		} );

		it( 'should not write ranges outside elements - start position outside element', () => {
			const text = new ViewText( viewDocument, 'foobar' );
			const b = new ViewElement( viewDocument, 'b', null, text );
			const p = new ViewElement( viewDocument, 'p', null, b );
			const range = ViewRange._createFromParentsAndOffsets( p, -1, p, 1 );

			expect( _stringifyView( p, range ) ).toBe( '<p><b>foobar</b>]</p>' );
		} );

		it( 'should not write ranges outside elements - end position outside text', () => {
			const text = new ViewText( viewDocument, 'foobar' );
			const b = new ViewElement( viewDocument, 'b', null, text );
			const p = new ViewElement( viewDocument, 'p', null, b );
			const range = ViewRange._createFromParentsAndOffsets( text, 0, text, 7 );

			expect( _stringifyView( p, range ) ).toBe( '<p><b>{foobar</b></p>' );
		} );

		it( 'should not write ranges outside elements - start position outside text', () => {
			const text = new ViewText( viewDocument, 'foobar' );
			const b = new ViewElement( viewDocument, 'b', null, text );
			const p = new ViewElement( viewDocument, 'p', null, b );
			const range = ViewRange._createFromParentsAndOffsets( text, -1, text, 2 );

			expect( _stringifyView( p, range ) ).toBe( '<p><b>fo}obar</b></p>' );
		} );

		it( 'should write multiple ranges from selection #1', () => {
			const text1 = new ViewText( viewDocument, 'foobar' );
			const text2 = new ViewText( viewDocument, 'bazqux' );
			const b1 = new ViewElement( viewDocument, 'b', null, text1 );
			const b2 = new ViewElement( viewDocument, 'b', null, text2 );
			const p = new ViewElement( viewDocument, 'p', null, [ b1, b2 ] );
			const range1 = ViewRange._createFromParentsAndOffsets( p, 0, p, 1 );
			const range2 = ViewRange._createFromParentsAndOffsets( p, 1, p, 1 );
			const selection = new ViewDocumentSelection( [ range2, range1 ] );

			expect( _stringifyView( p, selection ) ).toBe( '<p>[<b>foobar</b>][]<b>bazqux</b></p>' );
		} );

		it( 'should write multiple ranges from selection #2', () => {
			const text1 = new ViewText( viewDocument, 'foobar' );
			const text2 = new ViewText( viewDocument, 'bazqux' );
			const b = new ViewElement( viewDocument, 'b', null, text1 );
			const p = new ViewElement( viewDocument, 'p', null, [ b, text2 ] );
			const range1 = ViewRange._createFromParentsAndOffsets( p, 0, p, 1 );
			const range2 = ViewRange._createFromParentsAndOffsets( text2, 0, text2, 3 );
			const range3 = ViewRange._createFromParentsAndOffsets( text2, 3, text2, 4 );
			const range4 = ViewRange._createFromParentsAndOffsets( p, 1, p, 1 );
			const selection = new ViewDocumentSelection( [ range1, range2, range3, range4 ] );

			expect( _stringifyView( p, selection ) ).toBe( '<p>[<b>foobar</b>][]{baz}{q}ux</p>' );
		} );

		it( 'should use Position instance instead of Selection', () => {
			const text = new ViewText( viewDocument, 'foobar' );
			const position = new ViewPosition( text, 3 );
			const string = _stringifyView( text, position );
			expect( string ).toBe( 'foo{}bar' );
		} );

		it( 'should use Range instance instead of Selection', () => {
			const text = new ViewText( viewDocument, 'foobar' );
			const range = ViewRange._createFromParentsAndOffsets( text, 3, text, 4 );
			const string = _stringifyView( text, range );
			expect( string ).toBe( 'foo{b}ar' );
		} );

		it( 'should stringify ViewEmptyElement', () => {
			const img = new ViewEmptyElement( viewDocument, 'img' );
			const p = new ViewContainerElement( viewDocument, 'p', null, img );
			expect( _stringifyView( p, null, { showType: true } ) )
				.toBe( '<container:p><empty:img></empty:img></container:p>' );
		} );

		it( 'should stringify UIElement', () => {
			const span = new ViewUIElement( viewDocument, 'span' );
			const p = new ViewContainerElement( viewDocument, 'p', null, span );
			expect( _stringifyView( p, null, { showType: true } ) )
				.toBe( '<container:p><ui:span></ui:span></container:p>' );
		} );

		it( 'should not stringify inner UIElement content (renderUIElements=false)', () => {
			const span = new ViewUIElement( viewDocument, 'span' );

			span.render = function( domDocument ) {
				const domElement = this.toDomElement( domDocument );

				domElement.innerHTML = '<b>foo</b>';

				return domElement;
			};

			const p = new ViewContainerElement( viewDocument, 'p', null, span );
			expect( _stringifyView( p, null, { showType: true } ) )
				.toBe( '<container:p><ui:span></ui:span></container:p>' );
		} );

		it( 'should stringify UIElement, (renderUIElements=true)', () => {
			const span = new ViewUIElement( viewDocument, 'span' );

			span.render = function( domDocument ) {
				const domElement = this.toDomElement( domDocument );

				domElement.innerHTML = '<b>foo</b>';

				return domElement;
			};

			const p = new ViewContainerElement( viewDocument, 'p', null, span );
			expect( _stringifyView( p, null, { showType: true, renderUIElements: true } ) )
				.toBe( '<container:p><ui:span><b>foo</b></ui:span></container:p>' );
		} );

		it( 'should stringify a RawElement', () => {
			const span = new ViewRawElement( viewDocument, 'span' );
			const p = new ViewContainerElement( viewDocument, 'p', null, span );

			expect( _stringifyView( p, null, { showType: true } ) )
				.toBe( '<container:p><raw:span></raw:span></container:p>' );
		} );

		it( 'should not stringify the inner RawElement content (renderRawElements=false)', () => {
			const span = new ViewRawElement( viewDocument, 'span' );

			span.render = function( domElement, domConverter ) {
				domConverter.setContentOf( domElement, '<b>foo</b>' );
			};

			const p = new ViewContainerElement( viewDocument, 'p', null, span );
			expect( _stringifyView( p, null, { showType: true } ) )
				.toBe( '<container:p><raw:span></raw:span></container:p>' );
		} );

		it( 'should stringify a RawElement, (renderRawElements=true)', () => {
			const span = new ViewRawElement( viewDocument, 'span' );

			span.render = function( domElement, domConverter ) {
				domConverter.setContentOf( domElement, '<b>foo</b>' );
			};

			const p = new ViewContainerElement( viewDocument, 'p', null, span );
			expect( _stringifyView( p, null, { showType: true, renderRawElements: true } ) )
				.toBe( '<container:p><raw:span><b>foo</b></raw:span></container:p>' );
		} );

		it( 'should not return `data-list-item-id` on <li> element by default (skipListItemIds=true)', () => {
			const li = new ViewContainerElement( viewDocument, 'li', { 'data-list-item-id': 'foo' } );
			const ol = new ViewContainerElement( viewDocument, 'ol', null, li );

			expect( _stringifyView( ol, null, { showType: true, skipListItemIds: true } ) )
				.toBe( '<container:ol><container:li></container:li></container:ol>' );
		} );

		it( 'should not return `data-list-item-id` on <li> element when set (skipListItemIds=true)', () => {
			const li = new ViewContainerElement( viewDocument, 'li', { 'data-list-item-id': 'foo' } );
			const ol = new ViewContainerElement( viewDocument, 'ol', null, li );

			expect( _stringifyView( ol, null, { showType: true, skipListItemIds: true } ) )
				.toBe( '<container:ol><container:li></container:li></container:ol>' );
		} );

		it( 'should return `data-list-item-id` on <li> element (skipListItemIds=true)', () => {
			const li = new ViewContainerElement( viewDocument, 'li', { 'data-list-item-id': 'foo' } );
			const ol = new ViewContainerElement( viewDocument, 'ol', null, li );

			expect( _stringifyView( ol, null, { showType: true, skipListItemIds: false } ) )
				.toBe( '<container:ol><container:li data-list-item-id="foo"></container:li></container:ol>' );
		} );

		it( 'should sort classes in specified element', () => {
			const text = new ViewText( viewDocument, 'foobar' );
			const b = new ViewElement( viewDocument, 'b', {
				class: 'zz xx aa'
			}, text );

			expect( _stringifyView( b ) ).toBe( '<b class="aa xx zz">foobar</b>' );
		} );

		it( 'should sort styles in specified element', () => {
			const text = new ViewText( viewDocument, 'foobar' );
			const i = new ViewElement( viewDocument, 'i', {
				style: 'text-decoration: underline; font-weight: bold'
			}, text );

			expect( _stringifyView( i ) ).toBe( '<i style="font-weight:bold;text-decoration:underline">foobar</i>' );
		} );
	} );

	describe( 'parse', () => {
		let viewDocument;

		beforeEach( () => {
			viewDocument = new ViewDocument( new StylesProcessor() );
		} );

		it( 'should return empty DocumentFragment for empty string', () => {
			const fragment = _parseView( '' );

			expect( fragment ).toBeInstanceOf( ViewDocumentFragment );
			expect( fragment.childCount ).toBe( 0 );
		} );

		it( 'should return empty DocumentFragment and Selection for string containing range only', () => {
			const { view, selection } = _parseView( '[]' );

			expect( view ).toBeInstanceOf( ViewDocumentFragment );
			expect( selection.rangeCount ).toBe( 1 );
			expect( selection.getFirstRange().isEqual( ViewRange._createFromParentsAndOffsets( view, 0, view, 0 ) ) ).toBe( true );
		} );

		it( 'should return Element if range is around single element', () => {
			const { view, selection } = _parseView( '[<b>foobar</b>]' );
			const parent = view.parent;

			expect( view ).toBeInstanceOf( ViewElement );
			expect( parent ).toBeInstanceOf( ViewDocumentFragment );
			expect( selection.rangeCount ).toBe( 1 );
			expect( selection.getFirstRange().isEqual( ViewRange._createFromParentsAndOffsets( parent, 0, parent, 1 ) ) ).toBe( true );
		} );

		it( 'should create DocumentFragment when multiple elements on root', () => {
			const view = _parseView( '<b></b><i></i>' );
			expect( view ).toBeInstanceOf( ViewDocumentFragment );
			expect( view.childCount ).toBe( 2 );
			expect( view.getChild( 0 ).isSimilar( new ViewElement( viewDocument, 'b' ) ) ).toBe( true );
			expect( view.getChild( 1 ).isSimilar( new ViewElement( viewDocument, 'i' ) ) ).toBe( true );
		} );

		it( 'should parse text', () => {
			const text = _parseView( 'foobar' );
			expect( text ).toBeInstanceOf( ViewText );
			expect( text.data ).toBe( 'foobar' );
		} );

		it( 'should parse text with spaces', () => {
			const text = _parseView( 'foo bar' );
			expect( text ).toBeInstanceOf( ViewText );
			expect( text.data ).toBe( 'foo bar' );
		} );

		it( 'should parse elements and texts', () => {
			const view = _parseView( '<b>foobar</b>' );
			const element = new ViewElement( viewDocument, 'b' );

			expect( view ).toBeInstanceOf( ViewElement );
			expect( view.isSimilar( element ) ).toBe( true );
			expect( view.childCount ).toBe( 1 );
			const text = view.getChild( 0 );
			expect( text ).toBeInstanceOf( ViewText );
			expect( text.data ).toBe( 'foobar' );
		} );

		it( 'should parse element attributes', () => {
			const view = _parseView( '<b name="foo" title="bar" class="foo bar" style="color:red;"></b>' );
			const element = new ViewElement( viewDocument, 'b', { name: 'foo', title: 'bar', class: 'foo bar', style: 'color:red;' } );

			expect( view ).toBeInstanceOf( ViewElement );
			expect( view.isSimilar( element ) ).toBe( true );
			expect( view.childCount ).toBe( 0 );
		} );

		it( 'should parse element type', () => {
			const view1 = _parseView( '<attribute:b></attribute:b>' );
			const attribute = new ViewAttributeElement( viewDocument, 'b' );
			const view2 = _parseView( '<container:p></container:p>' );
			const container = new ViewContainerElement( viewDocument, 'p' );

			expect( view1 ).toBeInstanceOf( ViewAttributeElement );
			expect( view1.isSimilar( attribute ) ).toBe( true );
			expect( view2 ).toBeInstanceOf( ViewContainerElement );
			expect( view2.isSimilar( container ) ).toBe( true );
		} );

		it( 'should parse element priority', () => {
			const parsed1 = _parseView( '<b view-priority="12"></b>' );
			const attribute1 = new ViewAttributeElement( viewDocument, 'b' );
			attribute1._priority = 12;
			const parsed2 = _parseView( '<attribute:b view-priority="44"></attribute:b>' );
			const attribute2 = new ViewAttributeElement( viewDocument, 'b' );
			attribute2._priority = 44;

			parsed1.isSimilar( attribute1 );
			expect( parsed1.isSimilar( attribute1 ) ).toBe( true );
			expect( parsed2.isSimilar( attribute2 ) ).toBe( true );
		} );

		it( 'should parse attribute element id', () => {
			const parsed1 = _parseView( '<attribute:span view-id="foo"></attribute:span>' );
			expect( parsed1.id ).toBe( 'foo' );

			const parsed2 = _parseView( '<container:div view-id="bar"></container:div>' );
			expect( parsed2.id ).toBeUndefined();
		} );

		it( 'should correctly parse whitespaces around custom inline object elements', () => {
			const parsed = _parseView( '<p>Foo <inlineObj></inlineObj> bar</p>', { inlineObjectElements: [ 'inlineObj' ] } );

			expect( parsed.getChild( 0 ).data ).toBe( 'Foo ' );
			expect( parsed.getChild( 2 ).data ).toBe( ' bar' );
		} );

		it( 'should paste nested elements and texts', () => {
			const parsed = _parseView( '<container:p>foo<b view-priority="12">bar<i view-priority="25">qux</i></b></container:p>' );
			expect( parsed.isSimilar( new ViewContainerElement( viewDocument, 'p' ) ) ).toBe( true );
			expect( parsed.childCount ).toBe( 2 );
			expect( parsed.getChild( 0 ) ).toBeInstanceOf( ViewText );
			expect( parsed.getChild( 0 ).data ).toBe( 'foo' );
			const b = parsed.getChild( 1 );
			expect( b ).toBeInstanceOf( ViewAttributeElement );
			expect( b.priority ).toBe( 12 );
			expect( b.childCount ).toBe( 2 );
			expect( b.getChild( 0 ) ).toBeInstanceOf( ViewText );
			expect( b.getChild( 0 ).data ).toBe( 'bar' );
			const i = b.getChild( 1 );
			expect( i ).toBeInstanceOf( ViewAttributeElement );
			expect( i.priority ).toBe( 25 );
			expect( i.getChild( 0 ) ).toBeInstanceOf( ViewText );
			expect( i.getChild( 0 ).data ).toBe( 'qux' );
		} );

		it( 'should parse selection range inside text', () => {
			const { view, selection } = _parseView( 'f{oo}b{}ar' );
			expect( view ).toBeInstanceOf( ViewText );
			expect( view.data ).toBe( 'foobar' );
			expect( selection.rangeCount ).toBe( 2 );
			const ranges = [ ...selection.getRanges() ];

			expect( ranges[ 0 ].isEqual( ViewRange._createFromParentsAndOffsets( view, 1, view, 3 ) ) ).toBe( true );
			expect( ranges[ 1 ].isEqual( ViewRange._createFromParentsAndOffsets( view, 4, view, 4 ) ) ).toBe( true );
		} );

		it( 'should parse selection range between elements', () => {
			const { view, selection } = _parseView( '<p>[<b>foobar]</b>[]</p>' );
			expect( view ).toBeInstanceOf( ViewElement );
			expect( view.childCount ).toBe( 1 );
			const b = view.getChild( 0 );
			expect( b ).toBeInstanceOf( ViewElement );
			expect( b.name ).toBe( 'b' );
			expect( b.childCount ).toBe( 1 );
			const text = b.getChild( 0 );
			expect( text ).toBeInstanceOf( ViewText );
			expect( text.data ).toBe( 'foobar' );
			expect( selection.rangeCount ).toBe( 2 );
			const ranges = [ ...selection.getRanges() ];
			expect( ranges[ 0 ].isEqual( ViewRange._createFromParentsAndOffsets( view, 0, b, 1 ) ) ).toBe( true );
			expect( ranges[ 1 ].isEqual( ViewRange._createFromParentsAndOffsets( view, 1, view, 1 ) ) ).toBe( true );
		} );

		it( 'should support unicode', () => {
			const { view, selection } = _parseView( '<p>[<b>நிலை}க்கு</b></p>' );

			expect( view ).toBeInstanceOf( ViewElement );
			expect( view.name ).toBe( 'p' );
			expect( view.childCount ).toBe( 1 );

			const b = view.getChild( 0 );
			expect( b.name ).toBe( 'b' );
			expect( b.childCount ).toBe( 1 );

			const text = b.getChild( 0 );
			expect( text.data ).toBe( 'நிலைக்கு' );

			expect( selection.rangeCount ).toBe( 1 );
			const range = selection.getFirstRange();

			expect( range.start.parent ).toBe( view );
			expect( range.start.offset ).toBe( 0 );
			expect( range.end.parent ).toBe( text );
			expect( range.end.offset ).toBe( 4 );
		} );

		it( 'should parse ranges #1', () => {
			const { view, selection } = _parseView( '<container:p>foo{bar]</container:p>' );
			expect( view.isSimilar( new ViewContainerElement( viewDocument, 'p' ) ) ).toBe( true );
			expect( view.childCount ).toBe( 1 );
			const text = view.getChild( 0 );
			expect( text ).toBeInstanceOf( ViewText );
			expect( text.data ).toBe( 'foobar' );
			expect( selection.rangeCount ).toBe( 1 );
			expect( selection.getFirstRange().isEqual( ViewRange._createFromParentsAndOffsets( text, 3, view, 1 ) ) ).toBe( true );
		} );

		it( 'should parse ranges #2', () => {
			const { view, selection } = _parseView( '<attribute:b>[foob}ar<i>{baz</i>]</attribute:b>' );
			expect( view.isSimilar( new ViewAttributeElement( viewDocument, 'b' ) ) ).toBe( true );
			expect( view.childCount ).toBe( 2 );
			const text1 = view.getChild( 0 );
			expect( text1 ).toBeInstanceOf( ViewText );
			expect( text1.data ).toBe( 'foobar' );
			const i = view.getChild( 1 );
			expect( i.isSimilar( new ViewElement( viewDocument, 'i' ) ) ).toBe( true );
			expect( i.childCount ).toBe( 1 );
			const text2 = i.getChild( 0 );
			expect( text2 ).toBeInstanceOf( ViewText );
			expect( text2.data ).toBe( 'baz' );
			expect( selection.rangeCount ).toBe( 2 );
			const ranges = [ ...selection.getRanges() ];
			expect( ranges[ 0 ].isEqual( ViewRange._createFromParentsAndOffsets( view, 0, text1, 4 ) ) ).toBe( true );
			expect( ranges[ 1 ].isEqual( ViewRange._createFromParentsAndOffsets( text2, 0, view, 2 ) ) ).toBe( true );
		} );

		it( 'should use ranges order when provided', () => {
			const { view, selection } = _parseView( '{f}oo{b}arb{a}z', { order: [ 3, 1, 2 ] } );
			expect( selection.rangeCount ).toBe( 3 );
			const ranges = [ ...selection.getRanges() ];
			expect( ranges[ 0 ].isEqual( ViewRange._createFromParentsAndOffsets( view, 3, view, 4 ) ) ).toBe( true );
			expect( ranges[ 1 ].isEqual( ViewRange._createFromParentsAndOffsets( view, 7, view, 8 ) ) ).toBe( true );
			expect( ranges[ 2 ].isEqual( ViewRange._createFromParentsAndOffsets( view, 0, view, 1 ) ) ).toBe( true );
			expect( selection.anchor.isEqual( ranges[ 2 ].start ) ).toBe( true );
			expect( selection.focus.isEqual( ranges[ 2 ].end ) ).toBe( true );
		} );

		it( 'should set last range backward if needed', () => {
			const { view, selection } = _parseView( '{f}oo{b}arb{a}z', { order: [ 3, 1, 2 ], lastRangeBackward: true } );
			expect( selection.rangeCount ).toBe( 3 );
			const ranges = [ ...selection.getRanges() ];
			expect( ranges[ 0 ].isEqual( ViewRange._createFromParentsAndOffsets( view, 3, view, 4 ) ) ).toBe( true );
			expect( ranges[ 1 ].isEqual( ViewRange._createFromParentsAndOffsets( view, 7, view, 8 ) ) ).toBe( true );
			expect( ranges[ 2 ].isEqual( ViewRange._createFromParentsAndOffsets( view, 0, view, 1 ) ) ).toBe( true );
			expect( selection.anchor.isEqual( ranges[ 2 ].end ) ).toBe( true );
			expect( selection.focus.isEqual( ranges[ 2 ].start ) ).toBe( true );
		} );

		it( 'should throw when ranges order does not include all ranges', () => {
			expect( () => {
				_parseView( '{}foobar{}', { order: [ 1 ] } );
			} ).toThrow();
		} );

		it( 'should throw when ranges order is invalid', () => {
			expect( () => {
				_parseView( '{}foobar{}', { order: [ 1, 4 ] } );
			} ).toThrow();
		} );

		it( 'should throw when element range delimiter is inside text node', () => {
			expect( () => {
				_parseView( 'foo[bar' );
			} ).toThrow();
		} );

		it( 'should throw when text range delimiter is inside empty text node', () => {
			expect( () => {
				_parseView( '<b>foo</b>}' );
			} ).toThrow();
		} );

		it( 'should throw when end of range is found before start', () => {
			expect( () => {
				_parseView( 'fo}obar' );
			} ).toThrow();
		} );

		it( 'should throw when intersecting ranges found', () => {
			expect( () => {
				_parseView( '[fo{o}bar]' );
			} ).toThrow();
		} );

		it( 'should throw when opened ranges are left', () => {
			expect( () => {
				_parseView( 'fo{obar' );
			} ).toThrow();
		} );

		it( 'should throw when wrong type is provided', () => {
			vi.spyOn( XmlDataProcessor.prototype, 'toView' ).mockReturnValue( new ViewContainerElement( viewDocument, 'invalidType:b' ) );

			expect( () => {
				_parseView( 'sth' );
			} ).toThrow( /Parse error - cannot parse element's name: invalidType:b/ );
		} );

		it( 'should use provided root element #1', () => {
			const root = new ViewElement( viewDocument, 'p' );
			const data = _parseView( '<span>text</span>', { rootElement: root } );

			expect( _stringifyView( data ) ).toBe( '<p><span>text</span></p>' );
		} );

		it( 'should use provided root element #2', () => {
			const root = new ViewElement( viewDocument, 'p' );
			const data = _parseView( '<span>text</span><b>test</b>', { rootElement: root } );

			expect( _stringifyView( data ) ).toBe( '<p><span>text</span><b>test</b></p>' );
		} );

		it( 'should parse an ViewEmptyElement', () => {
			const parsed = _parseView( '<empty:img></empty:img>' );

			expect( parsed ).toBeInstanceOf( ViewEmptyElement );
		} );

		it( 'should parse a UIElement', () => {
			const parsed = _parseView( '<ui:span></ui:span>' );

			expect( parsed ).toBeInstanceOf( ViewUIElement );
		} );

		it( 'should parse a RawElement', () => {
			const parsed = _parseView( '<raw:span></raw:span>' );

			expect( parsed ).toBeInstanceOf( ViewRawElement );
		} );

		it( 'should throw an error if ViewEmptyElement is not empty', () => {
			expect( () => {
				_parseView( '<empty:img>foo bar</empty:img>' );
			} ).toThrow( /Parse error - cannot parse inside ViewEmptyElement./ );
		} );

		it( 'should throw an error if a UIElement is not empty', () => {
			expect( () => {
				_parseView( '<ui:span>foo bar</ui:span>' );
			} ).toThrow( /Parse error - cannot parse inside UIElement./ );
		} );

		it( 'should throw an error if a RawElement is not empty', () => {
			expect( () => {
				_parseView( '<raw:span>foo bar</raw:span>' );
			} ).toThrow( /Parse error - cannot parse inside RawElement./ );
		} );
	} );
} );

function createAttachedRoot( viewDocument, element ) {
	const root = createViewRoot( viewDocument );

	// Set name of view root the same as dom root.
	// This is a mock of attaching view root to dom root.
	root._name = element.tagName.toLowerCase();

	return root;
}
