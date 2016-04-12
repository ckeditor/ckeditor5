/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treeview */

'use strict';

import ContainerElement from '/ckeditor5/engine/treeview/containerelement.js';
import Element from '/ckeditor5/engine/treeview/element.js';

describe( 'ContainerElement', () => {
	describe( 'constructor', () => {
		it( 'should create element with default priority', () => {
			const el = new ContainerElement( 'p' );

			expect( el ).to.be.an.instanceof( ContainerElement );
			expect( el ).to.be.an.instanceof( Element );
			expect( el ).to.have.property( 'name' ).that.equals( 'p' );
		} );
	} );
} );
