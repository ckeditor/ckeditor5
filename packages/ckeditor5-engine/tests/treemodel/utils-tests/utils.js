/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import treeModelTestUtils from '/tests/engine/treemodel/_utils/utils.js';
import Document from '/ckeditor5/engine/treemodel/document.js';
import Range from '/ckeditor5/engine/treemodel/range.js';
import Element from '/ckeditor5/engine/treemodel/element.js';

const getNodesAndText = treeModelTestUtils.getNodesAndText;

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

		let fooJsoned = treeModelTestUtils.jsonParseStringify( foo );
		expect( fooJsoned ).to.not.be.instanceOf( Foo );
		expect( fooJsoned ).to.deep.equal( { ra: { bar: 'bar' } } );
	} );
} );
