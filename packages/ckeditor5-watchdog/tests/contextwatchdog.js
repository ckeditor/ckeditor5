/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ContextWatchdog from '../src/contextwatchdog';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Context from '@ckeditor/ckeditor5-core/src/context';
import sinon from 'sinon';
import { expect } from 'chai';

describe( 'ContextWatchdog', () => {
	let element1, element2;
	const contextOptions = {};
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
		mainWatchdog = ContextWatchdog.for( Context, contextOptions );

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

	describe( 'case: no editors and contextItems', () => {
		it( 'should create only context', async () => {
			mainWatchdog = ContextWatchdog.for( Context, contextOptions );

			await mainWatchdog.waitForReady();

			expect( mainWatchdog.context ).to.be.instanceOf( Context );

			await mainWatchdog.destroy();
		} );

		it( 'should have proper states', async () => {
			mainWatchdog = ContextWatchdog.for( Context, contextOptions );

			expect( mainWatchdog.state ).to.equal( 'initializing' );

			await mainWatchdog.waitForReady();

			expect( mainWatchdog.state ).to.equal( 'ready' );

			await mainWatchdog.destroy();

			expect( mainWatchdog.state ).to.equal( 'destroyed' );
		} );
	} );

	describe( 'case: multiple editors', () => {
		it( 'should allow adding multiple items without waiting', async () => {
			mainWatchdog = ContextWatchdog.for( Context, contextOptions );

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
			mainWatchdog = ContextWatchdog.for( Context, contextOptions );

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
	} );

	it( 'case: recreating watchdog', async () => {
		mainWatchdog = ContextWatchdog.for( Context, contextOptions );

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
