/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Alignment from '../src/alignment';
import AlignmentEditing from '../src/alignmentediting';
import AlignmentUI from '../src/alignmentui';

describe( 'Alignment', () => {
	it( 'requires AlignmentEditing and AlignmentUI', () => {
		expect( Alignment.requires ).to.deep.equal( [ AlignmentEditing, AlignmentUI ] );
	} );
} );
