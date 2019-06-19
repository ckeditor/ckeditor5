/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Watchdog from '../src/watchdog';
import { watch } from 'chokidar';

describe( 'Watchdog', () => {
	describe( 'simple scenarios', () => {
		it( '#1', () => {
			const watchdog = new Watchdog();

			const editorCreateSpy = sinon.spy( FakeEditor, 'create' );
			const editorDestroySpy = sinon.spy( FakeEditor.prototype, 'destroy' );

			class FakeEditor {
				static create( el, config ) {
					this.el = el;
					this.config = config;

					return Promise.resolve();
				}

				destroy() {
					return Promise.resolve();
				}
			}

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
} );
