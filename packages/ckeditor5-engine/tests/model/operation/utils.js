/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Model } from '../../../src/model/model.js';
import { ModelDocumentFragment } from '../../../src/model/documentfragment.js';
import { ModelElement } from '../../../src/model/element.js';
import { ModelText } from '../../../src/model/text.js';
import { ModelTextProxy } from '../../../src/model/textproxy.js';
import { ModelPosition } from '../../../src/model/position.js';
import { ModelRange } from '../../../src/model/range.js';
import * as utils from '../../../src/model/operation/utils.js';
import { _getModelData } from '../../../src/dev-utils/model.js';
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
			new ModelText( 'foo' ),
			new ModelText( 'bar', { bold: true } ),
			new ModelElement( 'imageBlock', { src: 'img.jpg' } ),
			new ModelText( 'xyz' )
		] );
	} );

	describe( 'insert', () => {
		it( 'should insert nodes between nodes', () => {
			utils._insert( ModelPosition._createAt( root, 3 ), [ 'xxx', new ModelElement( 'p' ) ] );

			expectData( 'fooxxx<p></p><$text bold="true">bar</$text><imageBlock src="img.jpg"></imageBlock>xyz' );
		} );

		it( 'should split text node if nodes at inserted at offset inside text node', () => {
			utils._insert( ModelPosition._createAt( root, 5 ), new ModelElement( 'p' ) );

			expectData( 'foo<$text bold="true">ba</$text><p></p><$text bold="true">r</$text><imageBlock src="img.jpg"></imageBlock>xyz' );
		} );

		it( 'should merge text nodes if possible', () => {
			utils._insert( ModelPosition._createAt( root, 3 ), new ModelText( 'xxx', { bold: true } ) );

			expectData( 'foo<$text bold="true">xxxbar</$text><imageBlock src="img.jpg"></imageBlock>xyz' );
		} );
	} );

	describe( 'remove', () => {
		it( 'should remove nodes in given range', () => {
			const range = new ModelRange( ModelPosition._createAt( root, 3 ), ModelPosition._createAt( root, 6 ) );
			utils._remove( range );

			expectData( 'foo<imageBlock src="img.jpg"></imageBlock>xyz' );
		} );

		it( 'should split text node if range starts or ends inside text node', () => {
			const range = new ModelRange( ModelPosition._createAt( root, 1 ), ModelPosition._createAt( root, 5 ) );
			utils._remove( range );

			expectData( 'f<$text bold="true">r</$text><imageBlock src="img.jpg"></imageBlock>xyz' );
		} );

		it( 'should merge text nodes if possible', () => {
			const range = new ModelRange( ModelPosition._createAt( root, 3 ), ModelPosition._createAt( root, 7 ) );
			utils._remove( range );

			expectData( 'fooxyz' );
			expect( root.childCount ).toBe( 1 );
		} );

		it( 'should throw if given range is not flat', () => {
			expectToThrowCKEditorError( () => {
				utils._remove( new ModelRange( new ModelPosition( root, [ 0 ] ), new ModelPosition( root, [ 1, 2 ] ) ) );
			}, /operation-utils-remove-range-not-flat/ );
		} );
	} );

	describe( 'move', () => {
		it( 'should move a range of nodes', () => {
			const range = new ModelRange( ModelPosition._createAt( root, 3 ), ModelPosition._createAt( root, 6 ) );
			utils._move( range, ModelPosition._createAt( root, 0 ) );

			expectData( '<$text bold="true">bar</$text>foo<imageBlock src="img.jpg"></imageBlock>xyz' );
		} );

		it( 'should correctly move if target position is in same element as moved range, but after range', () => {
			const range = new ModelRange( ModelPosition._createAt( root, 3 ), ModelPosition._createAt( root, 6 ) );
			utils._move( range, ModelPosition._createAt( root, 10 ) );

			expectData( 'foo<imageBlock src="img.jpg"></imageBlock>xyz<$text bold="true">bar</$text>' );
		} );

		it( 'should throw if given range is not flat', () => {
			expectToThrowCKEditorError( () => {
				utils._move( new ModelRange( new ModelPosition( root, [ 0 ] ), new ModelPosition( root, [ 1, 2 ] ) ), null );
			}, /operation-utils-move-range-not-flat/ );
		} );
	} );

	describe( 'setAttribute', () => {
		it( 'should set attribute on given range of nodes', () => {
			const range = new ModelRange( ModelPosition._createAt( root, 6 ), ModelPosition._createAt( root, 8 ) );
			utils._setAttribute( range, 'newAttr', true );

			expectData( 'foo<$text bold="true">bar</$text>' +
				'<imageBlock newAttr="true" src="img.jpg"></imageBlock>' +
				'<$text newAttr="true">x</$text>yz'
			);
		} );

		it( 'should remove attribute if null was passed as a value', () => {
			const range = new ModelRange( ModelPosition._createAt( root, 6 ), ModelPosition._createAt( root, 7 ) );
			utils._setAttribute( range, 'src', null );

			expectData( 'foo<$text bold="true">bar</$text><imageBlock></imageBlock>xyz' );
		} );

		it( 'should merge nodes if possible', () => {
			const range = new ModelRange( ModelPosition._createAt( root, 0 ), ModelPosition._createAt( root, 3 ) );
			utils._setAttribute( range, 'bold', true );

			expectData( '<$text bold="true">foobar</$text><imageBlock src="img.jpg"></imageBlock>xyz' );
		} );
	} );
} );

