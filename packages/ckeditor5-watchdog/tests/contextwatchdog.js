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

	it( 'should disable adding items once the ContextWatchdog is destroyed', async () => {
		watchdog = new ContextWatchdog( Context );

		watchdog.create();

		await watchdog.destroy();

		let err;

		try {
			await watchdog.add( [ {
				id: 'editor1',
				type: 'editor',
				creator: ( el, config ) => ClassicTestEditor.create( el, config ),
				sourceElementOrData: element1,
				config: {}
			} ] );
		} catch ( _err ) {
			err = _err;
		}

		expect( err ).to.be.instanceOf( Error );
		expect( err.message ).to.match( /Cannot add items to destroyed watchdog\./ );
	} );

	describe( 'for scenario with no items', () => {
		it( 'should create only context', async () => {
			watchdog = new ContextWatchdog( Context );

			await watchdog.create();

			expect( watchdog.context ).to.be.instanceOf( Context );

			await watchdog.destroy();
		} );

		it( 'should have proper states', async () => {
			watchdog = new ContextWatchdog( Context );

			const initializationPromise = watchdog.create();

			expect( watchdog.state ).to.equal( 'initializing' );

			await initializationPromise;

			expect( watchdog.state ).to.equal( 'ready' );

			await watchdog.destroy();

			expect( watchdog.state ).to.equal( 'destroyed' );
		} );

		it( 'should set custom creator and destructor if provided', async () => {
			const mainWatchdog = new ContextWatchdog( Context );

			const customCreator = sinon.spy( config => Context.create( config ) );
			const customDestructor = sinon.spy( context => context.destroy() );

			mainWatchdog.setCreator( customCreator );
			mainWatchdog.setDestructor( customDestructor );

			await mainWatchdog.create();

			sinon.assert.calledOnce( customCreator );

			await mainWatchdog.destroy();

			sinon.assert.calledOnce( customDestructor );
		} );

		it( 'should log if an error happens during the component destroying', async () => {
			const mainWatchdog = new ContextWatchdog( Context );

			const consoleErrorStub = sinon.stub( console, 'error' );
			const err = new Error( 'foo' );

			mainWatchdog.setDestructor( async editor => {
				await editor.destroy();

				throw err;
			} );

			await mainWatchdog.create();
			await mainWatchdog._restart();

			sinon.assert.calledWith(
				consoleErrorStub,
				'An error happened during destroying the context or items.',
				err
			);

			mainWatchdog.setDestructor( editor => editor.destroy() );

			await mainWatchdog.destroy();
		} );

		it( 'should handle the Watchdog configuration', async () => {
			watchdog = new ContextWatchdog( Context, {
				crashNumberLimit: 0
			} );

			await watchdog.create();

			setTimeout( () => throwCKEditorError( 'foo', watchdog.context ) );

			await waitCycle();

			expect( watchdog.state ).to.equal( 'crashedPermanently' );

			await watchdog.destroy();
		} );

		describe( 'in case of error handling', () => {
			it( 'should restart the `Context`', async () => {
				watchdog = new ContextWatchdog( Context );

				const errorSpy = sinon.spy();

				await watchdog.create();

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
			watchdog = new ContextWatchdog( Context );

			watchdog.create();

			watchdog.add( {
				id: 'editor1',
				type: 'editor',
				creator: ( el, config ) => ClassicTestEditor.create( el, config ),
				sourceElementOrData: element1,
				config: {}
			}, {
				id: 'editor2',
				type: 'editor',
				creator: ( el, config ) => ClassicTestEditor.create( el, config ),
				sourceElementOrData: element2,
				config: {}
			} );

			await watchdog.destroy();
		} );

		it( 'should throw when multiple items with the same id are added', async () => {
			watchdog = new ContextWatchdog( Context );

			await watchdog.create();

			const editorItemConfig = {
				id: 'editor1',
				type: 'editor',
				creator: ( el, config ) => ClassicTestEditor.create( el, config ),
				sourceElementOrData: element1,
				config: {}
			};

			const editorCreationPromise1 = watchdog.add( editorItemConfig );
			const editorCreationPromise2 = watchdog.add( editorItemConfig );

			let err;
			try {
				await editorCreationPromise1;
				await editorCreationPromise2;
			} catch ( _err ) {
				err = _err;
			}

			await watchdog.destroy();

			expect( err ).to.be.instanceOf( Error );
			expect( err.message ).to.match( /Item with the given id is already added: 'editor1'./ );
		} );

		it( 'should throw when not added item is removed', async () => {
			watchdog = new ContextWatchdog( Context );

			await watchdog.create();

			let err;

			try {
				await watchdog.remove( 'foo' );
			} catch ( _err ) {
				err = _err;
			}

			await watchdog.destroy();

			expect( err ).to.be.instanceOf( Error );
			expect( err.message ).to.match( /Item with the given id was not registered: foo\./ );
		} );

		it( 'should throw when the item is added before the context is created', async () => {
			const mainWatchdog = new ContextWatchdog( Context );

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
			watchdog = new ContextWatchdog( Context );

			watchdog.create();

			const destructorSpy = sinon.spy( editor => editor.destroy() );

			watchdog.add( {
				id: 'editor1',
				type: 'editor',
				creator: ( el, config ) => ClassicTestEditor.create( el, config ),
				destructor: destructorSpy,
				sourceElementOrData: element1,
				config: {}
			} );

			await watchdog.destroy();

			sinon.assert.calledOnce( destructorSpy );
		} );

		it( 'should throw when the item is of not known type', async () => {
			watchdog = new ContextWatchdog( Context );

			await watchdog.create();

			let err;
			try {
				await watchdog.add( {
					id: 'editor1',
					type: 'foo',
					creator: ( el, config ) => ClassicTestEditor.create( el, config ),
					sourceElementOrData: element1,
					config: {}
				} );
			} catch ( _err ) {
				watchdog._stopErrorHandling();
				err = _err;
			}

			await watchdog.destroy();

			expect( err ).to.be.instanceOf( Error );
			expect( err.message ).to.match( /Not supported item type: 'foo'\./ );
		} );

		it( 'should allow adding and removing items without waiting for promises', async () => {
			watchdog = new ContextWatchdog( Context );

			watchdog.create();

			watchdog.add( [ {
				id: 'editor1',
				type: 'editor',
				creator: ( el, config ) => ClassicTestEditor.create( el, config ),
				sourceElementOrData: element1,
				config: {}
			}, {
				id: 'editor2',
				type: 'editor',
				creator: ( el, config ) => ClassicTestEditor.create( el, config ),
				sourceElementOrData: element2,
				config: {}
			} ] );

			watchdog.remove( [ 'editor1', 'editor2' ] );

			await watchdog.destroy();
		} );

		it( 'should not change the input items', async () => {
			watchdog = new ContextWatchdog( Context );

			watchdog.create();

			watchdog.add( Object.freeze( [ {
				id: 'editor1',
				type: 'editor',
				creator: ( el, config ) => ClassicTestEditor.create( el, config ),
				sourceElementOrData: element1,
				config: {}
			} ] ) );

			await watchdog._restart();

			await watchdog.destroy();
		} );

		it( 'should return the created items instances with ContextWatchdog#getItem( itemId )', async () => {
			watchdog = new ContextWatchdog( Context );

			watchdog.create();

			await watchdog.add( [ {
				id: 'editor1',
				type: 'editor',
				creator: ( el, config ) => ClassicTestEditor.create( el, config ),
				sourceElementOrData: element1,
				config: {}
			}, {
				id: 'editor2',
				type: 'editor',
				creator: ( el, config ) => ClassicTestEditor.create( el, config ),
				sourceElementOrData: element2,
				config: {}
			} ] );

			expect( watchdog.getItem( 'editor1' ) ).to.be.instanceOf( ClassicTestEditor );
			expect( watchdog.getItem( 'editor2' ) ).to.be.instanceOf( ClassicTestEditor );

			await watchdog.remove( 'editor1' );

			expect( () => {
				watchdog.getItem( 'editor1' );
			} ).to.throw( /Item with the given id was not registered: editor1\./ );

			expect( watchdog.getItem( 'editor2' ) ).to.be.instanceOf( ClassicTestEditor );

			await watchdog.destroy();
		} );

		describe( 'in case of error handling', () => {
			it( 'should restart the whole structure of editors if an error happens inside the `Context`', async () => {
				watchdog = new ContextWatchdog( Context );

				await watchdog.create();

				await watchdog.add( [ {
					id: 'editor1',
					type: 'editor',
					creator: ( el, config ) => ClassicTestEditor.create( el, config ),
					sourceElementOrData: element1,
					config: {}
				} ] );

				const oldContext = watchdog.context;
				const restartSpy = sinon.spy();

				watchdog.on( 'restart', restartSpy );

				setTimeout( () => throwCKEditorError( 'foo', watchdog.context ) );

				await waitCycle();

				sinon.assert.calledOnce( restartSpy );

				expect( watchdog.getItemState( 'editor1' ) ).to.equal( 'ready' );
				expect( watchdog.context ).to.not.equal( oldContext );

				await watchdog.destroy();
			} );

			it( 'should restart only the editor if an error happens inside the editor', async () => {
				watchdog = new ContextWatchdog( Context );

				await watchdog.create();

				await watchdog.add( {
					id: 'editor1',
					type: 'editor',
					creator: ( el, config ) => ClassicTestEditor.create( el, config ),
					sourceElementOrData: element1,
					config: {}
				} );

				const oldContext = watchdog.context;
				const restartSpy = sinon.spy();

				const oldEditor = watchdog.getItem( 'editor1' );

				watchdog.on( 'restart', restartSpy );

				setTimeout( () => throwCKEditorError( 'foo', oldEditor ) );

				await waitCycle();

				sinon.assert.notCalled( restartSpy );

				expect( watchdog.context ).to.equal( oldContext );

				expect( watchdog.getItem( 'editor1' ) ).to.not.equal( oldEditor );

				await watchdog.destroy();
			} );

			it( 'should restart only the editor if an error happens inside one of the editors', async () => {
				watchdog = new ContextWatchdog( Context );

				await watchdog.create();

				await watchdog.add( [ {
					id: 'editor1',
					type: 'editor',
					creator: ( el, config ) => ClassicTestEditor.create( el, config ),
					sourceElementOrData: element1,
					config: {}
				}, {
					id: 'editor2',
					type: 'editor',
					creator: ( el, config ) => ClassicTestEditor.create( el, config ),
					sourceElementOrData: element2,
					config: {}
				} ] );

				const oldContext = watchdog.context;

				const editorWatchdog1 = watchdog._getWatchdog( 'editor1' );
				const editorWatchdog2 = watchdog._getWatchdog( 'editor2' );

				const oldEditor1 = watchdog.getItem( 'editor1' );
				const oldEditor2 = watchdog.getItem( 'editor2' );

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

				expect( watchdog.getItemState( 'editor1' ) ).to.equal( 'ready' );
				expect( watchdog.getItemState( 'editor2' ) ).to.equal( 'ready' );
				expect( watchdog.state ).to.equal( 'ready' );

				expect( oldEditor1 ).to.not.equal( editorWatchdog1.editor );
				expect( oldEditor2 ).to.equal( editorWatchdog2.editor );

				expect( watchdog.context ).to.equal( oldContext );

				await watchdog.destroy();
			} );

			it( 'should handle removing and restarting at the same time', async () => {
				watchdog = new ContextWatchdog( Context );

				await watchdog.create();

				await watchdog.add( [ {
					id: 'editor1',
					type: 'editor',
					creator: ( el, config ) => ClassicTestEditor.create( el, config ),
					sourceElementOrData: element1,
					config: {}
				}, {
					id: 'editor2',
					type: 'editor',
					creator: ( el, config ) => ClassicTestEditor.create( el, config ),
					sourceElementOrData: element2,
					config: {}
				} ] );

				const editor1 = watchdog.getItem( 'editor1' );

				const removePromise = watchdog.remove( 'editor1' );

				setTimeout( () => throwCKEditorError( 'foo', editor1 ) );

				await waitCycle();
				await removePromise;

				expect( Array.from( watchdog._watchdogs.keys() ) ).to.include( 'editor2' );
				expect( Array.from( watchdog._watchdogs.keys() ) ).to.not.include( 'editor1' );

				await watchdog.destroy();
			} );

			it( 'should handle restarting the item instance many times', async () => {
				watchdog = new ContextWatchdog( Context );

				await watchdog.create();

				await watchdog.add( [ {
					id: 'editor1',
					type: 'editor',
					creator: ( el, config ) => ClassicTestEditor.create( el, config ),
					sourceElementOrData: element1,
					config: {}
				}, {
					id: 'editor2',
					type: 'editor',
					creator: ( el, config ) => ClassicTestEditor.create( el, config ),
					sourceElementOrData: element2,
					config: {}
				} ] );

				setTimeout( () => throwCKEditorError( 'foo', watchdog.getItem( 'editor1' ) ) );
				setTimeout( () => throwCKEditorError( 'foo', watchdog.getItem( 'editor1' ) ) );
				setTimeout( () => throwCKEditorError( 'foo', watchdog.getItem( 'editor1' ) ) );
				setTimeout( () => throwCKEditorError( 'foo', watchdog.getItem( 'editor1' ) ) );

				await waitCycle();

				expect( watchdog.getItemState( 'editor1' ) ).to.equal( 'crashedPermanently' );
				expect( watchdog.state ).to.equal( 'ready' );

				await watchdog.destroy();
			} );

			it( 'should rethrow item `error` events as `itemError` events', async () => {
				watchdog = new ContextWatchdog( Context );

				watchdog.create();

				await watchdog.add( [ {
					id: 'editor1',
					type: 'editor',
					creator: ( el, config ) => ClassicTestEditor.create( el, config ),
					sourceElementOrData: element1,
					config: {}
				} ] );

				watchdog.on(
					'itemError',
					sinon.mock()
						.once()
						.withArgs( sinon.match.any, sinon.match( data => {
							return data.itemId === 'editor1';
						} ) )
						.callsFake( () => {
							expect( watchdog.getItemState( 'editor1' ) ).to.equal( 'crashed' );
						} )
				);

				setTimeout( () => throwCKEditorError( 'foo', watchdog.getItem( 'editor1' ) ) );

				await waitCycle();

				sinon.verify();

				await watchdog.destroy();
			} );

			it( 'should rethrow item `restart` events as `itemRestart` events', async () => {
				watchdog = new ContextWatchdog( Context );

				watchdog.create();

				await watchdog.add( [ {
					id: 'editor1',
					type: 'editor',
					creator: ( el, config ) => ClassicTestEditor.create( el, config ),
					sourceElementOrData: element1,
					config: {}
				} ] );

				watchdog.on(
					'itemRestart',
					sinon.mock()
						.once()
						.withArgs( sinon.match.any, sinon.match( data => {
							return data.itemId === 'editor1';
						} ) )
						.callsFake( () => {
							expect( watchdog.getItemState( 'editor1' ) ).to.equal( 'ready' );
						} )
				);

				setTimeout( () => throwCKEditorError( 'foo', watchdog.getItem( 'editor1' ) ) );

				await waitCycle();

				sinon.verify();

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
