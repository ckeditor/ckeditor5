/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals setTimeout, window, console, document */

import Watchdog from '../src/watchdog';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

describe( 'Watchdog', () => {
	afterEach( () => sinon.restore() );

	describe( 'create()', () => {
		it( 'should create an editor instance', () => {
			const watchdog = new Watchdog();

			const editorCreateSpy = sinon.spy( FakeEditor, 'create' );
			const editorDestroySpy = sinon.spy( FakeEditor.prototype, 'destroy' );

			watchdog.setCreator( ( el, config ) => FakeEditor.create( el, config ) );
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
				} );
		} );

		it( 'should throw an error when the creator is not defined', () => {
			const watchdog = new Watchdog();
			watchdog.setDestructor( editor => editor.destroy() );

			expect( () => watchdog.create() ).to.throw( CKEditorError, /^watchdog-creator-not-defined/ );
		} );

		it( 'should throw an error when the destructor is not defined', () => {
			const watchdog = new Watchdog();
			watchdog.setCreator( ( el, config ) => FakeEditor.create( el, config ) );

			expect( () => watchdog.create() ).to.throw( CKEditorError, /^watchdog-destructor-not-defined/ );
		} );
	} );

	describe( 'restart()', () => {
		it( 'should restart the editor', () => {
			const watchdog = new Watchdog();

			const editorCreateSpy = sinon.spy( FakeEditor, 'create' );
			const editorDestroySpy = sinon.spy( FakeEditor.prototype, 'destroy' );

			watchdog.setCreator( ( el, config ) => FakeEditor.create( el, config ) );
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

			watchdog.setCreator( ( el, config ) => FakeEditor.create( el, config ) );
			watchdog.setDestructor( editor => editor.destroy() );

			return watchdog.create( document.createElement( 'div' ), {
				initialData: '<p>foo</p>',
				plugins: [ Paragraph ]
			} )
				.then( () => {
					expect( watchdog.editor.getData() ).to.equal( '<p>foo</p>' );

					return watchdog.restart();
				} )
				.then( () => {
					expect( watchdog.editor.getData() ).to.equal( '<p>foo</p>' );

					return watchdog.destroy();
				} );
		} );
	} );

	describe( 'editor', () => {
		it( 'should be the current editor instance', () => {
			const watchdog = new Watchdog();

			watchdog.setCreator( ( el, config ) => FakeEditor.create( el, config ) );
			watchdog.setDestructor( editor => editor.destroy() );

			expect( watchdog.editor ).to.be.null;

			let oldEditor;

			return watchdog.create( document.createElement( 'div' ), {} )
				.then( () => {
					oldEditor = watchdog.editor;
					expect( watchdog.editor ).to.be.instanceOf( FakeEditor );

					return watchdog.restart();
				} )
				.then( () => {
					expect( watchdog.editor ).to.be.instanceOf( FakeEditor );
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

			watchdog.setCreator( el =>
				FakeEditor.create( el )
					.then( () => Promise.reject( new Error( 'foo' ) ) )
			);
			watchdog.setDestructor( editor => editor.destroy() );

			return watchdog.create( document.createElement( 'div' ) ).then(
				() => { throw new Error( '`watchdog.create()` should throw an error.' ); },
				err => {
					expect( err ).to.be.instanceOf( Error );
					expect( err.message ).to.equal( 'foo' );
				}
			);
		} );

		it( 'Watchdog should not restart editor during the destroy', () => {
			const watchdog = new Watchdog();

			watchdog.setCreator( el => FakeEditor.create( el ) );
			watchdog.setDestructor( () => Promise.reject( new Error( 'foo' ) ) );

			return Promise.resolve()
				.then( () => watchdog.create( document.createElement( 'div' ) ) )
				.then( () => watchdog.destroy() )
				.then(
					() => { throw new Error( '`watchdog.create()` should throw an error.' ); },
					err => {
						expect( err ).to.be.instanceOf( Error );
						expect( err.message ).to.equal( 'foo' );
					}
				);
		} );

		it( 'Watchdog should intercept editor errors and restart the editor during the runtime', () => {
			const watchdog = new Watchdog();

			watchdog.setCreator( ( el, config ) => FakeEditor.create( el, config ) );
			watchdog.setDestructor( editor => editor.destroy() );

			// sinon.stub( window, 'onerror' ).value( undefined ); and similar don't work.
			const originalErrorHandler = window.onerror;
			window.onerror = undefined;

			return watchdog.create( document.createElement( 'div' ) ).then( () => {
				setTimeout( () => {
					throw new CKEditorError( 'foo', undefined, watchdog.editor );
				} );

				return new Promise( res => {
					watchdog.on( 'restart', () => {
						window.onerror = originalErrorHandler;

						watchdog.destroy().then( res );
					} );
				} );
			} );
		} );

		it( 'Watchdog should not hide intercepted errors', () => {
			const watchdog = new Watchdog();

			watchdog.setCreator( ( el, config ) => FakeEditor.create( el, config ) );
			watchdog.setDestructor( editor => editor.destroy() );

			// sinon.stub( window, 'onerror' ).value( undefined ); and similar don't work.
			const originalErrorHandler = window.onerror;
			const windowErrorSpy = sinon.spy();
			window.onerror = windowErrorSpy;

			return watchdog.create( document.createElement( 'div' ) ).then( () => {
				setTimeout( () => {
					throw new CKEditorError( 'foo', undefined, watchdog.editor );
				} );

				return new Promise( res => {
					watchdog.on( 'restart', () => {
						window.onerror = originalErrorHandler;

						sinon.assert.calledOnce( windowErrorSpy );
						expect( windowErrorSpy.getCall( 0 ).args[ 0 ] ).to.equal( 'Uncaught CKEditorError: foo' );

						watchdog.destroy().then( res );
					} );
				} );
			} );
		} );

		it( 'Watchdog should intercept editor errors and restart the editor during the runtime', () => {
			const watchdog = new Watchdog();

			watchdog.setCreator( ( el, config ) => FakeEditor.create( el, config ) );
			watchdog.setDestructor( editor => editor.destroy() );

			// sinon.stub( window, 'onerror' ).value( undefined ); and similar don't work.
			const originalErrorHandler = window.onerror;
			window.onerror = undefined;

			return watchdog.create( document.createElement( 'div' ) ).then( () => {
				setTimeout( () => {
					throw new CKEditorError( 'foo', undefined, watchdog.editor );
				} );

				return new Promise( res => {
					watchdog.on( 'restart', () => {
						window.onerror = originalErrorHandler;

						watchdog.destroy().then( res );
					} );
				} );
			} );
		} );

		it( 'Watchdog should not intercept non-editor errors', () => {
			const watchdog = new Watchdog();

			watchdog.setCreator( ( el, config ) => FakeEditor.create( el, config ) );
			watchdog.setDestructor( editor => editor.destroy() );

			const editorErrorSpy = sinon.spy();
			watchdog.on( 'error', editorErrorSpy );

			// sinon.stub( window, 'onerror' ).value( undefined ); and similar don't work.
			const originalErrorHandler = window.onerror;
			window.onerror = undefined;

			return watchdog.create( document.createElement( 'div' ) ).then( () => {
				setTimeout( () => {
					throw new Error( 'foo' );
				} );

				return new Promise( res => {
					setTimeout( () => {
						window.onerror = originalErrorHandler;

						sinon.assert.notCalled( editorErrorSpy );

						watchdog.destroy().then( res );
					}, 5 );
				} );
			} );
		} );

		it( 'Watchdog should not intercept other editor errors', () => {
			const watchdog1 = new Watchdog();
			const watchdog2 = new Watchdog();

			watchdog1.setCreator( ( el, config ) => FakeEditor.create( el, config ) );
			watchdog1.setDestructor( editor => editor.destroy() );

			watchdog2.setCreator( ( el, config ) => FakeEditor.create( el, config ) );
			watchdog2.setDestructor( editor => editor.destroy() );

			// sinon.stub( window, 'onerror' ).value( undefined ); and similar don't work.
			const originalErrorHandler = window.onerror;
			window.onerror = undefined;

			return Promise.all( [
				watchdog1.create( document.createElement( 'div' ) ),
				watchdog2.create( document.createElement( 'div' ) )
			] ).then( () => {
				return new Promise( res => {
					const watchdog1ErrorSpy = sinon.spy();
					const watchdog2ErrorSpy = sinon.spy();

					watchdog1.on( 'restart', watchdog1ErrorSpy );
					watchdog2.on( 'restart', watchdog2ErrorSpy );

					setTimeout( () => {
						throw new CKEditorError( 'foo', undefined, watchdog2.editor );
					} );

					// TODO - timing.
					setTimeout( () => {
						window.onerror = originalErrorHandler;

						sinon.assert.notCalled( watchdog1ErrorSpy );
						sinon.assert.calledOnce( watchdog2ErrorSpy );

						Promise.all( [ watchdog1.destroy(), watchdog2.destroy() ] )
							.then( res );
					}, 5 );
				} );
			} );
		} );

		it( 'Watchdog should intercept editor errors and restart the editor if the editor can be found from the ctx', () => {
			const watchdog = new Watchdog();

			watchdog.setCreator( ( el, config ) => FakeEditor.create( el, config ) );
			watchdog.setDestructor( editor => editor.destroy() );

			// sinon.stub( window, 'onerror' ).value( undefined ); and similar don't work.
			const originalErrorHandler = window.onerror;
			window.onerror = undefined;

			return watchdog.create( document.createElement( 'div' ) ).then( () => {
				setTimeout( () => {
					throw new CKEditorError( 'foo', undefined, watchdog.editor.model.document );
				} );

				return new Promise( res => {
					watchdog.on( 'restart', () => {
						window.onerror = originalErrorHandler;

						watchdog.destroy().then( res );
					} );
				} );
			} );
		} );

		it( 'Watchdog should intercept editor errors and restart the editor if the editor can be found from the ctx #2', () => {
			const watchdog = new Watchdog();

			watchdog.setCreator( ( el, config ) => FakeEditor.create( el, config ) );
			watchdog.setDestructor( editor => editor.destroy() );

			// sinon.stub( window, 'onerror' ).value( undefined ); and similar don't work.
			const originalErrorHandler = window.onerror;
			window.onerror = undefined;

			return watchdog.create( document.createElement( 'div' ) ).then( () => {
				setTimeout( () => {
					throw new CKEditorError( 'foo', undefined, { foo: [ 1, 2, 3, { bar: watchdog.editor } ] } );
				} );

				return new Promise( res => {
					watchdog.on( 'restart', () => {
						window.onerror = originalErrorHandler;

						watchdog.destroy().then( res );
					} );
				} );
			} );
		} );

		it( 'editor should be restarted maximum 3 times by default', () => {
			const watchdog = new Watchdog();

			watchdog.setCreator( ( el, config ) => FakeEditor.create( el, config ) );
			watchdog.setDestructor( editor => editor.destroy() );

			const errorSpy = sinon.spy();
			watchdog.on( 'error', errorSpy );

			const restartSpy = sinon.spy();
			watchdog.on( 'restart', restartSpy );

			// sinon.stub( window, 'onerror' ).value( undefined ); and similar don't work.
			const originalErrorHandler = window.onerror;
			window.onerror = undefined;

			return watchdog.create( document.createElement( 'div' ) ).then( () => {
				setTimeout( () => throwCKEditorError( 'foo1', watchdog.editor ) );
				setTimeout( () => throwCKEditorError( 'foo2', watchdog.editor ) );
				setTimeout( () => throwCKEditorError( 'foo3', watchdog.editor ) );
				setTimeout( () => throwCKEditorError( 'foo4', watchdog.editor ) );

				return new Promise( res => {
					setTimeout( () => {
						expect( errorSpy.callCount ).to.equal( 4 );
						expect( watchdog.crashes.length ).to.equal( 4 );
						expect( restartSpy.callCount ).to.equal( 3 );

						window.onerror = originalErrorHandler;

						watchdog.destroy().then( res );
					}, 5 );
				} );
			} );
		} );

		it( 'editor should be restarted maximum of `crashNumberLimit` if the option is set', () => {
			const watchdog = new Watchdog( { crashNumberLimit: 2 } );

			watchdog.setCreator( ( el, config ) => FakeEditor.create( el, config ) );
			watchdog.setDestructor( editor => editor.destroy() );

			const errorSpy = sinon.spy();
			watchdog.on( 'error', errorSpy );

			const restartSpy = sinon.spy();
			watchdog.on( 'restart', restartSpy );

			// sinon.stub( window, 'onerror' ).value( undefined ); and similar don't work.
			const originalErrorHandler = window.onerror;
			window.onerror = undefined;

			return watchdog.create( document.createElement( 'div' ) ).then( () => {
				setTimeout( () => throwCKEditorError( 'foo1', watchdog.editor ) );
				setTimeout( () => throwCKEditorError( 'foo2', watchdog.editor ) );
				setTimeout( () => throwCKEditorError( 'foo3', watchdog.editor ) );
				setTimeout( () => throwCKEditorError( 'foo4', watchdog.editor ) );

				return new Promise( res => {
					setTimeout( () => {
						expect( errorSpy.callCount ).to.equal( 4 );
						expect( watchdog.crashes.length ).to.equal( 4 );
						expect( restartSpy.callCount ).to.equal( 2 );

						window.onerror = originalErrorHandler;

						watchdog.destroy().then( res );
					}, 5 );
				} );
			} );
		} );

		it( 'Watchdog should warn if the CKEditorError missing its context', () => {
			const watchdog = new Watchdog();

			watchdog.setCreator( ( el, config ) => FakeEditor.create( el, config ) );
			watchdog.setDestructor( editor => editor.destroy() );

			// sinon.stub( window, 'onerror' ).value( undefined ); and similar don't work.
			const originalErrorHandler = window.onerror;
			window.onerror = undefined;

			sinon.stub( console, 'error' );

			return watchdog.create( document.createElement( 'div' ) ).then( () => {
				setTimeout( () => throwCKEditorError( 'foo' ) );

				return new Promise( res => {
					setTimeout( () => {
						window.onerror = originalErrorHandler;

						expect( watchdog.crashes ).to.deep.equal( [] );

						sinon.assert.calledOnce( console.error );
						sinon.assert.calledWithExactly(
							console.error,
							'The error is missing its context and Watchdog cannot restart the proper editor.'
						);

						watchdog.destroy().then( res );
					}, 5 );
				} );
			} );
		} );

		it( 'editor should be restarted with the data before the crash #1', () => {
			const watchdog = new Watchdog();

			watchdog.setCreator( ( el, config ) => FakeEditor.create( el, config ) );
			watchdog.setDestructor( editor => editor.destroy() );

			// sinon.stub( window, 'onerror' ).value( undefined ); and similar don't work.
			const originalErrorHandler = window.onerror;
			window.onerror = undefined;

			return watchdog.create( document.createElement( 'div' ), {
				initialData: '<p>foo</p>',
				plugins: [ Paragraph ]
			} ).then( () => {
				setTimeout( () => throwCKEditorError( 'foo', watchdog.editor ) );

				return new Promise( res => {
					watchdog.on( 'restart', () => {
						window.onerror = originalErrorHandler;

						expect( watchdog.editor.getData() ).to.equal( '<p>foo</p>' );

						watchdog.destroy().then( res );
					} );
				} );
			} );
		} );

		it( 'editor should be restarted with the data before the crash #2', () => {
			const watchdog = new Watchdog();

			watchdog.setCreator( ( el, config ) => FakeEditor.create( el, config ) );
			watchdog.setDestructor( editor => editor.destroy() );

			// sinon.stub( window, 'onerror' ).value( undefined ); and similar don't work.
			const originalErrorHandler = window.onerror;
			window.onerror = undefined;

			return watchdog.create( document.createElement( 'div' ), {
				initialData: '<p>foo</p>',
				plugins: [ Paragraph ]
			} ).then( () => {
				const doc = watchdog.editor.model.document;

				watchdog.editor.model.change( writer => {
					writer.insertText( 'bar', writer.createPositionAt( doc.getRoot(), 1 ) );
				} );

				setTimeout( () => throwCKEditorError( 'foo', watchdog.editor ) );

				return new Promise( res => {
					watchdog.on( 'restart', () => {
						window.onerror = originalErrorHandler;

						console.log( watchdog.editor.getData() );
						expect( watchdog.editor.getData() ).to.equal( '<p>foo</p><p>bar</p>' );

						watchdog.destroy().then( res );
					} );
				} );
			} );
		} );

		it( 'editor should be restarted with the data of the latest document version before the crash', () => {
			const watchdog = new Watchdog();

			watchdog.setCreator( ( el, config ) => FakeEditor.create( el, config ) );
			watchdog.setDestructor( editor => editor.destroy() );

			// sinon.stub( window, 'onerror' ).value( undefined ); and similar don't work.
			const originalErrorHandler = window.onerror;
			window.onerror = undefined;

			return watchdog.create( document.createElement( 'div' ), {
				initialData: '<p>foo</p>',
				plugins: [ Paragraph ]
			} ).then( () => {
				const doc = watchdog.editor.model.document;

				watchdog.editor.model.document.version = -1000;
				watchdog.editor.model.change( writer => {
					writer.insertText( 'bar', writer.createPositionAt( doc.getRoot(), 1 ) );
				} );

				setTimeout( () => throwCKEditorError( 'foo', watchdog.editor ) );

				return new Promise( res => {
					watchdog.on( 'restart', () => {
						window.onerror = originalErrorHandler;

						expect( watchdog.editor.getData() ).to.equal( '<p>foo</p>' );

						watchdog.destroy().then( res );
					} );
				} );
			} );
		} );
	} );

	describe( 'crashes', () => {
		it( 'should be an array of caught errors by the Watchdog', () => {
			const watchdog = new Watchdog();

			watchdog.setCreator( ( el, config ) => FakeEditor.create( el, config ) );
			watchdog.setDestructor( editor => editor.destroy() );

			// sinon.stub( window, 'onerror' ).value( undefined ); and similar don't work.
			const originalErrorHandler = window.onerror;
			window.onerror = undefined;

			return watchdog.create( document.createElement( 'div' ) ).then( () => {
				setTimeout( () => throwCKEditorError( 'foo', watchdog.editor ) );
				setTimeout( () => throwCKEditorError( 'bar', watchdog.editor ) );

				return new Promise( res => {
					// TODO - timing.
					setTimeout( () => {
						window.onerror = originalErrorHandler;

						expect( watchdog.crashes[ 0 ].message ).to.equal( 'foo' );
						expect( watchdog.crashes[ 1 ].message ).to.equal( 'bar' );

						watchdog.destroy().then( res );
					}, 5 );
				} );
			} );
		} );
	} );
} );

// Wrap Editor to follow the API.
class FakeEditor extends VirtualTestEditor {
	static create( elementOrData, config ) {
		return super.create( config );
	}
}

function throwCKEditorError( name, ctx ) {
	throw new CKEditorError( name, undefined, ctx );
}
