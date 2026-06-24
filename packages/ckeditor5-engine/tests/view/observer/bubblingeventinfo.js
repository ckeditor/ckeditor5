/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';
import { BubblingEventInfo } from '../../../src/view/observer/bubblingeventinfo.js';

import { EventInfo } from '@ckeditor/ckeditor5-utils';

describe( 'BubblingEventInfo', () => {
	it( 'should be created properly', () => {
		const range = {};
		const event = new BubblingEventInfo( this, 'test', range );

		expect( event ).toBeInstanceOf( EventInfo );
		expect( event.source ).toBe( this );
		expect( event.name ).toBe( 'test' );
		expect( event.path ).toEqual( [] );
		expect( event.startRange ).toBe( range );
		expect( event.eventPhase ).toBe( 'none' );
		expect( event.currentTarget ).toBeNull();
	} );
} );
