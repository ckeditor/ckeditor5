/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';
import { defaultConfig } from '../src/schemadefinitions.js';

describe( 'schemadefinitions', () => {
	it( 'should be an object', () => {
		// Sanity check if object exists. We will add test coverage later.
		expect( defaultConfig ).toBeTypeOf( 'object' );
		expect( Array.isArray( defaultConfig.block ) ).toBe( true );
		expect( Array.isArray( defaultConfig.inline ) ).toBe( true );
	} );
} );
