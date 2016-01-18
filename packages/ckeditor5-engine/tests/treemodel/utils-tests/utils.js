/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import treeModelTestUtils from '/tests/core/treemodel/_utils/utils.js';
import Document from '/ckeditor5/core/treemodel/document.js';
import Range from '/ckeditor5/core/treemodel/range.js';
import Element from '/ckeditor5/core/treemodel/element.js';

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
