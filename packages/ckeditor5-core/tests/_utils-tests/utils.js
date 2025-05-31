/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import testUtils from '../_utils/utils.js';

describe( 'utils', () => {
	testUtils.createSinonSandbox();

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
			const assertionGreen = testUtils.sinon.stub();

			testUtils.checkAssertions( assertionRed, assertionGreen );
			expect( assertionGreen.called ).to.equal( false );
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

			expect( testUtils.isMixed( CustomClass, mixin ) ).to.true;
		} );

		it( 'should return false when given mixin is not mixed to target class', () => {
			expect( testUtils.isMixed( CustomClass, mixin ) ).to.false;
		} );

		it( 'should return false when class has mixin like interface', () => {
			CustomClass = class {
				foo() {
					return 'biz';
				}
			};

			expect( testUtils.isMixed( CustomClass, mixin ) ).to.false;
		} );
	} );
} );
