/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import LinkImage from '../src/linkimage';
import LinkImageEditing from '../src/linkimageediting';
import LinkImageUI from '../src/linkimageui';

describe( 'LinkImage', () => {
	it( 'should require LinkImageEditing and LinkImageUI', () => {
		expect( LinkImage.requires ).to.deep.equal( [ LinkImageEditing, LinkImageUI ] );
	} );

	it( 'should be named', () => {
		expect( LinkImage.pluginName ).to.equal( 'LinkImage' );
	} );
} );
