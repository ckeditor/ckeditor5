/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Model from '../../../src/model/model.js';
import DocumentFragment from '../../../src/model/documentfragment.js';
import Element from '../../../src/model/element.js';
import Text from '../../../src/model/text.js';
import TextProxy from '../../../src/model/textproxy.js';
import Position from '../../../src/model/position.js';
import Range from '../../../src/model/range.js';
import * as utils from '../../../src/model/operation/utils.js';
import { getData } from '../../../src/dev-utils/model.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

let model, doc, root;

describe( 'Operation utils', () => {
	beforeEach( () => {
		model = new Model();
		doc = model.document;
		model.schema.extend( '$text', { allowIn: '$root' } );

		root = doc.createRoot();

		// index:	0001112333
		// offset:	0123456789
		// data:	foobarIxyz
		// bold:	___BBBB___
		root._appendChild( [
			new Text( 'foo' ),
			new Text( 'bar', { bold: true } ),
			new Element( 'imageBlock', { src: 'img.jpg' } ),
			new Text( 'xyz' )
		] );
	} );

	describe( 'insert', () => {
		it( 'should insert nodes between nodes', () => {
			utils._insert( Position._createAt( root, 3 ), [ 'xxx', new Element( 'p' ) ] );

			expectData( 'fooxxx<p></p><$text bold="true">bar</$text><imageBlock src="img.jpg"></imageBlock>xyz' );
		} );

		it( 'should split text node if nodes at inserted at offset inside text node', () => {
			utils._insert( Position._createAt( root, 5 ), new Element( 'p' ) );

			expectData( 'foo<$text bold="true">ba</$text><p></p><$text bold="true">r</$text><imageBlock src="img.jpg"></imageBlock>xyz' );
		} );

		it( 'should merge text nodes if possible', () => {
			utils._insert( Position._createAt( root, 3 ), new Text( 'xxx', { bold: true } ) );

			expectData( 'foo<$text bold="true">xxxbar</$text><imageBlock src="img.jpg"></imageBlock>xyz' );
		} );
	} );

	describe( 'remove', () => {
		it( 'should remove nodes in given range', () => {
			const range = new Range( Position._createAt( root, 3 ), Position._createAt( root, 6 ) );
			utils._remove( range );

			expectData( 'foo<imageBlock src="img.jpg"></imageBlock>xyz' );
		} );

		it( 'should split text node if range starts or ends inside text node', () => {
			const range = new Range( Position._createAt( root, 1 ), Position._createAt( root, 5 ) );
			utils._remove( range );

			expectData( 'f<$text bold="true">r</$text><imageBlock src="img.jpg"></imageBlock>xyz' );
		} );

		it( 'should merge text nodes if possible', () => {
			const range = new Range( Position._createAt( root, 3 ), Position._createAt( root, 7 ) );
			utils._remove( range );

			expectData( 'fooxyz' );
			expect( root.childCount ).to.equal( 1 );
		} );

		it( 'should throw if given range is not flat', () => {
			expectToThrowCKEditorError( () => {
				utils._remove( new Range( new Position( root, [ 0 ] ), new Position( root, [ 1, 2 ] ) ) );
			}, /operation-utils-remove-range-not-flat/ );
		} );
	} );

	describe( 'move', () => {
		it( 'should move a range of nodes', () => {
			const range = new Range( Position._createAt( root, 3 ), Position._createAt( root, 6 ) );
			utils._move( range, Position._createAt( root, 0 ) );

			expectData( '<$text bold="true">bar</$text>foo<imageBlock src="img.jpg"></imageBlock>xyz' );
		} );

		it( 'should correctly move if target position is in same element as moved range, but after range', () => {
			const range = new Range( Position._createAt( root, 3 ), Position._createAt( root, 6 ) );
			utils._move( range, Position._createAt( root, 10 ) );

			expectData( 'foo<imageBlock src="img.jpg"></imageBlock>xyz<$text bold="true">bar</$text>' );
		} );

		it( 'should throw if given range is not flat', () => {
			expectToThrowCKEditorError( () => {
				utils._move( new Range( new Position( root, [ 0 ] ), new Position( root, [ 1, 2 ] ) ), null );
			}, /operation-utils-move-range-not-flat/ );
		} );
	} );

	describe( 'setAttribute', () => {
		it( 'should set attribute on given range of nodes', () => {
			const range = new Range( Position._createAt( root, 6 ), Position._createAt( root, 8 ) );
			utils._setAttribute( range, 'newAttr', true );

			expectData( 'foo<$text bold="true">bar</$text>' +
				'<imageBlock newAttr="true" src="img.jpg"></imageBlock>' +
				'<$text newAttr="true">x</$text>yz'
			);
		} );

		it( 'should remove attribute if null was passed as a value', () => {
			const range = new Range( Position._createAt( root, 6 ), Position._createAt( root, 7 ) );
			utils._setAttribute( range, 'src', null );

			expectData( 'foo<$text bold="true">bar</$text><imageBlock></imageBlock>xyz' );
		} );

		it( 'should merge nodes if possible', () => {
			const range = new Range( Position._createAt( root, 0 ), Position._createAt( root, 3 ) );
			utils._setAttribute( range, 'bold', true );

			expectData( '<$text bold="true">foobar</$text><imageBlock src="img.jpg"></imageBlock>xyz' );
		} );
	} );
} );

