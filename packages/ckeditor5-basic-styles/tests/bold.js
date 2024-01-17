/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Bold from '../src/bold.js';
import BoldEditing from '../src/bold/boldediting.js';
import BoldUI from '../src/bold/boldui.js';

describe( 'Bold', () => {
	it( 'should require BoldEditing and BoldUI', () => {
		expect( Bold.requires ).to.deep.equal( [ BoldEditing, BoldUI ] );
	} );

	it( 'should be named', () => {
		expect( Bold.pluginName ).to.equal( 'Bold' );
	} );
} );
