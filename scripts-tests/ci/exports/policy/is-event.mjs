/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, expect, it } from 'vitest';
import { isEvent } from '../../../../scripts/ci/exports/policy/is-event.mjs';

function createLibrary( exports ) {
	return {
		modules: [ { exports } ]
	};
}

describe( 'scripts/ci/exports/policy/is-event', () => {
	it( 'should mark an event export as an event and a part of the public tree', () => {
		const exportItem = { localName: 'ExampleEvent', type: 'event', internal: false, references: [] };

		isEvent( createLibrary( [ exportItem ] ) );

		expect( exportItem.isEvent ).toBe( true );
		expect( exportItem.isPublicTree ).toBe( true );
	} );

	it( 'should mark references of an event export as a part of the public tree', () => {
		const reference = { references: [] };
		const exportItem = { localName: 'ExampleEvent', type: 'event', internal: false, references: [ reference ] };

		isEvent( createLibrary( [ exportItem ] ) );

		expect( reference.isPublicTree ).toBe( true );
	} );

	it( 'should not mark an internal event export', () => {
		const exportItem = { localName: 'ExampleEvent', type: 'event', internal: true, references: [] };

		isEvent( createLibrary( [ exportItem ] ) );

		expect( exportItem.isEvent ).toBeUndefined();
		expect( exportItem.isPublicTree ).toBeUndefined();
	} );

	it( 'should not mark a non-event export', () => {
		const exportItem = { localName: 'ExampleClass', type: 'class', internal: false, references: [] };

		isEvent( createLibrary( [ exportItem ] ) );

		expect( exportItem.isEvent ).toBeUndefined();
		expect( exportItem.isPublicTree ).toBeUndefined();
	} );
} );
