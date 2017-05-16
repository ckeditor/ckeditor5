/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import {
	getNodesAndText,
	jsonParseStringify,
	wrapInDelta,
	itemAt,
	getText,
	createRangeOnElementOnly
} from '../../../tests/model/_utils/utils';
import Document from '../../../src/model/document';
import Range from '../../../src/model/range';
import Element from '../../../src/model/element';
import Text from '../../../src/model/text';
import Node from '../../../src/model/node';
import TextProxy from '../../../src/model/textproxy';
import Operation from '../../../src/model/operation/operation';
import Delta from '../../../src/model/delta/delta';

describe( 'getNodesAndText', () => {
	let doc, root, div, p;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot();

		div = new Element( 'div', [], new Text( 'foobar' ) );
		p = new Element( 'p', [], new Text( 'abcxyz' ) );

		root.insertChildren( 0, [ div, p ] );
	} );

	it( 'reads two elements with text', () => {
		expect( getNodesAndText( Range.createIn( root ) ) ).to.equal( 'DIVfoobarDIVPabcxyzP' );
	} );
} );

describe( 'jsonParseStringify', () => {
	class Foo {
		constructor( ra ) {
			this.ra = ra;
		}
	}

	it( 'should return cleaned object', () => {
		const foo = new Foo( { bar: 'bar' } );

		const fooJsoned = jsonParseStringify( foo );
		expect( fooJsoned ).to.not.be.instanceOf( Foo );
		expect( fooJsoned ).to.deep.equal( { ra: { bar: 'bar' } } );
	} );
} );

describe( 'wrapInDelta', () => {
	it( 'should return given operation wrapped in a delta', () => {
		const op = new Operation( 0 );
		const wrapped = wrapInDelta( op );

		expect( wrapped ).to.equal( op );
		expect( wrapped.delta ).to.be.instanceof( Delta );
	} );
} );

describe( 'itemAt', () => {
	let foo, img, bar, element;

	beforeEach( () => {
		foo = new Text( 'foo' );
		img = new Element( 'image' );
		bar = new Text( 'bar' );

		element = new Element( 'p', null, [ foo, img, bar ] );
	} );

	it( 'should return element if it starts at given offset', () => {
		expect( itemAt( element, 3 ) ).to.equal( img );
	} );

	it( 'should return text proxy with one character if text node starts at given offset', () => {
		const text = itemAt( element, 4 );

		expect( text ).to.be.instanceof( TextProxy );
		expect( text.data ).to.equal( 'b' );
		expect( text.textNode ).to.equal( bar );
	} );

	it( 'should return text proxy with one character if text node occupies given offset', () => {
		const text = itemAt( element, 1 );

		expect( text ).to.be.instanceof( TextProxy );
		expect( text.data ).to.equal( 'o' );
		expect( text.textNode ).to.equal( foo );
	} );
} );

describe( 'getText', () => {
	it( 'should deeply visit each child of given element and concat text data of all visited text nodes', () => {
		const div = new Element( 'div', null, [
			new Element( 'p', null, [
				new Text( 'aaa', { bold: true } ),
				new Text( ' bbb' )
			] ),
			new Text( 'ccc' ),
			new Node( { attr: 'value' } ),
			new Element( 'p', null, [
				new Text( 'ddd' )
			] )
		] );

		expect( getText( div ) ).to.equal( 'aaa bbbcccddd' );
	} );
} );

describe( 'createRangeOnElementOnly', () => {
	it( 'should create a range that contains only the given element', () => {
		const parent = new Element( 'parent' );
		const element = new Element( 'elem' );
		parent.appendChildren( element );

		const range = createRangeOnElementOnly( element );

		expect( Array.from( range.getItems() ) ).to.deep.equal( [ element ] );
	} );
} );
