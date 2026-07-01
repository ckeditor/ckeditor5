/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, afterEach, vi } from 'vitest';

import { stubUid } from '../_utils/uid.js';
import { ListItemUid } from '../../../src/list/utils/model.js';

describe( 'stubUid()', () => {
	afterEach( () => {
		vi.restoreAllMocks();
	} );

	it( 'Should start from 0', () => {
		stubUid( 0 );

		expect( ListItemUid.next() ).toBe( '000' );
		expect( ListItemUid.next() ).toBe( '001' );
		expect( ListItemUid.next() ).toBe( '002' );
		expect( ListItemUid.next() ).toBe( '003' );
		expect( ListItemUid.next() ).toBe( '004' );
		expect( ListItemUid.next() ).toBe( '005' );
		expect( ListItemUid.next() ).toBe( '006' );
		expect( ListItemUid.next() ).toBe( '007' );
		expect( ListItemUid.next() ).toBe( '008' );
		expect( ListItemUid.next() ).toBe( '009' );
		expect( ListItemUid.next() ).toBe( '00a' );
		expect( ListItemUid.next() ).toBe( '00b' );
	} );

	it( 'Should start from 0xa00 (default)', () => {
		stubUid();

		expect( ListItemUid.next() ).toBe( 'a00' );
		expect( ListItemUid.next() ).toBe( 'a01' );
		expect( ListItemUid.next() ).toBe( 'a02' );
		expect( ListItemUid.next() ).toBe( 'a03' );
		expect( ListItemUid.next() ).toBe( 'a04' );
		expect( ListItemUid.next() ).toBe( 'a05' );
		expect( ListItemUid.next() ).toBe( 'a06' );
		expect( ListItemUid.next() ).toBe( 'a07' );
		expect( ListItemUid.next() ).toBe( 'a08' );
		expect( ListItemUid.next() ).toBe( 'a09' );
		expect( ListItemUid.next() ).toBe( 'a0a' );
		expect( ListItemUid.next() ).toBe( 'a0b' );
	} );
} );
