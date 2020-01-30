/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, setTimeout, window, console */

import ContextWatchdog from '../src/contextwatchdog';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Context from '@ckeditor/ckeditor5-core/src/context';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

describe( 'ContextWatchdog', () => {
	let element1, element2;
	let watchdog;
	let originalErrorHandler;

	beforeEach( () => {
		element1 = document.createElement( 'div' );
		element2 = document.createElement( 'div' );

		document.body.appendChild( element1 );
		document.body.appendChild( element2 );

		originalErrorHandler = window.onerror;
		window.onerror = sinon.spy();
	} );

	afterEach( () => {
		window.onerror = originalErrorHandler;

		element1.remove();
		element2.remove();

		sinon.restore();
	} );

	it( 'should disable adding items once the Watchdog is destroyed', async () => {
		watchdog = ContextWatchdog.for( Context, {} );

		await watchdog.destroy();

		let err;

		try {
			await watchdog.add( {
				editor2: {
					type: 'editor',
					creator: ( el, config ) => ClassicTestEditor.create( el, config ),
					sourceElementOrData: element1,
					config: {}
				},
			} );
		} catch ( _err ) {
			err = _err;
		}

		expect( err ).to.be.instanceOf( Error );
		expect( err.message ).to.match( /Cannot add items to destroyed watchdog\./ );
	} );

	it.skip( 'case: editor, contextItem', async () => {
		watchdog = ContextWatchdog.for( Context, {} );

		watchdog.add( {
			editor1: {
				type: 'editor',
				creator: ( el, config ) => ClassicTestEditor.create( el, config ),
				sourceElementOrData: element1,
				config: {}
			},
			annotatedInput: {
				type: 'contextItem',
				creator: () => { }
			}
		} );

		await watchdog.waitForReady();

		await watchdog.destroy();
	} );

	describe( 'for scenario with no items', () => {
		it( 'should create only context', async () => {
			watchdog = ContextWatchdog.for( Context, {} );

			await watchdog.waitForReady();

			expect( watchdog.context ).to.be.instanceOf( Context );

			await watchdog.destroy();
		} );

		it( 'should have proper states', async () => {
			watchdog = ContextWatchdog.for( Context, {} );

			expect( watchdog.state ).to.equal( 'initializing' );

			await watchdog.waitForReady();

			expect( watchdog.state ).to.equal( 'ready' );

			await watchdog.destroy();

			expect( watchdog.state ).to.equal( 'destroyed' );
		} );

		it( 'should set custom destructor if provided', async () => {
			const mainWatchdog = new ContextWatchdog();
			const customDestructor = sinon.spy( context => context.destroy() );

			mainWatchdog.setCreator( config => Context.create( config ) );
			mainWatchdog.setDestructor( customDestructor );
			mainWatchdog.create();

			await mainWatchdog.destroy();

			sinon.assert.calledOnce( customDestructor );
		} );

		it( 'should log if an error happens during the component destructing', async () => {
			const mainWatchdog = new ContextWatchdog();

			const consoleErrorStub = sinon.stub( console, 'error' );
			const err = new Error( 'foo' );
			mainWatchdog.setCreator( config => Context.create( config ) );
			mainWatchdog.setDestructor( async editor => {
				await editor.destroy();

				throw err;
			} );

			await mainWatchdog.create();

			await mainWatchdog._restart();

			sinon.assert.calledWith(
				consoleErrorStub,
				'An error happened during destructing.',
				err
			);

			mainWatchdog.setDestructor( editor => editor.destroy() );

			await mainWatchdog.destroy();
		} );

		it( 'should handle the Watchdog configuration', async () => {
			// TODO
			const mainWatchdog = ContextWatchdog.for( Context, {}, {
				crashNumberLimit: Infinity
			} );

			await mainWatchdog.create();

			await mainWatchdog.destroy();
		} );

		describe( 'in case of error handling', () => {
			it( 'should restart the `Context`', async () => {
				watchdog = ContextWatchdog.for( Context, {} );
				const errorSpy = sinon.spy();

				await watchdog.waitForReady();

				const oldContext = watchdog.context;

				watchdog.on( 'restart', errorSpy );

				setTimeout( () => throwCKEditorError( 'foo', watchdog.context ) );

				await waitCycle();

				sinon.assert.calledOnce( errorSpy );

				expect( watchdog.context ).to.not.equal( oldContext );
			} );
		} );
	} );

	describe( 'for multiple items scenario', () => {
		it( 'should allow adding multiple items without waiting for promises', async () => {
			watchdog = ContextWatchdog.for( Context, {} );

			watchdog.add( {
				editor1: {
					type: 'editor',
					creator: ( el, config ) => ClassicTestEditor.create( el, config ),
					sourceElementOrData: element1,
					config: {}
				},
			} );

			watchdog.add( {
				editor2: {
					type: 'editor',
					creator: ( el, config ) => ClassicTestEditor.create( el, config ),
					sourceElementOrData: element2,
					config: {}
				},
			} );

			await watchdog.waitForReady();

			await watchdog.destroy();
		} );

		it( 'should throw when multiple items with the same name are added', async () => {
			watchdog = ContextWatchdog.for( Context, {} );

			watchdog.add( {
				editor1: {
					type: 'editor',
					creator: ( el, config ) => ClassicTestEditor.create( el, config ),
					sourceElementOrData: element1,
					config: {}
				},
			} );

			await watchdog.waitForReady();

			let err;
			try {
				await watchdog.add( {
					editor1: {
						type: 'editor',
						creator: ( el, config ) => ClassicTestEditor.create( el, config ),
						sourceElementOrData: element1,
						config: {}
					},
				} );
			} catch ( _err ) {
				err = _err;
			}

			watchdog._actionQueue._clear();

			await watchdog.destroy();

			expect( err ).to.be.instanceOf( Error );
			expect( err.message ).to.match( /Item with the given name is already added: 'editor1'./ );
		} );

		it( 'should throw when not added item is removed', async () => {
			watchdog = ContextWatchdog.for( Context, {} );

			await watchdog.waitForReady();

			let err;

			try {
				await watchdog.remove( [ 'foo' ] );
			} catch ( _err ) {
				err = _err;
			}

			watchdog._actionQueue._clear();

			await watchdog.destroy();

			expect( err ).to.be.instanceOf( Error );
			expect( err.message ).to.match( /There is no watchdog named: 'foo'\./ );
		} );

		it( 'should throw when the item is added before the context is created', async () => {
			const mainWatchdog = new ContextWatchdog( {}, {} );

			let err;
			try {
				await mainWatchdog.add( {} );
			} catch ( _err ) {
				err = _err;
			}

			expect( err ).to.be.instanceOf( Error );
			expect( err.message ).to.match(
				/Context was not created yet\. You should call the `ContextWatchdog#create\(\)` method first\./
			);
		} );

		it( 'should allow setting editor custom destructors', async () => {
			watchdog = ContextWatchdog.for( Context, {} );

			const destructorSpy = sinon.spy( editor => editor.destroy() );

			watchdog.add( {
				editor1: {
					type: 'editor',
					creator: ( el, config ) => ClassicTestEditor.create( el, config ),
					destructor: destructorSpy,
					sourceElementOrData: element1,
					config: {},
				},
			} );

			await watchdog.destroy();

			sinon.assert.calledOnce( destructorSpy );
		} );

		it( 'should throw when the item is of not known type', async () => {
			watchdog = ContextWatchdog.for( Context, {} );

			await watchdog.waitForReady();

			let err;
			try {
				await watchdog.add( {
					editor1: {
						type: 'foo',
						creator: ( el, config ) => ClassicTestEditor.create( el, config ),
						sourceElementOrData: element1,
						config: {}
					},
				} );
			} catch ( _err ) {
				watchdog._stopErrorHandling();
				err = _err;
			}

			watchdog._actionQueue._clear();

			await watchdog.destroy();

			expect( err ).to.be.instanceOf( Error );
			expect( err.message ).to.match( /Not supported item type: 'foo'\./ );
		} );

		it( 'should allow adding and removing items without waiting', async () => {
			watchdog = ContextWatchdog.for( Context, {} );

			watchdog.add( {
				editor1: {
					type: 'editor',
					creator: ( el, config ) => ClassicTestEditor.create( el, config ),
					sourceElementOrData: element1,
					config: {}
				},
			} );

			watchdog.add( {
				editor2: {
					type: 'editor',
					creator: ( el, config ) => ClassicTestEditor.create( el, config ),
					sourceElementOrData: element2,
					config: {}
				},
			} );

			await watchdog.waitForReady();

			expect( watchdog.state ).to.equal( 'ready' );

			watchdog.remove( [ 'editor1' ] );

			await watchdog.waitForReady();

			watchdog.remove( [ 'editor2' ] );

			await watchdog.waitForReady();

			await watchdog.destroy();
		} );

		it( 'should not change the input items', async () => {
			watchdog = ContextWatchdog.for( Context, {} );

			watchdog.add( Object.freeze( {
				editor1: {
					type: 'editor',
					creator: ( el, config ) => ClassicTestEditor.create( el, config ),
					sourceElementOrData: element1,
					config: {}
				}
			} ) );

			watchdog._restart();

			await watchdog.waitForReady();

			await watchdog.destroy();
		} );

		it( 'should return the created items instances with get( itemName )', async () => {
			watchdog = ContextWatchdog.for( Context, {} );

			watchdog.add( {
				editor1: {
					type: 'editor',
					creator: ( el, config ) => ClassicTestEditor.create( el, config ),
					sourceElementOrData: element1,
					config: {}
				},
				editor2: {
					type: 'editor',
					creator: ( el, config ) => ClassicTestEditor.create( el, config ),
					sourceElementOrData: element2,
					config: {}
				}
			} );

			await watchdog.waitForReady();

			expect( watchdog.get( 'editor1' ) ).to.be.instanceOf( ClassicTestEditor );
			expect( watchdog.get( 'editor2' ) ).to.be.instanceOf( ClassicTestEditor );

			await watchdog.remove( [ 'editor1' ] );

			expect( () => {
				watchdog.get( 'editor1' );
			} ).to.throw( /Item with the given name was not registered: editor1\./ );

			expect( watchdog.get( 'editor2' ) ).to.be.instanceOf( ClassicTestEditor );

			await watchdog.destroy();
		} );

		describe( 'in case of error handling', () => {
			it( 'should restart the whole structure of editors if an error happens inside the `Context`', async () => {
				watchdog = ContextWatchdog.for( Context, {} );
				watchdog.add( {
					editor1: {
						type: 'editor',
						creator: ( el, config ) => ClassicTestEditor.create( el, config ),
						sourceElementOrData: element1,
						config: {}
					}
				} );

				await watchdog.waitForReady();

				const oldContext = watchdog.context;
				const restartSpy = sinon.spy();

				watchdog.on( 'restart', restartSpy );

				setTimeout( () => throwCKEditorError( 'foo', watchdog.context ) );

				await waitCycle();

				sinon.assert.calledOnce( restartSpy );

				expect( watchdog._watchdogs.get( 'editor1' ).state ).to.equal( 'ready' );
				expect( watchdog.context ).to.not.equal( oldContext );

				await watchdog.destroy();
			} );

			it( 'should restart only the editor if an error happens inside the editor', async () => {
				watchdog = ContextWatchdog.for( Context, {} );
				watchdog.add( {
					editor1: {
						type: 'editor',
						creator: ( el, config ) => ClassicTestEditor.create( el, config ),
						sourceElementOrData: element1,
						config: {}
					}
				} );

				await watchdog.waitForReady();

				const oldContext = watchdog.context;
				const restartSpy = sinon.spy();

				const oldEditor = watchdog.get( 'editor1' );

				watchdog.on( 'restart', restartSpy );

				setTimeout( () => throwCKEditorError( 'foo', oldEditor ) );

				await waitCycle();

				sinon.assert.notCalled( restartSpy );

				expect( watchdog.context ).to.equal( oldContext );

				expect( watchdog.get( 'editor1' ) ).to.not.equal( oldEditor );

				await watchdog.destroy();
			} );

			it( 'should restart only the editor if an error happens inside one of the editors', async () => {
				watchdog = ContextWatchdog.for( Context, {} );

				watchdog.add( {
					editor1: {
						type: 'editor',
						creator: ( el, config ) => ClassicTestEditor.create( el, config ),
						sourceElementOrData: element1,
						config: {}
					},
					editor2: {
						type: 'editor',
						creator: ( el, config ) => ClassicTestEditor.create( el, config ),
						sourceElementOrData: element2,
						config: {}
					}
				} );

				await watchdog.waitForReady();

				const oldContext = watchdog.context;

				const editorWatchdog1 = watchdog._watchdogs.get( 'editor1' );
				const editorWatchdog2 = watchdog._watchdogs.get( 'editor2' );

				const oldEditor1 = watchdog.get( 'editor1' );
				const oldEditor2 = watchdog.get( 'editor2' );

				const mainWatchdogRestartSpy = sinon.spy();
				const editorWatchdog1RestartSpy = sinon.spy();
				const editorWatchdog2RestartSpy = sinon.spy();

				watchdog.on( 'restart', mainWatchdogRestartSpy );
				editorWatchdog1.on( 'restart', editorWatchdog1RestartSpy );
				editorWatchdog2.on( 'restart', editorWatchdog2RestartSpy );

				setTimeout( () => throwCKEditorError( 'foo', editorWatchdog1.editor ) );

				await waitCycle();

				sinon.assert.calledOnce( editorWatchdog1RestartSpy );

				sinon.assert.notCalled( mainWatchdogRestartSpy );
				sinon.assert.notCalled( editorWatchdog2RestartSpy );

				expect( editorWatchdog1.state ).to.equal( 'ready' );
				expect( editorWatchdog2.state ).to.equal( 'ready' );
				expect( watchdog.state ).to.equal( 'ready' );

				expect( oldEditor1 ).to.not.equal( editorWatchdog1.editor );
				expect( oldEditor2 ).to.equal( editorWatchdog2.editor );

				expect( watchdog.context ).to.equal( oldContext );

				await watchdog.destroy();
			} );
		} );
	} );
} );

function throwCKEditorError( name, context ) {
	throw new CKEditorError( name, context );
}

function waitCycle() {
	return new Promise( res => setTimeout( res ) );
}
