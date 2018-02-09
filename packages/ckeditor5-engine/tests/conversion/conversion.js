/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Conversion from '../../src/conversion/conversion';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

describe( 'Conversion', () => {
	let conversion, dispA, dispB;

	beforeEach( () => {
		conversion = new Conversion();

		// Placeholders. Will be used only to see if their were given as attribute for a spy function.
		dispA = Symbol( 'dispA' );
		dispB = Symbol( 'dispB' );

		conversion.register( 'ab', [ dispA, dispB ] );
		conversion.register( 'a', [ dispA ] );
		conversion.register( 'b', [ dispB ] );
	} );

	describe( 'register()', () => {
		it( 'should throw when trying to use same group name twice', () => {
			expect( () => {
				conversion.register( 'ab' );
			} ).to.throw( CKEditorError, /conversion-register-group-exists/ );
		} );
	} );

	describe( 'for()', () => {
		it( 'should return object with .add() method', () => {
			const forResult = conversion.for( 'ab' );

			expect( forResult.add ).to.be.instanceof( Function );
		} );

		it( 'should throw if non-existing group name has been used', () => {
			expect( () => {
				conversion.for( 'foo' );
			} ).to.throw( CKEditorError, /conversion-for-unknown-group/ );
		} );
	} );

	describe( 'add()', () => {
		let helperA, helperB;

		beforeEach( () => {
			helperA = sinon.stub();
			helperB = sinon.stub();
		} );

		it( 'should be chainable', () => {
			const forResult = conversion.for( 'ab' );
			const addResult = forResult.add( () => {} );

			expect( addResult ).to.equal( addResult.add( () => {} ) );
		} );

		it( 'should fire given helper for every dispatcher in given group', () => {
			conversion.for( 'ab' ).add( helperA );

			expect( helperA.calledWithExactly( dispA ) ).to.be.true;
			expect( helperA.calledWithExactly( dispB ) ).to.be.true;

			conversion.for( 'b' ).add( helperB );

			expect( helperB.calledWithExactly( dispA ) ).to.be.false;
			expect( helperB.calledWithExactly( dispB ) ).to.be.true;
		} );
	} );
} );
