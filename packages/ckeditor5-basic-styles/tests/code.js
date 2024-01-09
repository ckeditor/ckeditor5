/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Code from '../src/code.js';
import CodeEditing from '../src/code/codeediting.js';
import CodeUI from '../src/code/codeui.js';

describe( 'Code', () => {
	it( 'should require CodeEditing and CodeUI', () => {
		expect( Code.requires ).to.deep.equal( [ CodeEditing, CodeUI ] );
	} );

	it( 'should be named', () => {
		expect( Code.pluginName ).to.equal( 'Code' );
	} );
} );
