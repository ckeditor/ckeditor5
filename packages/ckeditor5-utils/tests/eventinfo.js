/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, expect, it } from 'vitest';
import { EventInfo } from '../src/eventinfo.js';

describe( 'EventInfo', () => {
	it( 'should be created properly', () => {
		const event = new EventInfo( this, 'test' );

		expect( event.source ).toEqual( this );
		expect( event.name ).toEqual( 'test' );
		expect( event.path ).toEqual( [] );
		expect( event.stop.called ).not.toBe( true );
		expect( event.off.called ).not.toBe( true );
	} );

	it( 'should have stop() and off() marked', () => {
		const event = new EventInfo( this, 'test' );

		event.stop();
		event.off();

		expect( event.stop.called ).toBe( true );
		expect( event.off.called ).toBe( true );
	} );

	it( 'should not mark "called" in future instances', () => {
		let event = new EventInfo( this, 'test' );

		event.stop();
		event.off();

		event = new EventInfo( 'test' );

		expect( event.stop.called ).not.toBe( true );
		expect( event.off.called ).not.toBe( true );
	} );
} );
