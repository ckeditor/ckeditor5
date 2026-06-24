/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LinkManualDecorator } from '../../src/utils/manualdecorator.js';

describe( 'Manual Decorator', () => {
	let manualDecorator;

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	beforeEach( () => {
		manualDecorator = new LinkManualDecorator( {
			id: 'foo',
			label: 'bar',
			attributes: {
				one: 'two'
			}
		} );
	} );

	it( 'constructor', () => {
		expect( manualDecorator.id ).toBe( 'foo' );
		expect( manualDecorator.label ).toBe( 'bar' );
		expect( manualDecorator.attributes ).toEqual( { one: 'two' } );
		expect( manualDecorator.defaultValue ).toBeUndefined();
	} );

	it( 'constructor with defaultValue', () => {
		manualDecorator = new LinkManualDecorator( {
			id: 'foo',
			label: 'bar',
			attributes: {
				one: 'two'
			},
			defaultValue: true
		} );

		expect( manualDecorator.id ).toBe( 'foo' );
		expect( manualDecorator.label ).toBe( 'bar' );
		expect( manualDecorator.attributes ).toEqual( { one: 'two' } );
		expect( manualDecorator.defaultValue ).toEqual( true );
	} );

	it( '#value is observable', () => {
		const spy = vi.fn();
		expect( manualDecorator.value ).toBeUndefined();

		manualDecorator.on( 'change:value', spy );
		manualDecorator.value = true;

		expect( spy ).toHaveBeenCalledOnce();
		expect( spy.mock.calls[ 0 ][ 1 ] ).toBe( 'value' );
		expect( spy.mock.calls[ 0 ][ 2 ] ).toBe( true );
		expect( spy.mock.calls[ 0 ][ 3 ] ).toBeUndefined();

		manualDecorator.value = false;
		expect( spy ).toHaveBeenCalledTimes( 2 );
		expect( spy.mock.calls[ 1 ][ 1 ] ).toBe( 'value' );
		expect( spy.mock.calls[ 1 ][ 2 ] ).toBe( false );
		expect( spy.mock.calls[ 1 ][ 3 ] ).toBe( true );
	} );
} );
