/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Watchdog from '../src/watchdog';

describe( 'Watchdog', () => {
	describe( 'simple scenarios', () => {
		it( 'watchdog should expose `create()` and `destroy()` methods', () => {
			const watchdog = new Watchdog();
			const FakeEditor = getFakeEditor();

			const editorCreateSpy = sinon.spy( FakeEditor, 'create' );
			const editorDestroySpy = sinon.spy( FakeEditor.prototype, 'destroy' );

			watchdog.setCreator( ( el, config ) => FakeEditor.create( el, config ) );
			watchdog.setDestructor( editor => editor.destroy() );

			return watchdog.create()
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
			const FakeEditor = getFakeEditor();

			const editorCreateSpy = sinon.spy( FakeEditor, 'create' );
			const editorDestroySpy = sinon.spy( FakeEditor.prototype, 'destroy' );

			watchdog.setCreator( ( el, config ) => FakeEditor.create( el, config ) );
			watchdog.setDestructor( editor => editor.destroy() );

			return watchdog.create()
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
	} );

	describe( 'editor', () => {
		it( 'should be the current editor used by the Watchdog', () => {
			const watchdog = new Watchdog();
			const FakeEditor = getFakeEditor();

			watchdog.setCreator( ( el, config ) => FakeEditor.create( el, config ) );
			watchdog.setDestructor( editor => editor.destroy() );

			expect( watchdog.editor ).to.be.undefined;

			let oldEditor;

			return watchdog.create()
				.then( () => {
					oldEditor = watchdog.editor;
					expect( watchdog.editor ).to.be.instanceOf( FakeEditor );

					return watchdog.restart();
				} )
				.then( () => {
					expect( watchdog.editor ).to.be.instanceOf( FakeEditor );
					expect( watchdog.editor ).to.not.equal( oldEditor );

					return watchdog.destroy();
				} );
		} );
	} );
} );

function getFakeEditor() {
	return class FakeEditor {
		static create( el, config ) {
			this.el = el;
			this.config = config;

			return Promise.resolve( new this() );
		}

		constructor() {
			this.model = {
				document: {
					version: 0
				}
			};
		}

		getData() {
			return 'foo';
		}

		setData() {

		}

		destroy() {
			return Promise.resolve();
		}
	}
}
