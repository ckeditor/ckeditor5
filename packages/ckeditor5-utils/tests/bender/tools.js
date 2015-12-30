/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-include: ../_tools/tools.js */

'use strict';

let createFn3 = () => {};
let destroyFn3 = () => {};

bender.tools.core.defineEditorCreatorMock( 'test1' );
bender.tools.core.defineEditorCreatorMock( 'test2', {
	foo: 1,
	bar: 2
} );
bender.tools.core.defineEditorCreatorMock( 'test3', {
	create: createFn3,
	destroy: destroyFn3
} );

const modules = bender.amd.require( 'core/creator', 'creator-test1', 'creator-test2', 'creator-test3' );
let Creator;

///////////////////

before( () => {
	Creator = modules[ 'core/creator' ];
} );

describe( 'bender.tools.core.defineEditorCreatorMock()', () => {
	it( 'should register all creators', () => {
		const TestCreator1 = modules[ 'creator-test1' ];
		const TestCreator2 = modules[ 'creator-test2' ];
		const TestCreator3 = modules[ 'creator-test3' ];

		expect( TestCreator1.prototype ).to.be.instanceof( Creator );
		expect( TestCreator2.prototype ).to.be.instanceof( Creator );
		expect( TestCreator3.prototype ).to.be.instanceof( Creator );
	} );

	it( 'should copy properties from the second argument', () => {
		const TestCreator = modules[ 'creator-test2' ];

		expect( TestCreator.prototype ).to.have.property( 'foo', 1 );
		expect( TestCreator.prototype ).to.have.property( 'bar', 2 );
	} );

	it( 'should create spies for create() and destroy() if not defined', () => {
		const TestCreator1 = modules[ 'creator-test1' ];
		const TestCreator2 = modules[ 'creator-test2' ];
		const TestCreator3 = modules[ 'creator-test3' ];

		expect( TestCreator1.prototype.create ).to.have.property( 'called', false, 'test1.create' );
		expect( TestCreator1.prototype.destroy ).to.have.property( 'called', false, 'test1.destroy' );
		expect( TestCreator2.prototype.create ).to.have.property( 'called', false, 'test2.create' );
		expect( TestCreator2.prototype.destroy ).to.have.property( 'called', false, 'test2.destroy' );

		// Not spies:
		expect( TestCreator3.prototype ).to.have.property( 'create', createFn3 );
		expect( TestCreator3.prototype ).to.have.property( 'destroy', destroyFn3 );
	} );
} );

describe( 'bender.tools.core.getIteratorCount()', () => {
	it( 'should returns number of editable items ', () => {
		const count = bender.tools.core.getIteratorCount( [ 1, 2, 3, 4, 5 ] );
		expect( count ).to.equal( 5 );
	} );
} );