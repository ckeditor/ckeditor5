/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Document from '../../src/model/document';
import DocumentFragment from '../../src/model/documentfragment';
import Element from '../../src/model/element';
import Text from '../../src/model/text';
import TextProxy from '../../src/model/textproxy';
import Position from '../../src/model/position';
import Range from '../../src/model/range';
import writer from '../../src/model/writer';
import { getData } from '../../src/dev-utils/model';

import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

let doc, root;

describe( 'writer', () => {
	beforeEach( () => {
		doc = new Document();
		doc.schema.allow( { name: '$text', inside: '$root' } );

		root = doc.createRoot();

		// index:	0001112333
		// offset:	0123456789
		// data:	foobarIxyz
		// bold:	___BBBB___
		root.appendChildren( [
			new Text( 'foo' ),
			new Text( 'bar', { bold: true } ),
			new Element( 'image', { src: 'img.jpg' } ),
			new Text( 'xyz' )
		] );
	} );

	describe( 'insert', () => {
		it( 'should insert nodes between nodes', () => {
			writer.insert( Position.createAt( root, 3 ), [ 'xxx', new Element( 'p' ) ] );

			expectData( 'fooxxx<p></p><$text bold="true">bar</$text><image src="img.jpg"></image>xyz' );
		} );

		it( 'should split text node if nodes at inserted at offset inside text node', () => {
			writer.insert( Position.createAt( root, 5 ), new Element( 'p' ) );

			expectData( 'foo<$text bold="true">ba</$text><p></p><$text bold="true">r</$text><image src="img.jpg"></image>xyz' );
		} );

		it( 'should merge text nodes if possible', () => {
			writer.insert( Position.createAt( root, 3 ), new Text( 'xxx', { bold: true } ) );

			expectData( 'foo<$text bold="true">xxxbar</$text><image src="img.jpg"></image>xyz' );
		} );
	} );

	describe( 'remove', () => {
		it( 'should remove nodes in given range', () => {
			const range = Range.createFromParentsAndOffsets( root, 3, root, 6 );
			writer.remove( range );

			expectData( 'foo<image src="img.jpg"></image>xyz' );
		} );

		it( 'should split text node if range starts or ends inside text node', () => {
			const range = Range.createFromParentsAndOffsets( root, 1, root, 5 );
			writer.remove( range );

			expectData( 'f<$text bold="true">r</$text><image src="img.jpg"></image>xyz' );
		} );

		it( 'should merge text nodes if possible', () => {
			const range = Range.createFromParentsAndOffsets( root, 3, root, 7 );
			writer.remove( range );

			expectData( 'fooxyz' );
			expect( root.childCount ).to.equal( 1 );
		} );

		it( 'should throw if given range is not flat', () => {
			expect( () => {
				writer.remove( new Range( new Position( root, [ 0 ] ), new Position( root, [ 1, 2 ] ) ) );
			} ).to.throw( CKEditorError, /model-writer-remove-range-not-flat/ );
		} );
	} );

	describe( 'move', () => {
		it( 'should move a range of nodes', () => {
			const range = Range.createFromParentsAndOffsets( root, 3, root, 6 );
			writer.move( range, Position.createAt( root, 0 ) );

			expectData( '<$text bold="true">bar</$text>foo<image src="img.jpg"></image>xyz' );
		} );

		it( 'should use remove and insert methods', () => {
			sinon.spy( writer, 'remove' );
			sinon.spy( writer, 'insert' );

			const range = Range.createFromParentsAndOffsets( root, 3, root, 6 );
			const position = Position.createAt( root, 0 );
			writer.move( range, position );

			expect( writer.remove.calledWithExactly( range ) ).to.be.true;
			expect( writer.insert.calledWith( position ) ).to.be.true;
		} );

		it( 'should correctly move if target position is in same element as moved range, but after range', () => {
			const range = Range.createFromParentsAndOffsets( root, 3, root, 6 );
			writer.move( range, Position.createAt( root, 10 ) );

			expectData( 'foo<image src="img.jpg"></image>xyz<$text bold="true">bar</$text>' );
		} );

		it( 'should throw if given range is not flat', () => {
			expect( () => {
				writer.move( new Range( new Position( root, [ 0 ] ), new Position( root, [ 1, 2 ] ) ), null );
			} ).to.throw( CKEditorError, /model-writer-move-range-not-flat/ );
		} );
	} );

	describe( 'setAttribute', () => {
		it( 'should set attribute on given range of nodes', () => {
			const range = Range.createFromParentsAndOffsets( root, 6, root, 8 );
			writer.setAttribute( range, 'newAttr', true );

			expectData( 'foo<$text bold="true">bar</$text><image newAttr="true" src="img.jpg"></image><$text newAttr="true">x</$text>yz' );
		} );

		it( 'should remove attribute if null was passed as a value', () => {
			const range = Range.createFromParentsAndOffsets( root, 6, root, 7 );
			writer.setAttribute( range, 'src', null );

			expectData( 'foo<$text bold="true">bar</$text><image></image>xyz' );
		} );

		it( 'should merge nodes if possible', () => {
			const range = Range.createFromParentsAndOffsets( root, 0, root, 3 );
			writer.setAttribute( range, 'bold', true );

			expectData( '<$text bold="true">foobar</$text><image src="img.jpg"></image>xyz' );
		} );
	} );

	describe( 'removeAttribute', () => {
		it( 'should use setAttribute', () => {
			sinon.spy( writer, 'setAttribute' );

			const range = Range.createFromParentsAndOffsets( root, 6, root, 7 );
			writer.removeAttribute( range, 'src' );

			expect( writer.setAttribute.calledWithExactly( range, 'src', null ) ).to.be.true;
		} );
	} );
} );

