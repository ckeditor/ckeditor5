/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Alignment from '../src/alignment.js';
import AlignmentEditing from '../src/alignmentediting.js';
import AlignmentUI from '../src/alignmentui.js';

describe( 'Alignment', () => {
	it( 'requires AlignmentEditing and AlignmentUI', () => {
		expect( Alignment.requires ).to.deep.equal( [ AlignmentEditing, AlignmentUI ] );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( Alignment.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( Alignment.isPremiumPlugin ).to.be.false;
	} );
} );
