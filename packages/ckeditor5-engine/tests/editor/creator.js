/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import amdUtils from '/tests/_utils/amd.js';
import testUtils from '/tests/_utils/utils.js';
import coreTestUtils from '/tests/core/_utils/utils.js';
import Editor from '/ckeditor5/core/editor.js';
import Creator from '/ckeditor5/core/creator.js';
import CKEditorError from '/ckeditor5/core/ckeditorerror.js';

let editor, element;

function initEditor( config ) {
	element = document.createElement( 'div' );
	document.body.appendChild( element );

	editor = new Editor( element, config );

	return editor.init();
}

testUtils.createSinonSandbox();

before( () => {
	coreTestUtils.defineEditorCreatorMock( 'test1' );

	coreTestUtils.defineEditorCreatorMock( 'test-throw-on-many1' );
	coreTestUtils.defineEditorCreatorMock( 'test-throw-on-many2' );

	coreTestUtils.defineEditorCreatorMock( 'test-config1' );
	coreTestUtils.defineEditorCreatorMock( 'test-config2' );

	amdUtils.define( 'test3', [ 'core/plugin' ], ( Plugin ) => {
		return class extends Plugin {};
	} );

	amdUtils.define( 'creator-async-create', [ 'core/creator' ], ( Creator ) => {
		return class extends Creator {
			create() {
				return new Promise( ( resolve, reject ) => {
					reject( new Error( 'Catch me - create.' ) );
				} );
			}

			destroy() {}
		};
	} );

	amdUtils.define( 'creator-async-destroy', [ 'core/creator' ], ( Creator ) => {
		return class extends Creator {
			create() {}

			destroy() {
				return new Promise( ( resolve, reject ) => {
					reject( new Error( 'Catch me - destroy.' ) );
				} );
			}
		};
	} );
} );

afterEach( () => {
	editor = null; // To make sure we're using the freshly inited editor.
} );

///////////////////

describe( 'init', () => {
	it( 'should instantiate the creator and call create()', () => {
		return initEditor( {
				creator: 'creator-test1'
			} )
			.then( () => {
				let creator = editor.plugins.get( 'creator-test1' );

				expect( creator ).to.be.instanceof( Creator );

				// The create method has been called.
				sinon.assert.calledOnce( creator.create );
			} );
	} );

	it( 'should throw if creator is not defined', () => {
		return initEditor( {} )
			.then( () => {
				throw new Error( 'This should not be executed.' );
			} )
			.catch( ( err ) => {
				expect( err ).to.be.instanceof( CKEditorError );
				expect( err.message ).to.match( /^editor-undefined-creator:/ );
			} );
	} );

	it( 'should use the creator specified in config.creator', () => {
		return initEditor( {
				creator: 'creator-test-config2',
				features: [ 'creator-test-config1', 'creator-test-config2' ],
			} )
			.then( () => {
				let creator1 = editor.plugins.get( 'creator-test-config1' );
				let creator2 = editor.plugins.get( 'creator-test-config2' );

				sinon.assert.calledOnce( creator2.create );
				sinon.assert.notCalled( creator1.create );
			} );
	} );

	it( 'should throw an error if the creator doesn\'t exist', () => {
		return initEditor( {
				creator: 'bad'
			} )
			.then( () => {
				throw new Error( 'This should not be executed.' );
			} )
			.catch( ( err ) => {
				// It's the Require.JS error.
				expect( err ).to.be.an.instanceof( Error );
				expect( err.message ).to.match( /^Script error for/ );
			} );
	} );

	it( 'should chain the promise from the creator (enables async creators)', () => {
		return initEditor( {
				creator: 'creator-async-create'
			} )
			.then( () => {
				throw new Error( 'This should not be executed.' );
			} )
			.catch( ( err ) => {
				// Unfortunately fake timers don't work with promises, so throwing in the creator's create()
				// seems to be the only way to test that the promise chain isn't broken.
				expect( err ).to.have.property( 'message', 'Catch me - create.' );
			} );
	} );
} );

describe( 'destroy', () => {
	it( 'should call "destroy" on the creator', () => {
		let creator1;

		return initEditor( {
				creator: 'creator-test1'
			} )
			.then( () => {
				creator1 = editor.plugins.get( 'creator-test1' );

				return editor.destroy();
			} )
			.then( () => {
				sinon.assert.calledOnce( creator1.destroy );
			} );
	} );

	it( 'should chain the promise from the creator (enables async creators)', () => {
		return initEditor( {
				creator: 'creator-async-destroy'
			} )
			.then( () => {
				return editor.destroy();
			} )
			.then( () => {
				throw new Error( 'This should not be executed.' );
			} )
			.catch( ( err ) => {
				// Unfortunately fake timers don't work with promises, so throwing in the creator's destroy()
				// seems to be the only way to test that the promise chain isn't broken.
				expect( err ).to.have.property( 'message', 'Catch me - destroy.' );
			} );
	} );
} );
