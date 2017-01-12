/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import testUtils from 'ckeditor5-core/tests/_utils/utils';
import utilsTestUtils from 'ckeditor5-utils/tests/_utils/utils';
import ObesrvableMixin from 'ckeditor5-utils/src/observablemixin';
import EmitterMixin from 'ckeditor5-utils/src/emittermixin';

testUtils.createSinonSandbox();

describe( 'utilsTestUtils.createObserver()', () => {
	let observable, observable2, observer;

	beforeEach( () => {
		observer = utilsTestUtils.createObserver();

		observable = Object.create( ObesrvableMixin );
		observable.set( { foo: 0, bar: 0 } );

		observable2 = Object.create( ObesrvableMixin );
		observable2.set( { foo: 0, bar: 0 } );
	} );

	it( 'should create an observer', () => {
		function Emitter() {}
		Emitter.prototype = EmitterMixin;

		expect( observer  ).to.be.instanceof( Emitter );
		expect( observer.observe ).is.a( 'function' );
		expect( observer.stopListening ).is.a( 'function' );
	} );

	describe( 'Observer', () => {
		/* global console:false  */

		it( 'logs changes in the observable', () => {
			const spy = testUtils.sinon.stub( console, 'log' );

			observer.observe( 'Some observable', observable );
			observer.observe( 'Some observable 2', observable2 );

			observable.foo = 1;
			expect( spy.callCount ).to.equal( 1 );

			observable.foo = 2;
			observable2.bar = 3;
			expect( spy.callCount ).to.equal( 3 );
		} );

		it( 'logs changes to specified properties', () => {
			const spy = testUtils.sinon.stub( console, 'log' );

			observer.observe( 'Some observable', observable, [ 'foo' ] );

			observable.foo = 1;
			expect( spy.callCount ).to.equal( 1 );

			observable.bar = 1;
			expect( spy.callCount ).to.equal( 1 );
		} );

		it( 'stops listening when asked to do so', () => {
			const spy = testUtils.sinon.stub( console, 'log' );

			observer.observe( 'Some observable', observable );

			observable.foo = 1;
			expect( spy.callCount ).to.equal( 1 );

			observer.stopListening();

			observable.foo = 2;
			expect( spy.callCount ).to.equal( 1 );
		} );
	} );
} );
