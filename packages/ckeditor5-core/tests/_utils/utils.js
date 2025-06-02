/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * General test utils for CKEditor.
 */
const utils = {
	sinon,

	/**
	 * Creates Sinon sandbox in {@link utils#sinon} and plugs `afterEach()` callback which
	 * restores all spies and stubs created in this sandbox.
	 *
	 * See https://github.com/ckeditor/ckeditor5-design/issues/72 and http://sinonjs.org/docs/#sinon-sandbox
	 *
	 * Usage:
	 *
	 *		import testUtils from '@ckeditor/ckeditor5-utils/tests/_utils/utils';
	 *
	 *		describe( 'MyClass', () => {
	 *			// Create Sinon sandbox inside top-level describe block:
	 *			testUtils.createSinonSandbox();
	 *
	 *			// Then inside tests you can use testUtils.sinon:
	 *			it( 'does something', () => {
	 *				testUtils.sinon.spy( obj, 'method' );
	 *			} );
	 *		}
	 *
	 * **Note**: Do not use `testUtils.createSinonSandbox()` outside `describe()` block as it will attach `afterEach()` calls
	 * to all test - not only those in current file.
	 */

	createSinonSandbox() {
		// eslint-disable-next-line mocha/no-top-level-hooks
		afterEach( () => {
			utils.sinon.restore();
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

export default utils;
