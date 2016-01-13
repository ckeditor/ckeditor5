/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import amdTestUtils from '/tests/_utils/amd.js';
import coreTestUtils from '/tests/core/_utils/utils.js';
import Creator from '/ckeditor5/core/creator.js';

let createFn3 = () => {};
let destroyFn3 = () => {};

coreTestUtils.defineEditorCreatorMock( 'test1' );
coreTestUtils.defineEditorCreatorMock( 'test2', {
	foo: 1,
	bar: 2
} );
coreTestUtils.defineEditorCreatorMock( 'test3', {
	create: createFn3,
	destroy: destroyFn3
} );

const modules = amdTestUtils.require( {
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

describe( 'coreTestUtils.defineEditorCreatorMock()', () => {
	it( 'should register all creators', () => {
		expect( TestCreator1.prototype ).to.be.instanceof( Creator );
		expect( TestCreator2.prototype ).to.be.instanceof( Creator );
		expect( TestCreator3.prototype ).to.be.instanceof( Creator );
	} );

	it( 'should copy properties from the second argument', () => {
		expect( TestCreator2.prototype ).to.have.property( 'foo', 1 );
		expect( TestCreator2.prototype ).to.have.property( 'bar', 2 );
	} );

	it( 'should create spies for create() and destroy() if not defined', () => {
		expect( TestCreator1.prototype.create ).to.have.property( 'called', false, 'test1.create' );
		expect( TestCreator1.prototype.destroy ).to.have.property( 'called', false, 'test1.destroy' );
		expect( TestCreator2.prototype.create ).to.have.property( 'called', false, 'test2.create' );
		expect( TestCreator2.prototype.destroy ).to.have.property( 'called', false, 'test2.destroy' );

		// Not spies:
		expect( TestCreator3.prototype ).to.have.property( 'create', createFn3 );
		expect( TestCreator3.prototype ).to.have.property( 'destroy', destroyFn3 );
	} );
} );

describe( 'coreTestUtils.getIteratorCount()', () => {
	it( 'should returns number of editable items ', () => {
		const count = coreTestUtils.getIteratorCount( [ 1, 2, 3, 4, 5 ] );
		expect( count ).to.equal( 5 );
	} );
} );
