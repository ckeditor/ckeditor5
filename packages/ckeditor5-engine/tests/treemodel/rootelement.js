/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel */

'use strict';

import Document from '/ckeditor5/engine/treemodel/document.js';
import Element from '/ckeditor5/engine/treemodel/element.js';
import RootElement from '/ckeditor5/engine/treemodel/rootelement.js';

describe( 'Element', () => {
	describe( 'constructor', () => {
		it( 'should create root element without attributes', () => {
			let doc = new Document();
			let root = new RootElement( doc );

			expect( root ).to.be.an.instanceof( Element );
			expect( root ).to.have.property( 'document' ).that.equals( doc );
			expect( root._attrs.size ).to.equal( 0 );
			expect( root.getChildCount() ).to.equal( 0 );
		} );
	} );
} );
