/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ShowBlocks as ShowBlocksDLL } from '../src/index.js';
import ShowBlocks from '../src/showblocks.js';

describe( 'ShowBlocks DLL', () => {
	it( 'exports ShowBlocks', () => {
		expect( ShowBlocksDLL ).to.equal( ShowBlocks );
	} );
} );
