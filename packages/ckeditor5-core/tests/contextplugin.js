/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi } from 'vitest';
import { ContextPlugin } from '../src/contextplugin.js';

describe( 'ContextPlugin', () => {
	const contextMock = {};

	it( 'should be marked as a context plugin', () => {
		expect( ContextPlugin.isContextPlugin ).toBe( true );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `false`', () => {
		expect( ContextPlugin.isOfficialPlugin ).toBe( false );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ContextPlugin.isPremiumPlugin ).toBe( false );
	} );

	describe( 'constructor()', () => {
		it( 'should set the `context` property', () => {
			const plugin = new ContextPlugin( contextMock );

			expect( plugin ).toHaveProperty( 'context', contextMock );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should be defined', () => {
			const plugin = new ContextPlugin( contextMock );

			expect( plugin.destroy ).toBeTypeOf( 'function' );
		} );

		it( 'should stop listening', () => {
			const plugin = new ContextPlugin( contextMock );
			const stopListeningSpy = vi.spyOn( plugin, 'stopListening' );

			plugin.destroy();

			expect( stopListeningSpy ).toHaveBeenCalledOnce();
		} );
	} );
} );
