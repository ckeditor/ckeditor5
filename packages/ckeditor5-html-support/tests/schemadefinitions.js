/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { defaultConfig } from '../src/schemadefinitions.js';

describe( 'schemadefinitions', () => {
	it( 'should be an object', () => {
		// Sanity check if object exists. We will add test coverage later.
		expect( defaultConfig ).to.be.an( 'object' );
		expect( defaultConfig.block ).to.be.an( 'array' );
		expect( defaultConfig.inline ).to.be.an( 'array' );
	} );
} );
