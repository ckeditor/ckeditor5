/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel */

'use strict';

import Character from '/ckeditor5/core/treemodel/character.js';
import Node from '/ckeditor5/core/treemodel/node.js';
import Element from '/ckeditor5/core/treemodel/element.js';
import Attribute from '/ckeditor5/core/treemodel/attribute.js';

describe( 'Character', () => {
	describe( 'constructor', () => {
		it( 'should create character without attributes', () => {
			let character = new Character( 'f' );
			let parent = new Element( 'parent', [], character );

			expect( character ).to.be.an.instanceof( Node );
			expect( character ).to.have.property( 'character' ).that.equals( 'f' );
			expect( character ).to.have.property( 'parent' ).that.equals( parent );
			expect( character.attrs.size ).to.equal( 0 );
		} );

		it( 'should create character with attributes', () => {
			let attr = new Attribute( 'foo', 'bar' );
			let character = new Character( 'f', [ attr ] );
			let parent = new Element( 'parent', [], character );

			expect( character ).to.be.an.instanceof( Node );
			expect( character ).to.have.property( 'character' ).that.equals( 'f' );
			expect( character ).to.have.property( 'parent' ).that.equals( parent );
			expect( character.attrs.size ).to.equal( 1 );
			expect( character.attrs.get( attr.key ) ).to.equal( attr );
		} );
	} );
} );
