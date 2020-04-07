/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ManualDecorator from '../../src/utils/manualdecorator';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'Manual Decorator', () => {
	let manualDecorator;
	testUtils.createSinonSandbox();

	beforeEach( () => {
		manualDecorator = new ManualDecorator( {
			id: 'foo',
			label: 'bar',
			attributes: {
				one: 'two'
			}
		} );
	} );

	it( 'constructor', () => {
		expect( manualDecorator.id ).to.equal( 'foo' );
		expect( manualDecorator.label ).to.equal( 'bar' );
		expect( manualDecorator.attributes ).to.deep.equal( { one: 'two' } );
		expect( manualDecorator.defaultValue ).to.deep.equal( undefined );
	} );

	it( 'constructor with defaultValue', () => {
		manualDecorator = new ManualDecorator( {
			id: 'foo',
			label: 'bar',
			attributes: {
				one: 'two'
			},
			defaultValue: true
		} );

		expect( manualDecorator.id ).to.equal( 'foo' );
		expect( manualDecorator.label ).to.equal( 'bar' );
		expect( manualDecorator.attributes ).to.deep.equal( { one: 'two' } );
		expect( manualDecorator.defaultValue ).to.deep.equal( true );
	} );

	it( '#value is observable', () => {
		const spy = testUtils.sinon.spy();
		expect( manualDecorator.value ).to.be.undefined;

		manualDecorator.on( 'change:value', spy );
		manualDecorator.value = true;

		expect( spy.calledOnce ).to.be.true;
		testUtils.sinon.assert.calledWithExactly( spy.firstCall, testUtils.sinon.match.any, 'value', true, undefined );

		manualDecorator.value = false;
		expect( spy.calledTwice ).to.be.true;
		testUtils.sinon.assert.calledWithExactly( spy.secondCall, testUtils.sinon.match.any, 'value', false, true );
	} );
} );