describe( 'normalizeNodes', () => {
	it( 'should change single object into an array', () => {
		const p = new Element( 'p' );

		expect( writer.normalizeNodes( p ) ).to.deep.equal( [ p ] );
	} );

	it( 'should change strings to text nodes', () => {
		const text = writer.normalizeNodes( 'abc' )[ 0 ];

		expect( text ).to.be.instanceof( Text );
		expect( text.data ).to.equal( 'abc' );
	} );

	it( 'should change text proxies to text nodes', () => {
		const textNode = new Text( 'abc' );
		const textProxy = new TextProxy( textNode, 1, 1 );

		const text = writer.normalizeNodes( textProxy )[ 0 ];

		expect( text ).to.be.instanceof( Text );
		expect( text.data ).to.equal( 'b' );
	} );

	it( 'should not change elements', () => {
		const p = new Element( 'p' );

		expect( writer.normalizeNodes( p )[ 0 ] ).to.equal( p );
	} );

	it( 'should omit unrecognized objects', () => {
		expect( writer.normalizeNodes( 1 ) ).to.deep.equal( [] );
	} );

	it( 'should accept arrays', () => {
		const text = new Text( 'foo', { bold: true } );
		const image = new Element( 'image' );
		const nodes = [ 'abc', text, image, 1, 'xyz' ];

		const normalized = writer.normalizeNodes( nodes );

		expect( normalized[ 0 ] ).to.be.instanceof( Text );
		expect( normalized[ 1 ] ).to.equal( text );
		expect( normalized[ 2 ] ).to.equal( image );
		expect( normalized[ 3 ] ).to.be.instanceof( Text );
	} );

	it( 'should merge text nodes if mergeTextNodes flag is set to true', () => {
		const normalized = writer.normalizeNodes( [ 'foo', 'bar' ], true );

		expect( normalized.length ).to.equal( 1 );
		expect( normalized[ 0 ].data ).to.equal( 'foobar' );
	} );

	it( 'should replace document fragment by the list of it\'s children', () => {
		const nodes = [
			new Text( 'foo', { bold: true } ),
			new DocumentFragment( [ new Text( 'bar', { bold: true } ), new Element( 'image' ) ] ),
			'xyz'
		];

		const normalized = writer.normalizeNodes( nodes, true );

		expect( normalized[ 0 ] ).to.be.instanceof( Text );
		expect( normalized[ 0 ].getAttribute( 'bold' ) ).to.be.true;
		expect( normalized[ 0 ].data ).to.equal( 'foobar' );
		expect( normalized[ 1 ].name ).to.equal( 'image' );
		expect( normalized[ 2 ].data ).to.equal( 'xyz' );
	} );
} );

function expectData( html ) {
	expect( getData( doc, { withoutSelection: true } ) ).to.equal( html );
}
