/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: view, browser-only */

'use strict';

import { getParentContainer } from '/ckeditor5/engine/view/writer.js';
import ContainerElement from '/ckeditor5/engine/view/containerelement.js';
import AttributeElement from '/ckeditor5/engine/view/attributeelement.js';
import Text from '/ckeditor5/engine/view/text.js';
import Position from '/ckeditor5/engine/view/position.js';

describe( 'writer', () => {
	describe( 'getParentContainer', () => {
		it( 'should return parent container of the node', () => {
			const text = new Text( 'foobar' );
			const b = new AttributeElement( 'b', null, [ text ] );
			const parent = new ContainerElement( 'p', null, [ b ] );

			b.priority = 1;
			const container = getParentContainer( new Position( text, 0 ) );

			expect( container ).to.equal( parent );
		} );

		it( 'should return undefined if no parent container', () => {
			const text = new Text( 'foobar' );
			const b = new AttributeElement( 'b', null, [ text ] );

			b.priority = 1;
			const container = getParentContainer( new Position( text, 0 ) );

			expect( container ).to.be.undefined;
		} );
	} );
} );
