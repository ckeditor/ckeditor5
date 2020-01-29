/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, setTimeout, window */

import ContextWatchdog from '../src/contextwatchdog';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Context from '@ckeditor/ckeditor5-core/src/context';
import sinon from 'sinon';
import { expect } from 'chai';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

describe( 'ContextWatchdog', () => {
	let element1, element2;
	let mainWatchdog;
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
		mainWatchdog = ContextWatchdog.for( Context, {} );

		await mainWatchdog.destroy();

		let err;

		try {
			await mainWatchdog.add( {
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
		mainWatchdog = ContextWatchdog.for( Context, {} );

		mainWatchdog.add( {
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

		await mainWatchdog.waitForReady();

		await mainWatchdog.destroy();
	} );

	describe( 'for scenario with no items', () => {
		it( 'should create only context', async () => {
			mainWatchdog = ContextWatchdog.for( Context, {} );

			await mainWatchdog.waitForReady();

			expect( mainWatchdog.context ).to.be.instanceOf( Context );

			await mainWatchdog.destroy();
		} );

		it( 'should have proper states', async () => {
			mainWatchdog = ContextWatchdog.for( Context, {} );

			expect( mainWatchdog.state ).to.equal( 'initializing' );

			await mainWatchdog.waitForReady();

			expect( mainWatchdog.state ).to.equal( 'ready' );

			await mainWatchdog.destroy();

			expect( mainWatchdog.state ).to.equal( 'destroyed' );
		} );

		it( 'should set custom destructor if provided', async () => {
			const mainWatchdog = new ContextWatchdog();
			const customDestructor = sinon.spy( context => context.destroy() );

			mainWatchdog.setCreator( config => Context.create( config ) );
			mainWatchdog.setDestructor( customDestructor );
			mainWatchdog._create();

			await mainWatchdog.destroy();

			sinon.assert.calledOnce( customDestructor );
		} );

		describe( 'in case of error handling', () => {
			it( 'should restart the `Context`', async () => {
				mainWatchdog = ContextWatchdog.for( Context, {} );
				const errorSpy = sinon.spy();

				await mainWatchdog.waitForReady();

				const oldContext = mainWatchdog.context;

				mainWatchdog.on( 'restart', errorSpy );

				setTimeout( () => throwCKEditorError( 'foo', mainWatchdog.context ) );

				await waitCycle();

				sinon.assert.calledOnce( errorSpy );

				expect( mainWatchdog.context ).to.not.equal( oldContext );
			} );
		} );
	} );

	describe( 'for multiple items scenario', () => {
		it( 'should allow adding multiple items without waiting for promises', async () => {
			mainWatchdog = ContextWatchdog.for( Context, {} );

			mainWatchdog.add( {
				editor1: {
					type: 'editor',
					creator: ( el, config ) => ClassicTestEditor.create( el, config ),
					sourceElementOrData: element1,
					config: {}
				},
			} );

			mainWatchdog.add( {
				editor2: {
					type: 'editor',
					creator: ( el, config ) => ClassicTestEditor.create( el, config ),
					sourceElementOrData: element2,
					config: {}
				},
			} );

			await mainWatchdog.waitForReady();

			await mainWatchdog.destroy();
		} );

		it( 'should throw when multiple items with the same name are added', async () => {
			mainWatchdog = ContextWatchdog.for( Context, {} );

			mainWatchdog.add( {
				editor1: {
					type: 'editor',
					creator: ( el, config ) => ClassicTestEditor.create( el, config ),
					sourceElementOrData: element1,
					config: {}
				},
			} );

			await mainWatchdog.waitForReady();

			let err;
			try {
				await mainWatchdog.add( {
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

			mainWatchdog._actionQueue._clear();

			await mainWatchdog.destroy();

			expect( err ).to.be.instanceOf( Error );
			expect( err.message ).to.match( /Watchdog with the given name is already added: 'editor1'./ );
		} );

		it( 'should throw when not added item is removed', async () => {
			mainWatchdog = ContextWatchdog.for( Context, {} );

			await mainWatchdog.waitForReady();

			let err;

			try {
				await mainWatchdog.remove( [ 'foo' ] );
			} catch ( _err ) {
				err = _err;
			}

			mainWatchdog._actionQueue._clear();

			await mainWatchdog.destroy();

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
			mainWatchdog = ContextWatchdog.for( Context, {} );

			const destructorSpy = sinon.spy( editor => editor.destroy() );

			mainWatchdog.add( {
				editor1: {
					type: 'editor',
					creator: ( el, config ) => ClassicTestEditor.create( el, config ),
					destructor: destructorSpy,
					sourceElementOrData: element1,
					config: {},
				},
			} );

			await mainWatchdog.destroy();

			sinon.assert.calledOnce( destructorSpy );
		} );

		it( 'should throw when the item is of not known type', async () => {
			mainWatchdog = ContextWatchdog.for( Context, {} );

			await mainWatchdog.waitForReady();

			let err;
			try {
				await mainWatchdog.add( {
					editor1: {
						type: 'foo',
						creator: ( el, config ) => ClassicTestEditor.create( el, config ),
						sourceElementOrData: element1,
						config: {}
					},
				} );
			} catch ( _err ) {
				mainWatchdog._stopErrorHandling();
				err = _err;
			}

			mainWatchdog._actionQueue._clear();

			await mainWatchdog.destroy();

			expect( err ).to.be.instanceOf( Error );
			expect( err.message ).to.match( /Not supported item type: 'foo'\./ );
		} );

		it( 'should allow adding and removing items without waiting', async () => {
			mainWatchdog = ContextWatchdog.for( Context, {} );

			mainWatchdog.add( {
				editor1: {
					type: 'editor',
					creator: ( el, config ) => ClassicTestEditor.create( el, config ),
					sourceElementOrData: element1,
					config: {}
				},
			} );

			mainWatchdog.add( {
				editor2: {
					type: 'editor',
					creator: ( el, config ) => ClassicTestEditor.create( el, config ),
					sourceElementOrData: element2,
					config: {}
				},
			} );

			await mainWatchdog.waitForReady();

			expect( mainWatchdog.state ).to.equal( 'ready' );

			mainWatchdog.remove( [ 'editor1' ] );

			await mainWatchdog.waitForReady();

			mainWatchdog.remove( [ 'editor2' ] );

			await mainWatchdog.waitForReady();

			await mainWatchdog.destroy();
		} );

		it( 'should not change the input items', async () => {
			mainWatchdog = ContextWatchdog.for( Context, {} );

			mainWatchdog.add( Object.freeze( {
				editor1: {
					type: 'editor',
					creator: ( el, config ) => ClassicTestEditor.create( el, config ),
					sourceElementOrData: element1,
					config: {}
				}
			} ) );

			mainWatchdog._restart();

			await mainWatchdog.waitForReady();

			await mainWatchdog.destroy();
		} );

		describe( 'in case of error handling', () => {
			it( 'should restart the whole structure of editors if an error happens inside the `Context`', async () => {
				mainWatchdog = ContextWatchdog.for( Context, {} );
				mainWatchdog.add( {
					editor1: {
						type: 'editor',
						creator: ( el, config ) => ClassicTestEditor.create( el, config ),
						sourceElementOrData: element1,
						config: {}
					}
				} );

				await mainWatchdog.waitForReady();

				const oldContext = mainWatchdog.context;
				const restartSpy = sinon.spy();

				mainWatchdog.on( 'restart', restartSpy );

				setTimeout( () => throwCKEditorError( 'foo', mainWatchdog.context ) );

				await waitCycle();

				sinon.assert.calledOnce( restartSpy );

				expect( mainWatchdog._watchdogs.get( 'editor1' ).state ).to.equal( 'ready' );
				expect( mainWatchdog.context ).to.not.equal( oldContext );

				await mainWatchdog.destroy();
			} );

			it( 'should restart only the editor if an error happens inside the editor', async () => {
				mainWatchdog = ContextWatchdog.for( Context, {} );
				mainWatchdog.add( {
					editor1: {
						type: 'editor',
						creator: ( el, config ) => ClassicTestEditor.create( el, config ),
						sourceElementOrData: element1,
						config: {}
					}
				} );

				await mainWatchdog.waitForReady();

				const oldContext = mainWatchdog.context;
				const restartSpy = sinon.spy();

				const oldEditor = mainWatchdog.getWatchdog( 'editor1' ).editor;

				mainWatchdog.on( 'restart', restartSpy );

				setTimeout( () => throwCKEditorError( 'foo', oldEditor ) );

				await waitCycle();

				sinon.assert.notCalled( restartSpy );

				expect( mainWatchdog.context ).to.equal( oldContext );

				expect( mainWatchdog.getWatchdog( 'editor1' ).editor ).to.not.equal( oldEditor );
				expect( mainWatchdog.getWatchdog( 'editor1' ).state ).to.equal( 'ready' );

				await mainWatchdog.destroy();
			} );

			it( 'should restart only the editor if an error happens inside one of the editors', async () => {
				mainWatchdog = ContextWatchdog.for( Context, {} );

				mainWatchdog.add( {
					editor1: {
						type: 'editor',
						creator: ( el, config ) => ClassicTestEditor.create( el, config ),
						sourceElementOrData: element1,
						config: {}
					},
					editor2: {
						type: 'editor',
						creator: ( el, config ) => ClassicTestEditor.create( el, config ),
						sourceElementOrData: element1,
						config: {}
					}
				} );

				await mainWatchdog.waitForReady();

				const oldContext = mainWatchdog.context;

				const editorWatchdog1 = mainWatchdog.getWatchdog( 'editor1' );
				const editorWatchdog2 = mainWatchdog.getWatchdog( 'editor2' );

				const oldEditor1 = editorWatchdog1.editor;
				const oldEditor2 = editorWatchdog2.editor;

				const mainWatchdogRestartSpy = sinon.spy();
				const editorWatchdog1RestartSpy = sinon.spy();
				const editorWatchdog2RestartSpy = sinon.spy();

				mainWatchdog.on( 'restart', mainWatchdogRestartSpy );
				editorWatchdog1.on( 'restart', editorWatchdog1RestartSpy );
				editorWatchdog2.on( 'restart', editorWatchdog2RestartSpy );

				setTimeout( () => throwCKEditorError( 'foo', editorWatchdog1.editor ) );

				await waitCycle();

				sinon.assert.calledOnce( editorWatchdog1RestartSpy );

				sinon.assert.notCalled( mainWatchdogRestartSpy );
				sinon.assert.notCalled( editorWatchdog2RestartSpy );

				expect( editorWatchdog1.state ).to.equal( 'ready' );
				expect( editorWatchdog2.state ).to.equal( 'ready' );
				expect( mainWatchdog.state ).to.equal( 'ready' );

				expect( oldEditor1 ).to.not.equal( editorWatchdog1.editor );
				expect( oldEditor2 ).to.equal( editorWatchdog2.editor );

				expect( mainWatchdog.context ).to.equal( oldContext );

				await mainWatchdog.destroy();
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
