/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import {
	getNodesAndText,
	itemAt,
	getText,
	createRangeOnElementOnly
} from '../../../tests/model/_utils/utils';
import Model from '../../../src/model/model';
import Range from '../../../src/model/range';
import Element from '../../../src/model/element';
import Text from '../../../src/model/text';
import Node from '../../../src/model/node';
import TextProxy from '../../../src/model/textproxy';

describe( 'getNodesAndText', () => {
	let doc, root, div, p;

	beforeEach( () => {
		const model = new Model();

		doc = model.document;
		root = doc.createRoot();

		div = new Element( 'div', [], new Text( 'foobar' ) );
		p = new Element( 'p', [], new Text( 'abcxyz' ) );

		root._insertChild( 0, [ div, p ] );
	} );

	it( 'reads two elements with text', () => {
		expect( getNodesAndText( Range._createIn( root ) ) ).to.equal( 'DIVfoobarDIVPabcxyzP' );
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
		parent._appendChild( element );

		const range = createRangeOnElementOnly( element );

		expect( Array.from( range.getItems() ) ).to.deep.equal( [ element ] );
	} );
} );
