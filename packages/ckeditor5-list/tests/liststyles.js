/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ListStyles from '../src/liststyles';
import ListStylesEditing from '../src/liststylesediting';
import ListStylesUI from '../src/liststylesui';

describe( 'ListStyles', () => {
	it( 'should be named', () => {
		expect( ListStyles.pluginName ).to.equal( 'ListStyles' );
	} );

	it( 'should require ListStylesEditing and ListStylesUI', () => {
		expect( ListStyles.requires ).to.deep.equal( [ ListStylesEditing, ListStylesUI ] );
	} );
} );
