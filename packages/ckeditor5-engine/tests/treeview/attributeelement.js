/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treeview */

'use strict';

import AttributeElement from '/ckeditor5/engine/treeview/attributeelement.js';
import Element from '/ckeditor5/engine/treeview/element.js';
import { DEFAULT_PRIORITY } from '/ckeditor5/engine/treeview/attributeelement.js';

describe( 'AttributeElement', () => {
	describe( 'constructor', () => {
		it( 'should create element with default priority', () => {
			const el = new AttributeElement( 'strong' );

			expect( el ).to.be.an.instanceof( AttributeElement );
			expect( el ).to.be.an.instanceof( Element );
			expect( el ).to.have.property( 'name' ).that.equals( 'strong' );
			expect( el ).to.have.property( 'priority' ).that.equals( DEFAULT_PRIORITY );
		} );
	} );

	describe( 'clone', () => {
		it( 'should clone element with priority', () => {
			const el = new AttributeElement( 'b' );
			el.priority = 7;

			const clone = el.clone();

			expect( clone ).to.not.equal( el );
			expect( clone.name ).to.equal( el.name );
			expect( clone.priority ).to.equal( el.priority );
		} );
	} );
} );
