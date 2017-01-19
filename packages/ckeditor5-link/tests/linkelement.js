/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import LinkElement from '../src/linkelement';
import AttributeElement from '@ckeditor/ckeditor5-engine/src/view/attributeelement';

describe( 'LinkElement', () => {
	it( 'should extend AttributeElement', () => {
		expect( new LinkElement( 'a' ) ).to.instanceof( AttributeElement );
	} );
} );
