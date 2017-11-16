/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * General test utils for CKEditor.
 */
const utils = {
	/**
	 * Creates Sinon sandbox in {@link bender#sinon} and plugs `afterEach()` callback which
	 * restores all spies and stubs created in this sandbox.
	 *
	 * See https://github.com/ckeditor/ckeditor5-design/issues/72 and http://sinonjs.org/docs/#sinon-sandbox
	 *
	 * Usage:
	 *
	 *		// Directly in the test file:
	 *		testUtils.createSinonSandbox();
	 *
	 *		// Then inside tests you can use bender.sinon:
	 *		it( 'does something', () => {
	 *			testUtils.sinon.spy( obj, 'method' );
	 *		} );
	 */
	createSinonSandbox() {
		before( () => {
			utils.sinon = sinon.sandbox.create();
		} );

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
	 *      it( 'test', () => {
	 *          // Test bootstrapping...
	 *
	 *          const assertEdge = () => {
	 *              // expect();
	 *          };
	 *
	 *          const assertAll = () => {
	 *              // expect();
	 *          };
	 *
	 *          testUtils.checkAssertions( assertEdge, assertAll );
	 *      } );
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
	}
};

export default utils;
