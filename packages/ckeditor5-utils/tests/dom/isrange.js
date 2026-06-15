/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';
import { isRange } from '../../src/dom/isrange.js';

describe( 'isRange()', () => {
	it( 'detects native DOM Range', () => {
		expect( isRange( new Range() ) ).toBe( true );

		expect( isRange( {} ) ).toBe( false );
		expect( isRange( null ) ).toBe( false );
		expect( isRange( undefined ) ).toBe( false );
		expect( isRange( new Date() ) ).toBe( false );
		expect( isRange( 42 ) ).toBe( false );
	} );
} );
