/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/* bender-include: ../_tools/tools.js */

const modules = bender.amd.require( 'editor', 'plugin', 'creator', 'ckeditorerror' );
let editor, element;

function initEditor( config ) {
	const Editor = modules.editor;

	element = document.createElement( 'div' );
	document.body.appendChild( element );

	editor = new Editor( element, config );

	return editor.init();
}

bender.tools.createSinonSandbox();

before( () => {
	bender.tools.core.defineEditorCreatorMock( 'test1' );

	bender.tools.core.defineEditorCreatorMock( 'test-any1' );
	bender.tools.core.defineEditorCreatorMock( 'test-any2' );

	bender.tools.core.defineEditorCreatorMock( 'test-config1' );
	bender.tools.core.defineEditorCreatorMock( 'test-config2' );

	CKEDITOR.define( 'plugin!test3', [ 'plugin' ], ( Plugin ) => {
		return class extends Plugin {};
	} );

	CKEDITOR.define( 'plugin!creator-async-create', [ 'creator' ], ( Creator ) => {
		return class extends Creator {
			create() {
				return new Promise( ( resolve, reject ) => {
					reject( new Error( 'Catch me - create.' ) );
				} );
			}

			destroy() {}
		};
	} );

	CKEDITOR.define( 'plugin!creator-async-destroy', [ 'creator' ], ( Creator ) => {
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
		const Creator = modules.creator;

		return initEditor( {
				plugins: 'creator-test1'
			} )
			.then( () => {
				let creator = editor.plugins.get( 'creator-test1' );

				expect( creator ).to.be.instanceof( Creator );

				// The create method has been called.
				sinon.assert.calledOnce( creator.create );
			} );
	} );

	it( 'should instantiate any creator when more than one is available', () => {
		return initEditor( {
				plugins: 'creator-test-any1,creator-test-any2'
			} )
			.then( () => {
				let creator1 = editor.plugins.get( 'creator-test-any1' );
				let creator2 = editor.plugins.get( 'creator-test-any2' );

				expect( creator1.create.called + creator2.create.called ).to.be.equal( 1, 'only one of the creators should be used' );
			} );
	} );

	it( 'should use the creator specified in config.creator', () => {
		return initEditor( {
				creator: 'test-config2',
				plugins: 'creator-test-config1,creator-test-config2',
			} )
			.then( () => {
				let creator1 = editor.plugins.get( 'creator-test-config1' );
				let creator2 = editor.plugins.get( 'creator-test-config2' );

				sinon.assert.calledOnce( creator2.create );
				sinon.assert.notCalled( creator1.create );
			} );
	} );

	it( 'should throw an error if the creator doesn\'t exist', () => {
		const CKEditorError = modules.ckeditorerror;

		return initEditor( {
				creator: 'bad',
				plugins: 'creator-test1'
			} )
			.then( () => {
				throw new Error( 'This should not be executed.' );
			} )
			.catch( ( err ) => {
				expect( err ).to.be.instanceof( CKEditorError );
				expect( err.message ).to.match( /^editor-creator-404:/ );
			} );
	} );

	it( 'should throw an error no creators are defined', () => {
		const CKEditorError = modules.ckeditorerror;

		return initEditor( {} )
			.then( () => {
				throw new Error( 'This should not be executed.' );
			} )
			.catch( ( err ) => {
				expect( err ).to.be.instanceof( CKEditorError );
				expect( err.message ).to.match( /^editor-creator-404:/ );
			} );
	} );

	it( 'should chain the promise from the creator (enables async creators)', () => {
		return initEditor( {
				plugins: 'creator-async-create'
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
				plugins: 'creator-test1'
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
				plugins: 'creator-async-destroy'
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
