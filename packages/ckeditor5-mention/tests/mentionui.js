/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';

import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Plugin } from '@ckeditor/ckeditor5-core';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { keyCodes, global, EventInfo, env } from '@ckeditor/ckeditor5-utils';
import { _setModelData, ViewDocumentDomEventData } from '@ckeditor/ckeditor5-engine';
import { ContextualBalloon } from '@ckeditor/ckeditor5-ui';

import { CodeBlock } from '@ckeditor/ckeditor5-code-block';

import { MentionUI, createRegExp } from '../src/mentionui.js';
import { MentionEditing } from '../src/mentionediting.js';
import { MentionsView } from '../src/ui/mentionsview.js';
import { assertCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

describe( 'MentionUI', () => {
	let editor, model, doc, editingView, mentionUI, editorElement, mentionsView, panelView;

	const staticConfig = {
		feeds: [
			{
				feed: [ '@Barney', '@Lily', '@Marshall', '@Robin', '@Ted' ],
				marker: '@'
			}
		]
	};

	beforeEach( () => {
		vi.useFakeTimers( { now: Date.now() } );
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );
	} );

	afterEach( () => {
		vi.restoreAllMocks();
		vi.useRealTimers();
		editorElement.remove();

		if ( editor ) {
			return editor.destroy();
		}
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( MentionUI.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( MentionUI.isPremiumPlugin ).toBe( false );
	} );

	it( 'should create a plugin instance', () => {
		return createClassicTestEditor().then( () => {
			expect( mentionUI ).toBeInstanceOf( Plugin );
			expect( mentionUI ).toBeInstanceOf( MentionUI );
		} );
	} );

	it( 'should load ContextualBalloon plugin', () => {
		return createClassicTestEditor().then( () => {
			expect( editor.plugins.get( ContextualBalloon ) ).toBeInstanceOf( ContextualBalloon );
		} );
	} );

	describe( 'init()', () => {
		it( 'should throw if marker was not provided for feed', () => {
			return createClassicTestEditor( { feeds: [ { feed: [ 'a' ] } ] } ).catch( error => {
				assertCKEditorError( error, /mentionconfig-incorrect-marker/, null, { marker: undefined } );
			} );
		} );

		it( 'should throw if marker is empty string', () => {
			return createClassicTestEditor( { feeds: [ { marker: '', feed: [ 'a' ] } ] } ).catch( error => {
				assertCKEditorError( error, /mentionconfig-incorrect-marker/, null, { marker: '' } );
			} );
		} );

		it( 'should not throw if marker is longer then 1 character', () => {
			return expect( ClassicTestEditor
				.create( editorElement, {
					plugins: [ Paragraph, MentionEditing, MentionUI ],
					mention: { feeds: [ { marker: '$$', feed: [ 'a' ] } ] }
				} ).then( tempEditor => {
					return tempEditor.destroy();
				} )
			).resolves.not.toThrow();
		} );
	} );

	describe( 'pluginName', () => {
		it( 'should return plugin by its name', () => {
			return createClassicTestEditor().then( () => {
				expect( editor.plugins.get( 'MentionUI' ) ).toEqual( mentionUI );
			} );
		} );
	} );

	describe( 'contextual balloon', () => {
		let balloonAddSpy;

		beforeEach( () => {
			return createClassicTestEditor( staticConfig )
				.then( () => {
					_setModelData( model, '<paragraph>foo []</paragraph>' );
					const contextualBalloon = editor.plugins.get( ContextualBalloon );

					balloonAddSpy = vi.spyOn( contextualBalloon, 'add' );

					model.change( writer => {
						writer.insertText( '@', doc.selection.getFirstPosition() );
					} );
				} )
				.then( waitForDebounce );
		} );

		it( 'should disable arrow', () => {
			expect( balloonAddSpy ).toHaveBeenCalledOnce();
			expect( balloonAddSpy ).toHaveBeenCalledWith( expect.objectContaining( { singleViewMode: expect.anything() } ) );
			expect( panelView.isVisible ).toBe( true );
			expect( panelView.withArrow ).toBe( false );
		} );

		it( 'should add MentionView to a panel', () => {
			expect( editor.plugins.get( ContextualBalloon ).visibleView ).toBeInstanceOf( MentionsView );
		} );

		it( 'should hide the contextual balloon when editor turns into a readonly mode', () => {
			expect( panelView.isVisible ).toBe( true );

			editor.enableReadOnlyMode( 'unit-test' );

			expect( panelView.isVisible ).toBe( false );
		} );

		// See https://github.com/ckeditor/ckeditor5/issues/17964
		it( 'should have the ck-mention-balloon class to make sure z-index does not conflict with the dialog system', () => {
			expect( balloonAddSpy.mock.calls.length ).toEqual( 1 );
			expect( balloonAddSpy.mock.calls[ 0 ][ 0 ].balloonClassName ).toEqual( 'ck-mention-balloon' );
		} );
	} );

	describe( 'position', () => {
		let pinSpy;

		const caretRect = {
			bottom: 28,
			height: 18,
			left: 500,
			right: 501,
			top: 10,
			width: 1
		};

		const balloonRect = {
			bottom: 150,
			height: 150,
			left: 0,
			right: 200,
			top: 0,
			width: 200
		};

		beforeEach( () => {
			return createClassicTestEditor( staticConfig ).then( () => {
				pinSpy = vi.spyOn( panelView, 'pin' );
			} );
		} );

		it( 'should properly calculate position data', () => {
			const editableElement = editingView.document.selection.editableElement;

			_setModelData( model, '<paragraph>foo []</paragraph>' );
			stubSelectionRects( [ caretRect ] );

			expect( editor.model.markers.has( 'mention' ) ).toBe( false );

			model.change( writer => {
				writer.insertText( '@', doc.selection.getFirstPosition() );
			} );

			return waitForDebounce()
				.then( () => {
					const pinArgument = pinSpy.mock.calls[ 0 ][ 0 ];
					const { target, positions, limiter, fitInViewport } = pinArgument;

					expect( positions ).toHaveLength( 4 );

					// Mention UI should set limiter to the editable area.
					expect( limiter() ).toEqual( editingView.domConverter.mapViewToDom( editableElement ) );
					expect( fitInViewport ).toBeUndefined();

					expect( editor.model.markers.has( 'mention' ) ).toBe( true );
					const mentionMarker = editor.model.markers.get( 'mention' );
					const focus = doc.selection.focus;
					const expectedRange = editor.model.createRange( focus.getShiftedBy( -1 ), focus );

					// It should create a model marker for matcher marker character ('@').
					expect( expectedRange.isEqual( mentionMarker.getRange() ) ).toBe( true );

					const toViewRangeSpy = vi.spyOn( editor.editing.mapper, 'toViewRange' );

					expect( target() ).toEqual( caretRect );

					expect( toViewRangeSpy ).toHaveBeenCalledOnce();
					const range = toViewRangeSpy.mock.calls[ 0 ][ 0 ];

					expect( mentionMarker.getRange().isEqual( range ), 'Should position to mention marker.' );

					const caretSouthEast = positions[ 0 ];
					const caretSouthWest = positions[ 1 ];
					const caretNorthEast = positions[ 2 ];
					const caretNorthWest = positions[ 3 ];

					expect( caretSouthEast( caretRect, balloonRect ) ).toEqual( {
						left: 501,
						name: 'caret_se',
						top: 31,
						config: {
							withArrow: false
						}
					} );

					expect( caretSouthWest( caretRect, balloonRect ) ).toEqual( {
						left: 301,
						name: 'caret_sw',
						top: 31,
						config: {
							withArrow: false
						}
					} );

					expect( caretNorthEast( caretRect, balloonRect ) ).toEqual( {
						left: 501,
						name: 'caret_ne',
						top: -143,
						config: {
							withArrow: false
						}
					} );

					expect( caretNorthWest( caretRect, balloonRect ) ).toEqual( {
						left: 301,
						name: 'caret_nw',
						top: -143,
						config: {
							withArrow: false
						}
					} );
				} );
		} );

		it( 'should re-calculate position on typing and stay on selected position', () => {
			_setModelData( model, '<paragraph>foo []</paragraph>' );
			stubSelectionRects( [ caretRect ] );

			model.change( writer => {
				writer.insertText( '@', doc.selection.getFirstPosition() );
			} );

			let positionAfterFirstShow;

			return waitForDebounce()
				.then( () => {
					expect( pinSpy ).toHaveBeenCalledOnce();

					const pinArgument = pinSpy.mock.calls[ 0 ][ 0 ];
					const { positions } = pinArgument;

					expect( positions ).toHaveLength( 4 );

					positionAfterFirstShow = mentionsView.position;

					model.change( writer => {
						writer.insertText( 't', doc.selection.getFirstPosition() );
					} );
				} )
				.then( waitForDebounce )
				.then( () => {
					expect( pinSpy ).toHaveBeenCalledTimes( 2 );

					const pinArgument = pinSpy.mock.calls[ 1 ][ 0 ];
					const { positions } = pinArgument;

					expect( positions, 'should reuse first matched position' ).toHaveLength( 1 );
					expect( positions[ 0 ].name ).toEqual( positionAfterFirstShow );
				} );
		} );

		it( 'does not fail if selection has no #editableElement', () => {
			_setModelData( model, '<paragraph>foo []</paragraph>' );
			stubSelectionRects( [ caretRect ] );

			expect( editor.model.markers.has( 'mention' ) ).toBe( false );

			model.change( writer => {
				writer.insertText( '@', doc.selection.getFirstPosition() );
			} );

			return waitForDebounce()
				.then( () => {
					const pinArgument = pinSpy.mock.calls[ 0 ][ 0 ];
					const { limiter } = pinArgument;

					vi.spyOn( editingView.document.selection, 'editableElement', 'get' ).mockReturnValue( null );

					// Should not break;
					expect( limiter() ).toBeNull();
				} );
		} );

		describe( 'relation with the UI language direction of the editor', () => {
			describe( 'for RTL languages', () => {
				let contextualBaloonSpy;

				beforeEach( async () => {
					await editor.destroy();

					return createClassicTestEditor( { ...staticConfig } )
						.then( () => {
							const contextualBalloon = editor.plugins.get( ContextualBalloon );
							_setModelData( model, '<paragraph>foo []</paragraph>' );
							editor.locale.uiLanguageDirection = 'rtl';
							contextualBaloonSpy = vi.spyOn( contextualBalloon, 'add' );

							model.change( writer => {
								writer.insertText( '@', doc.selection.getFirstPosition() );
							} );
						} )
						.then( waitForDebounce );
				} );

				it( 'should prefer the west position first (to the left of the caret)', () => {
					const positionNames = contextualBaloonSpy.mock.calls[ 0 ][ 0 ].position.positions.map( ( { name } ) => name );

					expect( positionNames ).toEqual( [
						'caret_sw',
						'caret_se',
						'caret_nw',
						'caret_ne'
					] );
				} );
			} );

			describe( 'for ltr languages', () => {
				let contextualBaloonSpy;

				beforeEach( async () => {
					await editor.destroy();

					return createClassicTestEditor( { ...staticConfig } )
						.then( () => {
							const contextualBalloon = editor.plugins.get( ContextualBalloon );
							_setModelData( model, '<paragraph>foo []</paragraph>' );
							contextualBaloonSpy = vi.spyOn( contextualBalloon, 'add' );

							model.change( writer => {
								writer.insertText( '@', doc.selection.getFirstPosition() );
							} );
						} )
						.then( waitForDebounce );
				} );

				it( 'should prefer the east position first (to the right of the caret)', () => {
					const positionNames = contextualBaloonSpy.mock.calls[ 0 ][ 0 ].position.positions.map( ( { name } ) => name );

					expect( positionNames ).toEqual( [
						'caret_se',
						'caret_sw',
						'caret_ne',
						'caret_nw'
					] );
				} );
			} );
		} );
	} );

	describe( 'createRegExp()', () => {
		let regExpStub;

		// Cache the original value to restore it after the tests.
		const originalGroupSupport = env.features.isRegExpUnicodePropertySupported;

		beforeAll( () => {
			env.features.isRegExpUnicodePropertySupported = false;
		} );

		beforeEach( () => {
			return createClassicTestEditor( staticConfig )
				.then( editor => {
					const OriginalRegExp = RegExp;

					regExpStub = vi.spyOn( window, 'RegExp' ).mockImplementation( function( pattern, flags ) {
						// Call the real implementation using saved reference to avoid infinite recursion.
						return new OriginalRegExp( pattern, flags );
					} );

					return editor;
				} );
		} );

		afterAll( () => {
			env.features.isRegExpUnicodePropertySupported = originalGroupSupport;
		} );

		it( 'returns a simplified RegExp for browsers not supporting Unicode punctuation groups', () => {
			env.features.isRegExpUnicodePropertySupported = false;
			createRegExp( '@', 2 );
			expect( regExpStub ).toHaveBeenCalledOnce();
			expect( regExpStub ).toHaveBeenCalledWith( '(?:^|[ \\(\\[{"\'])(@)(.{2,})$', 'u' );
		} );

		it( 'returns a ES2018 RegExp for browsers supporting Unicode punctuation groups', () => {
			env.features.isRegExpUnicodePropertySupported = true;
			createRegExp( '@', 2 );
			expect( regExpStub ).toHaveBeenCalledOnce();
			expect( regExpStub ).toHaveBeenCalledWith( '(?:^|[ \\p{Ps}\\p{Pi}"\'])(@)(.{2,})$', 'u' );
		} );

		it( 'returns a proper regexp for markers longer than 1 character', () => {
			env.features.isRegExpUnicodePropertySupported = true;
			createRegExp( '@@', 2 );
			expect( regExpStub ).toHaveBeenCalledOnce();
			expect( regExpStub ).toHaveBeenCalledWith( '(?:^|[ \\p{Ps}\\p{Pi}"\'])(@@)(.{2,})$', 'u' );
		} );

		it( 'correctly escapes passed marker #1', () => {
			env.features.isRegExpUnicodePropertySupported = true;
			createRegExp( ']', 2 );
			expect( regExpStub ).toHaveBeenCalledOnce();
			expect( regExpStub ).toHaveBeenCalledWith( '(?:^|[ \\p{Ps}\\p{Pi}"\'])(\\])(.{2,})$', 'u' );
		} );

		it( 'correctly escapes passed marker #2', () => {
			env.features.isRegExpUnicodePropertySupported = true;
			createRegExp( '\\', 2 );
			expect( regExpStub ).toHaveBeenCalledOnce();
			expect( regExpStub ).toHaveBeenCalledWith( '(?:^|[ \\p{Ps}\\p{Pi}"\'])(\\\\)(.{2,})$', 'u' );
		} );
	} );

	describe( 'typing integration', () => {
		it( 'should show panel for matched marker after typing minimum characters', () => {
			return createClassicTestEditor( { feeds: [ Object.assign( { minimumCharacters: 2 }, staticConfig.feeds[ 0 ] ) ] } )
				.then( () => {
					_setModelData( model, '<paragraph>foo []</paragraph>' );

					model.change( writer => {
						writer.insertText( '@', doc.selection.getFirstPosition() );
					} );
				} )
				.then( () => {
					model.change( writer => {
						writer.insertText( 'B', doc.selection.getFirstPosition() );
					} );
				} )
				.then( waitForDebounce )
				.then( () => {
					expect( panelView.isVisible ).toBe( false );
					expect( editor.model.markers.has( 'mention' ) ).toBe( false );
				} )
				.then( waitForDebounce )
				.then( () => {
					model.change( writer => {
						writer.insertText( 'a', doc.selection.getFirstPosition() );
					} );
				} )
				.then( waitForDebounce )
				.then( () => {
					expect( panelView.isVisible ).toBe( true );
					expect( editor.model.markers.has( 'mention' ) ).toBe( true );
					expect( mentionsView.items ).toHaveLength( 1 );

					model.change( writer => {
						writer.insertText( 'r', doc.selection.getFirstPosition() );
					} );
				} )
				.then( waitForDebounce )
				.then( () => {
					expect( panelView.isVisible ).toBe( true );
					expect( editor.model.markers.has( 'mention' ) ).toBe( true );
					expect( mentionsView.items ).toHaveLength( 1 );
				} );
		} );

		it( 'should show panel after the whole marker is matched', () => {
			return createClassicTestEditor( {
				feeds: [ { marker: '@@', feed: [ '@Barney', '@Lily', '@Marshall', '@Robin', '@Ted' ] } ]
			} )
				.then( () => {
					_setModelData( editor.model, '<paragraph>foo []</paragraph>' );

					model.change( writer => {
						writer.insertText( '@', doc.selection.getFirstPosition() );
					} );
				} )
				.then( waitForDebounce )
				.then( () => {
					expect( panelView.isVisible ).toBe( false );
					expect( editor.model.markers.has( 'mention' ) ).toBe( false );
				} )
				.then( () => {
					model.change( writer => {
						writer.insertText( '@', doc.selection.getFirstPosition() );
					} );
				} )
				.then( waitForDebounce )
				.then( () => {
					expect( panelView.isVisible ).toBe( true );
					expect( editor.model.markers.has( 'mention' ) ).toBe( true );
					expect( mentionsView.items ).toHaveLength( 5 );

					model.change( writer => {
						writer.insertText( 't', doc.selection.getFirstPosition() );
					} );
				} )
				.then( waitForDebounce )
				.then( () => {
					expect( panelView.isVisible ).toBe( true );
					expect( editor.model.markers.has( 'mention' ) ).toBe( true );
					expect( mentionsView.items ).toHaveLength( 1 );
				} );
		} );

		it( 'should update the marker if the selection was moved from one valid position to another', () => {
			const spy = vi.fn();

			return createClassicTestEditor( staticConfig )
				.then( () => {
					_setModelData( model, '<paragraph>foo @ bar []</paragraph>' );

					model.change( writer => {
						writer.insertText( '@', doc.selection.getFirstPosition() );
					} );
				} )
				.then( waitForDebounce )
				.then( () => {
					expect( panelView.isVisible ).toBe( true );
					expect( editor.model.markers.has( 'mention' ) ).toBe( true );
				} )
				.then( () => {
					editor.model.markers.on( 'update', spy );

					model.change( writer => {
						writer.setSelection( doc.getRoot().getChild( 0 ), 5 );
					} );

					expect( spy ).toHaveBeenCalledOnce();
					expect( editor.model.markers.has( 'mention' ) ).toBe( true );
				} );
		} );

		it( 'should not show panel when command is disabled', () => {
			return createClassicTestEditor( staticConfig )
				.then( () => {
					_setModelData( model, '<paragraph>foo []</paragraph>' );

					const mentionCommand = editor.commands.get( 'mention' );
					mentionCommand.forceDisabled( 'mentionCommandDisableTest' );

					model.change( writer => {
						writer.insertText( '@', doc.selection.getFirstPosition() );
					} );
				} )
				.then( waitForDebounce )
				.then( () => {
					expect( panelView.isVisible ).toBe( false );
					expect( editor.model.markers.has( 'mention' ) ).toBe( false );
				} );
		} );

		describe( 'static list with large set of results', () => {
			const bigList = {
				marker: '@',
				feed: [
					'@a01', '@a02', '@a03', '@a04', '@a05', '@a06', '@a07', '@a08', '@a09', '@a10', '@a11', '@a12'
				]
			};

			beforeEach( () => {
				return createClassicTestEditor( { feeds: [ bigList ] } );
			} );

			it( 'should show panel with no more then 10 items for default static feed', () => {
				_setModelData( model, '<paragraph>foo []</paragraph>' );

				model.change( writer => {
					writer.insertText( '@', doc.selection.getFirstPosition() );
				} );

				return waitForDebounce()
					.then( () => {
						expect( panelView.isVisible ).toBe( true );
						expect( mentionsView.items ).toHaveLength( 10 );
					} );
			} );

			it( 'should scroll mention panel to the selected item', () => {
				_setModelData( model, '<paragraph>foo []</paragraph>' );

				model.change( writer => {
					writer.insertText( '@', doc.selection.getFirstPosition() );
				} );

				const arrowDownEvtData = {
					keyCode: keyCodes.arrowdown,
					preventDefault: vi.fn(),
					stopPropagation: vi.fn()
				};

				const arrowUpEvtData = {
					keyCode: keyCodes.arrowup,
					preventDefault: vi.fn(),
					stopPropagation: vi.fn()
				};

				return waitForDebounce()
					.then( () => {
						// The scroll test highly depends on browser styles.
						// Some CI test environments might not load theme which will result that tests will not render on CI as locally.
						// To make this test repeatable across different environments it enforces mentions view size to 100px...
						const reset = 'padding:0px;margin:0px;border:0 none;line-height: 1em;';

						const mentionElementSpy = vi.spyOn( Object.getOwnPropertyDescriptor( mentionsView.element.__proto__, 'scrollTop' ) ?
							mentionsView.element.__proto__ : mentionsView.element,
						'scrollTop', 'set' );
						mentionsView.element.style = `min-height:100px;height:100px;max-height:100px;${ reset };`;

						// ...and each list view item size to 25px...
						Array.from( mentionsView.items ).forEach( item => {
							const listItemElement = item.children.get( 0 ).element;

							listItemElement.style = `min-height:unset;height:25px;max-height:25px;${ reset };min-width:12em;`;
						} );

						// ...so after those changes it is safe to assume that:
						// - base offset is 0
						// - only 4 items are visible at once
						// - if scrolled to the last element scrollTop will be set to 150px. The 150px is the offset of the 7th item in the
						//   list as last four (7, 8, 9 & 10) will be visible.
						expect( panelView.isVisible ).toBe( true );
						expectChildViewsIsOnState( [ true, false, false, false, false, false, false, false, false, false ] );

						expect( mentionElementSpy ).toHaveBeenCalledTimes( 0 );

						fireKeyDownEvent( arrowDownEvtData );

						expectChildViewsIsOnState( [ false, true, false, false, false, false, false, false, false, false ] );
						expect( mentionsView.element.scrollTop ).toEqual( 0 );
						expect( mentionElementSpy ).toHaveBeenCalledTimes( 0 );

						fireKeyDownEvent( arrowUpEvtData );

						expectChildViewsIsOnState( [ true, false, false, false, false, false, false, false, false, false ] );
						expect( mentionsView.element.scrollTop ).toEqual( 0 );

						expect( mentionElementSpy ).toHaveBeenCalledTimes( 0 );

						fireKeyDownEvent( arrowUpEvtData );

						expectChildViewsIsOnState( [ false, false, false, false, false, false, false, false, false, true ] );

						// We want 150, but sometimes we get e.g. 151.
						expect( mentionsView.element.scrollTop ).toBeGreaterThanOrEqual( 140 );
						expect( mentionsView.element.scrollTop ).toBeLessThanOrEqual( 160 );

						expect( mentionElementSpy ).toHaveBeenCalledTimes( 1 );

						fireKeyDownEvent( arrowDownEvtData );

						expectChildViewsIsOnState( [ true, false, false, false, false, false, false, false, false, false ] );

						// We want 0, but sometimes we get e.g. 1. (Firefox)
						expect( mentionsView.element.scrollTop ).toBeGreaterThanOrEqual( 0 );
						expect( mentionsView.element.scrollTop ).toBeLessThanOrEqual( 10 );

						expect( mentionElementSpy ).toHaveBeenCalledTimes( 2 );
					} );
			} );
		} );

		describe( 'static list with default trigger', () => {
			beforeEach( () => {
				return createClassicTestEditor( staticConfig );
			} );

			it( 'should show panel for matched marker', () => {
				_setModelData( model, '<paragraph>foo []</paragraph>' );

				expect( editor.model.markers.has( 'mention' ) ).toBe( false );

				model.change( writer => {
					writer.insertText( '@', doc.selection.getFirstPosition() );
				} );

				return waitForDebounce()
					.then( () => {
						expect( panelView.isVisible ).toBe( true );
						expect( editor.model.markers.has( 'mention' ) ).toBe( true );
						expect( mentionsView.items ).toHaveLength( 5 );
					} );
			} );

			it( 'should not show panel for matched marker inside a code block', async () => {
				const editorElement = document.createElement( 'div' );
				document.body.appendChild( editorElement );

				const editor = await ClassicTestEditor.create( editorElement, {
					plugins: [ Paragraph, CodeBlock, MentionEditing, MentionUI ],
					mention: staticConfig
				} );

				const model = editor.model;
				const panelView = editor.plugins.get( ContextualBalloon ).view;

				_setModelData( model, '<codeBlock language="plaintext">foo []</codeBlock>' );

				model.change( writer => {
					writer.insertText( '@Ba', model.document.selection.getFirstPosition() );
				} );

				await waitForDebounce();

				expect( panelView.isVisible ).toBe( false );
				expect( model.markers.has( 'mention' ) ).toBe( false );

				await editor.destroy();
				editorElement.remove();
			} );

			it( 'should not show panel when feed response arrives after mention command was disabled', async () => {
				let feedResolve;

				const editorElement = document.createElement( 'div' );
				document.body.appendChild( editorElement );

				const editor = await ClassicTestEditor.create( editorElement, {
					plugins: [ Paragraph, CodeBlock, MentionEditing, MentionUI ],
					mention: {
						feeds: [ {
							marker: '@',
							feed: () => new Promise( resolve => {
								feedResolve = resolve;
							} )
						} ]
					}
				} );

				const model = editor.model;
				const panelView = editor.plugins.get( ContextualBalloon ).view;
				const mentionCommand = editor.commands.get( 'mention' );

				_setModelData( model, '<paragraph>foo []</paragraph>' );

				// Type '@' in the paragraph — triggers an async feed request.
				model.change( writer => {
					writer.insertText( '@', model.document.selection.getFirstPosition() );
				} );

				await waitForDebounce();

				// Disable the mention command while the feed is still pending.
				mentionCommand.forceDisabled( 'test' );

				// Resolve the feed — the command is disabled, so the panel should not appear.
				feedResolve( [ '@Barney', '@Lily' ] );

				await waitForDebounce();

				expect( panelView.isVisible ).toBe( false );

				mentionCommand.clearForceDisabled( 'test' );

				await editor.destroy();
				editorElement.remove();
			} );

			it( 'should show panel for matched marker at the beginning of paragraph', () => {
				_setModelData( model, '<paragraph>[] foo</paragraph>' );

				model.change( writer => {
					writer.insertText( '@', doc.selection.getFirstPosition() );
				} );

				return waitForDebounce()
					.then( () => {
						expect( panelView.isVisible ).toBe( true );
						expect( editor.model.markers.has( 'mention' ) ).toBe( true );
						expect( mentionsView.items ).toHaveLength( 5 );
					} );
			} );

			it( 'should show panel for matched marker after a <softBreak>', () => {
				model.schema.register( 'softBreak', {
					allowWhere: '$text',
					isInline: true
				} );

				editor.conversion.for( 'upcast' )
					.elementToElement( {
						model: 'softBreak',
						view: 'br'
					} );

				editor.conversion.for( 'downcast' )
					.elementToElement( {
						model: 'softBreak',
						view: ( modelElement, { writer } ) => writer.createEmptyElement( 'br' )
					} );

				_setModelData( model, '<paragraph>abc<softBreak></softBreak>[] foo</paragraph>' );

				model.change( writer => {
					writer.insertText( '@', doc.selection.getFirstPosition() );
				} );

				return waitForDebounce()
					.then( () => {
						expect( panelView.isVisible ).toBe( true );
						expect( editor.model.markers.has( 'mention' ) ).toBe( true );
						expect( mentionsView.items ).toHaveLength( 5 );
					} );
			} );

			// Opening parenthesis type characters that should be supported on all environments.
			for ( const character of [ '(', '\'', '"', '[', '{' ] ) {
				testOpeningPunctuationCharacter( character );
			}

			// Excerpt of opening parenthesis type characters that tests ES2018 Unicode property escapes on supported environment.
			for ( const character of [
				// Belongs to Ps (Punctuation, Open) group:
				'〈', '„', '﹛', '｟', '｛',
				// Belongs to Pi (Punctuation, Initial quote) group:
				'«', '‹', '⸌', ' ⸂', '⸠'
			] ) {
				testOpeningPunctuationCharacter( character, !env.features.isRegExpUnicodePropertySupported );
			}

			it( 'should not show panel for marker in the middle of other word', () => {
				_setModelData( model, '<paragraph>foo[]</paragraph>' );

				model.change( writer => {
					writer.insertText( '@', doc.selection.getFirstPosition() );
				} );

				return waitForDebounce()
					.then( () => {
						expect( panelView.isVisible ).toBe( false );
						expect( editor.model.markers.has( 'mention' ) ).toBe( false );
					} );
			} );

			it( 'should not show panel when selection is inside a mention', () => {
				_setModelData( model, '<paragraph>foo @Lily bar[]</paragraph>' );

				model.change( writer => {
					const range = writer.createRange(
						writer.createPositionAt( doc.getRoot().getChild( 0 ), 4 ),
						writer.createPositionAt( doc.getRoot().getChild( 0 ), 9 )
					);

					writer.setAttribute( 'mention', { id: '@Lily', uid: 1234 }, range );
				} );

				return waitForDebounce()
					.then( () => {
						model.change( writer => {
							writer.setSelection( doc.getRoot().getChild( 0 ), 0 );
						} );

						expect( panelView.isVisible ).toBe( false );

						model.change( writer => {
							writer.setSelection( doc.getRoot().getChild( 0 ), 7 );
						} );
					} )
					.then( () => {
						expect( panelView.isVisible ).toBe( false );
						expect( editor.model.markers.has( 'mention' ) ).toBe( false );
					} );
			} );

			it( 'should not show panel when selection is at the end of a mention', () => {
				_setModelData( model, '<paragraph>foo @Lily bar[]</paragraph>' );

				model.change( writer => {
					const range = writer.createRange(
						writer.createPositionAt( doc.getRoot().getChild( 0 ), 4 ),
						writer.createPositionAt( doc.getRoot().getChild( 0 ), 9 )
					);

					writer.setAttribute( 'mention', { id: '@Lily', uid: 1234 }, range );
				} );

				return waitForDebounce()
					.then( () => {
						model.change( writer => {
							writer.setSelection( doc.getRoot().getChild( 0 ), 9 );
						} );
					} )
					.then( () => {
						expect( panelView.isVisible ).toBe( false );
						expect( editor.model.markers.has( 'mention' ) ).toBe( false );
					} );
			} );

			it( 'should not show panel when selection is not collapsed', () => {
				_setModelData( model, '<paragraph>foo []</paragraph>' );

				model.change( writer => {
					writer.insertText( '@', doc.selection.getFirstPosition() );
				} );

				return waitForDebounce()
					.then( () => {
						expect( panelView.isVisible ).toBe( true );
						expect( editor.model.markers.has( 'mention' ) ).toBe( true );

						model.change( () => {
							model.modifySelection( doc.selection, { direction: 'backward', unit: 'character' } );
						} );
					} )
					.then( waitForDebounce )
					.then( () => {
						expect( panelView.isVisible ).toBe( false );
						expect( editor.model.markers.has( 'mention' ) ).toBe( false );
					} );
			} );

			it( 'should not show panel when selection is changing (non-collapsed)', () => {
				_setModelData( model, '<paragraph>foo []</paragraph>' );

				model.change( writer => {
					writer.insertText( '@', doc.selection.getFirstPosition() );
				} );

				return waitForDebounce()
					.then( () => {
						expect( panelView.isVisible ).toBe( true );
						expect( editor.model.markers.has( 'mention' ) ).toBe( true );

						model.change( () => {
							model.modifySelection( doc.selection, { direction: 'backward', unit: 'character' } );
						} );
					} )
					.then( waitForDebounce )
					.then( () => {
						expect( panelView.isVisible ).toBe( false );
						expect( editor.model.markers.has( 'mention' ) ).toBe( false );
					} )
					.then( () => {
						model.change( () => {
							model.modifySelection( doc.selection, { direction: 'backward', unit: 'character' } );
						} );
					} )
					.then( waitForDebounce )
					.then( () => {
						expect( panelView.isVisible ).toBe( false );
						expect( editor.model.markers.has( 'mention' ) ).toBe( false );
					} );
			} );

			it( 'should not show panel when selection is after existing mention', () => {
				_setModelData( model, '<paragraph>foo [@Lily] bar[]</paragraph>' );
				model.change( writer => {
					writer.setAttribute( 'mention', { id: '@Lily', uid: 1234 }, doc.selection.getFirstRange() );
				} );

				return waitForDebounce()
					.then( () => {
						expect( panelView.isVisible ).toBe( false );

						model.change( writer => {
							writer.setSelection( doc.getRoot().getChild( 0 ), 8 );
						} );
					} )
					.then( waitForDebounce )
					.then( () => {
						expect( panelView.isVisible ).toBe( false );
					} );
			} );

			it( 'should not show panel when selection moves inside existing mention', () => {
				_setModelData( model, '<paragraph>foo @Lily bar[]</paragraph>' );

				model.change( writer => {
					const range = writer.createRange(
						writer.createPositionAt( doc.getRoot().getChild( 0 ), 4 ),
						writer.createPositionAt( doc.getRoot().getChild( 0 ), 9 )
					);
					writer.setAttribute( 'mention', { id: '@Lily', uid: 1234 }, range );
				} );

				return waitForDebounce()
					.then( () => {
						model.change( writer => {
							writer.setSelection( doc.getRoot().getChild( 0 ), 9 );
						} );
					} )
					.then( waitForDebounce )
					.then( () => {
						expect( panelView.isVisible ).toBe( false );

						model.change( writer => {
							writer.setSelection( doc.getRoot().getChild( 0 ), 8 );
						} );
					} )
					.then( waitForDebounce )
					.then( () => {
						expect( panelView.isVisible ).toBe( false );
					} );
			} );

			it( 'should show filtered results for matched text', () => {
				_setModelData( model, '<paragraph>foo []</paragraph>' );

				model.change( writer => {
					writer.insertText( '@', doc.selection.getFirstPosition() );
				} );

				model.change( writer => {
					writer.insertText( 'T', doc.selection.getFirstPosition() );
				} );

				return waitForDebounce()
					.then( () => {
						expect( panelView.isVisible ).toBe( true );
						expect( editor.model.markers.has( 'mention' ) ).toBe( true );
						expect( mentionsView.items ).toHaveLength( 1 );
					} );
			} );

			it( 'should focus the first item in panel', () => {
				_setModelData( model, '<paragraph>foo []</paragraph>' );

				model.change( writer => {
					writer.insertText( '@', doc.selection.getFirstPosition() );
				} );

				return waitForDebounce()
					.then( () => {
						const button = mentionsView.items.get( 0 ).children.get( 0 );

						expect( button.isOn ).toBe( true );
					} );
			} );

			it( 'should hide panel if no matched items', () => {
				_setModelData( model, '<paragraph>foo []</paragraph>' );

				model.change( writer => {
					writer.insertText( '@', doc.selection.getFirstPosition() );
				} );

				return waitForDebounce()
					.then( () => expect( panelView.isVisible ).toBe( true ) )
					.then( () => {
						model.change( writer => {
							writer.insertText( 'x', doc.selection.getFirstPosition() );
						} );
					} )
					.then( waitForDebounce )
					.then( () => {
						expect( panelView.isVisible ).toBe( false );
						expect( editor.model.markers.has( 'mention' ) ).toBe( false );
						expect( mentionsView.items ).toHaveLength( 0 );
					} );
			} );

			it( 'should hide panel when text was unmatched', () => {
				_setModelData( model, '<paragraph>foo []</paragraph>' );

				model.change( writer => {
					writer.insertText( '@', doc.selection.getFirstPosition() );
				} );

				return waitForDebounce()
					.then( () => expect( panelView.isVisible ).toBe( true ) )
					.then( () => {
						model.change( writer => {
							const end = doc.selection.getFirstPosition();
							const start = end.getShiftedBy( -1 );

							writer.remove( writer.createRange( start, end ) );
						} );
					} )
					.then( waitForDebounce )
					.then( () => expect( panelView.isVisible ).toBe( false ) );
			} );
		} );

		// https://github.com/ckeditor/ckeditor5/issues/11400
		describe( 'matching with whitespaces', () => {
			const feedItems = [
				{ id: '@foo', name: 'Foo' },
				{ id: '@marry', name: 'Marry Foo' },
				{ id: '@marry', name: 'Marry Bar' },
				{ id: '@marry', name: 'Marry Baz' }
			];

			beforeEach( async () => {
				await createClassicTestEditor( {
					feeds: [
						{
							feed: queryText => feedItems.filter( ( { name } ) => name.toLowerCase().includes( queryText ) ),
							marker: '@'
						}
					]
				} );
			} );

			it( 'should not show panel when the selection is at the whitespace after an existing mention', async () => {
				_setModelData( model, '<paragraph>foo @marry bar[]</paragraph>' );

				model.change( writer => {
					const range = writer.createRange(
						// <paragraph>foo [@marry] bar</paragraph>
						writer.createPositionAt( doc.getRoot().getChild( 0 ), 4 ),
						writer.createPositionAt( doc.getRoot().getChild( 0 ), 10 )
					);

					writer.setAttribute( 'mention', { id: '@marry', uid: 1234 }, range );
				} );

				await waitForDebounce();

				model.change( writer => {
					writer.setSelection( doc.getRoot().getChild( 0 ), 0 );
				} );

				expect( panelView.isVisible ).toBe( false );

				model.change( writer => {
					// <paragraph>foo @marry []bar</paragraph>
					// All "Marry *" could match here if it wasn't for the existing mention.
					writer.setSelection( doc.getRoot().getChild( 0 ), 11 );
				} );

				expect( panelView.isVisible ).toBe( false );
				expect( model.markers.has( 'mention' ) ).toBe( false );
			} );

			it( 'should show the panel when the selection is at the whitespace after a matching marker and text', async () => {
				// This should match all "Marry *" because there's no marker for @marry yet.
				_setModelData( model, '<paragraph>foo @marry []bar</paragraph>' );

				await waitForDebounce();

				expect( panelView.isVisible ).toBe( true );
				expect( model.markers.has( 'mention' ) ).toBe( true );
				expect( mentionsView.items ).toHaveLength( 3 );
			} );
		} );

		describe( 'unicode', () => {
			beforeEach( () => {
				return createClassicTestEditor( {
					feeds: [
						{
							// Always return 5 items
							feed: [ '@תַפּוּחַ', '@אַגָס', '@apple', '@pear' ],
							marker: '@'
						}
					]
				} );
			} );

			it( 'should open panel for unicode character ב', ( { skip } ) => {
				if ( !env.features.isRegExpUnicodePropertySupported ) {
					skip();
					return;
				}

				_setModelData( model, '<paragraph>foo []</paragraph>' );

				model.change( writer => {
					writer.insertText( '@ס', doc.selection.getFirstPosition() );
				} );

				return waitForDebounce()
					.then( () => {
						expect( panelView.isVisible, 'panel is visible' ).toBe( true );
						expect( editor.model.markers.has( 'mention' ), 'marker is inserted' ).toBe( true );
						expect( mentionsView.items ).toHaveLength( 1 );
					} );
			} );
		} );

		describe( 'callback function using data from editor', () => {
			beforeEach( () => {
				return createClassicTestEditor( {
					feeds: [
						{
							marker: '#',
							feed() {
								expect( this ).toEqual( editor );
								return Promise.resolve( [ 'foo', 'bar' ] );
							}
						}
					]
				} );
			} );

			it( 'should bind the instance panel for matched marker', () => {
				_setModelData( model, '<paragraph>foo []</paragraph>' );

				model.change( writer => {
					writer.insertText( '#', doc.selection.getFirstPosition() );
				} );

				return waitForDebounce()
					.then( () => {
						expect( panelView.isVisible ).toBe( true );
						expect( editor.model.markers.has( 'mention' ) ).toBe( true );
						expect( mentionsView.items ).toHaveLength( 2 );
					} );
			} );
		} );

		describe( 'asynchronous list with custom trigger', () => {
			const issuesNumbers = [ '#100', '#101', '#102', '#103' ];

			let feedCallbackStub, feedCallbackTimeout, feedCallbackCallTimes;

			beforeEach( () => {
				feedCallbackTimeout = 20;
				feedCallbackCallTimes = 0;

				function feedCallback( feedText ) {
					return new Promise( resolve => {
						setTimeout( () => {
							feedCallbackCallTimes++;
							resolve( issuesNumbers.filter( number => number.includes( feedText ) ) );
						}, feedCallbackTimeout );
					} );
				}

				feedCallbackStub = vi.fn().mockImplementation( feedCallback );

				return createClassicTestEditor( {
					feeds: [
						{
							marker: '#',
							feed: feedCallbackStub
						}
					]
				} );
			} );

			it( 'should show panel for matched marker', () => {
				_setModelData( model, '<paragraph>foo []</paragraph>' );

				model.change( writer => {
					writer.insertText( '#', doc.selection.getFirstPosition() );
				} );

				return waitForDebounce()
					.then( () => {
						expect( panelView.isVisible ).toBe( true );
						expect( editor.model.markers.has( 'mention' ) ).toBe( true );
						expect( mentionsView.items ).toHaveLength( 4 );
					} );
			} );

			it( 'should fire requestFeed:response when request feed return a response', () => {
				_setModelData( model, '<paragraph>foo []</paragraph>' );
				const eventSpy = vi.fn();
				mentionUI.on( 'requestFeed:response', eventSpy );

				model.change( writer => {
					writer.insertText( '#', doc.selection.getFirstPosition() );
				} );

				return waitForDebounce()
					.then( () => {
						expect( eventSpy ).toHaveBeenCalledOnce();
						expect( eventSpy ).toHaveBeenCalledWith(
							expect.anything(),
							{
								feed: issuesNumbers,
								marker: '#',
								feedText: ''
							}
						);
						expect( panelView.isVisible ).toBe( true );
						expect( editor.model.markers.has( 'mention' ) ).toBe( true );
						expect( mentionsView.items ).toHaveLength( 4 );
					} );
			} );

			it( 'should show filtered results for matched text', () => {
				_setModelData( model, '<paragraph>foo []</paragraph>' );

				model.change( writer => {
					writer.insertText( '#', doc.selection.getFirstPosition() );
				} );

				model.change( writer => {
					writer.insertText( '2', doc.selection.getFirstPosition() );
				} );

				return waitForDebounce()
					.then( () => {
						expect( panelView.isVisible ).toBe( true );
						expect( editor.model.markers.has( 'mention' ) ).toBe( true );
						expect( mentionsView.items ).toHaveLength( 1 );
					} );
			} );

			it( 'should hide panel if no matched items', () => {
				_setModelData( model, '<paragraph>foo []</paragraph>' );

				model.change( writer => {
					writer.insertText( '#', doc.selection.getFirstPosition() );
				} );

				return waitForDebounce()
					.then( () => expect( panelView.isVisible ).toBe( true ) )
					.then( () => {
						model.change( writer => {
							writer.insertText( 'x', doc.selection.getFirstPosition() );
						} );
					} )
					.then( waitForDebounce )
					.then( () => {
						expect( panelView.isVisible ).toBe( false );
						expect( editor.model.markers.has( 'mention' ) ).toBe( false );
						expect( mentionsView.items ).toHaveLength( 0 );
					} );
			} );

			it( 'should hide panel when text was unmatched', () => {
				_setModelData( model, '<paragraph>foo []</paragraph>' );

				model.change( writer => {
					writer.insertText( '#', doc.selection.getFirstPosition() );
				} );

				return waitForDebounce()
					.then( () => expect( panelView.isVisible ).toBe( true ) )
					.then( () => {
						model.change( writer => {
							const end = doc.selection.getFirstPosition();
							const start = end.getShiftedBy( -1 );

							writer.remove( writer.createRange( start, end ) );
						} );
					} )
					.then( waitForDebounce )
					.then( () => expect( panelView.isVisible ).toBe( false ) );
			} );

			it( 'should show panel debounced', () => {
				_setModelData( model, '<paragraph>foo []</paragraph>' );

				model.change( writer => {
					writer.insertText( '#', doc.selection.getFirstPosition() );
				} );

				expect( feedCallbackStub ).not.toHaveBeenCalled();

				return Promise.resolve()
					.then( wait( 20 ) )
					.then( () => {
						expect( feedCallbackStub ).not.toHaveBeenCalled();

						model.change( writer => {
							writer.insertText( '1', doc.selection.getFirstPosition() );
						} );
					} )
					.then( wait( 20 ) )
					.then( () => {
						expect( feedCallbackStub ).not.toHaveBeenCalled();

						model.change( writer => {
							writer.insertText( '0', doc.selection.getFirstPosition() );
						} );
					} )
					.then( waitForDebounce )
					.then( () => {
						expect( feedCallbackStub ).toHaveBeenCalledOnce();

						// Should be called with all typed letters before debounce.
						expect( feedCallbackStub ).toHaveBeenCalledWith( '10' );

						expect( panelView.isVisible ).toBe( true );
						expect( editor.model.markers.has( 'mention' ) ).toBe( true );
						expect( mentionsView.items ).toHaveLength( 4 );
					} );
			} );

			it( 'should discard requested feed if they came out of order', () => {
				_setModelData( model, '<paragraph>foo []</paragraph>' );

				model.change( writer => {
					writer.insertText( '#', doc.selection.getFirstPosition() );
				} );

				expect( feedCallbackStub ).not.toHaveBeenCalled();

				const panelShowSpy = vi.spyOn( panelView, 'show' );

				// Increase the response time to extend the debounce time out.
				feedCallbackTimeout = 300;

				return Promise.resolve()
					.then( wait( 20 ) )
					.then( () => {
						expect( feedCallbackStub ).not.toHaveBeenCalled();

						model.change( writer => {
							writer.insertText( '1', doc.selection.getFirstPosition() );
						} );
					} )
					.then( waitForDebounce )
					.then( () => {
						expect( feedCallbackStub ).toHaveBeenCalledOnce();
						expect( feedCallbackStub ).toHaveBeenCalledWith( '1' );

						expect( panelView.isVisible, 'panel is hidden' ).toBe( false );
						expect( editor.model.markers.has( 'mention' ), 'marker is inserted' ).toBe( true );

						// Make second callback resolve before first.
						feedCallbackTimeout = 50;

						model.change( writer => {
							writer.insertText( '0', doc.selection.getFirstPosition() );
						} );
					} )
					.then( wait( 300 ) ) // Wait longer so the longer callback will be resolved.
					.then( () => {
						expect( feedCallbackStub ).toHaveBeenCalledTimes( 2 );
						expect( feedCallbackStub.mock.calls[ 1 ][ 0 ] ).toEqual( '10' );
						expect( panelShowSpy ).toHaveBeenCalledOnce();
						expect( feedCallbackCallTimes ).toEqual( 2 );

						expect( panelView.isVisible, 'panel is visible' ).toBe( true );
						expect( editor.model.markers.has( 'mention' ), 'marker is inserted' ).toBe( true );
						expect( mentionsView.items ).toHaveLength( 4 );
					} );
			} );

			it( 'should fire requestFeed:discarded event when requested feed came out of order', () => {
				_setModelData( model, '<paragraph>foo []</paragraph>' );

				model.change( writer => {
					writer.insertText( '#', doc.selection.getFirstPosition() );
				} );

				expect( feedCallbackStub ).not.toHaveBeenCalled();

				const panelShowSpy = vi.spyOn( panelView, 'show' );
				const eventSpy = vi.fn();
				mentionUI.on( 'requestFeed:discarded', eventSpy );

				// Increase the response time to extend the debounce time out.
				feedCallbackTimeout = 300;

				return Promise.resolve()
					.then( wait( 20 ) )
					.then( () => {
						expect( feedCallbackStub ).not.toHaveBeenCalled();

						model.change( writer => {
							writer.insertText( '1', doc.selection.getFirstPosition() );
						} );
					} )
					.then( waitForDebounce )
					.then( () => {
						expect( feedCallbackStub ).toHaveBeenCalledOnce();
						expect( feedCallbackStub ).toHaveBeenCalledWith( '1' );

						expect( panelView.isVisible, 'panel is hidden' ).toBe( false );
						expect( editor.model.markers.has( 'mention' ), 'marker is inserted' ).toBe( true );

						// Make second callback resolve before first.
						feedCallbackTimeout = 50;

						model.change( writer => {
							writer.insertText( '0', doc.selection.getFirstPosition() );
						} );
					} )
					.then( wait( 300 ) ) // Wait longer so the longer callback will be resolved.
					.then( () => {
						expect( feedCallbackStub ).toHaveBeenCalledTimes( 2 );
						expect( feedCallbackStub.mock.calls[ 1 ][ 0 ] ).toEqual( '10' );
						expect( panelShowSpy ).toHaveBeenCalledOnce();
						expect( eventSpy ).toHaveBeenCalledOnce();
						expect( eventSpy ).toHaveBeenCalledWith(
							expect.anything(),
							{
								feed: issuesNumbers,
								marker: '#',
								feedText: '1'
							}
						);
						expect( feedCallbackCallTimes ).toEqual( 2 );

						expect( panelView.isVisible, 'panel is visible' ).toBe( true );
						expect( editor.model.markers.has( 'mention' ), 'marker is inserted' ).toBe( true );
						expect( mentionsView.items ).toHaveLength( 4 );
					} );
			} );

			it( 'should discard requested feed if mention UI is hidden', () => {
				_setModelData( model, '<paragraph>foo []</paragraph>' );

				model.change( writer => {
					writer.insertText( '#', doc.selection.getFirstPosition() );
				} );

				expect( feedCallbackStub ).not.toHaveBeenCalled();

				feedCallbackTimeout = 200;

				return Promise.resolve()
					.then( waitForDebounce )
					.then( () => {
						expect( panelView.isVisible ).toBe( false ); // Should be still hidden;
						// Should be called with empty string.
						expect( feedCallbackStub ).toHaveBeenCalledWith( '' );

						model.change( writer => {
							writer.setSelection( doc.getRoot().getChild( 0 ), 0 );
						} );
					} )
					.then( waitForDebounce )
					.then( () => {
						expect( panelView.isVisible ).toBe( false );
						expect( editor.model.markers.has( 'mention' ) ).toBe( false );
					} );
			} );

			it( 'should fire requestFeed:error and log warning if requested feed failed', () => {
				_setModelData( model, '<paragraph>foo []</paragraph>' );

				feedCallbackStub.mockReturnValue( Promise.reject( 'Request timeout' ) );

				const warnSpy = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );
				const eventSpy = vi.fn();
				mentionUI.on( 'requestFeed:error', eventSpy );

				model.change( writer => {
					writer.insertText( '#', doc.selection.getFirstPosition() );
				} );

				return waitForDebounce()
					.then( () => {
						expect( panelView.isVisible, 'panel is hidden' ).toBe( false );
						expect( editor.model.markers.has( 'mention' ), 'there is no marker' ).toBe( false );

						expect( warnSpy ).toHaveBeenCalledWith(
							expect.stringMatching( /^mention-feed-callback-error/ ),
							expect.objectContaining( { marker: '#' } ),
							expect.any( String ) // Link to the documentation
						);
						expect( eventSpy ).toHaveBeenCalledOnce();
					} );
			} );

			it( 'should not fail if marker was removed', () => {
				_setModelData( model, '<paragraph>foo []</paragraph>' );
				const selectFirstMentionSpy = vi.spyOn( mentionsView, 'selectFirst' );

				model.change( writer => {
					writer.insertText( '#', doc.selection.getFirstPosition() );
				} );

				expect( feedCallbackStub ).not.toHaveBeenCalled();

				// Increase the response time to extend the debounce time out.
				feedCallbackTimeout = 500;

				return Promise.resolve()
					.then( waitForDebounce )
					.then( wait( 20 ) )
					.then( () => {
						model.change( writer => {
							writer.setSelection( doc.getRoot().getChild( 0 ), 2 );
						} );
					} )
					.then( wait( 20 ) )
					.then( () => {
						feedCallbackTimeout = 1000;
						model.change( writer => {
							writer.setSelection( doc.getRoot().getChild( 0 ), 'end' );
						} );
					} )
					.then( wait( 500 ) )
					.then( () => {
						expect( panelView.isVisible, 'panel is visible' ).toBe( true );
						// If there were any errors this will not get called.
						// The errors might come from unhandled promise rejections errors.
						expect( selectFirstMentionSpy ).toHaveBeenCalledOnce();
					} );
			} );

			it( 'should not show panel if selection was moved during fetching a feed', () => {
				_setModelData( model, '<paragraph>foo [#101] bar</paragraph><paragraph></paragraph>' );

				model.change( writer => {
					writer.setAttribute( 'mention', { id: '#101', uid: 1234 }, doc.selection.getFirstRange() );
				} );

				// Increase the response time to extend the debounce time out.
				feedCallbackTimeout = 300;

				model.change( writer => {
					writer.setSelection( doc.getRoot().getChild( 1 ), 0 );
					writer.insertText( '#', doc.selection.getFirstPosition() );
				} );

				expect( feedCallbackStub ).not.toHaveBeenCalled();

				return Promise.resolve()
					.then( waitForDebounce )
					.then( () => {
						expect( feedCallbackStub ).toHaveBeenCalledOnce();

						model.change( writer => {
							writer.setSelection( doc.getRoot().getChild( 0 ), 6 );
						} );

						expect( panelView.isVisible ).toBe( false );
					} )
					.then( waitForDebounce )
					.then( wait( 20 ) )
					.then( () => {
						expect( panelView.isVisible ).toBe( false );
						expect( editor.model.markers.has( 'mention' ) ).toBe( false );
					} );
			} );
		} );

		function testOpeningPunctuationCharacter( character, skipTest = false ) {
			it( `should show panel for matched marker after a "${ character }" character`, ( { skip } ) => {
				if ( skipTest ) {
					skip();
					return;
				}

				_setModelData( model, '<paragraph>[] foo</paragraph>' );

				model.change( writer => {
					writer.insertText( character, doc.selection.getFirstPosition() );
				} );

				model.change( writer => {
					writer.insertText( '@', doc.selection.getFirstPosition() );
				} );

				return waitForDebounce()
					.then( () => {
						expect( panelView.isVisible, 'panel is visible' ).toBe( true );
						expect( editor.model.markers.has( 'mention' ), 'marker is inserted' ).toBe( true );
						expect( mentionsView.items ).toHaveLength( 5 );
					} );
			} );
		}
	} );

	describe( 'panel behavior', () => {
		it( 'should close the opened panel on esc', () => {
			return createClassicTestEditor( staticConfig )
				.then( () => {
					_setModelData( model, '<paragraph>foo []</paragraph>' );

					model.change( writer => {
						writer.insertText( '@', doc.selection.getFirstPosition() );
					} );
				} )
				.then( waitForDebounce )
				.then( () => {
					expect( panelView.isVisible ).toBe( true );
					expect( editor.model.markers.has( 'mention' ) ).toBe( true );

					fireKeyDownEvent( {
						keyCode: keyCodes.esc,
						preventDefault: vi.fn(),
						stopPropagation: vi.fn()
					} );

					expect( panelView.isVisible ).toBe( false );
					expect( editor.model.markers.has( 'mention' ) ).toBe( false );
				} );
		} );

		it( 'should close the opened panel when click outside the panel', () => {
			return createClassicTestEditor( staticConfig )
				.then( () => {
					_setModelData( model, '<paragraph>foo []</paragraph>' );

					model.change( writer => {
						writer.insertText( '@', doc.selection.getFirstPosition() );
					} );
				} )
				.then( waitForDebounce )
				.then( () => {
					expect( panelView.isVisible ).toBe( true );
					expect( editor.model.markers.has( 'mention' ) ).toBe( true );

					document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

					expect( panelView.isVisible ).toBe( false );
					expect( editor.model.markers.has( 'mention' ) ).toBe( false );
				} );
		} );

		it( 'should hide the panel on selection change', () => {
			return createClassicTestEditor( staticConfig )
				.then( () => {
					_setModelData( model, '<paragraph>foo []</paragraph>' );

					model.change( writer => {
						writer.insertText( '@', doc.selection.getFirstPosition() );
					} );
				} )
				.then( waitForDebounce )
				.then( () => {
					expect( panelView.isVisible ).toBe( true );
					expect( editor.model.markers.has( 'mention' ) ).toBe( true );

					model.change( writer => {
						// Place position at the beginning of a paragraph.
						writer.setSelection( doc.getRoot().getChild( 0 ), 0 );
					} );

					expect( panelView.isVisible ).toBe( false );
					expect( mentionsView.position ).toBeUndefined();
					expect( editor.model.markers.has( 'mention' ) ).toBe( false );
				} );
		} );

		it( 'should hide the panel on selection change triggered by mouse click', () => {
			return createClassicTestEditor( staticConfig )
				.then( () => {
					_setModelData( model, '<paragraph>foo []</paragraph>' );

					model.change( writer => {
						writer.insertText( '@', doc.selection.getFirstPosition() );
					} );
				} )
				.then( waitForDebounce )
				.then( () => {
					expect( panelView.isVisible ).toBe( true );
					expect( editor.model.markers.has( 'mention' ) ).toBe( true );

					// This happens when user clicks outside the panel view and selection is changed.
					// Two panel closing mechanisms are run:
					// - clickOutsideHandler
					// - unmatched text in text watcher
					// which may fail when trying to remove mention marker twice.
					document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );
					model.change( writer => {
						// Place position at the beginning of a paragraph.
						writer.setSelection( doc.getRoot().getChild( 0 ), 0 );
					} );

					expect( panelView.isVisible ).toBe( false );
					expect( mentionsView.position ).toBeUndefined();
					expect( editor.model.markers.has( 'mention' ) ).toBe( false );
				} );
		} );

		describe( 'default list item', () => {
			// Create map of expected feed items as objects as they will be stored internally.
			const feedItems = staticConfig.feeds[ 0 ].feed.map( text => ( { text: `${ text }`, id: `${ text }` } ) );

			beforeEach( () => {
				return createClassicTestEditor( staticConfig );
			} );

			describe( 'on arrows', () => {
				it( 'should cycle down on arrow down', () => {
					_setModelData( model, '<paragraph>foo []</paragraph>' );

					model.change( writer => {
						writer.insertText( '@', doc.selection.getFirstPosition() );
					} );

					return waitForDebounce()
						.then( () => {
							expectChildViewsIsOnState( [ true, false, false, false, false ] );

							const keyEvtData = {
								keyCode: keyCodes.arrowdown,
								preventDefault: vi.fn(),
								stopPropagation: vi.fn()
							};

							fireKeyDownEvent( keyEvtData );
							expectChildViewsIsOnState( [ false, true, false, false, false ] );

							fireKeyDownEvent( keyEvtData );
							expectChildViewsIsOnState( [ false, false, true, false, false ] );

							fireKeyDownEvent( keyEvtData );
							expectChildViewsIsOnState( [ false, false, false, true, false ] );

							fireKeyDownEvent( keyEvtData );
							expectChildViewsIsOnState( [ false, false, false, false, true ] );

							fireKeyDownEvent( keyEvtData );
							expectChildViewsIsOnState( [ true, false, false, false, false ] );
						} );
				} );

				it( 'should cycle up on arrow up', () => {
					_setModelData( model, '<paragraph>foo []</paragraph>' );

					model.change( writer => {
						writer.insertText( '@', doc.selection.getFirstPosition() );
					} );

					return waitForDebounce()
						.then( () => {
							expectChildViewsIsOnState( [ true, false, false, false, false ] );

							const keyEvtData = {
								keyCode: keyCodes.arrowup,
								preventDefault: vi.fn(),
								stopPropagation: vi.fn()
							};

							fireKeyDownEvent( keyEvtData );
							expectChildViewsIsOnState( [ false, false, false, false, true ] );

							fireKeyDownEvent( keyEvtData );
							expectChildViewsIsOnState( [ false, false, false, true, false ] );

							fireKeyDownEvent( keyEvtData );
							expectChildViewsIsOnState( [ false, false, true, false, false ] );

							fireKeyDownEvent( keyEvtData );
							expectChildViewsIsOnState( [ false, true, false, false, false ] );

							fireKeyDownEvent( keyEvtData );
							expectChildViewsIsOnState( [ true, false, false, false, false ] );
						} );
				} );

				it( 'should not cycle with only one item in the list', () => {
					_setModelData( model, '<paragraph>foo []</paragraph>' );

					const keyDownEvtData = {
						keyCode: keyCodes.arrowdown,
						preventDefault: vi.fn(),
						stopPropagation: vi.fn()
					};

					const keyUpEvtData = {
						keyCode: keyCodes.arrowup,
						preventDefault: vi.fn(),
						stopPropagation: vi.fn()
					};

					model.change( writer => {
						writer.insertText( '@T', doc.selection.getFirstPosition() );
					} );

					return waitForDebounce()
						.then( () => {
							expectChildViewsIsOnState( [ true ] );

							fireKeyDownEvent( keyDownEvtData );

							expectChildViewsIsOnState( [ true ] );

							fireKeyDownEvent( keyUpEvtData );

							expectChildViewsIsOnState( [ true ] );
						} );
				} );
			} );

			describe( 'on "execute" keys', () => {
				testExecuteKey( 'enter', keyCodes.enter, feedItems );

				testExecuteKey( 'tab', keyCodes.tab, feedItems );
			} );

			describe( 'on other keys', () => {
				it( 'should do nothing on space', async () => {
					_setModelData( model, '<paragraph>foo []</paragraph>' );

					model.change( writer => {
						writer.insertText( '@', doc.selection.getFirstPosition() );
					} );

					const command = editor.commands.get( 'mention' );
					const spy = vi.spyOn( command, 'execute' );

					await waitForDebounce();
					expectChildViewsIsOnState( [ true, false, false, false, false ] );

					fireKeyDownEvent( {
						keyCodes: keyCodes.space,
						preventDefault: vi.fn(),
						stopPropagation: vi.fn()
					} );

					expect( spy ).not.toHaveBeenCalled();
				} );
			} );
		} );

		describe( 'default list item with custom feed', () => {
			const issues = [
				{ id: '@Ted' },
				{ id: '@Barney' },
				{ id: '@Robin' },
				{ id: '@Lily' },
				{ id: '@Marshal' }
			];

			beforeEach( () => {
				return createClassicTestEditor( {
					feeds: [
						{
							marker: '@',
							feed: feedText => issues.filter( issue => issue.id.includes( feedText ) )
						}
					]
				} );
			} );

			it( 'should show panel for matched marker', () => {
				_setModelData( model, '<paragraph>foo []</paragraph>' );

				model.change( writer => {
					writer.insertText( '@', doc.selection.getFirstPosition() );
				} );

				return waitForDebounce()
					.then( () => {
						expect( panelView.isVisible ).toBe( true );
						expect( editor.model.markers.has( 'mention' ) ).toBe( true );
						expect( mentionsView.items ).toHaveLength( 5 );
					} );
			} );
		} );

		describe( 'custom list item (string)', () => {
			const issues = [
				{ id: '@1002', title: 'Some bug in editor.' },
				{ id: '@1003', title: 'Introduce this feature.' },
				{ id: '@1004', title: 'Missing docs.' },
				{ id: '@1005', title: 'Another bug.' },
				{ id: '@1006', title: 'More bugs' }
			];

			beforeEach( () => {
				return createClassicTestEditor( {
					feeds: [
						{
							marker: '@',
							feed: issues,
							itemRenderer: item => item.title
						}
					]
				} );
			} );

			it( 'should show panel for matched marker', () => {
				_setModelData( model, '<paragraph>foo []</paragraph>' );

				model.change( writer => {
					writer.insertText( '@', doc.selection.getFirstPosition() );
				} );

				return waitForDebounce()
					.then( () => {
						expect( panelView.isVisible ).toBe( true );
						expect( editor.model.markers.has( 'mention' ) ).toBe( true );
						expect( mentionsView.items ).toHaveLength( 5 );
					} );
			} );

			describe( 'keys', () => {
				describe( 'on arrows', () => {
					it( 'should cycle down on arrow down', () => {
						_setModelData( model, '<paragraph>foo []</paragraph>' );

						model.change( writer => {
							writer.insertText( '@', doc.selection.getFirstPosition() );
						} );

						return waitForDebounce()
							.then( () => {
								expectChildViewsIsOnState( [ true, false, false, false, false ] );

								const keyEvtData = {
									keyCode: keyCodes.arrowdown,
									preventDefault: vi.fn(),
									stopPropagation: vi.fn()
								};

								fireKeyDownEvent( keyEvtData );
								expectChildViewsIsOnState( [ false, true, false, false, false ] );

								fireKeyDownEvent( keyEvtData );
								expectChildViewsIsOnState( [ false, false, true, false, false ] );

								fireKeyDownEvent( keyEvtData );
								expectChildViewsIsOnState( [ false, false, false, true, false ] );

								fireKeyDownEvent( keyEvtData );
								expectChildViewsIsOnState( [ false, false, false, false, true ] );

								fireKeyDownEvent( keyEvtData );
								expectChildViewsIsOnState( [ true, false, false, false, false ] );
							} );
					} );

					it( 'should cycle up on arrow up', () => {
						_setModelData( model, '<paragraph>foo []</paragraph>' );

						model.change( writer => {
							writer.insertText( '@', doc.selection.getFirstPosition() );
						} );

						return waitForDebounce()
							.then( () => {
								expectChildViewsIsOnState( [ true, false, false, false, false ] );

								const keyEvtData = {
									keyCode: keyCodes.arrowup,
									preventDefault: vi.fn(),
									stopPropagation: vi.fn()
								};

								fireKeyDownEvent( keyEvtData );
								expectChildViewsIsOnState( [ false, false, false, false, true ] );

								fireKeyDownEvent( keyEvtData );
								expectChildViewsIsOnState( [ false, false, false, true, false ] );

								fireKeyDownEvent( keyEvtData );
								expectChildViewsIsOnState( [ false, false, true, false, false ] );

								fireKeyDownEvent( keyEvtData );
								expectChildViewsIsOnState( [ false, true, false, false, false ] );

								fireKeyDownEvent( keyEvtData );
								expectChildViewsIsOnState( [ true, false, false, false, false ] );
							} );
					} );
				} );

				describe( 'on "execute" keys', () => {
					testExecuteKey( 'enter', keyCodes.enter, issues );

					testExecuteKey( 'tab', keyCodes.tab, issues );
				} );
			} );
		} );

		describe( 'custom list item (DOM Element)', () => {
			const issues = [
				{ id: '@1002', title: 'Some bug in editor.' },
				{ id: '@1003', title: 'Introduce this feature.' },
				{ id: '@1004', title: 'Missing docs.' },
				{ id: '@1005', title: 'Another bug.' },
				{ id: '@1006', title: 'More bugs' }
			];

			beforeEach( () => {
				return createClassicTestEditor( {
					feeds: [
						{
							marker: '@',
							feed: feedText => {
								return Promise.resolve( issues.filter( issue => issue.id.includes( feedText ) ) );
							},
							itemRenderer: item => {
								const span = global.document.createElementNS( 'http://www.w3.org/1999/xhtml', 'span' );

								span.innerHTML = `<span id="issue-${ item.id.slice( 1 ) }">@${ item.title }</span>`;

								return span;
							}
						}
					]
				} );
			} );

			it( 'should show panel for matched marker', () => {
				_setModelData( model, '<paragraph>foo []</paragraph>' );

				model.change( writer => {
					writer.insertText( '@', doc.selection.getFirstPosition() );
				} );

				return waitForDebounce()
					.then( () => {
						expect( panelView.isVisible ).toBe( true );
						expect( editor.model.markers.has( 'mention' ) ).toBe( true );
						expect( mentionsView.items ).toHaveLength( 5 );
					} );
			} );

			describe( 'keys', () => {
				describe( 'on arrows', () => {
					it( 'should cycle down on arrow down', () => {
						_setModelData( model, '<paragraph>foo []</paragraph>' );

						model.change( writer => {
							writer.insertText( '@', doc.selection.getFirstPosition() );
						} );

						return waitForDebounce()
							.then( () => {
								expectChildViewsIsOnState( [ true, false, false, false, false ] );

								const keyEvtData = {
									keyCode: keyCodes.arrowdown,
									preventDefault: vi.fn(),
									stopPropagation: vi.fn()
								};

								fireKeyDownEvent( keyEvtData );
								expectChildViewsIsOnState( [ false, true, false, false, false ] );

								fireKeyDownEvent( keyEvtData );
								expectChildViewsIsOnState( [ false, false, true, false, false ] );

								fireKeyDownEvent( keyEvtData );
								expectChildViewsIsOnState( [ false, false, false, true, false ] );

								fireKeyDownEvent( keyEvtData );
								expectChildViewsIsOnState( [ false, false, false, false, true ] );

								fireKeyDownEvent( keyEvtData );
								expectChildViewsIsOnState( [ true, false, false, false, false ] );
							} );
					} );

					it( 'should cycle up on arrow up', () => {
						_setModelData( model, '<paragraph>foo []</paragraph>' );

						model.change( writer => {
							writer.insertText( '@', doc.selection.getFirstPosition() );
						} );

						return waitForDebounce()
							.then( () => {
								expectChildViewsIsOnState( [ true, false, false, false, false ] );

								const keyEvtData = {
									keyCode: keyCodes.arrowup,
									preventDefault: vi.fn(),
									stopPropagation: vi.fn()
								};

								fireKeyDownEvent( keyEvtData );
								expectChildViewsIsOnState( [ false, false, false, false, true ] );

								fireKeyDownEvent( keyEvtData );
								expectChildViewsIsOnState( [ false, false, false, true, false ] );

								fireKeyDownEvent( keyEvtData );
								expectChildViewsIsOnState( [ false, false, true, false, false ] );

								fireKeyDownEvent( keyEvtData );
								expectChildViewsIsOnState( [ false, true, false, false, false ] );

								fireKeyDownEvent( keyEvtData );
								expectChildViewsIsOnState( [ true, false, false, false, false ] );
							} );
					} );
				} );

				describe( 'on "execute" keys', () => {
					testExecuteKey( 'enter', keyCodes.enter, issues );

					testExecuteKey( 'tab', keyCodes.tab, issues );
				} );

				describe( 'mouse', () => {
					it( 'should execute selected button on mouse click', () => {
						_setModelData( model, '<paragraph>foo []</paragraph>' );

						model.change( writer => {
							writer.insertText( '@', doc.selection.getFirstPosition() );
						} );

						const command = editor.commands.get( 'mention' );
						const spy = vi.spyOn( command, 'execute' );

						return waitForDebounce()
							.then( () => {
								expectChildViewsIsOnState( [ true, false, false, false, false ] );

								const element = panelView.element.querySelector( '#issue-1004' );
								element.dispatchEvent( new Event( 'click', { bubbles: true } ) );

								expect( spy ).toHaveBeenCalledOnce();

								const commandOptions = spy.mock.calls[ 0 ][ 0 ];

								const item = issues[ 2 ];

								expect( commandOptions ).toHaveProperty( 'mention' );
								expect( commandOptions.mention ).toEqual( item );
								expect( commandOptions ).toHaveProperty( 'marker', '@' );
								expect( commandOptions ).toHaveProperty( 'range' );

								const start = model.createPositionAt( doc.getRoot().getChild( 0 ), 4 );
								const expectedRange = model.createRange( start, start.getShiftedBy( 1 ) );

								expect( commandOptions.range.isEqual( expectedRange ) ).toBe( true );
							} );
					} );
				} );
			} );
		} );

		describe( 'multiple feeds configuration', () => {
			beforeEach( () => {
				return createClassicTestEditor( {
					feeds: [
						{
							marker: '@',
							feed: [ '@a1', '@a2', '@a3', '@a4 xyz', '@a5 x y z', '@a6 x$z' ]
						},
						{
							marker: '$',
							feed: [
								'$a1', '$a2', '$a3', '$a4',
								// A case of mention with a marker character from other feed.
								// See https://github.com/ckeditor/ckeditor5/issues/6398.
								'$a@'
							]
						}
					]
				} );
			} );

			it( 'should show panel for matched marker', () => {
				_setModelData( model, '<paragraph>foo []</paragraph>' );

				model.change( writer => {
					writer.insertText( '@', doc.selection.getFirstPosition() );
				} );

				return waitForDebounce()
					.then( () => {
						expect( panelView.isVisible ).toBe( true );
						expect( editor.model.markers.has( 'mention' ) ).toBe( true );
						expect( mentionsView.items ).toHaveLength( 6 );

						mentionsView.items.get( 0 ).children.get( 0 ).fire( 'execute' );
					} )
					.then( waitForDebounce )
					.then( () => {
						expect( panelView.isVisible ).toBe( false );
						expect( editor.model.markers.has( 'mention' ) ).toBe( false );

						model.change( writer => {
							writer.insertText( '$', doc.selection.getFirstPosition() );
						} );
					} )
					.then( waitForDebounce )
					.then( () => {
						expect( panelView.isVisible ).toBe( true );
						expect( editor.model.markers.has( 'mention' ) ).toBe( true );
						expect( mentionsView.items ).toHaveLength( 5 );

						mentionsView.items.get( 0 ).children.get( 0 ).fire( 'execute' );
					} )
					.then( waitForDebounce )
					.then( () => {
						expect( panelView.isVisible ).toBe( false );
						expect( editor.model.markers.has( 'mention' ) ).toBe( false );

						model.change( writer => {
							writer.insertText( '@', doc.selection.getFirstPosition() );
						} );
					} )
					.then( waitForDebounce )
					.then( () => {
						expect( panelView.isVisible ).toBe( true );
						expect( editor.model.markers.has( 'mention' ) ).toBe( true );

						expect( mentionsView.items ).toHaveLength( 6 );
					} );
			} );

			it( 'should show panel for matched marker if it contains the other configured marker', () => {
				_setModelData( model, '<paragraph>foo []</paragraph>' );

				model.change( writer => {
					writer.insertText( '@', doc.selection.getFirstPosition() );
				} );

				return waitForDebounce()
					.then( () => {
						expect( panelView.isVisible ).toBe( true );
						expect( editor.model.markers.has( 'mention' ) ).toBe( true );
						expect( mentionsView.items ).toHaveLength( 6 );

						mentionsView.items.get( 0 ).children.get( 0 ).fire( 'execute' );
					} )
					.then( waitForDebounce )
					.then( () => {
						expect( panelView.isVisible ).toBe( false );
						expect( editor.model.markers.has( 'mention' ) ).toBe( false );

						model.change( writer => {
							writer.insertText( '$a', doc.selection.getFirstPosition() );
						} );
					} )
					.then( waitForDebounce )
					.then( () => {
						model.change( writer => {
							writer.insertText( '@', doc.selection.getFirstPosition() );
						} );
					} )
					.then( waitForDebounce )
					.then( () => {
						expect( panelView.isVisible ).toBe( true );
						expect( editor.model.markers.has( 'mention' ) ).toBe( true );
					} );
			} );

			it( 'should match a feed', () => {
				_setModelData( model, '<paragraph>foo []</paragraph>' );

				model.change( writer => {
					writer.insertText( '@a3', doc.selection.getFirstPosition() );
				} );

				return waitForDebounce()
					.then( () => {
						expect( panelView.isVisible ).toBe( true );
						expect( editor.model.markers.has( 'mention' ) ).toBe( true );
						expect( mentionsView.items ).toHaveLength( 1 );
					} );
			} );

			it( 'should match a feed with space', () => {
				_setModelData( model, '<paragraph>foo []</paragraph>' );

				model.change( writer => {
					writer.insertText( '@a4 xyz', doc.selection.getFirstPosition() );
				} );

				return waitForDebounce()
					.then( () => {
						expect( panelView.isVisible ).toBe( true );
						expect( editor.model.markers.has( 'mention' ) ).toBe( true );
						expect( mentionsView.items ).toHaveLength( 1 );
					} );
			} );

			it( 'should match a feed with multiple spaces', () => {
				_setModelData( model, '<paragraph>foo []</paragraph>' );

				model.change( writer => {
					writer.insertText( '@a5 x y z', doc.selection.getFirstPosition() );
				} );

				return waitForDebounce()
					.then( () => {
						expect( panelView.isVisible ).toBe( true );
						expect( editor.model.markers.has( 'mention' ) ).toBe( true );
						expect( mentionsView.items ).toHaveLength( 1 );
					} );
			} );

			it( 'should match a feed with spaces and other mention character', () => {
				_setModelData( model, '<paragraph>foo []</paragraph>' );

				model.change( writer => {
					writer.insertText( '@a6 x$z', doc.selection.getFirstPosition() );
				} );

				return waitForDebounce()
					.then( () => {
						expect( panelView.isVisible ).toBe( true );
						expect( editor.model.markers.has( 'mention' ) ).toBe( true );
						expect( mentionsView.items ).toHaveLength( 1 );
					} );
			} );
		} );

		function testExecuteKey( name, keyCode, feedItems ) {
			it( 'should execute selected button on ' + name, () => {
				_setModelData( model, '<paragraph>foo []</paragraph>' );

				model.change( writer => {
					writer.insertText( '@', doc.selection.getFirstPosition() );
				} );

				const command = editor.commands.get( 'mention' );
				const spy = vi.spyOn( command, 'execute' );

				return waitForDebounce()
					.then( () => {
						expectChildViewsIsOnState( [ true, false, false, false, false ] );

						fireKeyDownEvent( {
							keyCode: keyCodes.arrowup,
							preventDefault: vi.fn(),
							stopPropagation: vi.fn()
						} );

						expectChildViewsIsOnState( [ false, false, false, false, true ] );

						fireKeyDownEvent( {
							keyCode,
							preventDefault: vi.fn(),
							stopPropagation: vi.fn()
						} );

						expect( spy ).toHaveBeenCalledOnce();

						assertCommandOptions( spy.mock.calls[ 0 ][ 0 ], '@', feedItems[ 4 ] );

						const start = model.createPositionAt( doc.getRoot().getChild( 0 ), 4 );
						const expectedRange = model.createRange( start, start.getShiftedBy( 1 ) );

						expect( spy.mock.calls[ 0 ][ 0 ].range.isEqual( expectedRange ) ).toBe( true );
					} );
			} );

			it( 'should do nothing if panel is not visible on ' + name, () => {
				_setModelData( model, '<paragraph>foo []</paragraph>' );

				model.change( writer => {
					writer.insertText( '@', doc.selection.getFirstPosition() );
				} );

				const command = editor.commands.get( 'mention' );
				const spy = vi.spyOn( command, 'execute' );

				return waitForDebounce()
					.then( () => {
						expect( panelView.isVisible ).toBe( true );
						expect( editor.model.markers.has( 'mention' ) ).toBe( true );

						fireKeyDownEvent( {
							keyCode: keyCodes.esc,
							preventDefault: vi.fn(),
							stopPropagation: vi.fn()
						} );

						expect( panelView.isVisible ).toBe( false );
						expect( editor.model.markers.has( 'mention' ) ).toBe( false );

						fireKeyDownEvent( {
							keyCode,
							preventDefault: vi.fn(),
							stopPropagation: vi.fn()
						} );

						expect( spy ).not.toHaveBeenCalled();

						expect( panelView.isVisible ).toBe( false );
						expect( editor.model.markers.has( 'mention' ) ).toBe( false );
					} );
			} );
		}

		describe( 'overriding commit keys using config.mention.commitKeys', () => {
			const issues = [
				{ id: '@Ted' },
				{ id: '@Barney' },
				{ id: '@Robin' },
				{ id: '@Lily' },
				{ id: '@Marshal' }
			];

			beforeEach( () => {
				return createClassicTestEditor( {
					commitKeys: [ keyCodes.a ],
					feeds: [
						{
							marker: '@',
							feed: feedText => issues.filter( issue => issue.id.includes( feedText ) )
						}
					]
				} );
			} );

			// Testing if custom key configuration will execute the mention command.
			testExecuteKey( 'a', keyCodes.a, issues );

			it( 'should no longer commit on enter (default)', () => {
				_setModelData( model, '<paragraph>foo []</paragraph>' );

				model.change( writer => {
					writer.insertText( '@', doc.selection.getFirstPosition() );
				} );

				return waitForDebounce()
					.then( () => {
						const command = editor.commands.get( 'mention' );
						const executeSpy = vi.spyOn( command, 'execute' );

						fireKeyDownEvent( {
							keyCode: keyCodes.enter,
							preventDefault: vi.fn(),
							stopPropagation: vi.fn()
						} );

						expect( executeSpy ).not.toHaveBeenCalled();
					} );
			} );

			it( 'should no longer commit on tab (default)', () => {
				_setModelData( model, '<paragraph>foo []</paragraph>' );

				model.change( writer => {
					writer.insertText( '@', doc.selection.getFirstPosition() );
				} );

				return waitForDebounce()
					.then( () => {
						const command = editor.commands.get( 'mention' );
						const executeSpy = vi.spyOn( command, 'execute' );

						fireKeyDownEvent( {
							keyCode: keyCodes.tab,
							preventDefault: vi.fn(),
							stopPropagation: vi.fn()
						} );

						expect( executeSpy ).not.toHaveBeenCalled();
					} );
			} );
		} );

		describe( 'overriding the number of visible mentions using config.mention.dropdownLimit', () => {
			const longFeed = [
				'@01', '@02', '@03', '@04', '@05', '@06', '@07', '@08', '@09', '@10',
				'@11', '@12', '@13', '@16', '@17', '@18', '@17', '@18', '@19', '@20',
				'@21', '@22', '@23', '@24', '@25', '@26', '@27', '@28', '@29', '@30'
			];

			const simpleArrayFeed = {
				marker: '@',
				feed: longFeed
			};

			const limitedArrayFeed = {
				marker: '@',
				feed: longFeed,
				dropdownLimit: 5
			};

			const customFunctionFeed = {
				marker: '@',
				feed: () => {
					return longFeed;
				}
			};

			it( 'works with specific number in case of custom function feed', () => {
				const mentionsLimit = 3;

				return createClassicTestEditor( {
					dropdownLimit: mentionsLimit,
					feeds: [ customFunctionFeed ] } )
					.then( () => {
						_setModelData( editor.model, '<paragraph>foo []</paragraph>' );

						model.change( writer => {
							writer.insertText( '@', doc.selection.getFirstPosition() );
						} );
					} )
					.then( waitForDebounce )
					.then( () => {
						expect( panelView.isVisible ).toBe( true );
						expect( mentionsView.items ).toHaveLength( mentionsLimit );
					} );
			} );

			it( 'dropdown list length should be equal to the dropdownLimit value', () => {
				return createClassicTestEditor( {
					dropdownLimit: 25,
					feeds: [ simpleArrayFeed ] } )
					.then( () => {
						_setModelData( model, '<paragraph>foo []</paragraph>' );

						model.change( writer => {
							writer.insertText( '@', doc.selection.getFirstPosition() );
						} );
					} )
					.then( waitForDebounce )
					.then( () => {
						expect( panelView.isVisible ).toBe( true );
						expect( mentionsView.items ).toHaveLength( 25 );
					} );
			} );

			it( 'dropdown list length should be equal to the length of the feed provided', () => {
				return createClassicTestEditor( {
					dropdownLimit: Infinity,
					feeds: [ simpleArrayFeed ] } )
					.then( () => {
						_setModelData( model, '<paragraph>foo []</paragraph>' );

						model.change( writer => {
							writer.insertText( '@', doc.selection.getFirstPosition() );
						} );
					} )
					.then( waitForDebounce )
					.then( () => {
						expect( panelView.isVisible ).toBe( true );
						expect( mentionsView.items ).toHaveLength( simpleArrayFeed.feed.length );
					} );
			} );

			it( 'dropdown list length should be equal to the feeds dropdownLimit value', () => {
				return createClassicTestEditor( {
					dropdownLimit: 25,
					feeds: [ limitedArrayFeed ] } )
					.then( () => {
						_setModelData( model, '<paragraph>foo []</paragraph>' );

						model.change( writer => {
							writer.insertText( '@', doc.selection.getFirstPosition() );
						} );
					} )
					.then( waitForDebounce )
					.then( () => {
						expect( panelView.isVisible ).toBe( true );
						expect( mentionsView.items ).toHaveLength( 5 );
					} );
			} );
		} );
	} );

	describe( 'execute', () => {
		beforeEach( () => createClassicTestEditor( staticConfig ) );

		it( 'should call the mention command with proper options', () => {
			_setModelData( model, '<paragraph>foo []</paragraph>' );

			model.change( writer => {
				writer.insertText( '@', doc.selection.getFirstPosition() );
			} );

			const command = editor.commands.get( 'mention' );
			const spy = vi.spyOn( command, 'execute' );

			return waitForDebounce()
				.then( () => {
					mentionsView.items.get( 0 ).children.get( 0 ).fire( 'execute' );

					expect( spy ).toHaveBeenCalledOnce();

					const commandOptions = spy.mock.calls[ 0 ][ 0 ];

					assertCommandOptions( commandOptions, '@', { id: '@Barney', text: '@Barney' } );

					const start = model.createPositionAt( doc.getRoot().getChild( 0 ), 4 );
					const expectedRange = model.createRange( start, start.getShiftedBy( 1 ) );

					expect( commandOptions.range.isEqual( expectedRange ) ).toBe( true );
				} );
		} );

		it( 'should hide panel on execute', () => {
			_setModelData( model, '<paragraph>foo []</paragraph>' );

			model.change( writer => {
				writer.insertText( '@', doc.selection.getFirstPosition() );
			} );

			return waitForDebounce()
				.then( () => {
					mentionsView.items.get( 0 ).children.get( 0 ).fire( 'execute' );
					return waitForDebounce().then( () => {
						expect( panelView.isVisible ).toBe( false );
						expect( editor.model.markers.has( 'mention' ) ).toBe( false );
					} );
				} );
		} );

		it( 'should focus view after command execution', () => {
			const focusSpy = vi.spyOn( editor.editing.view, 'focus' );

			_setModelData( model, '<paragraph>foo []</paragraph>' );

			model.change( writer => {
				writer.insertText( '@', doc.selection.getFirstPosition() );
			} );

			return waitForDebounce()
				.then( () => {
					mentionsView.items.get( 0 ).children.get( 0 ).fire( 'execute' );

					expect( focusSpy ).toHaveBeenCalledOnce();
				} );
		} );
	} );

	function createClassicTestEditor( mentionConfig ) {
		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Paragraph, MentionEditing, MentionUI ],
				mention: mentionConfig
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				doc = model.document;
				editingView = editor.editing.view;
				mentionUI = editor.plugins.get( MentionUI );
				panelView = editor.plugins.get( ContextualBalloon ).view;
				mentionsView = mentionUI._mentionsView;
			} );
	}

	function wait( timeout ) {
		return () => new Promise( resolve => {
			vi.advanceTimersByTime( timeout );
			resolve();
		} );
	}

	async function waitForDebounce() {
		return await wait( 180 )();
	}

	function fireKeyDownEvent( options ) {
		const eventInfo = new EventInfo( editingView.document, 'keydown' );
		const eventData = new ViewDocumentDomEventData( editingView.document, {
			target: document.body
		}, options );

		editingView.document.fire( eventInfo, eventData );
	}

	function stubSelectionRects( rects ) {
		const originalViewRangeToDom = editingView.domConverter.viewRangeToDom;

		// Mock selection rect.
		vi.spyOn( editingView.domConverter, 'viewRangeToDom' ).mockImplementation( ( ...args ) => {
			const domRange = originalViewRangeToDom.apply( editingView.domConverter, args );

			vi.spyOn( domRange, 'getClientRects' )
				.mockReturnValue( rects );

			return domRange;
		} );
	}

	function expectChildViewsIsOnState( expectedState ) {
		const childViews = [ ...mentionsView.items ].map( item => item.children.get( 0 ) );

		expect( childViews.map( child => child.isOn ) ).toEqual( expectedState );
	}

	function assertCommandOptions( commandOptions, marker, item ) {
		expect( commandOptions ).toHaveProperty( 'marker', marker );
		expect( commandOptions ).toHaveProperty( 'range' );
		expect( commandOptions ).toHaveProperty( 'mention' );

		const mentionForCommand = commandOptions.mention;

		for ( const key of Object.keys( item ) ) {
			expect( mentionForCommand[ key ] ).toEqual( item[ key ] );
		}
	}
} );
