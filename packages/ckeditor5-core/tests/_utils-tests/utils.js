/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import testUtils from '../_utils/utils';

testUtils.createSinonSandbox();

describe( 'utils', () => {
	describe( 'checkAssertions()', () => {
		it( 'does not throw an error if at least one assertion passed', () => {
			const assertionRed = testUtils.sinon.stub().callsFake( () => {
				expect( 1 ).to.equal( 2 );
			} );
			const assertionGreen = testUtils.sinon.stub().callsFake( () => {
				expect( 1 ).to.equal( 1 );
			} );

			expect( () => {
				testUtils.checkAssertions( assertionRed, assertionGreen );
			} ).to.not.throw();
		} );

		it( 'throws all errors if any assertion did not pass', () => {
			const assertionRed = testUtils.sinon.stub().callsFake( () => {
				expect( 1 ).to.equal( 2 );
			} );
			const assertionGreen = testUtils.sinon.stub().callsFake( () => {
				expect( 2 ).to.equal( 1 );
			} );

			expect( () => {
				testUtils.checkAssertions( assertionRed, assertionGreen );
			} ).to.throw( Error, 'expected 1 to equal 2\n\nexpected 2 to equal 1' );
		} );

		it( 'does not execute all assertions if the first one passed', () => {
			const assertionRed = testUtils.sinon.stub().callsFake( () => {
				expect( 1 ).to.equal( 1 );
			} );
			const assertionGreen = testUtils.sinon.stub().callsFake();

			testUtils.checkAssertions( assertionRed, assertionGreen );
			expect( assertionGreen.called ).to.equal( false );
		} );
	} );
} );
