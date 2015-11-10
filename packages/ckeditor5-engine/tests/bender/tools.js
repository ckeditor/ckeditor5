/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-include: ../_tools/tools.js */

'use strict';

var createFn3 = function() {};
var destroyFn3 = function() {};

bender.tools.core.defineEditorCreatorMock( 'test1' );
bender.tools.core.defineEditorCreatorMock( 'test2', {
	foo: 1,
	bar: 2
} );
bender.tools.core.defineEditorCreatorMock( 'test3', {
	create: createFn3,
	destroy: destroyFn3
} );

const modules = bender.amd.require( 'creator', 'plugin!creator-test1', 'plugin!creator-test2', 'plugin!creator-test3' );

///////////////////

describe( 'bender.tools.core.defineEditorCreatorMock()', function() {
	it( 'should register all creators', function() {
		const Creator = modules.creator;
		const TestCreator1 = modules[ 'plugin!creator-test1' ];
		const TestCreator2 = modules[ 'plugin!creator-test2' ];
		const TestCreator3 = modules[ 'plugin!creator-test3' ];

		expect( TestCreator1.prototype ).to.be.instanceof( Creator );
		expect( TestCreator2.prototype ).to.be.instanceof( Creator );
		expect( TestCreator3.prototype ).to.be.instanceof( Creator );
	} );

	it( 'should copy properties from the second argument', function() {
		const TestCreator = modules[ 'plugin!creator-test2' ];

		expect( TestCreator.prototype ).to.have.property( 'foo', 1 );
		expect( TestCreator.prototype ).to.have.property( 'bar', 2 );
	} );

	it( 'should create spies for create() and destroy() if not defined', function() {
		const TestCreator1 = modules[ 'plugin!creator-test1' ];
		const TestCreator2 = modules[ 'plugin!creator-test2' ];
		const TestCreator3 = modules[ 'plugin!creator-test3' ];

		expect( TestCreator1.prototype.create ).to.have.property( 'called', false, 'test1.create' );
		expect( TestCreator1.prototype.destroy ).to.have.property( 'called', false, 'test1.destroy' );
		expect( TestCreator2.prototype.create ).to.have.property( 'called', false, 'test2.create' );
		expect( TestCreator2.prototype.destroy ).to.have.property( 'called', false, 'test2.destroy' );

		// Not spies:
		expect( TestCreator3.prototype ).to.have.property( 'create', createFn3 );
		expect( TestCreator3.prototype ).to.have.property( 'destroy', destroyFn3 );
	} );
} );