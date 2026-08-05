/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import { Plugin } from '@ckeditor/ckeditor5-core';
import { EditorWatchdog } from '../src/editorwatchdog.js';
import { MultiRootEditor } from '@ckeditor/ckeditor5-editor-multi-root';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { CKEditorError } from '@ckeditor/ckeditor5-utils';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Clipboard } from '@ckeditor/ckeditor5-clipboard';
import { stubWindowOnError } from './_utils/stubwindowonerror.js';

class CommentsRepository extends Plugin {
	static get pluginName() {
		return 'CommentsRepository';
	}

	constructor( editor ) {
		super( editor );

		this.editor = editor;
		this._threads = [];
	}

	getCommentThread( id ) {
		const thread = this._threads.find( thread => thread.threadId === id );

		if ( !thread ) {
			return null;
		}

		return {
			...thread,
			remove: () => {
				this._threads = this._threads.filter( thread => thread.threadId !== id );
			},
			setAttribute: ( key, value ) => {
				const idx = this._threads.findIndex( thread => thread.threadId === id );

				this._threads[ idx ].attributes = { [ key ]: value };
			}
		};
	}

	getCommentThreads() {
		return this._threads;
	}

	hasCommentThread( id ) {
		return !!this.getCommentThread( id );
	}

	addCommentThread( data ) {
		const id = data.threadId;

		if ( this.hasCommentThread( id ) ) {
			const idx = this._threads.findIndex( thread => thread.threadId === id );

			this._threads[ idx ] = { ...data, id };
		} else {
			this._threads.push( { ...data, id } );
		}
	}

	_removeCommentThread( { threadId } ) {
		this._threads = this._threads.filter( thread => thread.threadId !== threadId );
	}
}

class TrackChanges extends Plugin {
	static get pluginName() {
		return 'TrackChanges';
	}

	static get requires() {
		return [ TrackChangesEditing ];
	}

	constructor( editor ) {
		super( editor );

		this.editor = editor;
	}

	getSuggestions() {
		const trackChangesEditing = this.editor.plugins.get( 'TrackChangesEditing' );

		if ( !trackChangesEditing ) {
			return [];
		}

		return trackChangesEditing._suggestions;
	}
}

class TrackChangesEditing extends Plugin {
	static get pluginName() {
		return 'TrackChangesEditing';
	}

	constructor( editor ) {
		super( editor );

		this.editor = editor;
		this._suggestions = [];
	}

	getSuggestion( id ) {
		const suggestion = this._suggestions.find( suggestion => suggestion.id === id );

		if ( !suggestion ) {
			return null;
		}

		suggestion.setAttribute = ( key, value ) => {
			const idx = this._suggestions.findIndex( suggestion => suggestion.id === id );

			this._suggestions[ idx ].attributes = { [ key ]: value };
		};

		return suggestion;
	}

	getSuggestions() {
		return this._suggestions;
	}

	hasSuggestion( id ) {
		return !!this.getSuggestion( id );
	}

	addSuggestionData( data ) {
		const id = data.id;

		if ( this.hasSuggestion( id ) ) {
			const idx = this._suggestions.findIndex( suggestion => suggestion.id === id );

			this._suggestions[ idx ] = data;
		} else {
			this._suggestions.push( data );
		}
	}

	_removeSuggestion( { id } ) {
		this._suggestions = this._suggestions.filter( suggestion => suggestion.id !== id );
	}
}

