/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { testUtils } from '../_utils/utils.js';

describe( 'utils', () => {
	afterEach( () => {
		vi.restoreAllMocks();
	} );

	describe( 'checkAssertions()', () => {
		it( 'does not throw an error if at least one assertion passed', () => {
			const assertionRed = vi.fn().mockImplementation( () => {
				expect( 1 ).toBe( 2 );
			} );
			const assertionGreen = vi.fn().mockImplementation( () => {
				expect( 1 ).toBe( 1 );
			} );

			expect( () => {
				testUtils.checkAssertions( assertionRed, assertionGreen );
			} ).not.toThrow();
		} );

		it( 'throws all errors if any assertion did not pass', () => {
			const error1 = 'first error';
			const error2 = 'second error';

			const assertionRed = vi.fn().mockImplementation( () => {
				throw new Error( error1 );
			} );
			const assertionGreen = vi.fn().mockImplementation( () => {
				throw new Error( error2 );
			} );

			expect( () => {
				testUtils.checkAssertions( assertionRed, assertionGreen );
			} ).toThrowError( `${ error1 }\n\n${ error2 }` );
		} );

		it( 'does not execute all assertions if the first one passed', () => {
			const assertionRed = vi.fn().mockImplementation( () => {
				expect( 1 ).toBe( 1 );
			} );
			const assertionGreen = vi.fn();

			testUtils.checkAssertions( assertionRed, assertionGreen );
			expect( assertionGreen ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'isMixed()', () => {
		let mixin, CustomClass;

		beforeEach( () => {
			CustomClass = class {};
			mixin = {
				foo() {
					return 'bar';
				}
			};
		} );

		it( 'should return true when given mixin is mixed to target class', () => {
			CustomClass.prototype.foo = mixin.foo;

			expect( testUtils.isMixed( CustomClass, mixin ) ).toBe( true );
		} );

		it( 'should return false when given mixin is not mixed to target class', () => {
			expect( testUtils.isMixed( CustomClass, mixin ) ).toBe( false );
		} );

		it( 'should return false when class has mixin like interface', () => {
			CustomClass = class {
				foo() {
					return 'biz';
				}
			};

			expect( testUtils.isMixed( CustomClass, mixin ) ).toBe( false );
		} );
	} );
} );