describe( 'normalizeNodes', () => {
	it( 'should change single object into an array', () => {
		const p = new Element( 'p' );

		expect( utils._normalizeNodes( p ) ).to.deep.equal( [ p ] );
	} );

	it( 'should change strings to text nodes', () => {
		const text = utils._normalizeNodes( 'abc' )[ 0 ];

		expect( text ).to.be.instanceof( Text );
		expect( text.data ).to.equal( 'abc' );
	} );

	it( 'should change text proxies to text nodes', () => {
		const textNode = new Text( 'abc' );
		const textProxy = new TextProxy( textNode, 1, 1 );

		const text = utils._normalizeNodes( textProxy )[ 0 ];

		expect( text ).to.be.instanceof( Text );
		expect( text.data ).to.equal( 'b' );
	} );

	it( 'should not change elements', () => {
		const p = new Element( 'p' );

		expect( utils._normalizeNodes( p )[ 0 ] ).to.equal( p );
	} );

	it( 'should omit unrecognized objects', () => {
		expect( utils._normalizeNodes( 1 ) ).to.deep.equal( [] );
	} );

	it( 'should accept arrays', () => {
		const text = new Text( 'foo', { bold: true } );
		const image = new Element( 'imageBlock' );
		const nodes = [ 'abc', text, image, 1, 'xyz' ];

		const normalized = utils._normalizeNodes( nodes );

		expect( normalized[ 0 ] ).to.be.instanceof( Text );
		expect( normalized[ 1 ] ).to.equal( text );
		expect( normalized[ 2 ] ).to.equal( image );
		expect( normalized[ 3 ] ).to.be.instanceof( Text );
	} );

	it( 'should merge text nodes if mergeTextNodes flag is set to true', () => {
		const normalized = utils._normalizeNodes( [ 'foo', 'bar' ], true );

		expect( normalized.length ).to.equal( 1 );
		expect( normalized[ 0 ].data ).to.equal( 'foobar' );
	} );

	it( 'should replace document fragment by the list of it\'s children', () => {
		const nodes = [
			new Text( 'foo', { bold: true } ),
			new DocumentFragment( [ new Text( 'bar', { bold: true } ), new Element( 'imageBlock' ) ] ),
			'xyz'
		];

		const normalized = utils._normalizeNodes( nodes, true );

		expect( normalized[ 0 ] ).to.be.instanceof( Text );
		expect( normalized[ 0 ].getAttribute( 'bold' ) ).to.be.true;
		expect( normalized[ 0 ].data ).to.equal( 'foobar' );
		expect( normalized[ 1 ].name ).to.equal( 'imageBlock' );
		expect( normalized[ 2 ].data ).to.equal( 'xyz' );
	} );
} );

function expectData( html ) {
	expect( getData( model, { withoutSelection: true } ) ).to.equal( html );
}
