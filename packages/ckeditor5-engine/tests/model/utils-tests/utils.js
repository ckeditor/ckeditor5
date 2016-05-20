/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import { getNodesAndText, jsonParseStringify } from '/tests/engine/model/_utils/utils.js';
import Document from '/ckeditor5/engine/model/document.js';
import Range from '/ckeditor5/engine/model/range.js';
import Element from '/ckeditor5/engine/model/element.js';

describe( 'getNodesAndText', () => {
	let doc, root, div, p;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot( 'root' );

		div = new Element( 'div', [], 'foobar' );
		p = new Element( 'p', [], 'abcxyz' );

		root.insertChildren( 0, [ div, p ] );
	} );

	it( 'reads two elements with text', () => {
		expect( getNodesAndText( Range.createFromElement( root ) ) ).to.equal( 'DIVfoobarDIVPabcxyzP' );
	} );
} );

describe( 'jsonParseStringify', () => {
	class Foo {
		constructor( ra ) {
			this.ra = ra;
		}
	}

	it( 'should return cleaned object', () => {
		let foo = new Foo( { bar: 'bar' } );

		let fooJsoned = jsonParseStringify( foo );
		expect( fooJsoned ).to.not.be.instanceOf( Foo );
		expect( fooJsoned ).to.deep.equal( { ra: { bar: 'bar' } } );
	} );
} );
