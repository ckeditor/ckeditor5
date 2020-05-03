/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Code from '../src/code';
import CodeEditing from '../src/code/codeediting';
import CodeUI from '../src/code/codeui';

describe( 'Code', () => {
	it( 'should require CodeEditing and CodeUI', () => {
		expect( Code.requires ).to.deep.equal( [ CodeEditing, CodeUI ] );
	} );

	it( 'should be named', () => {
		expect( Code.pluginName ).to.equal( 'Code' );
	} );
} );