describe( 'normalizeNodes', () => {
	it( 'should change single object into an array', () => {
		const p = new ModelElement( 'p' );

		expect( utils._normalizeNodes( p ) ).toEqual( [ p ] );
	} );

	it( 'should change strings to text nodes', () => {
		const text = utils._normalizeNodes( 'abc' )[ 0 ];

		expect( text ).toBeInstanceOf( ModelText );
		expect( text.data ).toBe( 'abc' );
	} );

	it( 'should change text proxies to text nodes', () => {
		const textNode = new ModelText( 'abc' );
		const textProxy = new ModelTextProxy( textNode, 1, 1 );

		const text = utils._normalizeNodes( textProxy )[ 0 ];

		expect( text ).toBeInstanceOf( ModelText );
		expect( text.data ).toBe( 'b' );
	} );

	it( 'should not change elements', () => {
		const p = new ModelElement( 'p' );

		expect( utils._normalizeNodes( p )[ 0 ] ).toBe( p );
	} );

	it( 'should omit unrecognized objects', () => {
		expect( utils._normalizeNodes( 1 ) ).toEqual( [] );
	} );

	it( 'should accept arrays', () => {
		const text = new ModelText( 'foo', { bold: true } );
		const image = new ModelElement( 'imageBlock' );
		const nodes = [ 'abc', text, image, 1, 'xyz' ];

		const normalized = utils._normalizeNodes( nodes );

		expect( normalized[ 0 ] ).toBeInstanceOf( ModelText );
		expect( normalized[ 1 ] ).toBe( text );
		expect( normalized[ 2 ] ).toBe( image );
		expect( normalized[ 3 ] ).toBeInstanceOf( ModelText );
	} );

	it( 'should merge text nodes if mergeTextNodes flag is set to true', () => {
		const normalized = utils._normalizeNodes( [ 'foo', 'bar' ], true );

		expect( normalized.length ).toBe( 1 );
		expect( normalized[ 0 ].data ).toBe( 'foobar' );
	} );

	it( 'should replace document fragment by the list of it\'s children', () => {
		const nodes = [
			new ModelText( 'foo', { bold: true } ),
			new ModelDocumentFragment( [ new ModelText( 'bar', { bold: true } ), new ModelElement( 'imageBlock' ) ] ),
			'xyz'
		];

		const normalized = utils._normalizeNodes( nodes, true );

		expect( normalized[ 0 ] ).toBeInstanceOf( ModelText );
		expect( normalized[ 0 ].getAttribute( 'bold' ) ).toBe( true );
		expect( normalized[ 0 ].data ).toBe( 'foobar' );
		expect( normalized[ 1 ].name ).toBe( 'imageBlock' );
		expect( normalized[ 2 ].data ).toBe( 'xyz' );
	} );
} );

function expectData( html ) {
	expect( _getModelData( model, { withoutSelection: true } ) ).toBe( html );
}
