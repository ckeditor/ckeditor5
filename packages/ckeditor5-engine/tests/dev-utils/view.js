/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import { parse, stringify, getData, setData } from '../../src/dev-utils/view';
import ViewDocument from '../../src/view/document';
import DocumentFragment from '../../src/view/documentfragment';
import Position from '../../src/view/position';
import Element from '../../src/view/element';
import AttributeElement from '../../src/view/attributeelement';
import ContainerElement from '../../src/view/containerelement';
import EmptyElement from '../../src/view/emptyelement';
import UIElement from '../../src/view/uielement';
import RawElement from '../../src/view/rawelement';
import Text from '../../src/view/text';
import DocumentSelection from '../../src/view/documentselection';
import Range from '../../src/view/range';
import View from '../../src/view/view';
import XmlDataProcessor from '../../src/dataprocessor/xmldataprocessor';
import createViewRoot from '../view/_utils/createroot';
import { StylesProcessor } from '../../src/view/stylesmap';

describe( 'view test utils', () => {
	describe( 'getData, setData', () => {
		afterEach( () => {
			sinon.restore();
		} );

		describe( 'getData', () => {
			it( 'should use stringify method', () => {
				const element = document.createElement( 'div' );
				const stringifySpy = sinon.spy( getData, '_stringify' );
				const view = new View( new StylesProcessor() );
				const viewDocument = view.document;
				const options = {
					showType: false,
					showPriority: false,
					withoutSelection: true,
					renderUIElements: false
				};
				const root = createAttachedRoot( viewDocument, element );
				root._appendChild( new Element( viewDocument, 'p' ) );

				expect( getData( view, options ) ).to.equal( '<p></p>' );
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
				const stringifySpy = sinon.spy( getData, '_stringify' );
				const view = new View( new StylesProcessor() );
				const viewDocument = view.document;
				const options = { showType: false, showPriority: false };
				const root = createAttachedRoot( viewDocument, element );
				root._appendChild( new Element( viewDocument, 'p' ) );

				view.change( writer => {
					writer.setSelection( Range._createFromParentsAndOffsets( root, 0, root, 1 ) );
				} );

				expect( getData( view, options ) ).to.equal( '[<p></p>]' );
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
					getData( { invalid: 'view' } );
				} ).to.throw( TypeError, 'View needs to be an instance of module:engine/view/view~View.' );
			} );
		} );

		describe( 'setData', () => {
			it( 'should use parse method', () => {
				const view = new View( new StylesProcessor() );
				const viewDocument = view.document;
				const data = 'foobar<b>baz</b>';
				const parseSpy = sinon.spy( setData, '_parse' );

				createAttachedRoot( viewDocument, document.createElement( 'div' ) );
				setData( view, data );

				expect( getData( view ) ).to.equal( 'foobar<b>baz</b>' );
				sinon.assert.calledOnce( parseSpy );
				const args = parseSpy.firstCall.args;
				expect( args[ 0 ] ).to.equal( data );
				expect( args[ 1 ] ).to.be.an( 'object' );
				expect( args[ 1 ].rootElement ).to.equal( viewDocument.getRoot() );

				view.destroy();
			} );

			it( 'should use parse method with selection', () => {
				const view = new View( new StylesProcessor() );
				const viewDocument = view.document;
				const data = '[<b>baz</b>]';
				const parseSpy = sinon.spy( setData, '_parse' );

				createAttachedRoot( viewDocument, document.createElement( 'div' ) );
				setData( view, data );

				expect( getData( view ) ).to.equal( '[<b>baz</b>]' );
				const args = parseSpy.firstCall.args;
				expect( args[ 0 ] ).to.equal( data );
				expect( args[ 1 ] ).to.be.an( 'object' );
				expect( args[ 1 ].rootElement ).to.equal( viewDocument.getRoot() );

				view.destroy();
			} );

			it( 'should throw an error when passing invalid document', () => {
				expect( () => {
					setData( { invalid: 'view' } );
				} ).to.throw( TypeError, 'View needs to be an instance of module:engine/view/view~View.' );
			} );
		} );
	} );

	describe( 'stringify', () => {
		let viewDocument;

		beforeEach( () => {
			viewDocument = new ViewDocument( new StylesProcessor() );
		} );

		it( 'should write text', () => {
			const text = new Text( viewDocument, 'foobar' );
			expect( stringify( text ) ).to.equal( 'foobar' );
		} );

		it( 'should write elements and texts', () => {
			const text = new Text( viewDocument, 'foobar' );
			const b = new Element( viewDocument, 'b', null, text );
			const p = new Element( viewDocument, 'p', null, b );

			expect( stringify( p ) ).to.equal( '<p><b>foobar</b></p>' );
		} );

		it( 'should write elements with attributes (attributes in alphabetical order)', () => {
			const text = new Text( viewDocument, 'foobar' );
			const b = new Element( viewDocument, 'b', {
				foo: 'bar'
			}, text );
			const p = new Element( viewDocument, 'p', {
				baz: 'qux',
				bar: 'taz',
				class: 'short wide'
			}, b );

			expect( stringify( p ) ).to.equal( '<p bar="taz" baz="qux" class="short wide"><b foo="bar">foobar</b></p>' );
		} );

		it( 'should write selection ranges inside elements', () => {
			const text1 = new Text( viewDocument, 'foobar' );
			const text2 = new Text( viewDocument, 'bazqux' );
			const b1 = new Element( viewDocument, 'b', null, text1 );
			const b2 = new Element( viewDocument, 'b', null, text2 );
			const p = new Element( viewDocument, 'p', null, [ b1, b2 ] );
			const range = Range._createFromParentsAndOffsets( p, 1, p, 2 );
			const selection = new DocumentSelection( [ range ] );
			expect( stringify( p, selection ) ).to.equal( '<p><b>foobar</b>[<b>bazqux</b>]</p>' );
		} );

		it( 'should support unicode', () => {
			const text = new Text( viewDocument, 'நிலைக்கு' );
			const b = new Element( viewDocument, 'b', null, text );
			const p = new Element( viewDocument, 'p', null, b );
			const range = Range._createFromParentsAndOffsets( p, 0, text, 4 );
			const selection = new DocumentSelection( [ range ] );

			expect( stringify( p, selection ) ).to.equal( '<p>[<b>நிலை}க்கு</b></p>' );
		} );

		it( 'should write collapsed selection ranges inside elements', () => {
			const text = new Text( viewDocument, 'foobar' );
			const p = new Element( viewDocument, 'p', null, text );
			const range = Range._createFromParentsAndOffsets( p, 0, p, 0 );
			const selection = new DocumentSelection( [ range ] );
			expect( stringify( p, selection ) ).to.equal( '<p>[]foobar</p>' );
		} );

		it( 'should write selection ranges inside text', () => {
			const text1 = new Text( viewDocument, 'foobar' );
			const text2 = new Text( viewDocument, 'bazqux' );
			const b1 = new Element( viewDocument, 'b', null, text1 );
			const b2 = new Element( viewDocument, 'b', null, text2 );
			const p = new Element( viewDocument, 'p', null, [ b1, b2 ] );
			const range = Range._createFromParentsAndOffsets( text1, 1, text1, 5 );
			const selection = new DocumentSelection( [ range ] );
			expect( stringify( p, selection ) ).to.equal( '<p><b>f{ooba}r</b><b>bazqux</b></p>' );
		} );

		it( 'should write selection ranges inside text represented by `[` and `]` characters', () => {
			const text1 = new Text( viewDocument, 'foobar' );
			const text2 = new Text( viewDocument, 'bazqux' );
			const b1 = new Element( viewDocument, 'b', null, text1 );
			const b2 = new Element( viewDocument, 'b', null, text2 );
			const p = new Element( viewDocument, 'p', null, [ b1, b2 ] );
			const range = Range._createFromParentsAndOffsets( text1, 1, text1, 5 );
			const selection = new DocumentSelection( [ range ] );
			expect( stringify( p, selection, { sameSelectionCharacters: true } ) )
				.to.equal( '<p><b>f[ooba]r</b><b>bazqux</b></p>' );
		} );

		it( 'should write collapsed selection ranges inside texts', () => {
			const text = new Text( viewDocument, 'foobar' );
			const p = new Element( viewDocument, 'p', null, text );
			const range = Range._createFromParentsAndOffsets( text, 0, text, 0 );
			const selection = new DocumentSelection( [ range ] );
			expect( stringify( p, selection ) ).to.equal( '<p>{}foobar</p>' );
		} );

		it( 'should write ranges that start inside text end ends between elements', () => {
			const text1 = new Text( viewDocument, 'foobar' );
			const text2 = new Text( viewDocument, 'bazqux' );
			const b1 = new Element( viewDocument, 'b', null, text1 );
			const b2 = new Element( viewDocument, 'b', null, text2 );
			const p = new Element( viewDocument, 'p', null, [ b1, b2 ] );
			const range = Range._createFromParentsAndOffsets( p, 0, text2, 5 );
			const selection = new DocumentSelection( [ range ] );
			expect( stringify( p, selection ) ).to.equal( '<p>[<b>foobar</b><b>bazqu}x</b></p>' );
		} );

		it( 'should write elements types as namespaces when needed', () => {
			const text = new Text( viewDocument, 'foobar' );
			const b = new AttributeElement( viewDocument, 'b', null, text );
			const p = new ContainerElement( viewDocument, 'p', null, b );

			expect( stringify( p, null, { showType: true } ) )
				.to.equal( '<container:p><attribute:b>foobar</attribute:b></container:p>' );
		} );

		it( 'should not write element type when type is not specified', () => {
			const p = new Element( viewDocument, 'p' );
			expect( stringify( p, null, { showType: true } ) ).to.equal( '<p></p>' );
		} );

		it( 'should write elements priorities when needed', () => {
			const text = new Text( viewDocument, 'foobar' );
			const b = new AttributeElement( viewDocument, 'b', null, text );
			const p = new ContainerElement( viewDocument, 'p', null, b );

			expect( stringify( p, null, { showPriority: true } ) )
				.to.equal( '<p><b view-priority="10">foobar</b></p>' );
		} );

		it( 'should write elements id when needed', () => {
			const text = new Text( viewDocument, 'foobar' );
			const span = new AttributeElement( viewDocument, 'span', null, text );
			span._id = 'foo';
			const p = new ContainerElement( viewDocument, 'p', null, span );

			expect( stringify( p, null, { showAttributeElementId: true } ) )
				.to.equal( '<p><span view-id="foo">foobar</span></p>' );
		} );

		it( 'should parse DocumentFragment as root', () => {
			const text1 = new Text( viewDocument, 'foobar' );
			const text2 = new Text( viewDocument, 'bazqux' );
			const b1 = new Element( viewDocument, 'b', null, text1 );
			const b2 = new Element( viewDocument, 'b', null, text2 );
			const fragment = new DocumentFragment( viewDocument, [ b1, b2 ] );
			expect( stringify( fragment, null ) ).to.equal( '<b>foobar</b><b>bazqux</b>' );
		} );

		it( 'should not write ranges outside elements - end position outside element', () => {
			const text = new Text( viewDocument, 'foobar' );
			const b = new Element( viewDocument, 'b', null, text );
			const p = new Element( viewDocument, 'p', null, b );
			const range = Range._createFromParentsAndOffsets( p, 0, p, 5 );

			expect( stringify( p, range ) ).to.equal( '<p>[<b>foobar</b></p>' );
		} );

		it( 'should not write ranges outside elements - start position outside element', () => {
			const text = new Text( viewDocument, 'foobar' );
			const b = new Element( viewDocument, 'b', null, text );
			const p = new Element( viewDocument, 'p', null, b );
			const range = Range._createFromParentsAndOffsets( p, -1, p, 1 );

			expect( stringify( p, range ) ).to.equal( '<p><b>foobar</b>]</p>' );
		} );

		it( 'should not write ranges outside elements - end position outside text', () => {
			const text = new Text( viewDocument, 'foobar' );
			const b = new Element( viewDocument, 'b', null, text );
			const p = new Element( viewDocument, 'p', null, b );
			const range = Range._createFromParentsAndOffsets( text, 0, text, 7 );

			expect( stringify( p, range ) ).to.equal( '<p><b>{foobar</b></p>' );
		} );

		it( 'should not write ranges outside elements - start position outside text', () => {
			const text = new Text( viewDocument, 'foobar' );
			const b = new Element( viewDocument, 'b', null, text );
			const p = new Element( viewDocument, 'p', null, b );
			const range = Range._createFromParentsAndOffsets( text, -1, text, 2 );

			expect( stringify( p, range ) ).to.equal( '<p><b>fo}obar</b></p>' );
		} );

		it( 'should write multiple ranges from selection #1', () => {
			const text1 = new Text( viewDocument, 'foobar' );
			const text2 = new Text( viewDocument, 'bazqux' );
			const b1 = new Element( viewDocument, 'b', null, text1 );
			const b2 = new Element( viewDocument, 'b', null, text2 );
			const p = new Element( viewDocument, 'p', null, [ b1, b2 ] );
			const range1 = Range._createFromParentsAndOffsets( p, 0, p, 1 );
			const range2 = Range._createFromParentsAndOffsets( p, 1, p, 1 );
			const selection = new DocumentSelection( [ range2, range1 ] );

			expect( stringify( p, selection ) ).to.equal( '<p>[<b>foobar</b>][]<b>bazqux</b></p>' );
		} );

		it( 'should write multiple ranges from selection #2', () => {
			const text1 = new Text( viewDocument, 'foobar' );
			const text2 = new Text( viewDocument, 'bazqux' );
			const b = new Element( viewDocument, 'b', null, text1 );
			const p = new Element( viewDocument, 'p', null, [ b, text2 ] );
			const range1 = Range._createFromParentsAndOffsets( p, 0, p, 1 );
			const range2 = Range._createFromParentsAndOffsets( text2, 0, text2, 3 );
			const range3 = Range._createFromParentsAndOffsets( text2, 3, text2, 4 );
			const range4 = Range._createFromParentsAndOffsets( p, 1, p, 1 );
			const selection = new DocumentSelection( [ range1, range2, range3, range4 ] );

			expect( stringify( p, selection ) ).to.equal( '<p>[<b>foobar</b>][]{baz}{q}ux</p>' );
		} );

		it( 'should use Position instance instead of Selection', () => {
			const text = new Text( viewDocument, 'foobar' );
			const position = new Position( text, 3 );
			const string = stringify( text, position );
			expect( string ).to.equal( 'foo{}bar' );
		} );

		it( 'should use Range instance instead of Selection', () => {
			const text = new Text( viewDocument, 'foobar' );
			const range = Range._createFromParentsAndOffsets( text, 3, text, 4 );
			const string = stringify( text, range );
			expect( string ).to.equal( 'foo{b}ar' );
		} );

		it( 'should stringify EmptyElement', () => {
			const img = new EmptyElement( viewDocument, 'img' );
			const p = new ContainerElement( viewDocument, 'p', null, img );
			expect( stringify( p, null, { showType: true } ) )
				.to.equal( '<container:p><empty:img></empty:img></container:p>' );
		} );

		it( 'should stringify UIElement', () => {
			const span = new UIElement( viewDocument, 'span' );
			const p = new ContainerElement( viewDocument, 'p', null, span );
			expect( stringify( p, null, { showType: true } ) )
				.to.equal( '<container:p><ui:span></ui:span></container:p>' );
		} );

		it( 'should not stringify inner UIElement content (renderUIElements=false)', () => {
			const span = new UIElement( viewDocument, 'span' );

			span.render = function( domDocument ) {
				const domElement = this.toDomElement( domDocument );

				domElement.innerHTML = '<b>foo</b>';

				return domElement;
			};

			const p = new ContainerElement( viewDocument, 'p', null, span );
			expect( stringify( p, null, { showType: true } ) )
				.to.equal( '<container:p><ui:span></ui:span></container:p>' );
		} );

		it( 'should stringify UIElement, (renderUIElements=true)', () => {
			const span = new UIElement( viewDocument, 'span' );

			span.render = function( domDocument ) {
				const domElement = this.toDomElement( domDocument );

				domElement.innerHTML = '<b>foo</b>';

				return domElement;
			};

			const p = new ContainerElement( viewDocument, 'p', null, span );
			expect( stringify( p, null, { showType: true, renderUIElements: true } ) )
				.to.equal( '<container:p><ui:span><b>foo</b></ui:span></container:p>' );
		} );

		it( 'should stringify a RawElement', () => {
			const span = new RawElement( viewDocument, 'span' );
			const p = new ContainerElement( viewDocument, 'p', null, span );
			expect( stringify( p, null, { showType: true } ) )
				.to.equal( '<container:p><raw:span></raw:span></container:p>' );
		} );

		it( 'should not stringify the inner RawElement content (renderRawElements=false)', () => {
			const span = new RawElement( viewDocument, 'span' );

			span.render = function( domDocument ) {
				const domElement = this.toDomElement( domDocument );

				domElement.innerHTML = '<b>foo</b>';

				return domElement;
			};

			const p = new ContainerElement( viewDocument, 'p', null, span );
			expect( stringify( p, null, { showType: true } ) )
				.to.equal( '<container:p><raw:span></raw:span></container:p>' );
		} );

		it( 'should stringify a RawElement, (renderRawElements=true)', () => {
			const span = new RawElement( viewDocument, 'span' );

			span.render = function( domDocument ) {
				const domElement = this.toDomElement( domDocument );

				domElement.innerHTML = '<b>foo</b>';

				return domElement;
			};

			const p = new ContainerElement( viewDocument, 'p', null, span );
			expect( stringify( p, null, { showType: true, renderRawElements: true } ) )
				.to.equal( '<container:p><raw:span><b>foo</b></raw:span></container:p>' );
		} );

		it( 'should sort classes in specified element', () => {
			const text = new Text( viewDocument, 'foobar' );
			const b = new Element( viewDocument, 'b', {
				class: 'zz xx aa'
			}, text );

			expect( stringify( b ) ).to.equal( '<b class="aa xx zz">foobar</b>' );
		} );

		it( 'should sort styles in specified element', () => {
			const text = new Text( viewDocument, 'foobar' );
			const i = new Element( viewDocument, 'i', {
				style: 'text-decoration: underline; font-weight: bold'
			}, text );

			expect( stringify( i ) ).to.equal( '<i style="font-weight:bold;text-decoration:underline">foobar</i>' );
		} );
	} );

	describe( 'parse', () => {
		let viewDocument;

		beforeEach( () => {
			viewDocument = new ViewDocument( new StylesProcessor() );
		} );

		it( 'should return empty DocumentFragment for empty string', () => {
			const fragment = parse( '' );

			expect( fragment ).to.be.instanceOf( DocumentFragment );
			expect( fragment.childCount ).to.equal( 0 );
		} );

		it( 'should return empty DocumentFragment and Selection for string containing range only', () => {
			const { view, selection } = parse( '[]' );

			expect( view ).to.be.instanceOf( DocumentFragment );
			expect( selection.rangeCount ).to.equal( 1 );
			expect( selection.getFirstRange().isEqual( Range._createFromParentsAndOffsets( view, 0, view, 0 ) ) ).to.be.true;
		} );

		it( 'should return Element if range is around single element', () => {
			const { view, selection } = parse( '[<b>foobar</b>]' );
			const parent = view.parent;

			expect( view ).to.be.instanceOf( Element );
			expect( parent ).to.be.instanceOf( DocumentFragment );
			expect( selection.rangeCount ).to.equal( 1 );
			expect( selection.getFirstRange().isEqual( Range._createFromParentsAndOffsets( parent, 0, parent, 1 ) ) ).to.be.true;
		} );

		it( 'should create DocumentFragment when multiple elements on root', () => {
			const view = parse( '<b></b><i></i>' );
			expect( view ).to.be.instanceOf( DocumentFragment );
			expect( view.childCount ).to.equal( 2 );
			expect( view.getChild( 0 ).isSimilar( new Element( viewDocument, 'b' ) ) ).to.be.true;
			expect( view.getChild( 1 ).isSimilar( new Element( viewDocument, 'i' ) ) ).to.be.true;
		} );

		it( 'should parse text', () => {
			const text = parse( 'foobar' );
			expect( text ).to.be.instanceOf( Text );
			expect( text.data ).to.equal( 'foobar' );
		} );

		it( 'should parse text with spaces', () => {
			const text = parse( 'foo bar' );
			expect( text ).to.be.instanceOf( Text );
			expect( text.data ).to.equal( 'foo bar' );
		} );

		it( 'should parse elements and texts', () => {
			const view = parse( '<b>foobar</b>' );
			const element = new Element( viewDocument, 'b' );

			expect( view ).to.be.instanceof( Element );
			expect( view.isSimilar( element ) ).to.be.true;
			expect( view.childCount ).to.equal( 1 );
			const text = view.getChild( 0 );
			expect( text ).to.be.instanceof( Text );
			expect( text.data ).to.equal( 'foobar' );
		} );

		it( 'should parse element attributes', () => {
			const view = parse( '<b name="foo" title="bar" class="foo bar" style="color:red;"></b>' );
			const element = new Element( viewDocument, 'b', { name: 'foo', title: 'bar', class: 'foo bar', style: 'color:red;' } );

			expect( view ).to.be.instanceof( Element );
			expect( view.isSimilar( element ) ).to.be.true;
			expect( view.childCount ).to.equal( 0 );
		} );

		it( 'should parse element type', () => {
			const view1 = parse( '<attribute:b></attribute:b>' );
			const attribute = new AttributeElement( viewDocument, 'b' );
			const view2 = parse( '<container:p></container:p>' );
			const container = new ContainerElement( viewDocument, 'p' );

			expect( view1 ).to.be.instanceof( AttributeElement );
			expect( view1.isSimilar( attribute ) ).to.be.true;
			expect( view2 ).to.be.instanceof( ContainerElement );
			expect( view2.isSimilar( container ) ).to.be.true;
		} );

		it( 'should parse element priority', () => {
			const parsed1 = parse( '<b view-priority="12"></b>' );
			const attribute1 = new AttributeElement( viewDocument, 'b' );
			attribute1._priority = 12;
			const parsed2 = parse( '<attribute:b view-priority="44"></attribute:b>' );
			const attribute2 = new AttributeElement( viewDocument, 'b' );
			attribute2._priority = 44;

			parsed1.isSimilar( attribute1 );
			expect( parsed1.isSimilar( attribute1 ) ).to.be.true;
			expect( parsed2.isSimilar( attribute2 ) ).to.be.true;
		} );

		it( 'should parse attribute element id', () => {
			const parsed1 = parse( '<attribute:span view-id="foo"></attribute:span>' );
			expect( parsed1.id ).to.equal( 'foo' );

			const parsed2 = parse( '<container:div view-id="bar"></container:div>' );
			expect( parsed2.id ).to.be.undefined;
		} );

		it( 'should paste nested elements and texts', () => {
			const parsed = parse( '<container:p>foo<b view-priority="12">bar<i view-priority="25">qux</i></b></container:p>' );
			expect( parsed.isSimilar( new ContainerElement( viewDocument, 'p' ) ) ).to.be.true;
			expect( parsed.childCount ).to.equal( 2 );
			expect( parsed.getChild( 0 ) ).to.be.instanceof( Text ).and.have.property( 'data' ).that.equal( 'foo' );
			const b = parsed.getChild( 1 );
			expect( b ).to.be.instanceof( AttributeElement );
			expect( b.priority ).to.equal( 12 );
			expect( b.childCount ).to.equal( 2 );
			expect( b.getChild( 0 ) ).to.be.instanceof( Text ).and.have.property( 'data' ).that.equal( 'bar' );
			const i = b.getChild( 1 );
			expect( i ).to.be.instanceof( AttributeElement );
			expect( i.priority ).to.equal( 25 );
			expect( i.getChild( 0 ) ).to.be.instanceof( Text ).and.have.property( 'data' ).that.equal( 'qux' );
		} );

		it( 'should parse selection range inside text', () => {
			const { view, selection } = parse( 'f{oo}b{}ar' );
			expect( view ).to.be.instanceof( Text );
			expect( view.data ).to.equal( 'foobar' );
			expect( selection.rangeCount ).to.equal( 2 );
			const ranges = [ ...selection.getRanges() ];

			expect( ranges[ 0 ].isEqual( Range._createFromParentsAndOffsets( view, 1, view, 3 ) ) ).to.be.true;
			expect( ranges[ 1 ].isEqual( Range._createFromParentsAndOffsets( view, 4, view, 4 ) ) ).to.be.true;
		} );

		it( 'should parse selection range between elements', () => {
			const { view, selection } = parse( '<p>[<b>foobar]</b>[]</p>' );
			expect( view ).to.be.instanceof( Element );
			expect( view.childCount ).to.equal( 1 );
			const b = view.getChild( 0 );
			expect( b ).to.be.instanceof( Element );
			expect( b.name ).to.equal( 'b' );
			expect( b.childCount ).to.equal( 1 );
			const text = b.getChild( 0 );
			expect( text ).to.be.instanceof( Text );
			expect( text.data ).to.equal( 'foobar' );
			expect( selection.rangeCount ).to.equal( 2 );
			const ranges = [ ...selection.getRanges() ];
			expect( ranges[ 0 ].isEqual( Range._createFromParentsAndOffsets( view, 0, b, 1 ) ) ).to.be.true;
			expect( ranges[ 1 ].isEqual( Range._createFromParentsAndOffsets( view, 1, view, 1 ) ) ).to.be.true;
		} );

		it( 'should support unicode', () => {
			const { view, selection } = parse( '<p>[<b>நிலை}க்கு</b></p>' );

			expect( view ).to.be.instanceof( Element );
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
			const { view, selection } = parse( '<container:p>foo{bar]</container:p>' );
			expect( view.isSimilar( new ContainerElement( viewDocument, 'p' ) ) ).to.be.true;
			expect( view.childCount ).to.equal( 1 );
			const text = view.getChild( 0 );
			expect( text ).to.be.instanceof( Text );
			expect( text.data ).to.equal( 'foobar' );
			expect( selection.rangeCount ).to.equal( 1 );
			expect( selection.getFirstRange().isEqual( Range._createFromParentsAndOffsets( text, 3, view, 1 ) ) ).to.be.true;
		} );

		it( 'should parse ranges #2', () => {
			const { view, selection } = parse( '<attribute:b>[foob}ar<i>{baz</i>]</attribute:b>' );
			expect( view.isSimilar( new AttributeElement( viewDocument, 'b' ) ) ).to.be.true;
			expect( view.childCount ).to.equal( 2 );
			const text1 = view.getChild( 0 );
			expect( text1 ).to.be.instanceof( Text );
			expect( text1.data ).to.equal( 'foobar' );
			const i = view.getChild( 1 );
			expect( i.isSimilar( new Element( viewDocument, 'i' ) ) ).to.be.true;
			expect( i.childCount ).to.equal( 1 );
			const text2 = i.getChild( 0 );
			expect( text2 ).to.be.instanceof( Text );
			expect( text2.data ).to.equal( 'baz' );
			expect( selection.rangeCount ).to.equal( 2 );
			const ranges = [ ...selection.getRanges() ];
			expect( ranges[ 0 ].isEqual( Range._createFromParentsAndOffsets( view, 0, text1, 4 ) ) ).to.be.true;
			expect( ranges[ 1 ].isEqual( Range._createFromParentsAndOffsets( text2, 0, view, 2 ) ) ).to.be.true;
		} );

		it( 'should use ranges order when provided', () => {
			const { view, selection } = parse( '{f}oo{b}arb{a}z', { order: [ 3, 1, 2 ] } );
			expect( selection.rangeCount ).to.equal( 3 );
			const ranges = [ ...selection.getRanges() ];
			expect( ranges[ 0 ].isEqual( Range._createFromParentsAndOffsets( view, 3, view, 4 ) ) ).to.be.true;
			expect( ranges[ 1 ].isEqual( Range._createFromParentsAndOffsets( view, 7, view, 8 ) ) ).to.be.true;
			expect( ranges[ 2 ].isEqual( Range._createFromParentsAndOffsets( view, 0, view, 1 ) ) ).to.be.true;
			expect( selection.anchor.isEqual( ranges[ 2 ].start ) ).to.be.true;
			expect( selection.focus.isEqual( ranges[ 2 ].end ) ).to.be.true;
		} );

		it( 'should set last range backward if needed', () => {
			const { view, selection } = parse( '{f}oo{b}arb{a}z', { order: [ 3, 1, 2 ], lastRangeBackward: true } );
			expect( selection.rangeCount ).to.equal( 3 );
			const ranges = [ ...selection.getRanges() ];
			expect( ranges[ 0 ].isEqual( Range._createFromParentsAndOffsets( view, 3, view, 4 ) ) ).to.be.true;
			expect( ranges[ 1 ].isEqual( Range._createFromParentsAndOffsets( view, 7, view, 8 ) ) ).to.be.true;
			expect( ranges[ 2 ].isEqual( Range._createFromParentsAndOffsets( view, 0, view, 1 ) ) ).to.be.true;
			expect( selection.anchor.isEqual( ranges[ 2 ].end ) ).to.be.true;
			expect( selection.focus.isEqual( ranges[ 2 ].start ) ).to.be.true;
		} );

		it( 'should throw when ranges order does not include all ranges', () => {
			expect( () => {
				parse( '{}foobar{}', { order: [ 1 ] } );
			} ).to.throw( Error );
		} );

		it( 'should throw when ranges order is invalid', () => {
			expect( () => {
				parse( '{}foobar{}', { order: [ 1, 4 ] } );
			} ).to.throw( Error );
		} );

		it( 'should throw when element range delimiter is inside text node', () => {
			expect( () => {
				parse( 'foo[bar' );
			} ).to.throw( Error );
		} );

		it( 'should throw when text range delimiter is inside empty text node', () => {
			expect( () => {
				parse( '<b>foo</b>}' );
			} ).to.throw( Error );
		} );

		it( 'should throw when end of range is found before start', () => {
			expect( () => {
				parse( 'fo}obar' );
			} ).to.throw( Error );
		} );

		it( 'should throw when intersecting ranges found', () => {
			expect( () => {
				parse( '[fo{o}bar]' );
			} ).to.throw( Error );
		} );

		it( 'should throw when opened ranges are left', () => {
			expect( () => {
				parse( 'fo{obar' );
			} ).to.throw( Error );
		} );

		it( 'should throw when wrong type is provided', () => {
			sinon.stub( XmlDataProcessor.prototype, 'toView' ).returns( new ContainerElement( viewDocument, 'invalidType:b' ) );

			expect( () => {
				parse( 'sth' );
			} ).to.throw( Error, 'Parse error - cannot parse element\'s name: invalidType:b.' );

			XmlDataProcessor.prototype.toView.restore();
		} );

		it( 'should use provided root element #1', () => {
			const root = new Element( viewDocument, 'p' );
			const data = parse( '<span>text</span>', { rootElement: root } );

			expect( stringify( data ) ).to.equal( '<p><span>text</span></p>' );
		} );

		it( 'should use provided root element #2', () => {
			const root = new Element( viewDocument, 'p' );
			const data = parse( '<span>text</span><b>test</b>', { rootElement: root } );

			expect( stringify( data ) ).to.equal( '<p><span>text</span><b>test</b></p>' );
		} );

		it( 'should parse an EmptyElement', () => {
			const parsed = parse( '<empty:img></empty:img>' );

			expect( parsed ).to.be.instanceof( EmptyElement );
		} );

		it( 'should parse a UIElement', () => {
			const parsed = parse( '<ui:span></ui:span>' );

			expect( parsed ).to.be.instanceof( UIElement );
		} );

		it( 'should parse a RawElement', () => {
			const parsed = parse( '<raw:span></raw:span>' );

			expect( parsed ).to.be.instanceof( RawElement );
		} );

		it( 'should throw an error if EmptyElement is not empty', () => {
			expect( () => {
				parse( '<empty:img>foo bar</empty:img>' );
			} ).to.throw( Error, 'Parse error - cannot parse inside EmptyElement.' );
		} );

		it( 'should throw an error if a UIElement is not empty', () => {
			expect( () => {
				parse( '<ui:span>foo bar</ui:span>' );
			} ).to.throw( Error, 'Parse error - cannot parse inside UIElement.' );
		} );

		it( 'should throw an error if a RawElement is not empty', () => {
			expect( () => {
				parse( '<raw:span>foo bar</raw:span>' );
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
