/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import testUtils from '/tests/ckeditor5/_utils/utils.js';
import moduleTestUtils from '/tests/ckeditor5/_utils/module.js';
import Creator from '/ckeditor5/creator/creator.js';

let createFn3 = () => {};
let destroyFn3 = () => {};

testUtils.createSinonSandbox();

testUtils.defineEditorCreatorMock( 'test1' );
testUtils.defineEditorCreatorMock( 'test2', {
	foo: 1,
	bar: 2
} );
testUtils.defineEditorCreatorMock( 'test3', {
	create: createFn3,
	destroy: destroyFn3
} );

const modules = moduleTestUtils.require( {
	testCreator1: 'creator-test1/creator-test1',
	testCreator2: 'creator-test2/creator-test2',
	testCreator3: 'creator-test3/creator-test3'
} );

///////////////////

let TestCreator1, TestCreator2, TestCreator3;

before( () => {
	TestCreator1 = modules.testCreator1;
	TestCreator2 = modules.testCreator2;
	TestCreator3 = modules.testCreator3;
} );

describe( 'testUtils.defineEditorCreatorMock()', () => {
	it( 'should register all creators', () => {
		expect( TestCreator1.prototype ).to.be.instanceof( Creator );
		expect( TestCreator2.prototype ).to.be.instanceof( Creator );
		expect( TestCreator3.prototype ).to.be.instanceof( Creator );
	} );

	it( 'should copy properties from the second argument', () => {
		expect( TestCreator2.prototype ).to.have.property( 'foo', 1 );
		expect( TestCreator2.prototype ).to.have.property( 'bar', 2 );

		expect( TestCreator3.prototype ).to.have.property( 'create', createFn3 );
		expect( TestCreator3.prototype ).to.have.property( 'destroy', destroyFn3 );
	} );
} );

describe( 'testUtils.createTestUIController()', () => {
	it( 'returns a promise', () => {
		expect( testUtils.createTestUIController() ).to.be.instanceof( Promise );
	} );

	describe( 'controller instance', () => {
		it( 'comes with a view', () => {
			const promise = testUtils.createTestUIController();

			return promise.then( controller => {
				expect( controller.view.element ).to.equal( document.body );
			} );
		} );

		it( 'creates collections and regions', () => {
			const promise = testUtils.createTestUIController( {
				foo: el => el.firstChild,
				bar: el => el.lastChild,
			} );

			promise.then( controller => {
				expect( controller.collections.get( 'foo' ) ).to.be.not.undefined;
				expect( controller.collections.get( 'bar' ) ).to.be.not.undefined;

				expect( controller.view.regions.get( 'foo' ).element ).to.equal( document.body.firstChild );
				expect( controller.view.regions.get( 'bar' ).element ).to.equal( document.body.lastChild );
			} );
		} );

		it( 'is ready', () => {
			const promise = testUtils.createTestUIController( {
				foo: el => el.firstChild,
				bar: el => el.lastChild,
			} );

			promise.then( controller => {
				expect( controller.ready ).to.be.true;
			} );
		} );
	} );
} );
