/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: view */

'use strict';

import TextProxy from '/ckeditor5/engine/view/textproxy.js';
import Text from '/ckeditor5/engine/view/text.js';
import ContainerElement from '/ckeditor5/engine/view/containerelement.js';

describe( 'TextProxy', () => {
	describe( 'constructor', () => {
		it( 'should create TextProxy instance with specified properties', () => {
			const textElement = new Text( 'abcdefgh' );
			const textParent = new ContainerElement( 'p', [], [ textElement ] );
			const textFragment = 'cdef';
			const index = 2;

			const textProxy = new TextProxy( textFragment, textParent, textElement, index );

			expect( textProxy ).to.have.property( 'parent' ).to.equal( textParent );
			expect( textProxy ).to.have.property( '_data' ).to.equal( textFragment );
			expect( textProxy ).to.have.property( '_textNodeParent' ).to.equal( textElement );
			expect( textProxy ).to.have.property( '_index' ).to.equal( index );
		} );
	} );
} );