// The error handling testing with mocha & chai is quite broken and hard to test.
//
describe( 'EditorWatchdog', () => {
	let element;

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );
	} );

	afterEach( () => {
		element.remove();
	} );

	describe( 'create()', () => {
		it( 'should create an editor instance', async () => {
			const watchdog = new EditorWatchdog();

			const editorCreateSpy = vi.spyOn( ClassicTestEditor, 'create' );
			const editorDestroySpy = vi.spyOn( ClassicTestEditor.prototype, 'destroy' );

			watchdog.setCreator( ( el, config ) => ClassicTestEditor.create( el, config ) );

			await watchdog.create( element, {} );

			expect( editorCreateSpy ).toHaveBeenCalledOnce();
			expect( editorDestroySpy ).not.toHaveBeenCalled();

			await watchdog.destroy();

			expect( editorCreateSpy ).toHaveBeenCalledOnce();
			expect( editorDestroySpy ).toHaveBeenCalledOnce();
		} );

		it( 'should properly copy the config', async () => {
			const watchdog = new EditorWatchdog();
			watchdog.setCreator( ( el, config ) => ClassicTestEditor.create( el, config ) );

			const config = {
				foo: [],
				bar: document.createElement( 'div' )
			};

			await watchdog.create( element, config );

			expect( watchdog.editor.config._config.foo ).not.toBe( config.foo );
			expect( watchdog.editor.config._config.bar ).toBe( config.bar );

			await watchdog.destroy();
		} );

		it( 'should support editor data passed as the first argument', async () => {
			const watchdog = new EditorWatchdog();

			watchdog.setCreator( ( data, config ) => ClassicTestEditor.create( data, config ) );

			stubWindowOnError();

			await watchdog.create( '<p>foo</p>', { plugins: [ Paragraph ] } );

			expect( watchdog.editor.getData() ).toBe( '<p>foo</p>' );

			await new Promise( res => {
				setTimeout( () => throwCKEditorError( 'foo', watchdog.editor ) );

				watchdog.on( 'restart', res );
			} );

			expect( watchdog.editor.getData() ).toBe( '<p>foo</p>' );

			// Watchdog should set data in a non-undoable batch to prevent the undo feature from reverting to empty editor.
			expect( watchdog.editor.model.document.history.getOperation( 0 ).batch.isUndoable ).toBe( false );

			await watchdog.destroy();
		} );

		it( 'should support root attributes', async () => {
			const watchdog = new EditorWatchdog();

			watchdog.setCreator( ( data, config ) => ClassicTestEditor.create( data, config ) );

			stubWindowOnError();

			await watchdog.create( '<p>foo</p>', { plugins: [ Paragraph ] } );

			const root = watchdog.editor.model.document.getRoot();

			watchdog.editor.model.change( writer => {
				writer.setAttribute( 'test', 1, root );
			} );

			expect( root.getAttribute( 'test' ) ).toBe( 1 );

			await new Promise( res => {
				setTimeout( () => throwCKEditorError( 'foo', watchdog.editor ) );

				watchdog.on( 'restart', res );
			} );

			expect( root.getAttribute( 'test' ) ).toBe( 1 );

			await watchdog.destroy();
		} );

		it( 'should support markers', async () => {
			const watchdog = new EditorWatchdog();

			watchdog.setCreator( ( data, config ) => ClassicTestEditor.create( data, config ) );

			stubWindowOnError();

			await watchdog.create( '<p>foo</p>', { plugins: [ Paragraph ] } );

			const root = watchdog.editor.model.document.getRoot();

			watchdog.editor.model.change( writer => {
				writer.addMarker( 'first', {
					usingOperation: false,
					affectsData: false,
					range: writer.createRange(
						writer.createPositionAt( root, [ 0 ] ),
						writer.createPositionAt( root, [ 1 ] )
					)
				} );

				writer.addMarker( 'second', {
					usingOperation: true,
					affectsData: true,
					range: writer.createRange(
						writer.createPositionAt( root, [ 0 ] ),
						writer.createPositionAt( root, [ 1 ] )
					)
				} );
			} );

			const marker = watchdog.editor.model.markers.get( 'second' );

			watchdog._save();

			await new Promise( res => {
				setTimeout( () => throwCKEditorError( 'foo', watchdog.editor ) );

				watchdog.on( 'restart', res );
			} );

			expect( watchdog.editor.model.markers.get( 'first' ) ).toBeNull();
			expect( watchdog.editor.model.markers.get( 'second' ).name ).toBe( marker.name );

			await watchdog.destroy();
		} );

		it( 'should create an editor instance after the ongoing destruction process has been finished', async () => {
			const watchdog = new EditorWatchdog( ClassicTestEditor );

			// It simulates the process of creating a new instance of the editor and immediately destroying it.
			const simulateRefreshApp = async () => {
				watchdog.create( element, {
					initialData: '<p>foo</p>',
					plugins: [ Paragraph ]
				} );

				watchdog.destroy();
			};

			// We do not wait for the completion of this process, which simulates the real case when the app is immediately
			// restarted and the initial process of the new app is called without waiting for the previous process to finish.
			simulateRefreshApp();

			await watchdog.create( element, {
				initialData: '<p>foo</p>',
				plugins: [ Paragraph ]
			} );

			expect( watchdog.editor ).not.toBeNull();
			expect( watchdog.state ).toBe( 'ready' );

			await watchdog.destroy();
		} );
	} );

	describe( 'editor', () => {
		it( 'should be the current editor instance', () => {
			const watchdog = new EditorWatchdog( ClassicTestEditor );

			stubWindowOnError();

			expect( watchdog.editor ).toBeNull();

			let oldEditor;

			return watchdog.create( element, {} )
				.then( () => {
					oldEditor = watchdog.editor;
					expect( watchdog.editor ).toBeInstanceOf( ClassicTestEditor );

					return new Promise( res => {
						setTimeout( () => throwCKEditorError( 'foo', watchdog.editor ) );

						watchdog.on( 'restart', res );
					} );
				} )
				.then( () => {
					expect( watchdog.editor ).toBeInstanceOf( ClassicTestEditor );
					expect( watchdog.editor ).not.toBe( oldEditor );

					return watchdog.destroy();
				} )
				.then( () => {
					expect( watchdog.editor ).toBeNull();
				} );
		} );
	} );

	describe( 'collaboration data', () => {
		let watchdog;

		beforeEach( async () => {
			watchdog = new EditorWatchdog();

			watchdog.setCreator( ( data, config ) => ClassicTestEditor.create( data, config ) );
		} );

		afterEach( async () => {
			await watchdog.destroy();
		} );

		it( 'should support comment threads', async () => {
			await watchdog.create( '<p>Foo bar</p>', {
				plugins: [ Paragraph, Clipboard, CommentsRepository ],
				comments: {
					editorConfig: {}
				}
			} );

			stubWindowOnError();

			const commentsRepository = watchdog.editor.plugins.get( 'CommentsRepository' );

			commentsRepository.addCommentThread( { threadId: 't1', target: () => null } );

			expect( commentsRepository.getCommentThreads().length ).toBe( 1 );
			expect( commentsRepository.getCommentThreads()[ 0 ].threadId ).toBe( 't1' );

			watchdog._save();

			await new Promise( res => {
				setTimeout( () => throwCKEditorError( 'foo', watchdog.editor ) );

				watchdog.on( 'restart', res );
			} );

			const restoredCommentThreads = watchdog.editor.plugins.get( 'CommentsRepository' ).getCommentThreads();

			expect( restoredCommentThreads.length ).toBe( 1 );
			expect( restoredCommentThreads[ 0 ].threadId ).toBe( 't1' );
		} );

		it( 'should support suggestions', async () => {
			await watchdog.create( '<p>Foo bar</p>', {
				plugins: [ Paragraph, TrackChanges, Clipboard ],
				comments: {
					editorConfig: {}
				}
			} );

			stubWindowOnError();

			const suggestionData = {
				id: '1',
				type: 'insertion:subType',
				authorId: 'u1',
				data: null,
				attributes: {}
			};

			const trackChanges = watchdog.editor.plugins.get( 'TrackChanges' );
			const trackChangesEditing = watchdog.editor.plugins.get( 'TrackChangesEditing' );

			trackChangesEditing.addSuggestionData( suggestionData );

			watchdog._save();

			expect( trackChanges.getSuggestions().length ).toBe( 1 );
			expect( trackChanges.getSuggestions()[ 0 ] ).toEqual( suggestionData );

			await new Promise( res => {
				setTimeout( () => throwCKEditorError( 'foo', watchdog.editor ) );

				watchdog.on( 'restart', res );
			} );

			const restoredSuggestions = watchdog.editor.plugins.get( 'TrackChanges' ).getSuggestions();

			expect( restoredSuggestions.length ).toBe( 1 );
			expect( restoredSuggestions[ 0 ] ).toEqual( suggestionData );
		} );

		it( 'should support comment data created by another plugins', async () => {
			// Plugin that creates comment thread on init.
			class InitPlugin {
				constructor( editor ) {
					this.editor = editor;
				}

				init() {
					const commentsRepository = this.editor.plugins.get( 'CommentsRepository' );

					commentsRepository.addCommentThread( { threadId: 't1', target: () => null } );
				}
			}

			await watchdog.create( '<p>Foo bar</p>', {
				plugins: [ Paragraph, CommentsRepository, Clipboard, InitPlugin ],
				comments: {
					editorConfig: {}
				}
			} );

			stubWindowOnError();

			// Set comment thread attributes to test if it will be restored after restart.
			const commentThread = watchdog.editor.plugins.get( 'CommentsRepository' ).getCommentThread( 't1' );
			commentThread.setAttribute( 'test', 'value' );

			watchdog._save();

			await new Promise( res => {
				setTimeout( () => throwCKEditorError( 'foo', watchdog.editor ) );

				watchdog.on( 'restart', res );
			} );

			// Should keep the comment thread up to date even if the InitPlugin creates the new instance.
			expect( watchdog.editor.plugins.get( 'CommentsRepository' ).getCommentThread( 't1' ).attributes ).toEqual( {
				test: 'value'
			} );
		} );

		it( 'should remove comment data created by another plugins when they no longer exist', async () => {
			// Plugin that creates comment thread on init.
			class InitPlugin {
				constructor( editor ) {
					this.editor = editor;
				}

				init() {
					const commentsRepository = this.editor.plugins.get( 'CommentsRepository' );

					commentsRepository.addCommentThread( { threadId: 't1', target: () => null } );
				}
			}

			await watchdog.create( '<p>Foo bar</p>', {
				plugins: [ Paragraph, CommentsRepository, Clipboard, InitPlugin ],
				comments: {
					editorConfig: {}
				}
			} );

			stubWindowOnError();

			const commentThread = watchdog.editor.plugins.get( 'CommentsRepository' ).getCommentThread( 't1' );
			commentThread.remove();

			watchdog._save();

			await new Promise( res => {
				setTimeout( () => throwCKEditorError( 'foo', watchdog.editor ) );

				watchdog.on( 'restart', res );
			} );

			// Should not keep the comment since it has been removed before crash.
			expect( watchdog.editor.plugins.get( 'CommentsRepository' ).getCommentThread( 't1' ) ).toBeNull();
		} );

		it( 'should support suggestion data created by another plugins', async () => {
			// Plugin that creates suggestion on init.
			class InitPlugin {
				constructor( editor ) {
					this.editor = editor;
				}

				init() {
					const trackChangesEditing = this.editor.plugins.get( 'TrackChangesEditing' );

					trackChangesEditing.addSuggestionData( {
						id: '1',
						type: 'insertion:subType',
						authorId: 'u1',
						data: null,
						createdAt: new Date(),
						attributes: {}
					} );
				}
			}

			await watchdog.create( '<p>Foo bar</p>', {
				plugins: [ Paragraph, Clipboard, TrackChanges, InitPlugin ],
				comments: {
					editorConfig: {}
				}
			} );

			stubWindowOnError();

			// Set comment thread attributes to test if it will be restored after restart.
			const suggestion = watchdog.editor.plugins.get( 'TrackChangesEditing' ).getSuggestion( '1' );

			// Set suggestion attributes to test if it will be restored after restart.
			suggestion.setAttribute( 'test', 'value' );

			watchdog._save();

			await new Promise( res => {
				setTimeout( () => throwCKEditorError( 'foo', watchdog.editor ) );

				watchdog.on( 'restart', res );
			} );

			// Should keep the suggestion attributes up to date even if the InitPlugin creates the new instance.
			expect( watchdog.editor.plugins.get( 'TrackChangesEditing' ).getSuggestion( '1' ).attributes ).toEqual( {
				test: 'value'
			} );
		} );

		it( 'should remove suggestion data created by another plugins when they no longer exist', async () => {
			// Plugin that creates suggestion on init.
			class InitPlugin {
				constructor( editor ) {
					this.editor = editor;
				}

				init() {
					const trackChangesEditing = this.editor.plugins.get( 'TrackChangesEditing' );

					trackChangesEditing.addSuggestionData( {
						id: '1',
						type: 'insertion:subType',
						authorId: 'u1',
						data: null,
						createdAt: new Date(),
						attributes: {}
					} );
				}
			}

			await watchdog.create( '<p>Foo bar</p>', {
				plugins: [ Paragraph, Clipboard, TrackChanges, InitPlugin ],
				comments: {
					editorConfig: {}
				}
			} );

			stubWindowOnError();

			const suggestion = watchdog.editor.plugins.get( 'TrackChangesEditing' ).getSuggestion( '1' );
			watchdog.editor.plugins.get( 'TrackChangesEditing' )._removeSuggestion( suggestion );

			watchdog._save();

			await new Promise( res => {
				setTimeout( () => throwCKEditorError( 'foo', watchdog.editor ) );

				watchdog.on( 'restart', res );
			} );

			// Should not keep the suggestion since it has been removed before crash.
			expect( watchdog.editor.plugins.get( 'TrackChangesEditing' ).getSuggestion( '1' ) ).toBeNull();
		} );
	} );

	describe( 'error handling', () => {
		it( 'Watchdog should not restart editor during the initialization', () => {
			const watchdog = new EditorWatchdog( ClassicTestEditor );
			let editor;

			watchdog.setCreator( async el => {
				editor = await ClassicTestEditor.create( el );
				await Promise.reject( new Error( 'foo' ) );
			} );

			return watchdog.create( element ).then(
				() => { throw new Error( '`watchdog.create()` should throw an error.' ); },
				err => {
					expect( err ).toBeInstanceOf( Error );
					expect( err.message ).toBe( 'foo' );

					return editor.destroy();
				}
			);
		} );

		it( 'Watchdog should not restart editor during the destroy', async () => {
			const watchdog = new EditorWatchdog( ClassicTestEditor );

			watchdog.setDestructor( () => Promise.reject( new Error( 'foo' ) ) );

			await watchdog.create( element );

			let caughtError = false;
			const editor = watchdog.editor;

			try {
				await watchdog.destroy();
			} catch ( err ) {
				caughtError = true;
				expect( err ).toBeInstanceOf( Error );
				expect( err.message ).toBe( 'foo' );

				await editor.destroy();
			}

			if ( !caughtError ) {
				throw new Error( '`watchdog.create()` should throw an error.' );
			}
		} );

		it( 'Watchdog should not hide intercepted errors', () => {
			const watchdog = new EditorWatchdog( ClassicTestEditor );

			const windowErrorSpy = stubWindowOnError();

			return watchdog.create( element ).then( () => {
				setTimeout( () => throwCKEditorError( 'foo', watchdog.editor ) );

				return new Promise( res => {
					watchdog.on( 'restart', () => {
						expect( windowErrorSpy ).toHaveBeenCalledOnce();

						// Various browsers will display the error slightly differently.
						expect( windowErrorSpy.mock.calls[ 0 ][ 0 ] ).toMatch( /foo/ );

						watchdog.destroy().then( res );
					} );
				} );
			} );
		} );

		it( 'Watchdog should intercept editor errors and restart the editor during the runtime', () => {
			const watchdog = new EditorWatchdog( ClassicTestEditor );

			stubWindowOnError();

			return watchdog.create( element ).then( () => {
				setTimeout( () => throwCKEditorError( 'foo', watchdog.editor ) );

				return new Promise( res => {
					watchdog.on( 'restart', () => {
						watchdog.destroy().then( res );
					} );
				} );
			} );
		} );

		it( 'Watchdog should not intercept non-editor errors', () => {
			const watchdog = new EditorWatchdog( ClassicTestEditor );

			const editorErrorSpy = vi.fn();
			watchdog.on( 'error', editorErrorSpy );

			const watchdogErrorHandlerSpy = vi.spyOn( watchdog, '_handleError' );

			stubWindowOnError( { swallowAllErrors: true } );

			return watchdog.create( element ).then( () => {
				const error = new Error( 'foo' );

				setTimeout( () => {
					throw error;
				} );

				setTimeout( () => {
					throw 'bar';
				} );

				setTimeout( () => {
					throw null;
				} );

				return new Promise( res => {
					setTimeout( () => {
						expect( editorErrorSpy ).not.toHaveBeenCalled();

						// Assert that only instances of the `Error` class will be checked deeper.
						expect( watchdogErrorHandlerSpy ).toHaveBeenCalledOnce();
						expect( watchdogErrorHandlerSpy.mock.calls[ 0 ][ 0 ] ).toBe( error );

						watchdog.destroy().then( res );
					} );
				} );
			} );
		} );

		it( 'Watchdog should not intercept other editor errors', () => {
			const watchdog1 = new EditorWatchdog( ClassicTestEditor );
			const watchdog2 = new EditorWatchdog( ClassicTestEditor );

			const config = {
				plugins: []
			};

			stubWindowOnError();

			return Promise.all( [
				watchdog1.create( element, config ),
				watchdog2.create( element, config )
			] ).then( () => {
				return new Promise( res => {
					const watchdog1ErrorSpy = vi.fn();
					const watchdog2ErrorSpy = vi.fn();

					watchdog1.on( 'restart', watchdog1ErrorSpy );
					watchdog2.on( 'restart', watchdog2ErrorSpy );

					setTimeout( () => throwCKEditorError( 'foo', watchdog2.editor ) );

					setTimeout( () => {
						expect( watchdog1ErrorSpy ).not.toHaveBeenCalled();
						expect( watchdog2ErrorSpy ).toHaveBeenCalledOnce();

						Promise.all( [ watchdog1.destroy(), watchdog2.destroy() ] )
							.then( res );
					} );
				} );
			} );
		} );

		it( 'Watchdog should intercept editor errors and restart the editor if the editor can be found from the context', async () => {
			const watchdog = new EditorWatchdog( ClassicTestEditor );

			stubWindowOnError();

			await watchdog.create( element );

			setTimeout( () => throwCKEditorError( 'foo', watchdog.editor.model.document ) );

			await new Promise( res => {
				watchdog.on( 'restart', () => {
					watchdog.destroy().then( res );
				} );
			} );
		} );

		it( 'Watchdog should intercept editor errors and restart the editor if the editor can be found from the context #2', async () => {
			const watchdog = new EditorWatchdog( ClassicTestEditor );

			stubWindowOnError();

			await watchdog.create( element );

			setTimeout( () => throwCKEditorError( 'foo', {
				foo: [ 1, 2, 3, {
					bar: new Set( [
						new Map( /** @type any */( [
							[ 'foo', 'bar' ],
							[ 0, watchdog.editor ]
						] ) )
					] )
				} ]
			} ) );

			await new Promise( res => {
				watchdog.on( 'restart', () => {
					watchdog.destroy().then( res );
				} );
			} );
		} );

		it( 'Watchdog should crash permanently if the `crashNumberLimit` is reached' +
			' and the average time between errors is lower than `minimumNonErrorTimePeriod` (default values)', async () => {
			const watchdog = new EditorWatchdog( ClassicTestEditor );

			const errorSpy = vi.fn();
			watchdog.on( 'error', errorSpy );

			const restartSpy = vi.fn();
			watchdog.on( 'restart', restartSpy );

			stubWindowOnError();

			await watchdog.create( element );

			setTimeout( () => throwCKEditorError( 'foo1', watchdog.editor ) );
			setTimeout( () => throwCKEditorError( 'foo2', watchdog.editor ) );
			setTimeout( () => throwCKEditorError( 'foo3', watchdog.editor ) );
			setTimeout( () => throwCKEditorError( 'foo4', watchdog.editor ) );

			await waitCycle();

			expect( errorSpy ).toHaveBeenCalledTimes( 4 );
			expect( watchdog.crashes.length ).toBe( 4 );
			expect( restartSpy ).toHaveBeenCalledTimes( 3 );

			await watchdog.destroy();
		} );

		it( 'Watchdog should crash permanently if the `crashNumberLimit` is reached' +
			' and the average time between errors is lower than `minimumNonErrorTimePeriod` (custom values)', async () => {
			const watchdog = new EditorWatchdog( ClassicTestEditor, { crashNumberLimit: 2, minimumNonErrorTimePeriod: 1000 } );

			const errorSpy = vi.fn();
			watchdog.on( 'error', errorSpy );

			const restartSpy = vi.fn();
			watchdog.on( 'restart', restartSpy );

			stubWindowOnError();

			await watchdog.create( element );

			setTimeout( () => throwCKEditorError( 'foo1', watchdog.editor ) );
			setTimeout( () => throwCKEditorError( 'foo2', watchdog.editor ) );
			setTimeout( () => throwCKEditorError( 'foo3', watchdog.editor ) );
			setTimeout( () => throwCKEditorError( 'foo4', watchdog.editor ) );

			await waitCycle();

			expect( errorSpy ).toHaveBeenCalledTimes( 3 );
			expect( watchdog.crashes.length ).toBe( 3 );
			expect( restartSpy ).toHaveBeenCalledTimes( 2 );

			await watchdog.destroy();
		} );

		it( 'Watchdog should not crash permanently when average time between errors' +
			' is longer than `minimumNonErrorTimePeriod`', async () => {
			const watchdog = new EditorWatchdog( ClassicTestEditor, { crashNumberLimit: 2, minimumNonErrorTimePeriod: 0 } );

			const errorSpy = vi.fn();
			watchdog.on( 'error', errorSpy );

			const restartSpy = vi.fn();
			watchdog.on( 'restart', restartSpy );

			stubWindowOnError();

			await watchdog.create( element );

			setTimeout( () => throwCKEditorError( 'foo1', watchdog.editor ), 5 );
			setTimeout( () => throwCKEditorError( 'foo2', watchdog.editor ), 10 );
			setTimeout( () => throwCKEditorError( 'foo3', watchdog.editor ), 15 );
			setTimeout( () => throwCKEditorError( 'foo4', watchdog.editor ), 20 );

			await new Promise( res => {
				setTimeout( res, 20 );
			} );

			expect( errorSpy ).toHaveBeenCalledTimes( 4 );
			expect( watchdog.crashes.length ).toBe( 4 );
			expect( restartSpy ).toHaveBeenCalledTimes( 4 );

			await watchdog.destroy();
		} );

		it.skip( 'Watchdog should warn if the CKEditorError is missing its context', async () => {
			const watchdog = new EditorWatchdog( ClassicTestEditor );

			stubWindowOnError();

			const consoleWarnStub = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

			await watchdog.create( element );

			setTimeout( () => throwCKEditorError( 'foo' ) );

			await waitCycle();

			expect( watchdog.crashes ).toEqual( [] );

			expect( consoleWarnStub ).toHaveBeenCalledWith(
				'The error is missing its context and Watchdog cannot restart the proper item.'
			);

			await watchdog.destroy();
		} );

		it( 'Watchdog should omit error if the CKEditorError context is equal to null', async () => {
			const watchdog = new EditorWatchdog( ClassicTestEditor );

			stubWindowOnError();

			await watchdog.create( element );

			setTimeout( () => throwCKEditorError( 'foo', null ) );

			await waitCycle();

			expect( watchdog.crashes ).toEqual( [] );

			await watchdog.destroy();
		} );

		it( 'editor should be restarted with the data from before the crash #1', () => {
			const watchdog = new EditorWatchdog( ClassicTestEditor );

			stubWindowOnError();

			return watchdog.create( element, {
				initialData: '<p>foo</p>',
				plugins: [ Paragraph ]
			} ).then( () => {
				setTimeout( () => throwCKEditorError( 'foo', watchdog.editor ) );

				return new Promise( res => {
					watchdog.on( 'restart', () => {
						expect( watchdog.editor.getData() ).toBe( '<p>foo</p>' );

						watchdog.destroy().then( res );
					} );
				} );
			} );
		} );

		it( 'editor should be restarted with the data before the crash #2', () => {
			const watchdog = new EditorWatchdog( ClassicTestEditor );

			stubWindowOnError();

			return watchdog.create( element, {
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
						expect( watchdog.editor.getData() ).toBe( '<p>foo</p>bar' );

						watchdog.destroy().then( res );
					} );
				} );
			} );
		} );

		it( 'editor should be restarted with the data of the latest document version before the crash', async () => {
			const watchdog = new EditorWatchdog( ClassicTestEditor );

			stubWindowOnError();

			await watchdog.create( element, {
				initialData: '<p>foo</p>',
				plugins: [ Paragraph ]
			} );

			const model = watchdog.editor.model;
			const doc = model.document;

			const watchdogRestartPromise = new Promise( res => {
				watchdog.on( 'restart', res );
			} );

			// Throw an error inside the change() block.
			// The watchdog should be then restarted from the state before this change block.
			setTimeout( () => {
				model.change( writer => {
					writer.insertText( 'bar', writer.createPositionAt( doc.getRoot(), 1 ) );

					throwCKEditorError( 'foo', watchdog.editor );
				} );
			} );

			await watchdogRestartPromise;

			expect( watchdog.editor.getData() ).toBe( '<p>foo</p>' );

			await watchdog.destroy();
		} );

		it( 'editor should be restarted with the latest available data before the crash', async () => {
			const watchdog = new EditorWatchdog( ClassicTestEditor );

			stubWindowOnError();

			const consoleErrorStub = vi.spyOn( console, 'error' ).mockImplementation( () => {} );

			await watchdog.create( element, {
				initialData: '<p>foo</p>',
				plugins: [ Paragraph ]
			} );

			const editorGetDataError = new Error( 'Some error' );
			const getDataStub = vi.spyOn( watchdog, '_getData' )
				.mockImplementationOnce( () => {
					throw editorGetDataError;
				} )
				.mockImplementationOnce( () => ( {} ) );
			// Keep the reference to cleanly destroy it at in the end, as during the TC it
			// throws an exception during destruction.
			const firstEditor = watchdog.editor;

			await new Promise( res => {
				const doc = watchdog.editor.model.document;

				watchdog.editor.model.change( writer => {
					writer.insertText( 'bar', writer.createPositionAt( doc.getRoot(), 1 ) );
				} );

				setTimeout( () => throwCKEditorError( 'foo', watchdog.editor ) );

				watchdog.on( 'restart', async () => {
					// It is called second time by during the default editor destruction
					// to update the source element.
					expect( getDataStub ).toHaveBeenCalledTimes( 2 );

					expect( watchdog.editor.getData() ).toBe( '<p>foo</p>' );

					expect( consoleErrorStub ).toHaveBeenCalledWith(
						editorGetDataError,
						'An error happened during restoring editor data. Editor will be restored from the previously saved data.'
					);

					await watchdog.destroy();

					getDataStub.mockRestore();

					await firstEditor.destroy();

					res();
				} );
			} );
		} );

		it( 'should use the custom destructor if passed', () => {
			const watchdog = new EditorWatchdog( ClassicTestEditor );
			const destructionSpy = vi.fn();

			watchdog.setDestructor( editor => {
				destructionSpy();
				return editor.destroy();
			} );

			stubWindowOnError();

			return watchdog.create( element ).then( () => {
				setTimeout( () => throwCKEditorError( 'foo', watchdog.editor ) );

				return new Promise( res => {
					watchdog.on( 'restart', () => {
						expect( destructionSpy ).toHaveBeenCalledOnce();

						watchdog.destroy().then( res );
					} );
				} );
			} );
		} );

		it( 'should handle the error when the editor destroying failed', async () => {
			const watchdog = new EditorWatchdog( ClassicTestEditor );

			stubWindowOnError();

			const consoleErrorStub = vi.spyOn( console, 'error' ).mockImplementation( () => {} );

			await watchdog.create( element, {
				initialData: '<p>foo</p>',
				plugins: [ Paragraph ]
			} );

			const editorGetDataError = new Error( 'Some error' );
			const destroyStub = vi.spyOn( watchdog, '_destroy' )
				.mockImplementation( () => {
					throw editorGetDataError;
				} );

			// Keep the reference to cleanly destroy it at in the end, as during the TC it
			// throws an exception during destruction.
			const firstEditor = watchdog.editor;

			await new Promise( res => {
				setTimeout( () => throwCKEditorError( 'foo', watchdog.editor ) );

				watchdog.on( 'restart', async () => {
					expect( consoleErrorStub ).toHaveBeenCalledWith(
						'An error happened during the editor destroying.',
						expect.anything()
					);

					destroyStub.mockRestore();

					await watchdog.destroy();
					await firstEditor.destroy();

					res();
				} );
			} );
		} );
	} );

	describe( 'async error handling', () => {
		let unhandledRejectionEventSupported;

		beforeAll( () => {
			return isUnhandledRejectionEventSupported()
				.then( val => {
					unhandledRejectionEventSupported = val;
				} );
		} );

		it( 'Watchdog should handle async CKEditorError errors', () => {
			if ( !unhandledRejectionEventSupported ) {
				return;
			}

			const watchdog = new EditorWatchdog( ClassicTestEditor );

			stubWindowOnError();

			return watchdog.create( element, {
				initialData: '<p>foo</p>',
				plugins: [ Paragraph ]
			} ).then( () => {
				const oldEditor = watchdog.editor;

				Promise.resolve().then( () => throwCKEditorError( 'foo', watchdog.editor ) );

				return new Promise( res => {
					watchdog.on( 'restart', () => {
						expect( watchdog.editor ).not.toBe( oldEditor );
						expect( watchdog.editor.getData() ).toBe( '<p>foo</p>' );

						watchdog.destroy().then( res );
					} );
				} );
			} );
		} );

		it( 'Watchdog should not react to non-editor async errors', () => {
			if ( !unhandledRejectionEventSupported ) {
				return;
			}

			const watchdog = new EditorWatchdog( ClassicTestEditor );
			const editorErrorSpy = vi.fn();

			stubWindowOnError();

			return watchdog.create( element, {
				initialData: '<p>foo</p>',
				plugins: [ Paragraph ]
			} ).then( () => {
				watchdog.on( 'error', editorErrorSpy );

				// These async errors are unhandled by design – the test verifies that the watchdog ignores them.
				// Wait until both `unhandledrejection` events have actually been dispatched so they are
				// handled here (and thus not reported as unexpected by the test runner) instead of leaking
				// out after the test has finished.
				const bothRejectionsDispatched = new Promise( res => {
					let count = 0;
					const handler = evt => {
						evt.preventDefault();

						if ( ++count === 2 ) {
							window.removeEventListener( 'unhandledrejection', handler );
							res();
						}
					};

					window.addEventListener( 'unhandledrejection', handler );
				} );

				Promise.resolve().then( () => Promise.reject( 'foo' ) );
				Promise.resolve().then( () => Promise.reject( new Error( 'bar' ) ) );

				return bothRejectionsDispatched;
			} ).then( () => {
				expect( editorErrorSpy ).not.toHaveBeenCalled();
				expect( watchdog.editor.getData() ).toBe( '<p>foo</p>' );

				return watchdog.destroy();
			} );
		} );
	} );

	describe( 'destroying', () => {
		// See https://github.com/ckeditor/ckeditor5/issues/4706.
		it( 'destroy() should clean internal stuff', () => {
			// 30ms should be enough to make the two data changes split into two data save actions.
			// This will ensure that the second data save action will be put off in time.
			const SAVE_INTERVAL = 30;

			const watchdog = new EditorWatchdog( ClassicTestEditor, {
				saveInterval: SAVE_INTERVAL
			} );

			return watchdog.create( element, {
				initialData: '<p>foo</p>',
				plugins: [ Paragraph ]
			} ).then( () => {
				const doc = watchdog.editor.model.document;

				watchdog.editor.model.change( writer => {
					writer.insertText( 'bar', writer.createPositionAt( doc.getRoot(), 1 ) );
				} );

				watchdog.editor.model.change( writer => {
					writer.insertText( 'foo', writer.createPositionAt( doc.getRoot(), 1 ) );
				} );

				return watchdog.destroy();
			} ).then( () => {
				// Wait to ensure that the throttled save is cleared and won't be executed
				// on the non-existing editor.
				return new Promise( res => setTimeout( res, SAVE_INTERVAL ) );
			} ).then( () => {
				expect( watchdog.editor ).toBe( null );
				expect( watchdog.state ).toBe( 'destroyed' );
				expect( watchdog.crashes ).toEqual( [] );
			} );
		} );

		// See https://github.com/ckeditor/ckeditor5/issues/10643.
		it( 'watchdog should remove the listener for `change:data` event before destroying the editor', async () => {
			const watchdog = new EditorWatchdog( ClassicTestEditor );

			const spy = vi.fn();

			// A plugin that modifies the editor data during the destruction phase.
			class InvalidPlugin {
				constructor( editor ) {
					this.editor = editor;
				}

				destroy() {
					const doc = this.editor.model.document;

					this.editor.model.change( writer => {
						writer.insertText( 'bar', writer.createPositionAt( doc.getRoot(), 1 ) );
						spy();
					} );
				}
			}

			await watchdog.create( element, {
				initialData: '<p>foo</p>',
				plugins: [ InvalidPlugin, Paragraph ]
			} );

			await watchdog._restart();

			// The watchdog during destroying the editor should not listen to the data changes.
			expect( spy ).toHaveBeenCalledOnce();
			expect( watchdog.editor.getData() ).toBe( '<p>foo</p>' );

			await watchdog.destroy();

			expect( spy ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'should destroy the editor after finishing the ongoing creation process', async () => {
			const watchdog = new EditorWatchdog( ClassicTestEditor );

			// Do not wait for the creation process to finish.
			watchdog.create( element, {
				initialData: '<p>foo</p>',
				plugins: [ Paragraph ]
			} );

			await watchdog.destroy();

			expect( watchdog.editor ).toBe( null );
			expect( watchdog.state ).toBe( 'destroyed' );
		} );
	} );

	describe( 'crashes', () => {
		it( 'should be an array of caught errors by the watchdog', () => {
			const watchdog = new EditorWatchdog( ClassicTestEditor );

			stubWindowOnError();

			return watchdog.create( element ).then( () => {
				setTimeout( () => throwCKEditorError( 'foo', watchdog.editor ) );
				setTimeout( () => throwCKEditorError( 'bar', watchdog.editor ) );

				return new Promise( res => {
					setTimeout( () => {
						expect( watchdog.crashes[ 0 ].message ).toMatch( /^foo/ );
						expect( watchdog.crashes[ 0 ].stack ).toBeTypeOf( 'string' );
						expect( watchdog.crashes[ 0 ].date ).toBeTypeOf( 'number' );
						expect( watchdog.crashes[ 0 ].filename ).toBeTypeOf( 'string' );
						expect( watchdog.crashes[ 0 ].lineno ).toBeTypeOf( 'number' );
						expect( watchdog.crashes[ 0 ].colno ).toBeTypeOf( 'number' );

						expect( watchdog.crashes[ 1 ].message ).toMatch( /^bar/ );

						watchdog.destroy().then( res );
					} );
				} );
			} );
		} );

		it( 'should include async errors', () => {
			return isUnhandledRejectionEventSupported().then( isSupported => {
				if ( !isSupported ) {
					return;
				}

				const watchdog = new EditorWatchdog( ClassicTestEditor );

				stubWindowOnError();

				return watchdog.create( element ).then( () => {
					Promise.resolve().then( () => throwCKEditorError( 'foo', watchdog.editor ) );

					return new Promise( res => {
						// This `setTimeout` needs to have a timer defined because Firefox calls the code in random order
						// and causes the test failed.
						setTimeout( () => {
							expect( watchdog.crashes[ 0 ].message ).toMatch( /^foo/ );
							expect( watchdog.crashes[ 0 ].stack ).toBeTypeOf( 'string' );
							expect( watchdog.crashes[ 0 ].date ).toBeTypeOf( 'number' );
							expect( watchdog.crashes[ 0 ].filename ).toBeUndefined();
							expect( watchdog.crashes[ 0 ].lineno ).toBeUndefined();
							expect( watchdog.crashes[ 0 ].colno ).toBeUndefined();

							watchdog.destroy().then( res );
						}, 10 );
					} );
				} );
			} );
		} );
	} );

	describe( 'state', () => {
		it( 'should reflect the state of the watchdog', async () => {
			const watchdog = new EditorWatchdog( ClassicTestEditor );

			stubWindowOnError();

			expect( watchdog.state ).toBe( 'initializing' );

			await watchdog.create( element );

			expect( watchdog.state ).toBe( 'ready' );

			setTimeout( () => throwCKEditorError( 'foo', watchdog.editor ) );
			setTimeout( () => throwCKEditorError( 'bar', watchdog.editor ) );

			await waitCycle();

			expect( watchdog.state ).toBe( 'ready' );

			await watchdog.destroy();

			expect( watchdog.state ).toBe( 'destroyed' );
		} );

		it( 'should be observable', async () => {
			const watchdog = new EditorWatchdog( ClassicTestEditor );
			const states = [];

			watchdog.on( 'stateChange', () => {
				states.push( watchdog.state );
			} );

			stubWindowOnError();

			await watchdog.create( element );

			setTimeout( () => throwCKEditorError( 'foo', watchdog.editor ) );
			setTimeout( () => throwCKEditorError( 'bar', watchdog.editor ) );
			setTimeout( () => throwCKEditorError( 'baz', watchdog.editor ) );
			setTimeout( () => throwCKEditorError( 'biz', watchdog.editor ) );

			await waitCycle();

			await watchdog.destroy();

			expect( states ).toEqual( [
				'ready',
				'crashed',
				'initializing',
				'ready',
				'crashed',
				'initializing',
				'ready',
				'crashed',
				'initializing',
				'ready',
				'crashed',
				'crashedPermanently',
				'destroyed'
			] );
		} );
	} );

	describe( 'config-based editor creator', () => {
		it( 'should create a single-root editor using the default Editor class', async () => {
			const watchdog = new EditorWatchdog( ClassicTestEditor );

			await watchdog.create( {
				root: { initialData: '<p>foo</p>' },
				plugins: [ Paragraph ]
			} );

			expect( watchdog.editor.getData() ).toBe( '<p>foo</p>' );

			await watchdog.destroy();
		} );

		it( 'should create a single-root editor using a custom creator', async () => {
			const watchdog = new EditorWatchdog();

			watchdog.setCreator( ( elementOrData, config ) => {
				if ( !elementOrData ) {
					return ClassicTestEditor.create( config );
				}

				return ClassicTestEditor.create( elementOrData, config );
			} );

			await watchdog.create( {
				root: { initialData: '<p>foo</p>' },
				plugins: [ Paragraph ]
			} );

			expect( watchdog.editor.getData() ).toBe( '<p>foo</p>' );

			await watchdog.destroy();
		} );

		it( 'should properly restart a single-root editor after crash', async () => {
			const watchdog = new EditorWatchdog( ClassicTestEditor );

			stubWindowOnError();

			await watchdog.create( {
				root: { initialData: '<p>foo</p>' },
				plugins: [ Paragraph ]
			} );

			const restartSpy = vi.fn();
			watchdog.on( 'restart', restartSpy );

			setTimeout( () => throwCKEditorError( 'foo', watchdog.editor ) );

			await waitCycle();

			expect( restartSpy ).toHaveBeenCalledOnce();

			expect( watchdog.editor.getData() ).toBe( '<p>foo</p>' );

			await watchdog.destroy();
		} );

		it( 'should properly restart a single-root editor and keep root attributes', async () => {
			const watchdog = new EditorWatchdog( ClassicTestEditor );

			stubWindowOnError();

			await watchdog.create( {
				root: { initialData: '<p>foo</p>' },
				plugins: [ Paragraph ]
			} );

			const root = watchdog.editor.model.document.getRoot();

			watchdog.editor.model.change( writer => {
				writer.setAttribute( 'test', 1, root );
			} );

			expect( root.getAttribute( 'test' ) ).toBe( 1 );

			const restartSpy = vi.fn();
			watchdog.on( 'restart', restartSpy );

			setTimeout( () => throwCKEditorError( 'foo', watchdog.editor ) );

			await waitCycle();

			expect( restartSpy ).toHaveBeenCalledOnce();

			expect( watchdog.editor.model.document.getRoot().getAttribute( 'test' ) ).toBe( 1 );

			await watchdog.destroy();
		} );

		it( 'should create a multi-root editor using config-based creator', async () => {
			const watchdog = new EditorWatchdog( MultiRootEditor );

			await watchdog.create( {
				roots: {
					header: { initialData: '<p>Foo</p>' },
					content: { initialData: '<p>Bar</p>' }
				},
				plugins: [ Paragraph ]
			} );

			expect( watchdog.editor.getFullData() ).toEqual( {
				header: '<p>Foo</p>',
				content: '<p>Bar</p>'
			} );

			await watchdog.destroy();
		} );

		it( 'should properly restart a multi-root editor after crash', async () => {
			const watchdog = new EditorWatchdog( MultiRootEditor );

			stubWindowOnError();

			await watchdog.create( {
				roots: {
					header: {
						initialData: '<p>Foo</p>',
						modelAttributes: { order: 1 }
					},
					content: {
						initialData: '<p>Bar</p>',
						modelAttributes: { order: 2 }
					}
				},
				plugins: [ Paragraph ]
			} );

			const restartSpy = vi.fn();
			watchdog.on( 'restart', restartSpy );

			setTimeout( () => throwCKEditorError( 'foo', watchdog.editor ) );

			await waitCycle();

			expect( restartSpy ).toHaveBeenCalledOnce();

			expect( watchdog.editor.getFullData() ).toEqual( {
				header: '<p>Foo</p>',
				content: '<p>Bar</p>'
			} );

			expect( watchdog.editor.getRootsAttributes() ).toEqual( {
				header: { order: 1, $rootEditableOptions: {} },
				content: { order: 2, $rootEditableOptions: {} }
			} );

			await watchdog.destroy();
		} );

		it( 'should restore a root containing an empty element after crash', async () => {
			const watchdog = new EditorWatchdog( MultiRootEditor );

			stubWindowOnError();

			await watchdog.create( {
				roots: {
					content: { initialData: '<p>Foo</p><p></p>' }
				},
				plugins: [ Paragraph ]
			} );

			const restartSpy = vi.fn();
			watchdog.on( 'restart', restartSpy );

			setTimeout( () => throwCKEditorError( 'foo', watchdog.editor ) );

			await waitCycle();

			expect( restartSpy ).toHaveBeenCalledOnce();

			// The empty paragraph (an element node without children) is restored along with the non-empty one.
			expect( watchdog.editor.getData( { rootName: 'content' } ) ).toBe( '<p>Foo</p><p>&nbsp;</p>' );

			await watchdog.destroy();
		} );

		it( 'should keep a detached config-provided root element after crash', async () => {
			const watchdog = new EditorWatchdog( MultiRootEditor );
			const contentElement = document.createElement( 'div' );

			stubWindowOnError();

			await watchdog.create( {
				roots: {
					content: { initialData: '<p>Bar</p>', element: contentElement }
				},
				plugins: [ Paragraph ]
			} );

			const restartSpy = vi.fn();
			watchdog.on( 'restart', restartSpy );

			setTimeout( () => throwCKEditorError( 'foo', watchdog.editor ) );

			await waitCycle();

			expect( restartSpy ).toHaveBeenCalledOnce();
			expect( watchdog.editor.getData( { rootName: 'content' } ) ).toBe( '<p>Bar</p>' );

			await watchdog.destroy();
		} );

		it( 'should properly handle added and removed roots in a multi-root editor after crash', async () => {
			const watchdog = new EditorWatchdog( MultiRootEditor );
			vi.useFakeTimers();

			stubWindowOnError();

			await watchdog.create( {
				roots: {
					header: {
						initialData: '<p>Foo</p>',
						modelAttributes: { order: 1 }
					},
					content: {
						initialData: '<p>Bar</p>',
						modelAttributes: { order: 2 }
					}
				},
				plugins: [ Paragraph ]
			} );

			watchdog.editor.detachRoot( 'content' );
			watchdog.editor.addRoot( 'new', { data: '<p>New</p>', attributes: { order: 3 } } );

			// Wait for throttled save.
			vi.advanceTimersByTime( 6000 );
			vi.useRealTimers();

			const restartSpy = vi.fn();
			watchdog.on( 'restart', restartSpy );

			setTimeout( () => throwCKEditorError( 'foo', watchdog.editor ) );

			await waitCycle();

			expect( restartSpy ).toHaveBeenCalledOnce();

			expect( watchdog.editor.getFullData() ).toEqual( {
				header: '<p>Foo</p>',
				new: '<p>New</p>'
			} );

			expect( watchdog.editor.getRootsAttributes() ).toEqual( {
				header: { order: 1, $rootEditableOptions: {} },
				new: { order: 3, $rootEditableOptions: {} }
			} );

			await watchdog.destroy();
		} );

		it( 'should bring back an inline root as an inline root after crash', async () => {
			const watchdog = new EditorWatchdog( MultiRootEditor );

			stubWindowOnError();

			await watchdog.create( {
				roots: {
					intro: {
						initialData: 'Article title',
						modelElement: '$inlineRoot'
					},
					content: {
						initialData: '<p>Article body.</p>'
					}
				},
				plugins: [ Paragraph ]
			} );

			expect( watchdog.editor.model.document.getRoot( 'intro' ).name ).toBe( '$inlineRoot' );
			expect( watchdog.editor.model.document.getRoot( 'content' ).name ).toBe( '$root' );

			const dataBefore = watchdog.editor.getFullData();

			const restartSpy = vi.fn();
			watchdog.on( 'restart', restartSpy );

			setTimeout( () => throwCKEditorError( 'foo', watchdog.editor ) );

			await waitCycle();

			expect( restartSpy ).toHaveBeenCalledOnce();

			// The inline root must not degrade to a generic `$root` after the restart.
			expect( watchdog.editor.model.document.getRoot( 'intro' ).name ).toBe( '$inlineRoot' );
			expect( watchdog.editor.model.document.getRoot( 'content' ).name ).toBe( '$root' );

			expect( watchdog.editor.getFullData() ).toEqual( dataBefore );

			await watchdog.destroy();
		} );

		it( 'should bring back an inline root added at runtime after crash', async () => {
			const watchdog = new EditorWatchdog( MultiRootEditor );
			vi.useFakeTimers();

			stubWindowOnError();

			await watchdog.create( {
				roots: {
					content: {
						initialData: '<p>Article body.</p>'
					}
				},
				plugins: [ Paragraph ]
			} );

			watchdog.editor.addRoot( 'intro', { data: 'Runtime title', modelElement: '$inlineRoot' } );

			// Wait for throttled save.
			vi.advanceTimersByTime( 6000 );
			vi.useRealTimers();

			expect( watchdog.editor.model.document.getRoot( 'intro' ).name ).toBe( '$inlineRoot' );

			const dataBefore = watchdog.editor.getFullData();

			const restartSpy = vi.fn();
			watchdog.on( 'restart', restartSpy );

			setTimeout( () => throwCKEditorError( 'foo', watchdog.editor ) );

			await waitCycle();

			expect( restartSpy ).toHaveBeenCalledOnce();

			expect( watchdog.editor.model.document.getRoot( 'intro' ).name ).toBe( '$inlineRoot' );
			expect( watchdog.editor.getFullData() ).toEqual( dataBefore );

			await watchdog.destroy();
		} );

		it( 'should restore editable options of an inline root added at runtime after crash', async () => {
			const watchdog = new EditorWatchdog( MultiRootEditor );
			vi.useFakeTimers();

			stubWindowOnError();

			await watchdog.create( {
				roots: {
					content: {
						initialData: '<p>Article body.</p>'
					}
				},
				plugins: [ Paragraph ]
			} );

			watchdog.editor.addRoot( 'intro', {
				data: 'Runtime title',
				modelElement: '$inlineRoot',
				element: 'h1',
				placeholder: 'Type title',
				label: 'Article title'
			} );

			// Wait for throttled save.
			vi.advanceTimersByTime( 6000 );
			vi.useRealTimers();

			const restartSpy = vi.fn();
			watchdog.on( 'restart', restartSpy );

			setTimeout( () => throwCKEditorError( 'foo', watchdog.editor ) );

			await waitCycle();

			expect( restartSpy ).toHaveBeenCalledOnce();

			expect( watchdog.editor.model.document.getRoot( 'intro' ).name ).toBe( '$inlineRoot' );

			// The editable element tag name, placeholder and label are rebuilt from `$rootEditableOptions` restored after the restart.
			expect( watchdog.editor.ui.getEditableElement( 'intro' ).tagName ).toBe( 'H1' );
			expect( watchdog.editor.getRootsAttributes().intro.$rootEditableOptions ).toEqual( {
				element: { name: 'h1' },
				placeholder: 'Type title',
				label: 'Article title'
			} );

			await watchdog.destroy();
		} );

		it( 'should reuse a connected DOM editable after crash in config-based mode', async () => {
			const watchdog = new EditorWatchdog( MultiRootEditor );

			stubWindowOnError();

			await watchdog.create( {
				roots: {
					header: { initialData: '<p>Foo</p>' },
					content: { initialData: '<p>Bar</p>' }
				},
				plugins: [ Paragraph ]
			} );

			// In config-based mode the editor creates the editables, but leaves placing them in the DOM to the integration.
			// Connect the header editable so the watchdog can reuse the very same element after the restart.
			const headerEditable = watchdog.editor.ui.getEditableElement( 'header' );
			document.body.appendChild( headerEditable );

			const restartSpy = vi.fn();
			watchdog.on( 'restart', restartSpy );

			setTimeout( () => throwCKEditorError( 'foo', watchdog.editor ) );

			await waitCycle();

			expect( restartSpy ).toHaveBeenCalledOnce();

			// The previously connected DOM editable is reused instead of creating a fresh detached one.
			expect( watchdog.editor.ui.getEditableElement( 'header' ) ).toBe( headerEditable );
			expect( headerEditable.isConnected ).toBe( true );
			expect( watchdog.editor.getData( { rootName: 'header' } ) ).toBe( '<p>Foo</p>' );

			await watchdog.destroy();

			headerEditable.remove();
		} );

		it( 'should not break the restart when the saved $rootEditableOptions value is invalid', async () => {
			const watchdog = new EditorWatchdog( MultiRootEditor );
			vi.useFakeTimers();

			stubWindowOnError();

			await watchdog.create( {
				roots: {
					content: { initialData: '<p>Article body.</p>' }
				},
				plugins: [ Paragraph ]
			} );

			watchdog.editor.addRoot( 'intro', { data: 'Runtime title', modelElement: '$inlineRoot' } );

			// Simulate a corrupted or injected attribute value that is not a valid options object.
			watchdog.editor.model.change( writer => {
				writer.setAttribute( '$rootEditableOptions', null, watchdog.editor.model.document.getRoot( 'intro' ) );
			} );

			// Wait for throttled save.
			vi.advanceTimersByTime( 6000 );
			vi.useRealTimers();

			const dataBefore = watchdog.editor.getFullData();

			const restartSpy = vi.fn();
			watchdog.on( 'restart', restartSpy );

			setTimeout( () => throwCKEditorError( 'foo', watchdog.editor ) );

			await waitCycle();

			// The invalid value must be ignored instead of breaking the restart.
			expect( restartSpy ).toHaveBeenCalledOnce();

			expect( watchdog.editor.model.document.getRoot( 'intro' ).name ).toBe( '$inlineRoot' );
			expect( watchdog.editor.getFullData() ).toEqual( dataBefore );

			await watchdog.destroy();
		} );
	} );

	describe( '_detectConfigBasedCreator()', () => {
		it( 'should detect legacy signature when first arg is an object with string values (multi-root)', async () => {
			const watchdog = new EditorWatchdog( MultiRootEditor );

			await watchdog.create( { foo: '<p>Foo</p>' }, { plugins: [ Paragraph ] } );

			expect( watchdog.editor.getData( { rootName: 'foo' } ) ).toBe( '<p>Foo</p>' );

			await watchdog.destroy();
		} );

		it( 'should detect legacy signature when first arg is an object with DOM element values (multi-root)', async () => {
			const watchdog = new EditorWatchdog( MultiRootEditor );

			await watchdog.create( { foo: element }, {
				initialData: { foo: '<p>Foo</p>' },
				plugins: [ Paragraph ]
			} );

			expect( watchdog.editor.getData( { rootName: 'foo' } ) ).toBe( '<p>Foo</p>' );

			await watchdog.destroy();
		} );

		// Covers: multi-root legacy detection when config is not passed as the second argument.
		// This ensures the `values.every()` branch in `_detectConfigBasedCreator()` is reached.
		it( 'should detect legacy signature when first arg is an object with string values and no config', async () => {
			class CustomMultiRootEditor extends MultiRootEditor {}
			CustomMultiRootEditor.builtinPlugins = [ Paragraph ];

			const watchdog = new EditorWatchdog( CustomMultiRootEditor );

			await watchdog.create( { foo: '<p>Foo</p>' } );

			expect( watchdog.editor.getData( { rootName: 'foo' } ) ).toBe( '<p>Foo</p>' );

			await watchdog.destroy();
		} );

		it( 'should detect config-based signature when called without arguments', async () => {
			const watchdog = new EditorWatchdog();

			watchdog.setCreator( () => ClassicTestEditor.create( '<p>foo</p>', { plugins: [ Paragraph ] } ) );

			await watchdog.create();

			expect( watchdog.editor.getData() ).toBe( '<p>foo</p>' );

			await watchdog.destroy();
		} );
	} );

	describe( 'config-based multi-root detection from legacy initialData', () => {
		// Covers: `legacyInitialData && typeof legacyInitialData === 'object'` true branch in `create()`.
		it( 'should detect multi-root from config.initialData as object', async () => {
			const watchdog = new EditorWatchdog( MultiRootEditor );

			await watchdog.create( {
				initialData: { foo: '<p>Foo</p>', bar: '<p>Bar</p>' },
				plugins: [ Paragraph ]
			} );

			expect( watchdog.editor.getData( { rootName: 'foo' } ) ).toBe( '<p>Foo</p>' );
			expect( watchdog.editor.getData( { rootName: 'bar' } ) ).toBe( '<p>Bar</p>' );

			await watchdog.destroy();
		} );
	} );

	describe( 'create() with no config', () => {
		// Covers: `config || {}` fallback in `create()` when config is undefined.
		it( 'should handle create() call without config for legacy signature', async () => {
			class CustomEditor extends ClassicTestEditor {}
			CustomEditor.builtinPlugins = [ Paragraph ];

			const watchdog = new EditorWatchdog( CustomEditor );

			await watchdog.create( '<p>foo</p>' );

			expect( watchdog.editor.getData() ).toBe( '<p>foo</p>' );

			await watchdog.destroy();
		} );
	} );

	describe( 'multi-root editor', () => {
		let element2, watchdog, restartSpy;

		beforeEach( () => {
			element2 = document.createElement( 'div' );
			document.body.appendChild( element2 );

			watchdog = new EditorWatchdog( MultiRootEditor );

			restartSpy = vi.fn();

			stubWindowOnError();
		} );

		afterEach( async () => {
			element2.remove();

			await watchdog.destroy();
		} );

		describe( 'init using data', () => {
			beforeEach( async () => {
				await watchdog.create( {
					header: '<p>Foo</p>',
					content: '<p>Bar</p>'
				}, {
					plugins: [ Paragraph ],
					roots: {
						header: {
							modelAttributes: { order: 1 }
						},
						content: {
							modelAttributes: { order: 2 }
						},
						lazyOne: {
							lazyLoad: true
						},
						lazyTwo: {
							lazyLoad: true
						}
					}
				} );

				watchdog.on( 'restart', restartSpy );
			} );

			it( 'should properly restart', async () => {
				setTimeout( () => throwCKEditorError( 'foo', watchdog.editor ) );

				await waitCycle();

				expect( restartSpy ).toHaveBeenCalledOnce();

				expect( watchdog.editor.getFullData() ).toEqual( {
					header: '<p>Foo</p>',
					content: '<p>Bar</p>'
				} );

				expect( watchdog.editor.getRootsAttributes() ).toEqual( {
					header: { order: 1, $rootEditableOptions: {} },
					content: { order: 2, $rootEditableOptions: {} }
				} );
			} );

			it( 'should properly handle added and removed roots', async () => {
				vi.useFakeTimers();

				watchdog.editor.detachRoot( 'content' );
				watchdog.editor.addRoot( 'new', { data: '<p>New</p>', attributes: { order: 3 } } );

				// Wait for throttled save.
				vi.advanceTimersByTime( 6000 );
				vi.useRealTimers();

				setTimeout( () => throwCKEditorError( 'foo', watchdog.editor ) );

				await waitCycle();

				expect( restartSpy ).toHaveBeenCalledOnce();

				expect( watchdog.editor.getFullData() ).toEqual( {
					header: '<p>Foo</p>',
					new: '<p>New</p>'
				} );

				expect( watchdog.editor.getRootsAttributes() ).toEqual( {
					header: { order: 1, $rootEditableOptions: {} },
					new: { order: 3, $rootEditableOptions: {} }
				} );
			} );

			it( 'should properly handle lazy roots', async () => {
				vi.useFakeTimers();

				watchdog.editor.detachRoot( 'lazyOne' );
				watchdog.editor.loadRoot( 'lazyTwo', { data: '<p>Two</p>', attributes: { order: 5 } } );

				vi.advanceTimersByTime( 6000 );
				vi.useRealTimers();

				setTimeout( () => throwCKEditorError( 'foo', watchdog.editor ) );

				await waitCycle();

				expect( restartSpy ).toHaveBeenCalledOnce();

				expect( watchdog.editor.getFullData() ).toEqual( {
					header: '<p>Foo</p>',
					content: '<p>Bar</p>',
					lazyTwo: '<p>Two</p>'
				} );

				expect( watchdog.editor.getRootsAttributes() ).toEqual( {
					header: { order: 1, $rootEditableOptions: {} },
					content: { order: 2, $rootEditableOptions: {} },
					lazyTwo: { order: 5, $rootEditableOptions: {} }
				} );
			} );
		} );

		describe( 'init using elements', () => {
			beforeEach( async () => {
				class MultiRootEditorIntegration {
					constructor( editor ) {
						this.editor = editor;
					}

					init() {
						this.editor.on( 'addRoot', ( evt, root ) => {
							const domElement = this.editor.createEditable( root );

							document.body.appendChild( domElement );
						} );

						this.editor.on( 'detachRoot', ( evt, root ) => {
							const domElement = this.editor.detachEditable( root );

							domElement.remove();
						} );
					}
				}

				watchdog.setDestructor( editor => {
					for ( const name of editor.ui.getEditableElementsNames() ) {
						const editable = editor.ui.getEditableElement( name );

						editable.remove();
					}

					return editor.destroy();
				} );

				await watchdog.create( {
					header: element,
					content: element2
				}, {
					initialData: {
						header: '<p>Foo</p>',
						content: '<p>Bar</p>'
					},
					plugins: [ Paragraph, MultiRootEditorIntegration ],
					roots: {
						header: {
							modelAttributes: {
								order: 1
							}
						},
						content: {
							modelAttributes: {
								order: 2
							}
						},
						lazyOne: {
							lazyLoad: true
						},
						lazyTwo: {
							lazyLoad: true
						}
					}
				} );

				watchdog.on( 'restart', restartSpy );
			} );

			it( 'should properly restart', async () => {
				setTimeout( () => throwCKEditorError( 'foo', watchdog.editor ) );

				await waitCycle();

				expect( restartSpy ).toHaveBeenCalledOnce();

				expect( watchdog.editor.data.get( { rootName: 'header' } ) ).toBe( '<p>Foo</p>' );
				expect( watchdog.editor.data.get( { rootName: 'content' } ) ).toBe( '<p>Bar</p>' );
			} );

			it( 'should properly handle added and removed roots', async () => {
				vi.useFakeTimers();

				watchdog.editor.detachRoot( 'content' );
				watchdog.editor.addRoot( 'new', { data: '<p>New</p>', attributes: { order: 3 } } );

				vi.advanceTimersByTime( 6000 );
				vi.useRealTimers();

				setTimeout( () => throwCKEditorError( 'foo', watchdog.editor ) );

				await waitCycle();

				expect( restartSpy ).toHaveBeenCalledOnce();

				expect( watchdog.editor.getFullData() ).toEqual( {
					header: '<p>Foo</p>',
					new: '<p>New</p>'
				} );

				expect( watchdog.editor.getRootsAttributes() ).toEqual( {
					header: { order: 1, $rootEditableOptions: {} },
					new: { order: 3, $rootEditableOptions: {} }
				} );
			} );

			it( 'should properly handle lazy roots', async () => {
				vi.useFakeTimers();

				watchdog.editor.detachRoot( 'lazyOne' );
				watchdog.editor.loadRoot( 'lazyTwo', { data: '<p>Two</p>', attributes: { order: 5 } } );

				vi.advanceTimersByTime( 6000 );
				vi.useRealTimers();

				setTimeout( () => throwCKEditorError( 'foo', watchdog.editor ) );

				await waitCycle();

				expect( restartSpy ).toHaveBeenCalledOnce();

				expect( watchdog.editor.getFullData() ).toEqual( {
					header: '<p>Foo</p>',
					content: '<p>Bar</p>',
					lazyTwo: '<p>Two</p>'
				} );

				expect( watchdog.editor.getRootsAttributes() ).toEqual( {
					header: { order: 1, $rootEditableOptions: {} },
					content: { order: 2, $rootEditableOptions: {} },
					lazyTwo: { order: 5, $rootEditableOptions: {} }
				} );
			} );
		} );

		it( 'should recover original legacy placeholders after restart', async () => {
			await watchdog.create( {}, {
				plugins: [ Paragraph ],
				roots: {
					header: {
						initialData: '<p>Foo</p>',
						modelAttributes: { order: 1 }
					},
					content: {
						initialData: '<p>Bar</p>',
						modelAttributes: { order: 2 }
					}
				},
				placeholder: {
					header: 'Type in header',
					content: 'Type in content'
				}
			} );

			watchdog.on( 'restart', restartSpy );

			setTimeout( () => throwCKEditorError( 'foo', watchdog.editor ) );

			await waitCycle();

			expect( restartSpy ).toHaveBeenCalledOnce();

			expect( watchdog.editor.getFullData() ).toEqual( {
				header: '<p>Foo</p>',
				content: '<p>Bar</p>'
			} );

			expect( watchdog.editor.getRootsAttributes() ).toEqual( {
				header: { order: 1, $rootEditableOptions: { placeholder: 'Type in header' } },
				content: { order: 2, $rootEditableOptions: { placeholder: 'Type in content' } }
			} );

			const editables = watchdog.editor.ui.view.editables;

			expect( editables.header.element.children[ 0 ].dataset.placeholder ).toBe( 'Type in header' );
			expect( editables.content.element.children[ 0 ].dataset.placeholder ).toBe( 'Type in content' );
		} );

		it( 'should recover original legacy placeholder after restart', async () => {
			await watchdog.create( {}, {
				plugins: [ Paragraph ],
				roots: {
					header: {
						initialData: '<p>Foo</p>',
						modelAttributes: { order: 1 }
					},
					content: {
						initialData: '<p>Bar</p>',
						modelAttributes: { order: 2 }
					}
				},
				placeholder: 'Type in some content'
			} );

			watchdog.on( 'restart', restartSpy );

			setTimeout( () => throwCKEditorError( 'foo', watchdog.editor ) );

			await waitCycle();

			expect( restartSpy ).toHaveBeenCalledOnce();

			expect( watchdog.editor.getFullData() ).toEqual( {
				header: '<p>Foo</p>',
				content: '<p>Bar</p>'
			} );

			expect( watchdog.editor.getRootsAttributes() ).toEqual( {
				header: { order: 1, $rootEditableOptions: { placeholder: 'Type in some content' } },
				content: { order: 2, $rootEditableOptions: { placeholder: 'Type in some content' } }
			} );

			const editables = watchdog.editor.ui.view.editables;

			expect( editables.header.element.children[ 0 ].dataset.placeholder ).toBe( 'Type in some content' );
			expect( editables.content.element.children[ 0 ].dataset.placeholder ).toBe( 'Type in some content' );
		} );
	} );
} );

function throwCKEditorError( name, context ) {
	throw new CKEditorError( name, context );
}

// Feature detection works as a race condition - if the `unhandledrejection` event
// is supported then the listener should be called first. Otherwise the timeout will be reached.
function isUnhandledRejectionEventSupported() {
	return new Promise( res => {
		window.addEventListener( 'unhandledrejection', function listener() {
			res( true );

			window.removeEventListener( 'unhandledrejection', listener );
		} );

		Promise.resolve().then( () => Promise.reject( new Error() ) );

		setTimeout( () => res( false ) );
	} );
}

function waitCycle() {
	return new Promise( res => setTimeout( res ) );
}
