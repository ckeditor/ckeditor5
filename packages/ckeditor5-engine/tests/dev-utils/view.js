/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

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
		afterEach( () => {
			sinon.restore();
		} );

		describe( '_getViewData', () => {
			it( 'should use stringify method', () => {
				const element = document.createElement( 'div' );
				const stringifySpy = sinon.spy( _getViewData, '_stringify' );
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

				expect( _getViewData( view, options ) ).to.equal( '<p></p>' );
				sinon.assert.calledOnce( stringifySpy );
				expect( stringifySpy.firstCall.args[ 0 ] ).to.equal( root );
				expect( stringifySpy.firstCall.args[ 1 ] ).to.equal( null );
				const stringifyOptions = stringifySpy.firstCall.args[ 2 ];
				expect( stringifyOptions ).to.have.property( 'showType' ).that.equals( false );
				expect( stringifyOptions ).to.have.property( 'showPriority' ).that.equals( false );
				expect( stringifyOptions ).to.have.property( 'ignoreRoot' ).that.equals( true );
				expect( stringifyOptions ).to.have.property( 'renderUIElements' ).that.equals( false );

				view.destroy();
			} );

			it( 'should use stringify method with selection', () => {
				const element = document.createElement( 'div' );
				const stringifySpy = sinon.spy( _getViewData, '_stringify' );
				const view = new EditingView( new StylesProcessor() );
				const viewDocument = view.document;
				const options = { showType: false, showPriority: false };
				const root = createAttachedRoot( viewDocument, element );
				root._appendChild( new ViewElement( viewDocument, 'p' ) );

				view.change( writer => {
					writer.setSelection( ViewRange._createFromParentsAndOffsets( root, 0, root, 1 ) );
				} );

				expect( _getViewData( view, options ) ).to.equal( '[<p></p>]' );
				sinon.assert.calledOnce( stringifySpy );
				expect( stringifySpy.firstCall.args[ 0 ] ).to.equal( root );
				expect( stringifySpy.firstCall.args[ 1 ] ).to.equal( viewDocument.selection );
				const stringifyOptions = stringifySpy.firstCall.args[ 2 ];
				expect( stringifyOptions ).to.have.property( 'showType' ).that.equals( false );
				expect( stringifyOptions ).to.have.property( 'showPriority' ).that.equals( false );
				expect( stringifyOptions ).to.have.property( 'ignoreRoot' ).that.equals( true );

				view.destroy();
			} );

			it( 'should throw an error when passing invalid document', () => {
				expect( () => {
					_getViewData( { invalid: 'view' } );
				} ).to.throw( TypeError, 'View needs to be an instance of module:engine/view/view~EditingView.' );
			} );
		} );

		describe( '_setViewData', () => {
			it( 'should use parse method', () => {
				const view = new EditingView( new StylesProcessor() );
				const viewDocument = view.document;
				const data = 'foobar<b>baz</b>';
				const parseSpy = sinon.spy( _setViewData, '_parse' );

				createAttachedRoot( viewDocument, document.createElement( 'div' ) );
				_setViewData( view, data );

				expect( _getViewData( view ) ).to.equal( 'foobar<b>baz</b>' );
				sinon.assert.calledOnce( parseSpy );
				const args = parseSpy.firstCall.args;
				expect( args[ 0 ] ).to.equal( data );
				expect( args[ 1 ] ).to.be.an( 'object' );
				expect( args[ 1 ].rootElement ).to.equal( viewDocument.getRoot() );

				view.destroy();
			} );

			it( 'should use parse method with selection', () => {
				const view = new EditingView( new StylesProcessor() );
				const viewDocument = view.document;
				const data = '[<b>baz</b>]';
				const parseSpy = sinon.spy( _setViewData, '_parse' );

				createAttachedRoot( viewDocument, document.createElement( 'div' ) );
				_setViewData( view, data );

				expect( _getViewData( view ) ).to.equal( '[<b>baz</b>]' );
				const args = parseSpy.firstCall.args;
				expect( args[ 0 ] ).to.equal( data );
				expect( args[ 1 ] ).to.be.an( 'object' );
				expect( args[ 1 ].rootElement ).to.equal( viewDocument.getRoot() );

				view.destroy();
			} );

			it( 'should throw an error when passing invalid document', () => {
				expect( () => {
					_setViewData( { invalid: 'view' } );
				} ).to.throw( TypeError, 'View needs to be an instance of module:engine/view/view~EditingView.' );
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
			expect( _stringifyView( text ) ).to.equal( 'foobar' );
		} );

		it( 'should write elements and texts', () => {
			const text = new ViewText( viewDocument, 'foobar' );
			const b = new ViewElement( viewDocument, 'b', null, text );
			const p = new ViewElement( viewDocument, 'p', null, b );

			expect( _stringifyView( p ) ).to.equal( '<p><b>foobar</b></p>' );
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

			expect( _stringifyView( p ) ).to.equal( '<p bar="taz" baz="qux" class="short wide"><b foo="bar">foobar</b></p>' );
		} );

		it( 'should write elements with attributes which values include double quotes', () => {
			const text = new ViewText( viewDocument, 'foobar' );
			const p = new ViewElement( viewDocument, 'p', {
				style: 'font-family: Calibri, "Times New Roman", sans-serif'
			}, text );

			expect( _stringifyView( p ) ).to.equal( '<p style="font-family:Calibri, &quot;Times New Roman&quot;, sans-serif">foobar</p>' );
		} );

		it( 'should write selection ranges inside elements', () => {
			const text1 = new ViewText( viewDocument, 'foobar' );
			const text2 = new ViewText( viewDocument, 'bazqux' );
			const b1 = new ViewElement( viewDocument, 'b', null, text1 );
			const b2 = new ViewElement( viewDocument, 'b', null, text2 );
			const p = new ViewElement( viewDocument, 'p', null, [ b1, b2 ] );
			const range = ViewRange._createFromParentsAndOffsets( p, 1, p, 2 );
			const selection = new ViewDocumentSelection( [ range ] );
			expect( _stringifyView( p, selection ) ).to.equal( '<p><b>foobar</b>[<b>bazqux</b>]</p>' );
		} );

		it( 'should support unicode', () => {
			const text = new ViewText( viewDocument, 'நிலைக்கு' );
			const b = new ViewElement( viewDocument, 'b', null, text );
			const p = new ViewElement( viewDocument, 'p', null, b );
			const range = ViewRange._createFromParentsAndOffsets( p, 0, text, 4 );
			const selection = new ViewDocumentSelection( [ range ] );

			expect( _stringifyView( p, selection ) ).to.equal( '<p>[<b>நிலை}க்கு</b></p>' );
		} );

		it( 'should write collapsed selection ranges inside elements', () => {
			const text = new ViewText( viewDocument, 'foobar' );
			const p = new ViewElement( viewDocument, 'p', null, text );
			const range = ViewRange._createFromParentsAndOffsets( p, 0, p, 0 );
			const selection = new ViewDocumentSelection( [ range ] );
			expect( _stringifyView( p, selection ) ).to.equal( '<p>[]foobar</p>' );
		} );

		it( 'should write selection ranges inside text', () => {
			const text1 = new ViewText( viewDocument, 'foobar' );
			const text2 = new ViewText( viewDocument, 'bazqux' );
			const b1 = new ViewElement( viewDocument, 'b', null, text1 );
			const b2 = new ViewElement( viewDocument, 'b', null, text2 );
			const p = new ViewElement( viewDocument, 'p', null, [ b1, b2 ] );
			const range = ViewRange._createFromParentsAndOffsets( text1, 1, text1, 5 );
			const selection = new ViewDocumentSelection( [ range ] );
			expect( _stringifyView( p, selection ) ).to.equal( '<p><b>f{ooba}r</b><b>bazqux</b></p>' );
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
				.to.equal( '<p><b>f[ooba]r</b><b>bazqux</b></p>' );
		} );

		it( 'should write collapsed selection ranges inside texts', () => {
			const text = new ViewText( viewDocument, 'foobar' );
			const p = new ViewElement( viewDocument, 'p', null, text );
			const range = ViewRange._createFromParentsAndOffsets( text, 0, text, 0 );
			const selection = new ViewDocumentSelection( [ range ] );
			expect( _stringifyView( p, selection ) ).to.equal( '<p>{}foobar</p>' );
		} );

		it( 'should write ranges that start inside text end ends between elements', () => {
			const text1 = new ViewText( viewDocument, 'foobar' );
			const text2 = new ViewText( viewDocument, 'bazqux' );
			const b1 = new ViewElement( viewDocument, 'b', null, text1 );
			const b2 = new ViewElement( viewDocument, 'b', null, text2 );
			const p = new ViewElement( viewDocument, 'p', null, [ b1, b2 ] );
			const range = ViewRange._createFromParentsAndOffsets( p, 0, text2, 5 );
			const selection = new ViewDocumentSelection( [ range ] );
			expect( _stringifyView( p, selection ) ).to.equal( '<p>[<b>foobar</b><b>bazqu}x</b></p>' );
		} );

		it( 'should write elements types as namespaces when needed', () => {
			const text = new ViewText( viewDocument, 'foobar' );
			const b = new ViewAttributeElement( viewDocument, 'b', null, text );
			const p = new ViewContainerElement( viewDocument, 'p', null, b );

			expect( _stringifyView( p, null, { showType: true } ) )
				.to.equal( '<container:p><attribute:b>foobar</attribute:b></container:p>' );
		} );

		it( 'should not write element type when type is not specified', () => {
			const p = new ViewElement( viewDocument, 'p' );
			expect( _stringifyView( p, null, { showType: true } ) ).to.equal( '<p></p>' );
		} );

		it( 'should write elements priorities when needed', () => {
			const text = new ViewText( viewDocument, 'foobar' );
			const b = new ViewAttributeElement( viewDocument, 'b', null, text );
			const p = new ViewContainerElement( viewDocument, 'p', null, b );

			expect( _stringifyView( p, null, { showPriority: true } ) )
				.to.equal( '<p><b view-priority="10">foobar</b></p>' );
		} );

		it( 'should write elements id when needed', () => {
			const text = new ViewText( viewDocument, 'foobar' );
			const span = new ViewAttributeElement( viewDocument, 'span', null, text );
			span._id = 'foo';
			const p = new ViewContainerElement( viewDocument, 'p', null, span );

			expect( _stringifyView( p, null, { showAttributeElementId: true } ) )
				.to.equal( '<p><span view-id="foo">foobar</span></p>' );
		} );

		it( 'should parse DocumentFragment as root', () => {
			const text1 = new ViewText( viewDocument, 'foobar' );
			const text2 = new ViewText( viewDocument, 'bazqux' );
			const b1 = new ViewElement( viewDocument, 'b', null, text1 );
			const b2 = new ViewElement( viewDocument, 'b', null, text2 );
			const fragment = new ViewDocumentFragment( viewDocument, [ b1, b2 ] );
			expect( _stringifyView( fragment, null ) ).to.equal( '<b>foobar</b><b>bazqux</b>' );
		} );

		it( 'should not write ranges outside elements - end position outside element', () => {
			const text = new ViewText( viewDocument, 'foobar' );
			const b = new ViewElement( viewDocument, 'b', null, text );
			const p = new ViewElement( viewDocument, 'p', null, b );
			const range = ViewRange._createFromParentsAndOffsets( p, 0, p, 5 );

			expect( _stringifyView( p, range ) ).to.equal( '<p>[<b>foobar</b></p>' );
		} );

		it( 'should not write ranges outside elements - start position outside element', () => {
			const text = new ViewText( viewDocument, 'foobar' );
			const b = new ViewElement( viewDocument, 'b', null, text );
			const p = new ViewElement( viewDocument, 'p', null, b );
			const range = ViewRange._createFromParentsAndOffsets( p, -1, p, 1 );

			expect( _stringifyView( p, range ) ).to.equal( '<p><b>foobar</b>]</p>' );
		} );

		it( 'should not write ranges outside elements - end position outside text', () => {
			const text = new ViewText( viewDocument, 'foobar' );
			const b = new ViewElement( viewDocument, 'b', null, text );
			const p = new ViewElement( viewDocument, 'p', null, b );
			const range = ViewRange._createFromParentsAndOffsets( text, 0, text, 7 );

			expect( _stringifyView( p, range ) ).to.equal( '<p><b>{foobar</b></p>' );
		} );

		it( 'should not write ranges outside elements - start position outside text', () => {
			const text = new ViewText( viewDocument, 'foobar' );
			const b = new ViewElement( viewDocument, 'b', null, text );
			const p = new ViewElement( viewDocument, 'p', null, b );
			const range = ViewRange._createFromParentsAndOffsets( text, -1, text, 2 );

			expect( _stringifyView( p, range ) ).to.equal( '<p><b>fo}obar</b></p>' );
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

			expect( _stringifyView( p, selection ) ).to.equal( '<p>[<b>foobar</b>][]<b>bazqux</b></p>' );
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

			expect( _stringifyView( p, selection ) ).to.equal( '<p>[<b>foobar</b>][]{baz}{q}ux</p>' );
		} );

		it( 'should use Position instance instead of Selection', () => {
			const text = new ViewText( viewDocument, 'foobar' );
			const position = new ViewPosition( text, 3 );
			const string = _stringifyView( text, position );
			expect( string ).to.equal( 'foo{}bar' );
		} );

		it( 'should use Range instance instead of Selection', () => {
			const text = new ViewText( viewDocument, 'foobar' );
			const range = ViewRange._createFromParentsAndOffsets( text, 3, text, 4 );
			const string = _stringifyView( text, range );
			expect( string ).to.equal( 'foo{b}ar' );
		} );

		it( 'should stringify ViewEmptyElement', () => {
			const img = new ViewEmptyElement( viewDocument, 'img' );
			const p = new ViewContainerElement( viewDocument, 'p', null, img );
			expect( _stringifyView( p, null, { showType: true } ) )
				.to.equal( '<container:p><empty:img></empty:img></container:p>' );
		} );

		it( 'should stringify UIElement', () => {
			const span = new ViewUIElement( viewDocument, 'span' );
			const p = new ViewContainerElement( viewDocument, 'p', null, span );
			expect( _stringifyView( p, null, { showType: true } ) )
				.to.equal( '<container:p><ui:span></ui:span></container:p>' );
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
				.to.equal( '<container:p><ui:span></ui:span></container:p>' );
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
				.to.equal( '<container:p><ui:span><b>foo</b></ui:span></container:p>' );
		} );

		it( 'should stringify a RawElement', () => {
			const span = new ViewRawElement( viewDocument, 'span' );
			const p = new ViewContainerElement( viewDocument, 'p', null, span );

			expect( _stringifyView( p, null, { showType: true } ) )
				.to.equal( '<container:p><raw:span></raw:span></container:p>' );
		} );

		it( 'should not stringify the inner RawElement content (renderRawElements=false)', () => {
			const span = new ViewRawElement( viewDocument, 'span' );

			span.render = function( domElement, domConverter ) {
				domConverter.setContentOf( domElement, '<b>foo</b>' );
			};

			const p = new ViewContainerElement( viewDocument, 'p', null, span );
			expect( _stringifyView( p, null, { showType: true } ) )
				.to.equal( '<container:p><raw:span></raw:span></container:p>' );
		} );

		it( 'should stringify a RawElement, (renderRawElements=true)', () => {
			const span = new ViewRawElement( viewDocument, 'span' );

			span.render = function( domElement, domConverter ) {
				domConverter.setContentOf( domElement, '<b>foo</b>' );
			};

			const p = new ViewContainerElement( viewDocument, 'p', null, span );
			expect( _stringifyView( p, null, { showType: true, renderRawElements: true } ) )
				.to.equal( '<container:p><raw:span><b>foo</b></raw:span></container:p>' );
		} );

		it( 'should not return `data-list-item-id` on <li> element by default (skipListItemIds=true)', () => {
			const li = new ViewContainerElement( viewDocument, 'li', { 'data-list-item-id': 'foo' } );
			const ol = new ViewContainerElement( viewDocument, 'ol', null, li );

			expect( _stringifyView( ol, null, { showType: true, skipListItemIds: true } ) )
				.to.equal( '<container:ol><container:li></container:li></container:ol>' );
		} );

		it( 'should not return `data-list-item-id` on <li> element when set (skipListItemIds=true)', () => {
			const li = new ViewContainerElement( viewDocument, 'li', { 'data-list-item-id': 'foo' } );
			const ol = new ViewContainerElement( viewDocument, 'ol', null, li );

			expect( _stringifyView( ol, null, { showType: true, skipListItemIds: true } ) )
				.to.equal( '<container:ol><container:li></container:li></container:ol>' );
		} );

		it( 'should return `data-list-item-id` on <li> element (skipListItemIds=true)', () => {
			const li = new ViewContainerElement( viewDocument, 'li', { 'data-list-item-id': 'foo' } );
			const ol = new ViewContainerElement( viewDocument, 'ol', null, li );

			expect( _stringifyView( ol, null, { showType: true, skipListItemIds: false } ) )
				.to.equal( '<container:ol><container:li data-list-item-id="foo"></container:li></container:ol>' );
		} );

		it( 'should sort classes in specified element', () => {
			const text = new ViewText( viewDocument, 'foobar' );
			const b = new ViewElement( viewDocument, 'b', {
				class: 'zz xx aa'
			}, text );

			expect( _stringifyView( b ) ).to.equal( '<b class="aa xx zz">foobar</b>' );
		} );

		it( 'should sort styles in specified element', () => {
			const text = new ViewText( viewDocument, 'foobar' );
			const i = new ViewElement( viewDocument, 'i', {
				style: 'text-decoration: underline; font-weight: bold'
			}, text );

			expect( _stringifyView( i ) ).to.equal( '<i style="font-weight:bold;text-decoration:underline">foobar</i>' );
		} );
	} );

	describe( 'parse', () => {
		let viewDocument;

		beforeEach( () => {
			viewDocument = new ViewDocument( new StylesProcessor() );
		} );

		it( 'should return empty DocumentFragment for empty string', () => {
			const fragment = _parseView( '' );

			expect( fragment ).to.be.instanceOf( ViewDocumentFragment );
			expect( fragment.childCount ).to.equal( 0 );
		} );

		it( 'should return empty DocumentFragment and Selection for string containing range only', () => {
			const { view, selection } = _parseView( '[]' );

			expect( view ).to.be.instanceOf( ViewDocumentFragment );
			expect( selection.rangeCount ).to.equal( 1 );
			expect( selection.getFirstRange().isEqual( ViewRange._createFromParentsAndOffsets( view, 0, view, 0 ) ) ).to.be.true;
		} );

		it( 'should return Element if range is around single element', () => {
			const { view, selection } = _parseView( '[<b>foobar</b>]' );
			const parent = view.parent;

			expect( view ).to.be.instanceOf( ViewElement );
			expect( parent ).to.be.instanceOf( ViewDocumentFragment );
			expect( selection.rangeCount ).to.equal( 1 );
			expect( selection.getFirstRange().isEqual( ViewRange._createFromParentsAndOffsets( parent, 0, parent, 1 ) ) ).to.be.true;
		} );

		it( 'should create DocumentFragment when multiple elements on root', () => {
			const view = _parseView( '<b></b><i></i>' );
			expect( view ).to.be.instanceOf( ViewDocumentFragment );
			expect( view.childCount ).to.equal( 2 );
			expect( view.getChild( 0 ).isSimilar( new ViewElement( viewDocument, 'b' ) ) ).to.be.true;
			expect( view.getChild( 1 ).isSimilar( new ViewElement( viewDocument, 'i' ) ) ).to.be.true;
		} );

		it( 'should parse text', () => {
			const text = _parseView( 'foobar' );
			expect( text ).to.be.instanceOf( ViewText );
			expect( text.data ).to.equal( 'foobar' );
		} );

		it( 'should parse text with spaces', () => {
			const text = _parseView( 'foo bar' );
			expect( text ).to.be.instanceOf( ViewText );
			expect( text.data ).to.equal( 'foo bar' );
		} );

		it( 'should parse elements and texts', () => {
			const view = _parseView( '<b>foobar</b>' );
			const element = new ViewElement( viewDocument, 'b' );

			expect( view ).to.be.instanceof( ViewElement );
			expect( view.isSimilar( element ) ).to.be.true;
			expect( view.childCount ).to.equal( 1 );
			const text = view.getChild( 0 );
			expect( text ).to.be.instanceof( ViewText );
			expect( text.data ).to.equal( 'foobar' );
		} );

		it( 'should parse element attributes', () => {
			const view = _parseView( '<b name="foo" title="bar" class="foo bar" style="color:red;"></b>' );
			const element = new ViewElement( viewDocument, 'b', { name: 'foo', title: 'bar', class: 'foo bar', style: 'color:red;' } );

			expect( view ).to.be.instanceof( ViewElement );
			expect( view.isSimilar( element ) ).to.be.true;
			expect( view.childCount ).to.equal( 0 );
		} );

		it( 'should parse element type', () => {
			const view1 = _parseView( '<attribute:b></attribute:b>' );
			const attribute = new ViewAttributeElement( viewDocument, 'b' );
			const view2 = _parseView( '<container:p></container:p>' );
			const container = new ViewContainerElement( viewDocument, 'p' );

			expect( view1 ).to.be.instanceof( ViewAttributeElement );
			expect( view1.isSimilar( attribute ) ).to.be.true;
			expect( view2 ).to.be.instanceof( ViewContainerElement );
			expect( view2.isSimilar( container ) ).to.be.true;
		} );

		it( 'should parse element priority', () => {
			const parsed1 = _parseView( '<b view-priority="12"></b>' );
			const attribute1 = new ViewAttributeElement( viewDocument, 'b' );
			attribute1._priority = 12;
			const parsed2 = _parseView( '<attribute:b view-priority="44"></attribute:b>' );
			const attribute2 = new ViewAttributeElement( viewDocument, 'b' );
			attribute2._priority = 44;

			parsed1.isSimilar( attribute1 );
			expect( parsed1.isSimilar( attribute1 ) ).to.be.true;
			expect( parsed2.isSimilar( attribute2 ) ).to.be.true;
		} );

		it( 'should parse attribute element id', () => {
			const parsed1 = _parseView( '<attribute:span view-id="foo"></attribute:span>' );
			expect( parsed1.id ).to.equal( 'foo' );

			const parsed2 = _parseView( '<container:div view-id="bar"></container:div>' );
			expect( parsed2.id ).to.be.undefined;
		} );

		it( 'should correctly parse whitespaces around custom inline object elements', () => {
			const parsed = _parseView( '<p>Foo <inlineObj></inlineObj> bar</p>', { inlineObjectElements: [ 'inlineObj' ] } );

			expect( parsed.getChild( 0 ).data ).to.equal( 'Foo ' );
			expect( parsed.getChild( 2 ).data ).to.equal( ' bar' );
		} );

		it( 'should paste nested elements and texts', () => {
			const parsed = _parseView( '<container:p>foo<b view-priority="12">bar<i view-priority="25">qux</i></b></container:p>' );
			expect( parsed.isSimilar( new ViewContainerElement( viewDocument, 'p' ) ) ).to.be.true;
			expect( parsed.childCount ).to.equal( 2 );
			expect( parsed.getChild( 0 ) ).to.be.instanceof( ViewText ).and.have.property( 'data' ).that.equal( 'foo' );
			const b = parsed.getChild( 1 );
			expect( b ).to.be.instanceof( ViewAttributeElement );
			expect( b.priority ).to.equal( 12 );
			expect( b.childCount ).to.equal( 2 );
			expect( b.getChild( 0 ) ).to.be.instanceof( ViewText ).and.have.property( 'data' ).that.equal( 'bar' );
			const i = b.getChild( 1 );
			expect( i ).to.be.instanceof( ViewAttributeElement );
			expect( i.priority ).to.equal( 25 );
			expect( i.getChild( 0 ) ).to.be.instanceof( ViewText ).and.have.property( 'data' ).that.equal( 'qux' );
		} );

		it( 'should parse selection range inside text', () => {
			const { view, selection } = _parseView( 'f{oo}b{}ar' );
			expect( view ).to.be.instanceof( ViewText );
			expect( view.data ).to.equal( 'foobar' );
			expect( selection.rangeCount ).to.equal( 2 );
			const ranges = [ ...selection.getRanges() ];

			expect( ranges[ 0 ].isEqual( ViewRange._createFromParentsAndOffsets( view, 1, view, 3 ) ) ).to.be.true;
			expect( ranges[ 1 ].isEqual( ViewRange._createFromParentsAndOffsets( view, 4, view, 4 ) ) ).to.be.true;
		} );

		it( 'should parse selection range between elements', () => {
			const { view, selection } = _parseView( '<p>[<b>foobar]</b>[]</p>' );
			expect( view ).to.be.instanceof( ViewElement );
			expect( view.childCount ).to.equal( 1 );
			const b = view.getChild( 0 );
			expect( b ).to.be.instanceof( ViewElement );
			expect( b.name ).to.equal( 'b' );
			expect( b.childCount ).to.equal( 1 );
			const text = b.getChild( 0 );
			expect( text ).to.be.instanceof( ViewText );
			expect( text.data ).to.equal( 'foobar' );
			expect( selection.rangeCount ).to.equal( 2 );
			const ranges = [ ...selection.getRanges() ];
			expect( ranges[ 0 ].isEqual( ViewRange._createFromParentsAndOffsets( view, 0, b, 1 ) ) ).to.be.true;
			expect( ranges[ 1 ].isEqual( ViewRange._createFromParentsAndOffsets( view, 1, view, 1 ) ) ).to.be.true;
		} );

		it( 'should support unicode', () => {
			const { view, selection } = _parseView( '<p>[<b>நிலை}க்கு</b></p>' );

			expect( view ).to.be.instanceof( ViewElement );
			expect( view.name ).to.equal( 'p' );
			expect( view.childCount ).to.equal( 1 );

			const b = view.getChild( 0 );
			expect( b.name ).to.equal( 'b' );
			expect( b.childCount ).to.equal( 1 );

			const text = b.getChild( 0 );
			expect( text.data ).to.equal( 'நிலைக்கு' );

			expect( selection.rangeCount ).to.equal( 1 );
			const range = selection.getFirstRange();

			expect( range.start.parent ).to.equal( view );
			expect( range.start.offset ).to.equal( 0 );
			expect( range.end.parent ).to.equal( text );
			expect( range.end.offset ).to.equal( 4 );
		} );

		it( 'should parse ranges #1', () => {
			const { view, selection } = _parseView( '<container:p>foo{bar]</container:p>' );
			expect( view.isSimilar( new ViewContainerElement( viewDocument, 'p' ) ) ).to.be.true;
			expect( view.childCount ).to.equal( 1 );
			const text = view.getChild( 0 );
			expect( text ).to.be.instanceof( ViewText );
			expect( text.data ).to.equal( 'foobar' );
			expect( selection.rangeCount ).to.equal( 1 );
			expect( selection.getFirstRange().isEqual( ViewRange._createFromParentsAndOffsets( text, 3, view, 1 ) ) ).to.be.true;
		} );

		it( 'should parse ranges #2', () => {
			const { view, selection } = _parseView( '<attribute:b>[foob}ar<i>{baz</i>]</attribute:b>' );
			expect( view.isSimilar( new ViewAttributeElement( viewDocument, 'b' ) ) ).to.be.true;
			expect( view.childCount ).to.equal( 2 );
			const text1 = view.getChild( 0 );
			expect( text1 ).to.be.instanceof( ViewText );
			expect( text1.data ).to.equal( 'foobar' );
			const i = view.getChild( 1 );
			expect( i.isSimilar( new ViewElement( viewDocument, 'i' ) ) ).to.be.true;
			expect( i.childCount ).to.equal( 1 );
			const text2 = i.getChild( 0 );
			expect( text2 ).to.be.instanceof( ViewText );
			expect( text2.data ).to.equal( 'baz' );
			expect( selection.rangeCount ).to.equal( 2 );
			const ranges = [ ...selection.getRanges() ];
			expect( ranges[ 0 ].isEqual( ViewRange._createFromParentsAndOffsets( view, 0, text1, 4 ) ) ).to.be.true;
			expect( ranges[ 1 ].isEqual( ViewRange._createFromParentsAndOffsets( text2, 0, view, 2 ) ) ).to.be.true;
		} );

		it( 'should use ranges order when provided', () => {
			const { view, selection } = _parseView( '{f}oo{b}arb{a}z', { order: [ 3, 1, 2 ] } );
			expect( selection.rangeCount ).to.equal( 3 );
			const ranges = [ ...selection.getRanges() ];
			expect( ranges[ 0 ].isEqual( ViewRange._createFromParentsAndOffsets( view, 3, view, 4 ) ) ).to.be.true;
			expect( ranges[ 1 ].isEqual( ViewRange._createFromParentsAndOffsets( view, 7, view, 8 ) ) ).to.be.true;
			expect( ranges[ 2 ].isEqual( ViewRange._createFromParentsAndOffsets( view, 0, view, 1 ) ) ).to.be.true;
			expect( selection.anchor.isEqual( ranges[ 2 ].start ) ).to.be.true;
			expect( selection.focus.isEqual( ranges[ 2 ].end ) ).to.be.true;
		} );

		it( 'should set last range backward if needed', () => {
			const { view, selection } = _parseView( '{f}oo{b}arb{a}z', { order: [ 3, 1, 2 ], lastRangeBackward: true } );
			expect( selection.rangeCount ).to.equal( 3 );
			const ranges = [ ...selection.getRanges() ];
			expect( ranges[ 0 ].isEqual( ViewRange._createFromParentsAndOffsets( view, 3, view, 4 ) ) ).to.be.true;
			expect( ranges[ 1 ].isEqual( ViewRange._createFromParentsAndOffsets( view, 7, view, 8 ) ) ).to.be.true;
			expect( ranges[ 2 ].isEqual( ViewRange._createFromParentsAndOffsets( view, 0, view, 1 ) ) ).to.be.true;
			expect( selection.anchor.isEqual( ranges[ 2 ].end ) ).to.be.true;
			expect( selection.focus.isEqual( ranges[ 2 ].start ) ).to.be.true;
		} );

		it( 'should throw when ranges order does not include all ranges', () => {
			expect( () => {
				_parseView( '{}foobar{}', { order: [ 1 ] } );
			} ).to.throw( Error );
		} );

		it( 'should throw when ranges order is invalid', () => {
			expect( () => {
				_parseView( '{}foobar{}', { order: [ 1, 4 ] } );
			} ).to.throw( Error );
		} );

		it( 'should throw when element range delimiter is inside text node', () => {
			expect( () => {
				_parseView( 'foo[bar' );
			} ).to.throw( Error );
		} );

		it( 'should throw when text range delimiter is inside empty text node', () => {
			expect( () => {
				_parseView( '<b>foo</b>}' );
			} ).to.throw( Error );
		} );

		it( 'should throw when end of range is found before start', () => {
			expect( () => {
				_parseView( 'fo}obar' );
			} ).to.throw( Error );
		} );

		it( 'should throw when intersecting ranges found', () => {
			expect( () => {
				_parseView( '[fo{o}bar]' );
			} ).to.throw( Error );
		} );

		it( 'should throw when opened ranges are left', () => {
			expect( () => {
				_parseView( 'fo{obar' );
			} ).to.throw( Error );
		} );

		it( 'should throw when wrong type is provided', () => {
			sinon.stub( XmlDataProcessor.prototype, 'toView' ).returns( new ViewContainerElement( viewDocument, 'invalidType:b' ) );

			expect( () => {
				_parseView( 'sth' );
			} ).to.throw( Error, 'Parse error - cannot parse element\'s name: invalidType:b.' );

			XmlDataProcessor.prototype.toView.restore();
		} );

		it( 'should use provided root element #1', () => {
			const root = new ViewElement( viewDocument, 'p' );
			const data = _parseView( '<span>text</span>', { rootElement: root } );

			expect( _stringifyView( data ) ).to.equal( '<p><span>text</span></p>' );
		} );

		it( 'should use provided root element #2', () => {
			const root = new ViewElement( viewDocument, 'p' );
			const data = _parseView( '<span>text</span><b>test</b>', { rootElement: root } );

			expect( _stringifyView( data ) ).to.equal( '<p><span>text</span><b>test</b></p>' );
		} );

		it( 'should parse an ViewEmptyElement', () => {
			const parsed = _parseView( '<empty:img></empty:img>' );

			expect( parsed ).to.be.instanceof( ViewEmptyElement );
		} );

		it( 'should parse a UIElement', () => {
			const parsed = _parseView( '<ui:span></ui:span>' );

			expect( parsed ).to.be.instanceof( ViewUIElement );
		} );

		it( 'should parse a RawElement', () => {
			const parsed = _parseView( '<raw:span></raw:span>' );

			expect( parsed ).to.be.instanceof( ViewRawElement );
		} );

		it( 'should throw an error if ViewEmptyElement is not empty', () => {
			expect( () => {
				_parseView( '<empty:img>foo bar</empty:img>' );
			} ).to.throw( Error, 'Parse error - cannot parse inside ViewEmptyElement.' );
		} );

		it( 'should throw an error if a UIElement is not empty', () => {
			expect( () => {
				_parseView( '<ui:span>foo bar</ui:span>' );
			} ).to.throw( Error, 'Parse error - cannot parse inside UIElement.' );
		} );

		it( 'should throw an error if a RawElement is not empty', () => {
			expect( () => {
				_parseView( '<raw:span>foo bar</raw:span>' );
			} ).to.throw( Error, 'Parse error - cannot parse inside RawElement.' );
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
