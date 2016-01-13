/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel */

'use strict';

import Attribute from '/ckeditor5/core/treemodel/attribute.js';

describe( 'Attribute', () => {
	describe( 'constructor', () => {
		it( 'should create attribute', () => {
			let attr = new Attribute( 'foo', 'bar' );

			expect( attr ).to.have.property( 'key' ).that.equals( 'foo' );
			expect( attr ).to.have.property( 'value' ).that.equals( 'bar' );
		} );

		it( 'should create equal instance even if object has different order', () => {
			let attr1 = new Attribute( 'foo', { a: 1, b: 2 } );
			let attr2 = new Attribute( 'foo', { b: 2, a: 1 } );

			expect( attr1.isEqual( attr2 ) ).to.be.true;
		} );
	} );
} );
