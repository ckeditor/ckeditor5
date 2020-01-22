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

	beforeEach( () => {
		element1 = document.createElement( 'div' );
		element2 = document.createElement( 'div' );

		document.body.appendChild( element1 );
		document.body.appendChild( element2 );
	} );

	afterEach( () => {
		element1.remove();
		element2.remove();

		sinon.restore();
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

	describe( 'for no items added', () => {
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

		describe( 'in case of error handling', () => {
			it( 'should restart the `Context`', async () => {
				mainWatchdog = ContextWatchdog.for( Context, {} );
				const errorSpy = sinon.spy();

				await mainWatchdog.waitForReady();

				const oldContext = mainWatchdog.context;

				const originalErrorHandler = window.onerror;
				window.onerror = sinon.spy();

				mainWatchdog.on( 'restart', errorSpy );

				setTimeout( () => throwCKEditorError( 'foo', mainWatchdog.context ) );

				await waitCycle();

				sinon.assert.calledOnce( errorSpy );

				expect( mainWatchdog.context ).to.not.equal( oldContext );

				window.onerror = originalErrorHandler;
			} );
		} );
	} );

	describe( 'for multiple editors', () => {
		it( 'should allow adding multiple items without waiting', async () => {
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
				const originalErrorHandler = window.onerror;

				window.onerror = sinon.spy();

				mainWatchdog.on( 'restart', restartSpy );

				setTimeout( () => throwCKEditorError( 'foo', mainWatchdog.context ) );

				await waitCycle();

				sinon.assert.calledOnce( restartSpy );

				expect( mainWatchdog.context ).to.not.equal( oldContext );

				window.onerror = originalErrorHandler;
			} );
		} );
	} );

	it( 'case: recreating watchdog', async () => {
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
		expect( err.message ).to.match( /Cannot add items do destroyed watchdog\./ );
	} );
} );

function throwCKEditorError( name, context ) {
	throw new CKEditorError( name, context );
}

function waitCycle() {
	return new Promise( res => setTimeout( res ) );
}
