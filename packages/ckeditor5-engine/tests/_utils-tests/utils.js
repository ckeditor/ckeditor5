/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import testUtils from '/tests/_utils/utils.js';
import moduleTestUtils from '/tests/_utils/module.js';
import coreTestUtils from '/tests/core/_utils/utils.js';
import Creator from '/ckeditor5/core/creator.js';

let createFn3 = () => {};
let destroyFn3 = () => {};

testUtils.createSinonSandbox();

coreTestUtils.defineEditorCreatorMock( 'test1' );
coreTestUtils.defineEditorCreatorMock( 'test2', {
	foo: 1,
	bar: 2
} );
coreTestUtils.defineEditorCreatorMock( 'test3', {
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

describe( 'coreTestUtils.defineEditorCreatorMock()', () => {
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
