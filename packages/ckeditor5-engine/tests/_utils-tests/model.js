/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import { stringify, parse, getData, setData } from '/tests/engine/_utils/model.js';
import Document from '/ckeditor5/engine/model/document.js';
import DocumentFragment from '/ckeditor5/engine/model/documentfragment.js';
import Element from '/ckeditor5/engine/model/element.js';
import Text from '/ckeditor5/engine/model/text.js';
import Range from '/ckeditor5/engine/model/range.js';
import Position from '/ckeditor5/engine/model/position.js';

describe( 'model test utils', () => {
	let document, root, selection, sandbox;

	beforeEach( () => {
		document = new Document();
		root = document.createRoot();
		selection = document.selection;
		sandbox = sinon.sandbox.create();
		selection.removeAllRanges();
	} );

	afterEach( () => {
		sandbox.restore();
	} );

	describe( 'getData', () => {
		it( 'should use stringify method', () => {
			const stringifySpy = sandbox.spy( getData, '_stringify' );
			root.appendChildren( new Element( 'b', null, [ 'btext' ] ) );

			expect( getData( document, { withoutSelection: true } ) ).to.equal( '<b>btext</b>' );
			sinon.assert.calledOnce( stringifySpy );
			sinon.assert.calledWithExactly( stringifySpy, root );
		} );

		it( 'should use stringify method with selection', () => {
			const stringifySpy = sandbox.spy( getData, '_stringify' );
			root.appendChildren( new Element( 'b', null, [ 'btext' ] ) );
			document.selection.addRange( Range.createFromParentsAndOffsets( root, 0, root, 1 ) );

			expect( getData( document ) ).to.equal( '<selection><b>btext</b></selection>' );
			sinon.assert.calledOnce( stringifySpy );
			sinon.assert.calledWithExactly( stringifySpy, root, document.selection );
		} );

		it( 'should throw an error when passing invalid document', () => {
			expect( () => {
				getData( { invalid: 'document' } );
			} ).to.throw( TypeError, 'Document needs to be an instance of engine.model.Document.' );
		} );
	} );

	describe( 'setData', () => {
		it( 'should use parse method', () => {
			const parseSpy = sandbox.spy( setData, '_parse' );
			const options = {};
			const data = '<b>btext</b>text';

			setData( document, data, options );

			expect( getData( document, { withoutSelection: true } ) ).to.equal( data );
			sinon.assert.calledOnce( parseSpy );
			const args = parseSpy.firstCall.args;
			expect( args[ 0 ] ).to.equal( data );
		} );

		it( 'should use parse method with selection', () => {
			const parseSpy = sandbox.spy( setData, '_parse' );
			const options = {};
			const data = '<selection><b>btext</b></selection>';

			setData( document, data, options );

			expect( getData( document ) ).to.equal( data );
			sinon.assert.calledOnce( parseSpy );
			const args = parseSpy.firstCall.args;
			expect( args[ 0 ] ).to.equal( data );
		} );

		it( 'should throw an error when passing invalid document', () => {
			expect( () => {
				setData( { invalid: 'document' } );
			} ).to.throw( TypeError, 'Document needs to be an instance of engine.model.Document.' );
		} );
	} );

	describe( 'stringify', () => {
		it( 'should stringify text', () => {
			const text = new Text( 'text', { underline: true, bold: true } );
			expect( stringify( text ) ).to.equal( '<$text bold=true underline=true>text</$text>' );
		} );

		it( 'should stringify element', () => {
			const element = new Element( 'a', null, [ new Element( 'b', null, 'btext' ), 'atext' ] );
			expect( stringify( element ) ).to.equal( '<a><b>btext</b>atext</a>' );
		} );

		it( 'should stringify document fragment', () => {
			const fragment = new DocumentFragment( [ new Element( 'b', null, 'btext' ), 'atext' ] );
			expect( stringify( fragment ) ).to.equal( '<b>btext</b>atext' );
		} );

		it( 'writes elements and texts', () => {
			root.appendChildren( [
				new Element( 'a', null, 'atext' ),
				new Element( 'b', null, [
					new Element( 'c1' ),
					'ctext',
					new Element( 'c2' )
				] ),
				new Element( 'd' )
			] );

			expect( stringify( root ) ).to.equal(
				'<a>atext</a><b><c1></c1>ctext<c2></c2></b><d></d>'
			);
		} );

		it( 'writes element attributes', () => {
			root.appendChildren(
				new Element( 'a', { foo: true, bar: 1, car: false }, [
					new Element( 'b', { fooBar: 'x y', barFoo: { x: 1, y: 2 } } )
				] )
			);

			// Note: attributes are written in a very simplistic way, because they are not to be parsed. They are just
			// to be compared in the tests with some patterns.
			expect( stringify( root ) ).to.equal(
				'<a bar=1 car=false foo=true><b barFoo={"x":1,"y":2} fooBar="x y"></b></a>'
			);
		} );

		it( 'writes text attributes', () => {
			root.appendChildren( [
				new Text( 'foo', { bold: true } ),
				'bar',
				new Text( 'bom', { bold: true, italic: true } ),
				new Element( 'a', null, [
					new Text( 'pom', { underline: true, bold: true } )
				] )
			] );

			expect( stringify( root ) ).to.equal(
				'<$text bold=true>foo</$text>' +
				'bar' +
				'<$text bold=true italic=true>bom</$text>' +
				'<a><$text bold=true underline=true>pom</$text></a>'
			);
		} );

		describe( 'selection', () => {
			let elA, elB;

			beforeEach( () => {
				elA = new Element( 'a' );
				elB = new Element( 'b' );

				root.appendChildren( [
					elA,
					'foo',
					new Text( 'bar', { bold: true } ),
					elB
				] );
			} );

			it( 'writes selection in an empty root', () => {
				const root = document.createRoot( '$root', 'empty' );
				selection.collapse( root );

				expect( stringify( root, selection ) ).to.equal(
					'<selection />'
				);
			} );

			it( 'writes only requested element', () => {
				expect( stringify( elA ) ).to.equal( '<a></a>' );
			} );

			it( 'writes selection collapsed in an element', () => {
				selection.collapse( root );

				expect( stringify( root, selection ) ).to.equal(
					'<selection /><a></a>foo<$text bold=true>bar</$text><b></b>'
				);
			} );

			it( 'writes selection collapsed in a text', () => {
				selection.collapse( root, 3 );

				expect( stringify( root, selection ) ).to.equal(
					'<a></a>fo<selection />o<$text bold=true>bar</$text><b></b>'
				);
			} );

			it( 'writes selection collapsed at the text left boundary', () => {
				selection.collapse( elA, 'after' );

				expect( stringify( root, selection ) ).to.equal(
					'<a></a><selection />foo<$text bold=true>bar</$text><b></b>'
				);
			} );

			it( 'writes selection collapsed at the text right boundary', () => {
				selection.collapse( elB, 'before' );

				expect( stringify( root, selection ) ).to.equal(
					'<a></a>foo<$text bold=true>bar</$text><selection bold=true /><b></b>'
				);
			} );

			it( 'writes selection collapsed at the end of the root', () => {
				selection.collapse( root, 'end' );

				// Needed due to https://github.com/ckeditor/ckeditor5-engine/issues/320.
				selection.clearAttributes();

				expect( stringify( root, selection ) ).to.equal(
					'<a></a>foo<$text bold=true>bar</$text><b></b><selection />'
				);
			} );

			it( 'writes selection attributes', () => {
				selection.collapse( root );
				selection.setAttributesTo( { italic: true, bold: true } );

				expect( stringify( root, selection )  ).to.equal(
					'<selection bold=true italic=true /><a></a>foo<$text bold=true>bar</$text><b></b>'
				);
			} );

			it( 'writes selection collapsed selection in a text with attributes', () => {
				selection.collapse( root, 5 );

				expect( stringify( root, selection ) ).to.equal(
					'<a></a>foo<$text bold=true>b<selection bold=true />ar</$text><b></b>'
				);
			} );

			it( 'writes flat selection containing couple of nodes', () => {
				selection.addRange(
					Range.createFromParentsAndOffsets( root, 0, root, 4 )
				);

				expect( stringify( root, selection ) ).to.equal(
					'<selection><a></a>foo</selection><$text bold=true>bar</$text><b></b>'
				);
			} );

			it( 'writes flat selection within text', () => {
				selection.addRange(
					Range.createFromParentsAndOffsets( root, 2, root, 3 )
				);

				expect( stringify( root, selection ) ).to.equal(
					'<a></a>f<selection>o</selection>o<$text bold=true>bar</$text><b></b>'
				);
			} );

			it( 'writes multi-level selection', () => {
				selection.addRange(
					Range.createFromParentsAndOffsets( elA, 0, elB, 0 )
				);

				expect( stringify( root, selection ) ).to.equal(
					'<a><selection></a>foo<$text bold=true>bar</$text><b></selection></b>'
				);
			} );

			it( 'writes backward selection', () => {
				selection.addRange(
					Range.createFromParentsAndOffsets( elA, 0, elB, 0 ),
					true
				);

				expect( stringify( root, selection ) ).to.equal(
					'<a><selection backward></a>foo<$text bold=true>bar</$text><b></selection></b>'
				);
			} );

			it( 'uses range and coverts it to selection', () => {
				const range = Range.createFromParentsAndOffsets( elA, 0, elB, 0 );

				expect( stringify( root, range ) ).to.equal(
					'<a><selection></a>foo<$text bold=true>bar</$text><b></selection></b>'
				);
			} );

			it( 'uses position and converts it to collapsed selection', () => {
				const position = new Position( root, [ 0 ] );

				expect( stringify( root, position ) ).to.equal(
					'<selection /><a></a>foo<$text bold=true>bar</$text><b></b>'
				);
			} );
		} );
	} );

	describe( 'parse', () => {
		test( 'creates empty DocumentFragment from empty string', {
			data: '',
			check( fragment ) {
				expect( fragment ).to.be.instanceOf( DocumentFragment );
			}
		} );

		test( 'creates empty DocumentFragment with selection', {
			data: '<selection />',
			check( fragment, selection ) {
				expect( fragment ).to.be.instanceOf( DocumentFragment );
				expect( fragment.getChildCount() ).to.equal( 0 );
				expect( selection.rangeCount ).to.equal( 1 );
				expect( selection.getFirstRange().isEqual( Range.createFromParentsAndOffsets( fragment, 0, fragment, 0 ) ) ).to.be.true;
			}
		} );

		test( 'returns Element if range is around single element', {
			data: '<selection><a></a></selection>',
			check( el, selection ) {
				const fragment = el.parent;
				expect( el ).to.be.instanceOf( Element );
				expect( fragment ).to.be.instanceOf( DocumentFragment );
				expect( selection.rangeCount ).to.equal( 1 );
				expect( selection.getFirstRange().isEqual( Range.createFromParentsAndOffsets( fragment, 0, fragment, 1 ) ) ).to.be.true;
			}
		} );

		test( 'returns DocumentFragment when multiple elements on root', {
			data: '<a></a><b></b>',
			check( fragment ) {
				expect( fragment ).to.be.instanceOf( DocumentFragment );
				expect( fragment.getChildCount() ).to.equal( 2 );
			}
		} );

		test( 'creates elements', {
			data: '<a></a><b><c></c></b>'
		} );

		test( 'creates text nodes', {
			data: 'foo<a>bar</a>bom'
		} );

		test( 'sets elements attributes', {
			data: '<a foo=1 bar=true car="x y"><b x="y"></b></a>',
			output: '<a bar=true car="x y" foo=1><b x="y"></b></a>',
			check( a ) {
				expect( a.getAttribute( 'car' ) ).to.equal( 'x y' );
			}
		} );

		test( 'sets complex attributes', {
			data: '<a foo={"a":1,"b":"c"}></a>',
			check( a ) {
				expect( a.getAttribute( 'foo' ) ).to.have.property( 'a', 1 );
			}
		} );

		test( 'sets text attributes', {
			data: '<$text bold=true italic=true>foo</$text><$text bold=true>bar</$text>bom',
			check( root ) {
				expect( root.getChildCount() ).to.equal( 9 );
				expect( root.getChild( 0 ) ).to.have.property( 'character', 'f' );
				expect( root.getChild( 0 ).getAttribute( 'italic' ) ).to.equal( true );
			}
		} );

		test( 'returns single parsed element', {
			data: '<paragraph></paragraph>',
			check( p ) {
				expect( p instanceof Element ).to.be.true;
			}
		} );

		test( 'returns DocumentFragment for multiple parsed elements', {
			data: '<paragraph></paragraph><paragraph></paragraph>',
			check( fragment ) {
				expect( fragment instanceof DocumentFragment ).to.be.true;
			}
		} );

		it( 'throws when unexpected closing tag', () => {
			expect( () => {
				parse( '<a><b></a></b>' );
			} ).to.throw( Error, 'Parse error - unexpected closing tag.' );
		} );

		it( 'throws when unexpected attribute', () => {
			expect( () => {
				parse( '<a ?></a>' );
			} ).to.throw( Error, 'Parse error - unexpected token: ?.' );
		} );

		it( 'throws when incorrect tag', () => {
			expect( () => {
				parse( '<a' );
			} ).to.throw( Error, 'Parse error - unexpected token: <a.' );
		} );

		it( 'throws when missing closing tag', () => {
			expect( () => {
				parse( '<a><b></b>' );
			} ).to.throw( Error, 'Parse error - missing closing tags: a.' );
		} );

		it( 'throws when missing opening tag for text', () => {
			expect( () => {
				parse( '</$text>' );
			} ).to.throw( Error, 'Parse error - unexpected closing tag.' );
		} );

		it( 'throws when missing closing tag for text', () => {
			expect( () => {
				parse( '<$text>' );
			} ).to.throw( Error, 'Parse error - missing closing tags: $text.' );
		} );

		describe( 'selection', () => {
			test( 'sets collapsed selection in an element', {
				data: '<a><selection /></a>',
				check( root, selection ) {
					expect( selection.getFirstPosition().parent ).to.have.property( 'name', 'a' );
				}
			} );

			test( 'sets collapsed selection between elements', {
				data: '<a></a><selection /><b></b>'
			} );

			test( 'sets collapsed selection before a text', {
				data: '<a></a><selection />foo'
			} );

			test( 'sets collapsed selection after a text', {
				data: 'foo<selection />'
			} );

			test( 'sets collapsed selection within a text', {
				data: 'foo<selection />bar',
				check( root ) {
					expect( root.getChildCount() ).to.equal( 6 );
				}
			} );

			test( 'sets selection attributes', {
				data: 'foo<selection bold=true italic=true />bar',
				check( root, selection ) {
					expect( selection.getAttribute( 'italic' ) ).to.be.true;
				}
			} );

			test( 'sets collapsed selection between text and text with attributes', {
				data: 'foo<selection /><$text bold=true>bar</$text>',
				check( root, selection ) {
					expect( root.getChildCount() ).to.equal( 6 );
					expect( selection.getAttribute( 'bold' ) ).to.be.undefined;
				}
			} );

			test( 'sets selection containing an element', {
				data: 'x<selection><a></a></selection>'
			} );

			test( 'sets selection with attribute containing an element', {
				data: 'x<selection bold=true><a></a></selection>'
			} );

			test( 'sets a backward selection containing an element', {
				data: 'x<selection backward bold=true><a></a></selection>'
			} );

			test( 'sets selection within a text', {
				data: 'x<selection bold=true>y</selection>z'
			} );

			test( 'sets selection within a text with different attributes', {
				data: '<$text bold=true>fo<selection bold=true>o</$text>ba</selection>r'
			} );

			it( 'throws when missing selection start', () => {
				expect( () => {
					parse( 'foo</selection>' );
				} ).to.throw( Error, 'Parse error - missing selection start.' );
			} );

			it( 'throws when missing selection end', () => {
				expect( () => {
					parse( '<selection>foo' );
				} ).to.throw( Error, 'Parse error - missing selection end.' );
			} );
		} );

		function test( title, options ) {
			it( title, () => {
				const output = options.output || options.data;
				const data = parse( options.data );
				let model, selection;

				if ( data.selection && data.model ) {
					model = data.model;
					selection = data.selection;
				} else {
					model = data;
				}

				expect( stringify( model, selection ) ).to.equal( output );

				if ( options.check ) {
					options.check( model, selection );
				}
			} );
		}
	} );
} );
