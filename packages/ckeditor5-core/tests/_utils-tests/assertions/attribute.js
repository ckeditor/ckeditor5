/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global chai */

import '../../_utils/assertions/attribute';

describe( 'attribute chai assertion', () => {
	it( 'should be added to chai assertions', () => {
		const assertion = new chai.Assertion();

		expect( assertion ).to.have.property( 'attribute' );
		expect( assertion.attribute ).to.be.instanceof( Function );
	} );

	it( 'should assert the target has a \'hasAttribute\' method', () => {
		expect( { hasAttribute: () => true } ).to.have.attribute( 'foo' );

		expect( function() {
			expect( {} ).not.to.have.attribute( 'bar' );
		} ).to.throw( 'expected {} to respond to \'hasAttribute\'' );

		expect( function() {
			expect( {} ).to.have.attribute( 'bar' );
		} ).to.throw( 'expected {} to respond to \'hasAttribute\'' );
	} );

	it( 'should assert the \'target.hasAttribute\' returns \'true\' for the given type', () => {
		expect( { hasAttribute: () => true } ).to.have.attribute( 'foo' );

		expect( function() {
			expect( { hasAttribute: () => false } ).to.have.attribute( 'bar' );
		} ).to.throw( 'expected { Object (hasAttribute) } to have attribute \'bar\'' );
	} );

	it( 'negated, should assert the \'target.hasAttribute\' returns \'false\' for the given type', () => {
		expect( { hasAttribute: () => false } ).not.to.have.attribute( 'foo' );

		expect( function() {
			expect( { hasAttribute: () => true } ).not.to.have.attribute( 'bar' );
		} ).to.throw( 'expected { Object (hasAttribute) } to not have attribute \'bar\'' );
	} );

	it( 'should assert the \'target.getAttribute\' returns the given value for the given type', () => {
		expect( {
			hasAttribute: () => true,
			getAttribute: () => 'bar'
		} ).to.have.attribute( 'foo', 'bar' );

		expect( function() {
			expect( {
				hasAttribute: () => true,
				getAttribute: () => 'bar'
			} ).to.have.attribute( 'foo', 'baz' );
		} ).to.throw( 'expected { Object (hasAttribute, getAttribute) } to have attribute \'foo\' of \'baz\', but got \'bar\'' );
	} );

	it( 'negated, should assert for the given type the \'target.getAttribute\' returns a value different than the given one', () => {
		expect( {
			hasAttribute: () => true,
			getAttribute: () => 'bar'
		} ).to.not.have.attribute( 'foo', 'baz' );

		expect( function() {
			expect( {
				hasAttribute: () => true,
				getAttribute: () => 'baz'
			} ).to.not.have.attribute( 'foo', 'baz' );
		} ).to.throw( 'expected { Object (hasAttribute, getAttribute) } to not have attribute \'foo\' of \'baz\'' );
	} );

	it( 'should prefix failure message with the given one', () => {
		expect( function() {
			expect( {} ).to.have.attribute( 'foo', 'baz', 'Illegal salmon' );
		} ).to.throw( /^Illegal salmon: / );
	} );
} );
