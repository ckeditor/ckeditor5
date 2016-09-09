/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import LinkElement from '/ckeditor5/link/linkelement.js';
import AttributeElement from '/ckeditor5/engine/view/attributeelement.js';

describe( 'LinkElement', () => {
	it( 'should extend AttributeElement', () => {
		expect( new LinkElement( 'a' ) ).to.instanceof( AttributeElement );
	} );
} );
