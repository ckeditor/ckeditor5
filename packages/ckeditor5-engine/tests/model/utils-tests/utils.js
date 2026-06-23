/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
	getNodesAndText,
	itemAt,
	getText,
	createRangeOnElementOnly
} from '../../../tests/model/_utils/utils.js';
import { Model } from '../../../src/model/model.js';
import { ModelRange } from '../../../src/model/range.js';
import { ModelElement } from '../../../src/model/element.js';
import { ModelText } from '../../../src/model/text.js';
import { ModelNode } from '../../../src/model/node.js';
import { ModelTextProxy } from '../../../src/model/textproxy.js';

describe( 'getNodesAndText', () => {
	let doc, root, div, p;

	beforeEach( () => {
		const model = new Model();

		doc = model.document;
		root = doc.createRoot();

		div = new ModelElement( 'div', [], new ModelText( 'foobar' ) );
		p = new ModelElement( 'p', [], new ModelText( 'abcxyz' ) );

		root._insertChild( 0, [ div, p ] );
	} );

	it( 'reads two elements with text', () => {
		expect( getNodesAndText( ModelRange._createIn( root ) ) ).toBe( 'DIVfoobarDIVPabcxyzP' );
	} );
} );

describe( 'itemAt', () => {
	let foo, img, bar, element;

	beforeEach( () => {
		foo = new ModelText( 'foo' );
		img = new ModelElement( 'imageBlock' );
		bar = new ModelText( 'bar' );

		element = new ModelElement( 'p', null, [ foo, img, bar ] );
	} );

	it( 'should return element if it starts at given offset', () => {
		expect( itemAt( element, 3 ) ).toBe( img );
	} );

	it( 'should return text proxy with one character if text node starts at given offset', () => {
		const text = itemAt( element, 4 );

		expect( text ).toBeInstanceOf( ModelTextProxy );
		expect( text.data ).toBe( 'b' );
		expect( text.textNode ).toBe( bar );
	} );

	it( 'should return text proxy with one character if text node occupies given offset', () => {
		const text = itemAt( element, 1 );

		expect( text ).toBeInstanceOf( ModelTextProxy );
		expect( text.data ).toBe( 'o' );
		expect( text.textNode ).toBe( foo );
	} );
} );

describe( 'getText', () => {
	it( 'should deeply visit each child of given element and concat text data of all visited text nodes', () => {
		const div = new ModelElement( 'div', null, [
			new ModelElement( 'p', null, [
				new ModelText( 'aaa', { bold: true } ),
				new ModelText( ' bbb' )
			] ),
			new ModelText( 'ccc' ),
			new ModelNode( { attr: 'value' } ),
			new ModelElement( 'p', null, [
				new ModelText( 'ddd' )
			] )
		] );

		expect( getText( div ) ).toBe( 'aaa bbbcccddd' );
	} );
} );

describe( 'createRangeOnElementOnly', () => {
	it( 'should create a range that contains only the given element', () => {
		const parent = new ModelElement( 'parent' );
		const element = new ModelElement( 'elem' );
		parent._appendChild( element );

		const range = createRangeOnElementOnly( element );

		expect( Array.from( range.getItems() ) ).toEqual( [ element ] );
	} );
} );
