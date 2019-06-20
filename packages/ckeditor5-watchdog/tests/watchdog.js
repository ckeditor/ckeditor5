/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Watchdog from '../src/watchdog';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'Watchdog', () => {
	testUtils.createSinonSandbox();

	describe( 'create()', () => {
		it( 'should create an editor instance', () => {
			const watchdog = new Watchdog();

			const editorCreateSpy = testUtils.sinon.spy( VirtualTestEditor, 'create' );
			const editorDestroySpy = testUtils.sinon.spy( VirtualTestEditor.prototype, 'destroy' );

			watchdog.setCreator( ( el, config ) => VirtualTestEditor.create( el, config ) );
			watchdog.setDestructor( editor => editor.destroy() );

			return watchdog.create( document.createElement( 'div' ), {} )
				.then( () => {
					sinon.assert.calledOnce( editorCreateSpy );
					sinon.assert.notCalled( editorDestroySpy );

					return watchdog.destroy();
				} )
				.then( () => {
					sinon.assert.calledOnce( editorCreateSpy );
					sinon.assert.calledOnce( editorDestroySpy );
				} )
		} );
	} );

	describe( 'restart()', () => {
		it( 'should restart the editor', () => {
			const watchdog = new Watchdog();

			const editorCreateSpy = testUtils.sinon.spy( VirtualTestEditor, 'create' );
			const editorDestroySpy = testUtils.sinon.spy( VirtualTestEditor.prototype, 'destroy' );

			watchdog.setCreator( ( el, config ) => VirtualTestEditor.create( el, config ) );
			watchdog.setDestructor( editor => editor.destroy() );

			return watchdog.create( document.createElement( 'div' ), {} )
				.then( () => {
					sinon.assert.calledOnce( editorCreateSpy );
					sinon.assert.notCalled( editorDestroySpy );

					return watchdog.restart();
				} )
				.then( () => {
					sinon.assert.calledTwice( editorCreateSpy );
					sinon.assert.calledOnce( editorDestroySpy );

					return watchdog.destroy();
				} );
		} );

		it( 'should restart the editor with the same data', () => {
			const watchdog = new Watchdog();

			// VirtualTestEditor doesn't handle the `config.initialData` properly.
			const FakeEditor = getFakeEditor();

			watchdog.setCreator( ( el, config ) => FakeEditor.create( el, config ) );
			watchdog.setDestructor( editor => editor.destroy() );

			return watchdog.create( document.createElement( 'div' ), { initialData: 'foo' } )
				.then( () => {
					expect( watchdog.editor.getData() ).to.equal( 'foo' );

					return watchdog.restart();
				} )
				.then( () => {
					expect( watchdog.editor.getData() ).to.equal( 'foo' );

					return watchdog.destroy();
				} );
		} );
	} );

	describe( 'editor', () => {
		it( 'should be the current editor instance', () => {
			const watchdog = new Watchdog();

			watchdog.setCreator( ( el, config ) => VirtualTestEditor.create( el, config ) );
			watchdog.setDestructor( editor => editor.destroy() );

			expect( watchdog.editor ).to.be.null;

			let oldEditor;

			return watchdog.create( document.createElement( 'div' ), {} )
				.then( () => {
					oldEditor = watchdog.editor;
					expect( watchdog.editor ).to.be.instanceOf( VirtualTestEditor );

					return watchdog.restart();
				} )
				.then( () => {
					expect( watchdog.editor ).to.be.instanceOf( VirtualTestEditor );
					expect( watchdog.editor ).to.not.equal( oldEditor );

					return watchdog.destroy();
				} )
				.then( () => {
					expect( watchdog.editor ).to.be.null;
				} );
		} );
	} );

	describe( 'error handling', () => {
		it( 'Watchdog should not restart editor during the initialization', () => {
			const watchdog = new Watchdog();

			watchdog.setCreator( () => Promise.reject( new Error( 'foo' ) ) );
			watchdog.setDestructor( () => { } );

			return watchdog.create( document.createElement( 'div' ) ).then(
				() => { throw new Error( '`watchdog.create()` should throw an error.' ) },
				err => {
					expect( err ).to.be.instanceOf( Error );
					expect( err.message ).to.equal( 'foo' );
				}
			);
		} );

		it( 'Watchdog should not restart editor during the destroy', () => {
			const watchdog = new Watchdog();

			watchdog.setCreator( el => VirtualTestEditor.create( el ) );
			watchdog.setDestructor( () => Promise.reject( new Error( 'foo' ) ) );

			return Promise.resolve()
				.then( () => watchdog.create( document.createElement( 'div' ) ) )
				.then( () => watchdog.destroy() )
				.then(
					() => { throw new Error( '`watchdog.create()` should throw an error.' ) },
					err => {
						expect( err ).to.be.instanceOf( Error );
						expect( err.message ).to.equal( 'foo' );
					}
				);
		} );
	} );
} );

function getFakeEditor() {
	return class FakeEditor {
		static create( el, config ) {
			const editor = new this();

			return Promise.resolve()
				.then( () => editor.create( el, config ) );
		}

		create( el, config ) {
			this.el = el;
			this.config = config;
			this._data = config.initialData || '';

			return this;
		}

		constructor() {
			this.model = {
				document: {
					version: 0
				}
			};
		}

		getData() {
			return this._data;
		}

		destroy() {
			this.el.remove();

			return Promise.resolve();
		}
	}
}
