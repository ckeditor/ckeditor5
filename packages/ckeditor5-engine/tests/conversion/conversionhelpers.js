/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi } from 'vitest';
import { ConversionHelpers } from '../../src/conversion/conversionhelpers.js';

describe( 'ConversionHelpers', () => {
	describe( 'add()', () => {
		const dispA = Symbol( 'dispA' );
		const dispB = Symbol( 'dispB' );

		it( 'should call a helper for one defined dispatcher', () => {
			const spy = vi.fn();
			const helpers = new ConversionHelpers( [ dispA ] );

			helpers.add( spy );

			expect( spy ).toHaveBeenCalledOnce();
			expect( spy ).toHaveBeenCalledWith( dispA );
		} );

		it( 'should call helper for all defined dispatcherers', () => {
			const spy = vi.fn();
			const helpers = new ConversionHelpers( [ dispA, dispB ] );

			helpers.add( spy );

			expect( spy ).toHaveBeenCalledTimes( 2 );
			expect( spy ).toHaveBeenCalledWith( dispA );
			expect( spy ).toHaveBeenCalledWith( dispB );
		} );

		it( 'should be chainable', () => {
			const spy = vi.fn();
			const helpers = new ConversionHelpers( [ dispA ] );

			expect( helpers.add( spy ) ).toBe( helpers );
		} );
	} );
} );
