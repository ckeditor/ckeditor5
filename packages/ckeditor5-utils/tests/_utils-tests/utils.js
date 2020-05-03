/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import AssertionError from 'assertion-error';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import ObservableMixin from '../../src/observablemixin';
import EmitterMixin from '../../src/emittermixin';
import { assertEqualMarkup, createObserver } from '../_utils/utils';

describe( 'utils - testUtils', () => {
	afterEach( () => {
		sinon.restore();
	} );

	describe( 'createObserver()', () => {
		let observable, observable2, observer;

		testUtils.createSinonSandbox();

		beforeEach( () => {
			observer = createObserver();

			observable = Object.create( ObservableMixin );
			observable.set( { foo: 0, bar: 0 } );

			observable2 = Object.create( ObservableMixin );
			observable2.set( { foo: 0, bar: 0 } );
		} );

		it( 'should create an observer', () => {
			function Emitter() {}
			Emitter.prototype = EmitterMixin;

			expect( observer ).to.be.instanceof( Emitter );
			expect( observer.observe ).is.a( 'function' );
			expect( observer.stopListening ).is.a( 'function' );
		} );

		describe( 'Observer', () => {
			/* global console:false  */

			it( 'logs changes in the observable', () => {
				const spy = sinon.stub( console, 'log' );

				observer.observe( 'Some observable', observable );
				observer.observe( 'Some observable 2', observable2 );

				observable.foo = 1;
				expect( spy.callCount ).to.equal( 1 );

				observable.foo = 2;
				observable2.bar = 3;
				expect( spy.callCount ).to.equal( 3 );
			} );

			it( 'logs changes to specified properties', () => {
				const spy = sinon.stub( console, 'log' );

				observer.observe( 'Some observable', observable, [ 'foo' ] );

				observable.foo = 1;
				expect( spy.callCount ).to.equal( 1 );

				observable.bar = 1;
				expect( spy.callCount ).to.equal( 1 );
			} );

			it( 'stops listening when asked to do so', () => {
				const spy = sinon.stub( console, 'log' );

				observer.observe( 'Some observable', observable );

				observable.foo = 1;
				expect( spy.callCount ).to.equal( 1 );

				observer.stopListening();

				observable.foo = 2;
				expect( spy.callCount ).to.equal( 1 );
			} );
		} );
	} );

	describe( 'assertEqualMarkup()', () => {
		it( 'should not throw for equal strings', () => {
			expect( assertEqualMarkup( 'foo', 'foo' ) ).to.not.throw;
		} );

		it( 'should throw AssertionError for not equal strings', () => {
			try {
				assertEqualMarkup( 'foo', 'bar' );
			} catch ( assertionError ) {
				expect( assertionError ).to.be.instanceOf( AssertionError );
			}
		} );

		it( 'should throw with default (short) message', () => {
			try {
				assertEqualMarkup( 'foo', 'bar' );
			} catch ( assertionError ) {
				expect( assertionError.message ).to.equal( 'Expected markup strings to be equal' );
			}
		} );

		it( 'should throw with passed message', () => {
			try {
				assertEqualMarkup( 'foo', 'bar', 'baz' );
			} catch ( assertionError ) {
				expect( assertionError.message ).to.equal( 'baz' );
			}
		} );

		it( 'should format actual string', () => {
			try {
				assertEqualMarkup( '<div><p><span>foo</span></p></div>', 'bar' );
			} catch ( assertionError ) {
				expect( assertionError.actual ).to.equal(
					'<div>\n' +
					'  <p><span>foo</span></p>\n' +
					'</div>'
				);
			}
		} );

		it( 'should format expected string', () => {
			try {
				assertEqualMarkup( 'foo', '<div><p><span>foo</span></p></div>' );
			} catch ( assertionError ) {
				expect( assertionError.expected ).to.equal(
					'<div>\n' +
					'  <p><span>foo</span></p>\n' +
					'</div>'
				);
			}
		} );

		it( 'should format model text node with attributes as inline', () => {
			try {
				assertEqualMarkup( 'foo', '<paragraph><$text bold="true">foo</$text></paragraph>' );
			} catch ( assertionError ) {
				expect( assertionError.expected ).to.equal(
					'<paragraph><$text bold="true">foo</$text></paragraph>'
				);
			}
		} );

		it( 'should format nested model structure properly', () => {
			try {
				assertEqualMarkup( 'foo',
					'<blockQuote>' +
						'<table>' +
							'<tableRow>' +
								'<tableCell>' +
									'<paragraph><$text bold="true">foo</$text></paragraph>' +
								'</tableCell>' +
								'<tableCell>' +
									'<paragraph><$text bold="true">bar</$text></paragraph>' +
									'<paragraph><$text bold="true">baz</$text></paragraph>' +
								'</tableCell>' +
							'</tableRow>' +
						'</table>' +
					'</blockQuote>'
				);
			} catch ( assertionError ) {
				expect( assertionError.expected ).to.equal(
					'<blockQuote>\n' +
					'  <table>\n' +
					'    <tableRow>\n' +
					'      <tableCell>\n' +
					'        <paragraph><$text bold="true">foo</$text></paragraph>\n' +
					'      </tableCell>\n' +
					'      <tableCell>\n' +
					'        <paragraph><$text bold="true">bar</$text></paragraph>\n' +
					'        <paragraph><$text bold="true">baz</$text></paragraph>\n' +
					'      </tableCell>\n' +
					'    </tableRow>\n' +
					'  </table>\n' +
					'</blockQuote>'
				);
			}
		} );
	} );
} );
