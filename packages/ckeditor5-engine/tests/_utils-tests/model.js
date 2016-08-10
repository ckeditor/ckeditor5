/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

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

		document.schema.registerItem( 'a', '$inline' );
		document.schema.allow( { name: 'a', inside: '$root' } );
		document.schema.registerItem( 'b', '$inline' );
		document.schema.allow( { name: 'b', inside: '$root' } );
		document.schema.registerItem( 'c', '$inline' );
		document.schema.allow( { name: 'c', inside: '$root' } );
		document.schema.registerItem( 'paragraph', '$block' );
		document.schema.allow( { name: '$text', inside: '$root' } );
	} );

	afterEach( () => {
		sandbox.restore();
	} );

	describe( 'getData', () => {
		it( 'should use stringify method', () => {
			const stringifySpy = sandbox.spy( getData, '_stringify' );
			root.appendChildren( new Element( 'b', null, new Text( 'btext' ) ) );

			expect( getData( document, { withoutSelection: true } ) ).to.equal( '<b>btext</b>' );
			sinon.assert.calledOnce( stringifySpy );
			sinon.assert.calledWithExactly( stringifySpy, root );
		} );

		it( 'should use stringify method with selection', () => {
			const stringifySpy = sandbox.spy( getData, '_stringify' );
			root.appendChildren( new Element( 'b', null, new Text( 'btext' ) ) );
			document.selection.addRange( Range.createFromParentsAndOffsets( root, 0, root, 1 ) );

			expect( getData( document ) ).to.equal( '[<b>btext</b>]' );
			sinon.assert.calledOnce( stringifySpy );
			sinon.assert.calledWithExactly( stringifySpy, root, document.selection );
		} );

		it( 'should support unicode', () => {
			root.appendChildren( 'நிலைக்கு' );
			document.selection.addRange( Range.createFromParentsAndOffsets( root, 2, root, 6 ) );

			expect( getData( document ) ).to.equal( 'நி[லைக்]கு' );
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
			const data = '[<b>btext</b>]';

			setData( document, data, options );

			expect( getData( document ) ).to.equal( data );
			sinon.assert.calledOnce( parseSpy );
			const args = parseSpy.firstCall.args;
			expect( args[ 0 ] ).to.equal( data );
		} );

		it( 'should insert text', () => {
			test( 'this is test text', '[]this is test text' );
		} );

		it( 'should insert text with selection around', () => {
			test( '[this is test text]' );
		} );

		it( 'should insert text with selection inside #1', () => {
			test( 'this [is test] text' );
		} );

		it( 'should insert text with selection inside #2', () => {
			test( '[this is test] text' );
		} );

		it( 'should insert text with selection inside #2', () => {
			test( 'this is [test text]' );
		} );

		it( 'should insert element', () => {
			test( '<b>foo bar</b>', '[]<b>foo bar</b>' );
		} );

		it( 'should insert element with selection inside #1', () => {
			test( '<b>[foo ]bar</b>' );
		} );

		it( 'should insert element with selection inside #2', () => {
			test( '[<b>foo ]bar</b>' );
		} );

		it( 'should insert element with selection inside #3', () => {
			test( '<b>[foo bar</b>]' );
		} );

		it( 'should insert backward selection', () => {
			setData( document, '<b>[foo bar</b>]', { lastRangeBackward: true } );

			expect( getData( document ) ).to.equal( '<b>[foo bar</b>]' );
			expect( document.selection.isBackward ).to.true;
		} );

		it( 'should support unicode', () => {
			test( 'நி[லைக்]கு' );
		} );

		it( 'should throw an error when passing invalid document', () => {
			expect( () => {
				setData( { invalid: 'document' } );
			} ).to.throw( TypeError, 'Document needs to be an instance of engine.model.Document.' );
		} );

		function test( data, expected ) {
			expected = expected || data;

			setData( document, data );
			expect( getData( document ) ).to.equal( expected );
		}
	} );

	describe( 'stringify', () => {
		it( 'should stringify text', () => {
			const text = new Text( 'text', { underline: true, bold: true } );
			expect( stringify( text ) ).to.equal( '<$text bold="true" underline="true">text</$text>' );
		} );

		it( 'should stringify element', () => {
			const element = new Element( 'a', null, [
				new Element( 'b', null, new Text( 'btext' ) ),
				new Text( 'atext' )
			] );

			expect( stringify( element ) ).to.equal( '<a><b>btext</b>atext</a>' );
		} );

		it( 'should stringify document fragment', () => {
			const fragment = new DocumentFragment( [
				new Element( 'b', null, new Text( 'btext' ) ),
				new Text( 'atext' )
			] );

			expect( stringify( fragment ) ).to.equal( '<b>btext</b>atext' );
		} );

		it( 'writes elements and texts', () => {
			root.appendChildren( [
				new Element( 'a', null, new Text( 'atext' ) ),
				new Element( 'b', null, [
					new Element( 'c1' ),
					new Text( 'ctext' ),
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
					new Element( 'b', { fooBar: 'x y', barFoo: JSON.stringify( { x: 1, y: 2 } ) } )
				] )
			);

			// Note: attributes are written in a very simplistic way, because they are not to be parsed. They are just
			// to be compared in the tests with some patterns.
			expect( stringify( root ) ).to.equal(
				'<a bar="1" car="false" foo="true"><b barFoo="{"x":1,"y":2}" fooBar="x y"></b></a>'
			);
		} );

		it( 'writes text attributes', () => {
			root.appendChildren( [
				new Text( 'foo', { bold: true } ),
				new Text( 'bar' ),
				new Text( 'bom', { bold: true, italic: true } ),
				new Element( 'a', null, [
					new Text( 'pom', { underline: true, bold: true } )
				] )
			] );

			expect( stringify( root ) ).to.equal(
				'<$text bold="true">foo</$text>' +
				'bar' +
				'<$text bold="true" italic="true">bom</$text>' +
				'<a><$text bold="true" underline="true">pom</$text></a>'
			);
		} );

		describe( 'selection', () => {
			let elA, elB;

			beforeEach( () => {
				elA = new Element( 'a' );
				elB = new Element( 'b' );

				root.appendChildren( [
					elA,
					new Text( 'foo' ),
					new Text( 'bar', { bold: true } ),
					elB
				] );
			} );

			it( 'writes selection in an empty root', () => {
				const root = document.createRoot( '$root', 'empty' );
				selection.collapse( root );

				expect( stringify( root, selection ) ).to.equal(
					'[]'
				);
			} );

			it( 'writes only requested element', () => {
				expect( stringify( elA ) ).to.equal( '<a></a>' );
			} );

			it( 'writes selection collapsed in an element', () => {
				selection.collapse( root );

				expect( stringify( root, selection ) ).to.equal(
					'[]<a></a>foo<$text bold="true">bar</$text><b></b>'
				);
			} );

			it( 'writes selection collapsed in a text', () => {
				selection.collapse( root, 3 );

				expect( stringify( root, selection ) ).to.equal(
					'<a></a>fo[]o<$text bold="true">bar</$text><b></b>'
				);
			} );

			it( 'writes selection collapsed at the text left boundary', () => {
				selection.collapse( elA, 'after' );

				expect( stringify( root, selection ) ).to.equal(
					'<a></a>[]foo<$text bold="true">bar</$text><b></b>'
				);
			} );

			it( 'writes selection collapsed at the text right boundary', () => {
				selection.collapse( elB, 'before' );

				expect( stringify( root, selection ) ).to.equal(
					'<a></a>foo<$text bold="true">bar</$text>[]<b></b>'
				);
				expect( selection.getAttribute( 'bold' ) ).to.true;
			} );

			it( 'writes selection collapsed at the end of the root', () => {
				selection.collapse( root, 'end' );

				// Needed due to https://github.com/ckeditor/ckeditor5-engine/issues/320.
				selection.clearAttributes();

				expect( stringify( root, selection ) ).to.equal(
					'<a></a>foo<$text bold="true">bar</$text><b></b>[]'
				);
			} );

			it( 'writes selection collapsed selection in a text with attributes', () => {
				selection.collapse( root, 5 );

				expect( stringify( root, selection ) ).to.equal(
					'<a></a>foo<$text bold="true">b[]ar</$text><b></b>'
				);
				expect( selection.getAttribute( 'bold' ) ).to.true;
			} );

			it( 'writes flat selection containing couple of nodes', () => {
				selection.addRange(
					Range.createFromParentsAndOffsets( root, 0, root, 4 )
				);

				expect( stringify( root, selection ) ).to.equal(
					'[<a></a>foo]<$text bold="true">bar</$text><b></b>'
				);
			} );

			it( 'writes flat selection within text', () => {
				selection.addRange(
					Range.createFromParentsAndOffsets( root, 2, root, 3 )
				);

				expect( stringify( root, selection ) ).to.equal(
					'<a></a>f[o]o<$text bold="true">bar</$text><b></b>'
				);
			} );

			it( 'writes multi-level selection', () => {
				selection.addRange(
					Range.createFromParentsAndOffsets( elA, 0, elB, 0 )
				);

				expect( stringify( root, selection ) ).to.equal(
					'<a>[</a>foo<$text bold="true">bar</$text><b>]</b>'
				);
			} );

			it( 'writes selection when is backward', () => {
				selection.addRange(
					Range.createFromParentsAndOffsets( elA, 0, elB, 0 ),
					true
				);

				expect( stringify( root, selection ) ).to.equal(
					'<a>[</a>foo<$text bold="true">bar</$text><b>]</b>'
				);
			} );

			it( 'uses range and coverts it to selection', () => {
				const range = Range.createFromParentsAndOffsets( elA, 0, elB, 0 );

				expect( stringify( root, range ) ).to.equal(
					'<a>[</a>foo<$text bold="true">bar</$text><b>]</b>'
				);
			} );

			it( 'uses position and converts it to collapsed selection', () => {
				const position = new Position( root, [ 0 ] );

				expect( stringify( root, position ) ).to.equal(
					'[]<a></a>foo<$text bold="true">bar</$text><b></b>'
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
			data: '[]',
			check( fragment, selection ) {
				expect( fragment ).to.be.instanceOf( DocumentFragment );
				expect( fragment.childCount ).to.equal( 0 );
				expect( selection.rangeCount ).to.equal( 1 );
				expect( selection.getFirstRange().isEqual( Range.createFromParentsAndOffsets( fragment, 0, fragment, 0 ) ) ).to.be.true;
			}
		} );

		test( 'returns Element if range is around single element', {
			data: '[<a></a>]',
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
				expect( fragment.childCount ).to.equal( 2 );
			}
		} );

		test( 'creates elements', {
			data: '<a></a><b><c></c></b>'
		} );

		test( 'creates text nodes', {
			data: 'foo<a>bar</a>bom'
		} );

		test( 'sets elements attributes', {
			data: '<a foo="1" bar="true" car="x y"><b x="y"></b></a>',
			output: '<a bar="true" car="x y" foo="1"><b x="y"></b></a>',
			check( a ) {
				expect( a.getAttribute( 'bar' ) ).to.equal( 'true' );
				expect( a.getAttribute( 'car' ) ).to.equal( 'x y' );
				expect( a.getAttribute( 'foo' ) ).to.equal( '1' );
			}
		} );

		test( 'sets text attributes', {
			data: '<$text bold="true" italic="true">foo</$text><$text bold="true">bar</$text>bom',
			check( root ) {
				expect( root.childCount ).to.equal( 3 );
				expect( root.maxOffset ).to.equal( 9 );
				expect( root.getChild( 0 ) ).to.have.property( 'data', 'foo' );
				expect( root.getChild( 0 ).getAttribute( 'italic' ) ).to.equal( 'true' );
				expect( root.getChild( 1 ) ).to.have.property( 'data', 'bar' );
				expect( root.getChild( 1 ).getAttribute( 'bold' ) ).to.equal( 'true' );
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

		it( 'throws when invalid XML', () => {
			expect( () => {
				parse( '<a><b></a></b>' );
			} ).to.throw( Error );
		} );

		describe( 'selection', () => {
			test( 'sets collapsed selection in an element', {
				data: '<a>[]</a>',
				check( root, selection ) {
					expect( selection.getFirstPosition().parent ).to.have.property( 'name', 'a' );
				}
			} );

			test( 'sets collapsed selection between elements', {
				data: '<a></a>[]<b></b>'
			} );

			test( 'sets collapsed selection before a text', {
				data: '<a></a>[]foo'
			} );

			test( 'sets collapsed selection after a text', {
				data: 'foo[]'
			} );

			test( 'sets collapsed selection within a text', {
				data: 'foo[]bar',
				check( text, selection ) {
					expect( text.offsetSize ).to.equal( 6 );
					expect( text.getPath() ).to.deep.equal( [ 0 ] );
					expect( selection.getFirstRange().start.path ).to.deep.equal( [ 3 ] );
					expect( selection.getFirstRange().end.path ).to.deep.equal( [ 3 ] );
				}
			} );

			it( 'sets selection attributes', () => {
				const result = parse( 'foo[]bar', document.schema, { selectionAttributes: {
					bold: true,
					italic: true
				} } );

				expect( stringify( result.model, result.selection ) ).to.equal( 'foo[]bar' );
				expect( result.selection.getAttribute( 'italic' ) ).to.be.true;
				expect( result.selection.getAttribute( 'bold' ) ).to.be.true;
			} );

			test( 'sets collapsed selection between text and text with attributes', {
				data: 'foo[]<$text bold="true">bar</$text>',
				check( root, selection ) {
					expect( root.maxOffset ).to.equal( 6 );
					expect( selection.getAttribute( 'bold' ) ).to.be.undefined;
				}
			} );

			test( 'sets selection containing an element', {
				data: 'x[<a></a>]'
			} );

			it( 'sets selection with attribute containing an element', () => {
				const result = parse( 'x[<a></a>]', document.schema, { selectionAttributes: {
					bold: true
				} } );

				expect( stringify( result.model, result.selection ) ).to.equal( 'x[<a></a>]' );
				expect( result.selection.getAttribute( 'bold' ) ).to.be.true;
			} );

			it( 'sets a backward selection containing an element', () => {
				const result = parse( 'x[<a></a>]', document.schema, {
					lastRangeBackward: true
				} );

				expect( stringify( result.model, result.selection ) ).to.equal( 'x[<a></a>]' );
				expect( result.selection.isBackward ).to.true;
			} );

			test( 'sets selection within a text', {
				data: 'x[y]z'
			} );

			it( 'sets a backward selection containing an element', () => {
				const result = parse( '<$text bold="true">fo[o</$text>ba]r', document.schema, {
					selectionAttributes: { bold: true }
				} );

				expect( stringify( result.model, result.selection ) ).to.equal( '<$text bold="true">fo[o</$text>ba]r' );
				expect( result.selection.getAttribute( 'bold' ) ).to.true;
			} );

			it( 'throws when missing selection start', () => {
				expect( () => {
					parse( 'foo]' );
				} ).to.throw( Error );
			} );

			it( 'throws when missing selection end', () => {
				expect( () => {
					parse( '[foo' );
				} ).to.throw( Error );
			} );
		} );

		function test( title, options ) {
			it( title, () => {
				const output = options.output || options.data;
				const data = parse( options.data, document.schema );
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
