/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * General test utils for CKEditor.
 */
export const testUtils = {
	// In Karma context `sinon` is a global; in Vitest it is not available.
	// TODO: Remove once all packages are migrated to Vitest. See: https://github.com/ckeditor/ckeditor5-internal/issues/4309
	sinon: typeof sinon !== 'undefined' ? sinon : null,

	/**
	 * Creates a cleanup hook that restores all mocks after each test.
	 *
	 * In Vitest context uses `vi.restoreAllMocks()`. In Karma/Sinon context falls back to `testUtils.sinon.restore()`.
	 *
	 * Usage:
	 *
	 *		import { testUtils } from '@ckeditor/ckeditor5-core/tests/_utils/utils';
	 *
	 *		describe( 'MyClass', () => {
	 *			testUtils.createSinonSandbox();
	 *
	 *			it( 'does something', () => {
	 *				vi.spyOn( obj, 'method' );
	 *			} );
	 *		}
	 *
	 * **Note**: Do not use `testUtils.createSinonSandbox()` outside `describe()` block as it will attach `afterEach()` calls
	 * to all tests - not only those in current file.
	 */

	createSinonSandbox() {
		// eslint-disable-next-line mocha/no-top-level-hooks
		afterEach( () => {
			if ( typeof vi !== 'undefined' ) {
				// eslint-disable-next-line no-undef
				vi.restoreAllMocks();
			} else {
				testUtils.sinon.restore();
			}
		} );
	},

	/**
	 * Executes specified assertions. It expects that at least one function will not throw an error.
	 *
	 * Some of the tests fail because different browsers renders selection differently when it comes to element boundaries.
	 * Using this method we can check few scenarios.
	 *
	 * See https://github.com/ckeditor/ckeditor5-core/issues/107.
	 *
	 * Usage:
	 *
	 *		it( 'test', () => {
	 *			// Test bootstrapping...
	 *
	 *			const assertEdge = () => {
	 *				// expect();
	 *			};
	 *
	 *			const assertAll = () => {
	 *				// expect();
	 *			};
	 *
	 *			testUtils.checkAssertions( assertEdge, assertAll );
	 *		} );
	 *
	 * @param {...Function} assertions Functions that will be executed.
	 */
	checkAssertions( ...assertions ) {
		const errors = [];

		for ( const assertFn of assertions ) {
			try {
				assertFn();

				return;
			} catch ( err ) {
				errors.push( err.message );
			}
		}

		throw new Error( errors.join( '\n\n' ) );
	},

	/**
	 * Checks if given mixin is mixed to given class.
	 *
	 * @param {Function} targetClass Class to check.
	 * @param {Object} mixin Mixin to check.
	 * @returns {Boolean} `True` when mixin is mixed to to target class, `false` otherwise.
	 */
	isMixed( targetClass, mixin ) {
		let isValid = true;

		for ( const property in mixin ) {
			if ( Object.prototype.hasOwnProperty.call( mixin, property ) ) {
				if ( targetClass.prototype[ property ] !== mixin[ property ] ) {
					isValid = false;
				}
			}
		}

		return isValid;
	}
};
