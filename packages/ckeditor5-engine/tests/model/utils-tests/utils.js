/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	getNodesAndText,
	itemAt,
	getText,
	createRangeOnElementOnly
} from '../../../tests/model/_utils/utils.js';
import { Model } from '../../../src/model/model.js';
import { Range } from '../../../src/model/range.js';
import { ModelElement } from '../../../src/model/element.js';
import { Text } from '../../../src/model/text.js';
import { ModelNode } from '../../../src/model/node.js';
import { TextProxy } from '../../../src/model/textproxy.js';

describe( 'getNodesAndText', () => {
	let doc, root, div, p;

	beforeEach( () => {
		const model = new Model();

		doc = model.document;
		root = doc.createRoot();

		div = new ModelElement( 'div', [], new Text( 'foobar' ) );
		p = new ModelElement( 'p', [], new Text( 'abcxyz' ) );

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
		img = new ModelElement( 'imageBlock' );
		bar = new Text( 'bar' );

		element = new ModelElement( 'p', null, [ foo, img, bar ] );
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
		const div = new ModelElement( 'div', null, [
			new ModelElement( 'p', null, [
				new Text( 'aaa', { bold: true } ),
				new Text( ' bbb' )
			] ),
			new Text( 'ccc' ),
			new ModelNode( { attr: 'value' } ),
			new ModelElement( 'p', null, [
				new Text( 'ddd' )
			] )
		] );

		expect( getText( div ) ).to.equal( 'aaa bbbcccddd' );
	} );
} );

describe( 'createRangeOnElementOnly', () => {
	it( 'should create a range that contains only the given element', () => {
		const parent = new ModelElement( 'parent' );
		const element = new ModelElement( 'elem' );
		parent._appendChild( element );

		const range = createRangeOnElementOnly( element );

		expect( Array.from( range.getItems() ) ).to.deep.equal( [ element ] );
	} );
} );
