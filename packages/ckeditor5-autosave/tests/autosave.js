/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Autosave } from '../src/autosave.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { PendingActions } from '@ckeditor/ckeditor5-core';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe( 'Autosave', () => {
	let editor, element, autosave;

	beforeEach( () => {
		vi.useFakeTimers( { now: Date.now() } );
	} );

	afterEach( () => {
		vi.restoreAllMocks();
		vi.useRealTimers();
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( Autosave.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( Autosave.isPremiumPlugin ).toBe( false );
	} );

	it( 'should have static pluginName property', () => {
		expect( Autosave.pluginName ).toBe( 'Autosave' );
	} );

	describe( 'initialization', () => {
		beforeEach( () => {
			element = document.createElement( 'div' );
			document.body.appendChild( element );

			return ClassicTestEditor
				.create( element, {
					plugins: [ Autosave, Paragraph ]
				} )
				.then( _editor => {
					const data = '<p>paragraph1</p><p>paragraph2</p>';

					editor = _editor;
					editor.setData( data );
					autosave = editor.plugins.get( Autosave );
				} );
		} );

		afterEach( () => {
			document.body.removeChild( element );

			return editor.destroy();
		} );

		it( 'should initialize adapter with an undefined value', () => {
			expect( autosave.adapter ).toBeUndefined();
		} );

		it( 'should allow plugin to work without defined adapter and without its config', () => {
			expect( () => {
				editor.model.change( writer => {
					writer.setSelection( writer.createRangeIn( editor.model.document.getRoot().getChild( 0 ) ) );
					editor.model.insertContent( writer.createText( 'foo' ) );
				} );

				vi.advanceTimersByTime( 1000 );
			} ).not.toThrow();
		} );

		it( 'should start with the `synchronized` state', () => {
			expect( autosave.state ).toBe( 'synchronized' );
		} );
	} );

	describe( 'config.autosave.save', () => {
		let spy;

		beforeEach( () => {
			element = document.createElement( 'div' );
			document.body.appendChild( element );

			spy = vi.fn();

			return ClassicTestEditor
				.create( element, {
					plugins: [ Autosave, Paragraph ],
					autosave: {
						save: spy
					},
					root: {
						initialData: '<p>Foo</p>'
					}
				} )
				.then( _editor => {
					editor = _editor;

					autosave = editor.plugins.get( Autosave );
				} );
		} );

		afterEach( () => {
			document.body.removeChild( element );

			return editor.destroy();
		} );

		it( 'should not call autosave callback while editor is being initialized', () => {
			vi.advanceTimersByTime( 1000 );

			return Promise.resolve().then( () => {
				expect( spy ).not.toHaveBeenCalled();
			} );
		} );

		it( 'should enable providing callback via the config', () => {
			editor.config.get( 'autosave' ).save.mockClear();

			editor.model.change( writer => {
				writer.setSelection( writer.createRangeIn( editor.model.document.getRoot().getChild( 0 ) ) );
				editor.model.insertContent( writer.createText( 'foo' ) );
			} );

			vi.advanceTimersByTime( 1000 );

			return Promise.resolve().then( () => {
				expect( editor.config.get( 'autosave' ).save ).toHaveBeenCalledTimes( 1 );
			} );
		} );

		it( 'config callback and adapter callback should be called if both are provided', () => {
			editor.config.get( 'autosave' ).save.mockClear();

			autosave.adapter = {
				save: vi.fn()
			};

			editor.model.change( writer => {
				writer.setSelection( writer.createRangeIn( editor.model.document.getRoot().getChild( 0 ) ) );
				editor.model.insertContent( writer.createText( 'foo' ) );
			} );

			vi.advanceTimersByTime( 1000 );

			return Promise.resolve().then( () => {
				expect( autosave.adapter.save ).toHaveBeenCalledTimes( 1 );
				expect( editor.config.get( 'autosave' ).save ).toHaveBeenCalledTimes( 1 );
			} );
		} );

		it( 'config callback and adapter callback should be called with the editor as an argument', () => {
			editor.config.get( 'autosave' ).save.mockClear();

			autosave.adapter = {
				save: vi.fn()
			};

			editor.model.change( writer => {
				writer.setSelection( writer.createRangeIn( editor.model.document.getRoot().getChild( 0 ) ) );
				editor.model.insertContent( writer.createText( 'foo' ) );
			} );

			vi.advanceTimersByTime( 1000 );

			return Promise.resolve().then( () => {
				expect( autosave.adapter.save.mock.calls[ 0 ] ).toEqual( [ editor ] );
				expect( editor.config.get( 'autosave' ).save.mock.calls[ 0 ] ).toEqual( [ editor ] );
			} );
		} );
	} );

	describe( 'config.autosave.waitingTime', () => {
		afterEach( () => {
			document.body.removeChild( element );

			return editor.destroy();
		} );

		it( 'should specify the time of waiting on the next use action before saving', () => {
			element = document.createElement( 'div' );
			document.body.appendChild( element );

			return ClassicTestEditor
				.create( element, {
					plugins: [ Autosave, Paragraph ],
					autosave: {
						save: vi.fn(),
						waitingTime: 500
					}
				} )
				.then( _editor => {
					editor = _editor;

					const data = '<p>paragraph1</p><p>paragraph2</p>';
					editor.setData( data );

					editor.model.change( writer => {
						writer.setSelection( writer.createRangeIn( editor.model.document.getRoot().getChild( 0 ) ) );
						editor.model.insertContent( writer.createText( 'foo' ) );
					} );

					vi.advanceTimersByTime( 499 );

					return Promise.resolve().then( () => {
						expect( editor.config.get( 'autosave' ).save ).not.toHaveBeenCalled();

						vi.advanceTimersByTime( 1 );

						return Promise.resolve();
					} ).then( () => {
						// Callback should be called exactly after 500ms.
						expect( editor.config.get( 'autosave' ).save ).toHaveBeenCalledTimes( 1 );
					} );
				} );
		} );

		it( 'should be default to 1000', () => {
			element = document.createElement( 'div' );
			document.body.appendChild( element );

			return ClassicTestEditor
				.create( element, {
					plugins: [ Autosave, Paragraph ],
					autosave: {
						save: vi.fn()
					}
				} )
				.then( _editor => {
					editor = _editor;

					const data = '<p>paragraph1</p><p>paragraph2</p>';
					editor.setData( data );

					editor.model.change( writer => {
						writer.setSelection( writer.createRangeIn( editor.model.document.getRoot().getChild( 0 ) ) );
						editor.model.insertContent( writer.createText( 'foo' ) );
					} );

					vi.advanceTimersByTime( 999 );

					return Promise.resolve().then( () => {
						expect( editor.config.get( 'autosave' ).save ).not.toHaveBeenCalled();

						vi.advanceTimersByTime( 1 );

						return Promise.resolve();
					} ).then( () => {
						// Callback should be called exactly after 1000ms by default.
						expect( editor.config.get( 'autosave' ).save ).toHaveBeenCalledTimes( 1 );
					} );
				} );
		} );
	} );

	describe( 'autosaving', () => {
		beforeEach( () => {
			element = document.createElement( 'div' );
			document.body.appendChild( element );

			return ClassicTestEditor
				.create( element, {
					plugins: [ Autosave, Paragraph ]
				} )
				.then( _editor => {
					const data = '<p>paragraph1</p><p>paragraph2</p>';

					editor = _editor;
					editor.setData( data );
					autosave = editor.plugins.get( Autosave );
				} );
		} );

		afterEach( () => {
			document.body.removeChild( element );

			return editor.destroy();
		} );

		it( 'should run adapter\'s save method when the editor\'s change event is fired', () => {
			autosave.adapter = {
				save: vi.fn()
			};

			editor.model.change( writer => {
				writer.setSelection( writer.createRangeIn( editor.model.document.getRoot().getChild( 0 ) ) );
				editor.model.insertContent( writer.createText( 'foo' ) );
			} );

			vi.advanceTimersByTime( 1000 );

			return Promise.resolve().then( () => {
				expect( autosave.adapter.save ).toHaveBeenCalledTimes( 1 );
			} );
		} );

		it( 'should debounce editor\'s change event', () => {
			const spy = vi.fn();
			const savedStates = [];

			autosave.adapter = {
				save() {
					spy();

					savedStates.push( editor.getData() );
				}
			};

			editor.model.change( writer => {
				writer.setSelection( writer.createRangeIn( editor.model.document.getRoot().getChild( 1 ) ) );
				editor.model.insertContent( writer.createText( 'foo' ) );
			} );

			vi.advanceTimersByTime( 1000 );

			editor.model.change( writer => {
				writer.setSelection( writer.createRangeIn( editor.model.document.getRoot().getChild( 1 ) ) );
				editor.model.insertContent( writer.createText( 'bar' ) );
			} );

			vi.advanceTimersByTime( 1000 );

			editor.model.change( writer => {
				writer.setSelection( writer.createRangeIn( editor.model.document.getRoot().getChild( 1 ) ) );
				editor.model.insertContent( writer.createText( 'biz' ) );
			} );

			expect( spy ).not.toHaveBeenCalled();

			vi.advanceTimersByTime( 1000 );

			return Promise.resolve().then( () => {
				expect( spy ).toHaveBeenCalledTimes( 1 );
				expect( savedStates ).toEqual( [
					'<p>paragraph1</p><p>biz</p>'
				] );
			} );
		} );

		it( 'should add a pending action after a change and wait on the server response', () => {
			const pendingActions = editor.plugins.get( PendingActions );
			const serverActionSpy = vi.fn();
			const serverActionStub = vi.fn().mockImplementation( () => wait( 1000 ).then( serverActionSpy ) );

			autosave.adapter = {
				save: serverActionStub
			};

			editor.model.change( writer => {
				writer.setSelection( writer.createRangeIn( editor.model.document.getRoot().getChild( 0 ) ) );
				editor.model.insertContent( writer.createText( 'foo' ) );
			} );

			expect( serverActionSpy ).not.toHaveBeenCalled();
			expect( pendingActions.hasAny ).toBe( true );
			expect( pendingActions.first.message ).toBe( 'Saving changes' );

			vi.advanceTimersByTime( 1000 );

			expect( serverActionSpy ).not.toHaveBeenCalled();
			expect( pendingActions.hasAny ).toBe( true );
			expect( pendingActions.first.message ).toBe( 'Saving changes' );

			return Promise.resolve().then( () => {
				vi.advanceTimersByTime( 1000 );

				return runPromiseCycles().then( () => {
					expect( serverActionSpy ).toHaveBeenCalledTimes( 1 );
					expect( pendingActions.hasAny ).toBe( false );
				} );
			} );
		} );

		it( 'should add a pending action during the saving #2.', () => {
			const serverActionSpy = vi.fn();
			const pendingActions = editor.plugins.get( PendingActions );

			autosave.adapter = {
				save: serverActionSpy
			};

			expect( pendingActions.hasAny ).toBe( false );

			editor.model.change( writer => {
				writer.setSelection( writer.createRangeIn( editor.model.document.getRoot().getChild( 0 ) ) );
				editor.model.insertContent( writer.createText( 'foo' ) );
			} );

			expect( pendingActions.hasAny ).toBe( true );

			vi.advanceTimersByTime( 1000 );

			return runPromiseCycles().then( () => {
				expect( serverActionSpy ).toHaveBeenCalledTimes( 1 );
				expect( pendingActions.hasAny ).toBe( false );
			} );
		} );

		it( 'should be in correct states during the saving', () => {
			const pendingActions = editor.plugins.get( PendingActions );
			const serverActionSpy = vi.fn();
			const serverActionStub = vi.fn().mockImplementation( () => wait( 1000 ).then( serverActionSpy ) );

			autosave.adapter = {
				save: serverActionStub
			};

			editor.model.change( writer => {
				writer.setSelection( writer.createRangeIn( editor.model.document.getRoot().getChild( 0 ) ) );
				editor.model.insertContent( writer.createText( 'foo' ) );
			} );

			expect( serverActionSpy ).not.toHaveBeenCalled();
			expect( pendingActions.hasAny ).toBe( true );
			expect( pendingActions.first.message ).toBe( 'Saving changes' );

			vi.advanceTimersByTime( 1000 );
			expect( autosave.state ).toBe( 'saving' );

			return Promise.resolve().then( () => {
				// Add new change before the response from the server.

				editor.model.change( writer => {
					writer.setSelection( writer.createRangeIn( editor.model.document.getRoot().getChild( 0 ) ) );
					editor.model.insertContent( writer.createText( 'foo' ) );
				} );

				vi.advanceTimersByTime( 1000 );

				return runPromiseCycles();
			} ).then( () => {
				// Now there should come the first server response.
				expect( autosave.state ).toBe( 'waiting' );
				expect( pendingActions.hasAny ).toBe( true );
				expect( serverActionSpy ).toHaveBeenCalledTimes( 1 );

				vi.advanceTimersByTime( 1000 );

				return runPromiseCycles();
			} ).then( () => {
				expect( autosave.state ).toBe( 'saving' );
				expect( pendingActions.hasAny ).toBe( true );
				expect( serverActionSpy ).toHaveBeenCalledTimes( 1 );

				// Wait for the second server response.
				vi.advanceTimersByTime( 1000 );

				return runPromiseCycles();
			} ).then( () => {
				expect( pendingActions.hasAny ).toBe( false );
				expect( autosave.state ).toBe( 'synchronized' );
				expect( serverActionSpy ).toHaveBeenCalledTimes( 2 );
			} );
		} );

		it( 'should filter out selection changes', () => {
			autosave.adapter = {
				save: vi.fn()
			};

			editor.model.change( writer => {
				writer.setSelection( writer.createRangeIn( editor.model.document.getRoot().getChild( 0 ) ) );
			} );

			vi.advanceTimersByTime( 1000 );

			return runPromiseCycles().then( () => {
				expect( autosave.adapter.save ).not.toHaveBeenCalled();
			} );
		} );

		it( 'should filter out markers that does not affect the data', () => {
			autosave.adapter = {
				save: vi.fn()
			};

			editor.model.change( writer => {
				const range = writer.createRangeIn( editor.model.document.getRoot().getChild( 0 ) );
				writer.addMarker( 'name', { usingOperation: true, range } );
			} );

			vi.advanceTimersByTime( 1000 );

			editor.model.change( writer => {
				const range = writer.createRangeIn( editor.model.document.getRoot().getChild( 1 ) );
				writer.updateMarker( 'name', { range } );
			} );

			vi.advanceTimersByTime( 1000 );

			return runPromiseCycles().then( () => {
				expect( autosave.adapter.save ).not.toHaveBeenCalled();
			} );
		} );

		it( 'should filter out markers that does not affect the data #2', () => {
			autosave.adapter = {
				save: vi.fn()
			};

			editor.model.change( writer => {
				const range = writer.createRangeIn( editor.model.document.getRoot().getChild( 0 ) );
				writer.addMarker( 'name', { usingOperation: false, range } );
			} );

			vi.advanceTimersByTime( 1000 );

			editor.model.change( writer => {
				const range = writer.createRangeIn( editor.model.document.getRoot().getChild( 1 ) );
				writer.updateMarker( 'name', { range } );
			} );

			vi.advanceTimersByTime( 1000 );

			return runPromiseCycles().then( () => {
				expect( autosave.adapter.save ).not.toHaveBeenCalled();
			} );
		} );

		it( 'should call the save method when some marker affects the data', () => {
			autosave.adapter = {
				save: vi.fn()
			};

			editor.model.change( writer => {
				const range = writer.createRangeIn( editor.model.document.getRoot().getChild( 0 ) );
				writer.addMarker( 'name', { usingOperation: true, affectsData: true, range } );
			} );

			vi.advanceTimersByTime( 1000 );

			return runPromiseCycles().then( () => {
				expect( autosave.adapter.save ).toHaveBeenCalledTimes( 1 );
			} );
		} );

		it( 'should call the save method when some marker affects the data #2', () => {
			autosave.adapter = {
				save: vi.fn()
			};

			editor.model.change( writer => {
				const range = writer.createRangeIn( editor.model.document.getRoot().getChild( 0 ) );
				writer.addMarker( 'name', { usingOperation: false, affectsData: true, range } );
			} );

			vi.advanceTimersByTime( 1000 );

			return runPromiseCycles().then( () => {
				expect( autosave.adapter.save ).toHaveBeenCalledTimes( 1 );

				editor.model.change( writer => {
					const range = writer.createRangeIn( editor.model.document.getRoot().getChild( 1 ) );
					writer.updateMarker( 'name', { range } );
				} );

				vi.advanceTimersByTime( 1000 );

				return runPromiseCycles().then( () => {
					expect( autosave.adapter.save ).toHaveBeenCalledTimes( 2 );
				} );
			} );
		} );

		it( 'should call the save method when some marker affects the data #3', () => {
			autosave.adapter = {
				save: vi.fn()
			};

			editor.model.change( writer => {
				const range = writer.createRangeIn( editor.model.document.getRoot().getChild( 0 ) );
				writer.addMarker( 'marker-not-affecting-data', { usingOperation: false, affectsData: true, range } );
				writer.addMarker( 'marker-affecting-data', { usingOperation: false, affectsData: false, range } );
			} );

			vi.advanceTimersByTime( 1000 );

			return runPromiseCycles().then( () => {
				expect( autosave.adapter.save ).toHaveBeenCalledTimes( 1 );
			} );
		} );

		it( 'should flush remaining call after editor\'s destroy', () => {
			const spy = vi.fn();
			const savedStates = [];

			autosave.adapter = {
				save() {
					spy();

					savedStates.push( editor.getData() );
				}
			};

			editor.model.change( writer => {
				writer.setSelection( writer.createRangeIn( editor.model.document.getRoot().getChild( 0 ) ) );
				editor.model.insertContent( writer.createText( 'foo' ) );
			} );

			editor.model.change( writer => {
				writer.setSelection( writer.createRangeIn( editor.model.document.getRoot().getChild( 1 ) ) );
				editor.model.insertContent( writer.createText( 'bar' ) );
			} );

			expect( spy ).not.toHaveBeenCalled();

			return editor.destroy().then( () => {
				expect( spy ).toHaveBeenCalledTimes( 1 );
				expect( savedStates ).toEqual( [
					'<p>foo</p><p>bar</p>'
				] );
			} );
		} );

		it( 'should work after editor\'s destroy with long server\'s response time', () => {
			const pendingActions = editor.plugins.get( PendingActions );
			const serverActionSpy = vi.fn();
			const serverActionStub = vi.fn().mockResolvedValueOnce( wait( 1000 ).then( serverActionSpy ) );

			autosave.adapter = {
				save: serverActionStub
			};

			editor.model.change( writer => {
				writer.setSelection( writer.createRangeIn( editor.model.document.getRoot().getChild( 0 ) ) );
				editor.model.insertContent( writer.createText( 'foo' ) );
			} );

			return editor.destroy()
				.then( () => {
					expect( pendingActions.hasAny ).toBe( true );
					vi.advanceTimersByTime( 1000 );
				} )
				.then( runPromiseCycles )
				.then( () => {
					expect( pendingActions.hasAny ).toBe( false );
					expect( serverActionSpy ).toHaveBeenCalledTimes( 1 );
					expect( serverActionStub ).toHaveBeenCalledTimes( 1 );
				} );
		} );

		it( 'should handle a situation when the save callback throws an error', () => {
			const pendingActions = editor.plugins.get( PendingActions );
			const successServerActionSpy = vi.fn();
			const serverActionStub = vi.fn();
			const handleUnhandledRejection = evt => {
				expect( evt.reason ).toEqual( new Error( 'foo' ) );
				evt.preventDefault();
			};

			window.addEventListener( 'unhandledrejection', handleUnhandledRejection, { once: true } );

			serverActionStub.mockRejectedValueOnce( new Error( 'foo' ) );

			serverActionStub.mockImplementationOnce( successServerActionSpy );

			autosave.adapter = {
				save: serverActionStub
			};

			editor.model.change( writer => {
				writer.setSelection( writer.createRangeIn( editor.model.document.getRoot().getChild( 0 ) ) );
				editor.model.insertContent( writer.createText( 'foo' ) );
			} );

			return editor.destroy()
				.then( () => {
					expect( pendingActions.hasAny ).toBe( true );
				} )
				.then( runPromiseCycles )
				.then( () => {
					expect( pendingActions.hasAny ).toBe( true );
					expect( serverActionStub ).toHaveBeenCalledTimes( 1 );
					expect( successServerActionSpy ).not.toHaveBeenCalled();
				} )
				.then( () => vi.advanceTimersByTime( 1000 ) )
				.then( runPromiseCycles )
				.then( () => {
					expect( pendingActions.hasAny ).toBe( false );
					expect( serverActionStub ).toHaveBeenCalledTimes( 2 );
					expect( successServerActionSpy ).toHaveBeenCalledTimes( 1 );
				} );
		} );

		it( 'should ignore non-local changes', () => {
			autosave.adapter = {
				save: vi.fn()
			};

			editor.model.enqueueChange( { isLocal: false }, writer => {
				writer.insertElement( 'paragraph', null, editor.model.document.getRoot(), 0 );
			} );

			vi.advanceTimersByTime( 2000 );

			return runPromiseCycles().then( () => {
				expect( autosave.adapter.save ).not.toHaveBeenCalled();
			} );
		} );
	} );

	describe( 'save()', () => {
		let spy;

		beforeEach( () => {
			element = document.createElement( 'div' );
			document.body.appendChild( element );

			spy = vi.fn();

			return ClassicTestEditor
				.create( element, {
					plugins: [ Autosave, Paragraph ],
					autosave: {
						save: async () => {
							await wait( 100 );

							spy();
						}
					},
					root: {
						initialData: '<p>Foo</p>'
					}
				} )
				.then( _editor => {
					editor = _editor;
					autosave = editor.plugins.get( Autosave );
				} );
		} );

		afterEach( () => {
			document.body.removeChild( element );

			return editor.destroy();
		} );

		it( 'should call autosave callback and return a promise resolved when the callback is finished', async () => {
			const promise = autosave.save();

			// Wait for autosave's inner promise delayer. After this callback has been called.
			await runPromiseCycles();

			// "Wait" for the callback to finish.
			vi.advanceTimersByTime( 100 );

			// Wait for autosave callback promise to resolve.
			await promise;

			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should use one autosave call and one promise if called multiple times', async () => {
			const promise = autosave.save();
			const promiseB = autosave.save();
			const promiseC = autosave.save();

			expect( promiseB ).toBe( promise );
			expect( promiseC ).toBe( promise );

			// Wait for autosave's inner promise delayer. After this callback has been called.
			await runPromiseCycles();

			// "Wait" for the callback to finish.
			vi.advanceTimersByTime( 100 );

			// Wait for autosave callback promise to resolve.
			await promise;

			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should use two autosave calls and one promise if called another time after model changed', async () => {
			const promise = autosave.save();

			editor.model.change( writer => {
				writer.setSelection( writer.createRangeIn( editor.model.document.getRoot().getChild( 0 ) ) );
				editor.model.insertContent( writer.createText( 'foo' ) );
			} );

			const promiseB = autosave.save();

			expect( promise ).toBe( promiseB );

			// Wait for autosave's inner promise delayer. After this callback has been called.
			await runPromiseCycles();

			// "Wait" for the first callback to finish.
			vi.advanceTimersByTime( 100 );

			// Wait for autosave callback promise to resolve.
			await runPromiseCycles();

			expect( spy ).toHaveBeenCalledTimes( 1 );

			// "Wait" for the second callback to finish.
			vi.advanceTimersByTime( 100 );

			// Wait for autosave callback promise to resolve.
			await promise;

			expect( spy ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'should cancel delayed autosave callback', async () => {
			editor.model.change( writer => {
				writer.setSelection( writer.createRangeIn( editor.model.document.getRoot().getChild( 0 ) ) );
				editor.model.insertContent( writer.createText( 'foo' ) );
			} );

			autosave.save();

			// Wait for autosave's inner promise delayer.
			await runPromiseCycles();

			// "Wait" for the `save()` callback to finish.
			vi.advanceTimersByTime( 100 );

			// Wait for autosave callback promise to resolve.
			await runPromiseCycles();

			// "Wait" for the debounce to finish.
			vi.advanceTimersByTime( 2000 );

			// Wait for autosave's inner promise delayer.
			await runPromiseCycles();

			// "Wait" for the autosave callback to finish.
			vi.advanceTimersByTime( 100 );

			// Wait for autosave callback promise to resolve.
			await runPromiseCycles();

			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should return a promise resolved when the autosave for save() call is finished (another callback in progress)', async () => {
			editor.model.change( writer => {
				writer.setSelection( writer.createRangeIn( editor.model.document.getRoot().getChild( 0 ) ) );
				editor.model.insertContent( writer.createText( 'foo' ) );
			} );

			// "Wait" for the debounce to finish.
			vi.advanceTimersByTime( 2000 );

			// Wait for autosave's inner promise delayer.
			await runPromiseCycles();

			editor.model.change( writer => {
				editor.model.insertContent( writer.createText( 'foo' ) );
			} );

			// Call `save()` before earlier callback finishes.
			const promise = autosave.save();

			expect( spy ).not.toHaveBeenCalled();

			// "Wait" for the callback to finish.
			vi.advanceTimersByTime( 100 );

			// Wait for autosave callback promise to resolve.
			await runPromiseCycles();

			// First callback (debounced) has finished.
			expect( spy ).toHaveBeenCalledTimes( 1 );

			// "Wait" for the second callback to finish.
			vi.advanceTimersByTime( 100 );

			await promise;

			// First callback has finished.
			expect( spy ).toHaveBeenCalledTimes( 2 );
		} );
	} );

	it( 'should run callbacks until the editor is in the ready state', () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );
		editor = null;

		class AsyncPlugin {
			constructor( editor ) {
				this.editor = editor;
			}

			init() {
				this.editor.data.once( 'ready', () => {
					const editor = this.editor;

					editor.model.change( writer => {
						writer.setSelection( writer.createRangeIn( editor.model.document.getRoot().getChild( 0 ) ) );
						editor.model.insertContent( writer.createText( 'bar' ) );
					} );

					vi.advanceTimersByTime( 10 );
				} );
			}
		}

		return ClassicTestEditor
			.create( element, {
				plugins: [ Autosave, Paragraph, AsyncPlugin ],
				autosave: {
					save: vi.fn(),
					waitingTime: 5
				}
			} )
			.then( _editor => {
				editor = _editor;
				const spy = editor.config.get( 'autosave' ).save;

				expect( editor.getData() ).toBe( '<p>bar</p>' );
				expect( spy ).not.toHaveBeenCalled();
			} )
			.then( () => {
				document.body.removeChild( element );

				return editor.destroy();
			} );
	} );
} );

function wait( time ) {
	return new Promise( res => {
		window.setTimeout( res, time );
	} );
}

function runPromiseCycles() {
	return Promise.resolve()
		.then( () => Promise.resolve() )
		.then( () => Promise.resolve() )
		.then( () => Promise.resolve() )
		.then( () => Promise.resolve() );
}
