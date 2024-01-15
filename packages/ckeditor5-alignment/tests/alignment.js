/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Alignment from '../src/alignment.js';
import AlignmentEditing from '../src/alignmentediting.js';
import AlignmentUI from '../src/alignmentui.js';

describe( 'Alignment', () => {
	it( 'requires AlignmentEditing and AlignmentUI', () => {
		expect( Alignment.requires ).to.deep.equal( [ AlignmentEditing, AlignmentUI ] );
	} );
} );
