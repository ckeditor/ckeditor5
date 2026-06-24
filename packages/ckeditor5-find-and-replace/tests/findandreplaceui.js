/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { IconFindReplace } from '@ckeditor/ckeditor5-icons';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { DropdownView, ButtonView, MenuBarMenuListItemButtonView, DialogView } from '@ckeditor/ckeditor5-ui';
import { global, keyCodes, env } from '@ckeditor/ckeditor5-utils';
import { FindAndReplaceUI } from '../src/findandreplaceui.js';
import { FindAndReplace } from '../src/findandreplace.js';
import { FindAndReplaceFormView } from '../src/ui/findandreplaceformview.js';

describe( 'FindAndReplaceUI', () => {
	let editorElement, editor, dropdown, findCommand, form, plugin;

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	it( 'should be named', () => {
		expect( FindAndReplaceUI.pluginName ).toBe( 'FindAndReplaceUI' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( FindAndReplaceUI.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( FindAndReplaceUI.isPremiumPlugin ).toBe( false );
	} );

	describe( 'init()', () => {
		describe( 'with the default UI type config (dialog)', () => {
			let toolbarButtonView, menuBarButtonView, dialogPlugin, dialogView;

			beforeEach( () => {
				editorElement = global.document.createElement( 'div' );
				global.document.body.appendChild( editorElement );

				return ClassicTestEditor
					.create( editorElement, {
						plugins: [ FindAndReplace, Paragraph ]
					} )
					.then( async newEditor => {
						editor = newEditor;
						toolbarButtonView = editor.ui.componentFactory.create( 'findAndReplace' );
						menuBarButtonView = editor.ui.componentFactory.create( 'menuBar:findAndReplace' );
						findCommand = editor.commands.get( 'find' );
						plugin = editor.plugins.get( 'FindAndReplaceUI' );
						dialogPlugin = editor.plugins.get( 'Dialog' );

						toolbarButtonView.fire( 'execute' );

						dialogView = dialogPlugin.view;

						await wait( 20 );

						form = dialogView.parts.get( 1 ).children.get( 0 );
					} );
			} );

			afterEach( () => {
				editorElement.remove();

				return editor.destroy();
			} );

			it( 'should add keystroke accessibility info', () => {
				expect( editor.accessibility.keystrokeInfos.get( 'contentEditing' ).groups.get( 'common' ).keystrokes ).toContainEqual( {
					label: 'Find in the document',
					keystroke: 'CTRL+F'
				} );
			} );

			it( 'should register a button UI compontent', () => {
				expect( toolbarButtonView ).toBeInstanceOf( ButtonView );
			} );

			it( 'should register a menu bar button UI compontent', () => {
				expect( menuBarButtonView ).toBeInstanceOf( MenuBarMenuListItemButtonView );
			} );

			it( 'should display a form inside a dialog', () => {
				expect( dialogView ).toBeInstanceOf( DialogView );
				expect( form ).toBeInstanceOf( FindAndReplaceFormView );
			} );

			it( 'should not create the form until the user opened the dialog (performance enhancement)', async () => {
				const editor = await ClassicTestEditor.create( editorElement, {
					plugins: [ FindAndReplace, Paragraph ]
				} );
				const plugin = editor.plugins.get( 'FindAndReplaceUI' );
				const toolbarButtonView = editor.ui.componentFactory.create( 'findAndReplace' );

				expect( plugin.formView ).toBeNull();

				toolbarButtonView.fire( 'execute' );

				expect( plugin.formView ).toBeInstanceOf( FindAndReplaceFormView );

				await editor.destroy();
			} );

			describe( 'findAndReplace button', () => {
				let button;

				describe( 'in toolbar', () => {
					beforeEach( () => {
						button = toolbarButtonView;
					} );

					it( 'should set a #tooltip of the #buttonView', () => {
						expect( button.tooltip ).toBe( true );
					} );

					testButton();
				} );

				describe( 'in menu bar', () => {
					beforeEach( () => {
						button = menuBarButtonView;
					} );

					testButton();

					it( 'should have proper role set', () => {
						expect( button.role ).toBe( 'menuitemcheckbox' );
					} );
				} );

				function testButton() {
					describe( 'upon dialog open', () => {
						it( 'CSS transitions should be disabled to avoid unnecessary animations (and then enable them again)', () => {
							// (https://github.com/ckeditor/ckeditor5/issues/10008)
							const disableCssTransitionsSpy = vi.spyOn( form, 'disableCssTransitions' );
							const enableCssTransitionsSpy = vi.spyOn( form, 'enableCssTransitions' );
							const selectSpy = vi.spyOn( form._findInputView.fieldView, 'select' );

							// Reopen the dialog.
							button.fire( 'execute' );
							button.fire( 'execute' );

							expect( disableCssTransitionsSpy.mock.invocationCallOrder[ 0 ] )
								.toBeLessThan( selectSpy.mock.invocationCallOrder[ 0 ] );
							expect( selectSpy.mock.invocationCallOrder[ 0 ] )
								.toBeLessThan( enableCssTransitionsSpy.mock.invocationCallOrder[ 0 ] );
						} );

						it( 'should be bound to dialog id', () => {
							dialogPlugin.id = 'findAndReplace';

							expect( button.isOn ).toBe( true );

							dialogPlugin.id = null;

							expect( button.isOn ).toBe( false );
						} );

						it( 'the form should be reset', () => {
							const spy = vi.spyOn( form, 'reset' );

							// Reopen the dialog.
							button.fire( 'execute' );
							button.fire( 'execute' );

							expect( spy ).toHaveBeenCalledTimes( 1 );
						} );

						it( 'the find input content should be selected', () => {
							const spy = vi.spyOn( form._findInputView.fieldView, 'select' );

							// Reopen the dialog.
							button.fire( 'execute' );
							button.fire( 'execute' );

							expect( spy ).toHaveBeenCalledTimes( 1 );
						} );

						it( 'the form input content should be focused', async () => {
							const spy = vi.spyOn( form, 'focus' );

							// Reopen the dialog.
							button.fire( 'execute' );
							button.fire( 'execute' );

							// Wait until it's not transparent.
							await wait( 20 );

							expect( spy ).toHaveBeenCalledTimes( 1 );
						} );

						it( 'all actions should be executed using the "low" priority to let the default open lister act first',
							async () => {
								const spy = vi.fn();
								const selectSpy = vi.spyOn( form._findInputView.fieldView, 'select' );

								dialogPlugin.on( 'show', spy );

								// Reopen the dialog.
								button.fire( 'execute' );
								button.fire( 'execute' );

								// Wait until it's not transparent.
								await wait( 20 );

								expect( spy.mock.invocationCallOrder[ 0 ] ).toBeLessThan( selectSpy.mock.invocationCallOrder[ 0 ] );
							} );
					} );

					describe( 'upon dialog close', () => {
						it( 'the #searchReseted event should be emitted', () => {
							const spy = vi.fn();

							plugin.on( 'searchReseted', spy );

							// Close the dialog.
							button.fire( 'execute' );

							expect( spy ).toHaveBeenCalledTimes( 1 );
						} );
					} );

					it( 'should be disabled when find command is disabled', () => {
						findCommand.isEnabled = true;
						expect( toolbarButtonView ).toHaveProperty( 'isEnabled', true );

						findCommand.isEnabled = false;
						expect( toolbarButtonView ).toHaveProperty( 'isEnabled', false );
					} );

					it( 'should set an #icon of the #buttonView', () => {
						expect( button.icon ).toBe( IconFindReplace );
					} );

					it( 'should set a #label of the #buttonView', () => {
						expect( button.label ).toBe( 'Find and replace' );
					} );

					it( 'should set a #keystroke of the #buttonView', () => {
						expect( button.keystroke ).toBe( 'CTRL+F' );
					} );

					it( 'should not open the dialog when command is disabled and CTRL+F was pressed', () => {
						// Close the dialog.
						dialogPlugin.hide();

						findCommand.isEnabled = false;

						expect( dialogPlugin.isOpen ).toBe( false );
						expect( button.isEnabled ).toBe( false );

						const keyEventData = ( {
							keyCode: keyCodes.f,
							ctrlKey: !env.isMac,
							metaKey: env.isMac,
							preventDefault: vi.fn(),
							stopPropagation: vi.fn()
						} );

						const wasHandled = editor.keystrokes.press( keyEventData );

						expect( wasHandled ).toBe( true );
						expect( keyEventData.preventDefault ).not.toHaveBeenCalled();

						expect( dialogPlugin.isOpen ).toBe( false );
					} );

					it( 'should open the dialog if dialog was closed and CTRL+F was pressed', () => {
						// Close the dialog.
						dialogPlugin.hide();

						const spy = vi.spyOn( form._findInputView.fieldView, 'select' );

						expect( dialogPlugin.isOpen ).toBe( false );

						const keyEventData = ( {
							keyCode: keyCodes.f,
							ctrlKey: !env.isMac,
							metaKey: env.isMac,
							preventDefault: vi.fn(),
							stopPropagation: vi.fn()
						} );

						const wasHandled = editor.keystrokes.press( keyEventData );

						expect( wasHandled ).toBe( true );
						expect( keyEventData.preventDefault ).toHaveBeenCalledTimes( 1 );

						expect( dialogPlugin.isOpen ).toBe( true );
						expect( spy ).toHaveBeenCalledTimes( 1 );
					} );

					it( 'should focus the dialog if dialog was open but blurred and CTRL+F was pressed', () => {
						const spy = vi.spyOn( dialogPlugin.view, 'focus' );

						editor.editing.view.focus();

						expect( dialogPlugin.isOpen ).toBe( true );

						const keyEventData = ( {
							keyCode: keyCodes.f,
							ctrlKey: !env.isMac,
							metaKey: env.isMac,
							preventDefault: vi.fn(),
							stopPropagation: vi.fn()
						} );

						const wasHandled = editor.keystrokes.press( keyEventData );

						expect( wasHandled ).toBe( true );
						expect( keyEventData.preventDefault ).toHaveBeenCalledTimes( 1 );

						expect( dialogPlugin.isOpen ).toBe( true );
						expect( spy ).toHaveBeenCalledTimes( 1 );
					} );

					it( 'should not change the focus if dialog was open and focused and CTRL+F was pressed', () => {
						form._focusTracker.focusedElement = form._findButtonView;

						const keyEventData = ( {
							keyCode: keyCodes.f,
							ctrlKey: !env.isMac,
							metaKey: env.isMac,
							preventDefault: vi.fn(),
							stopPropagation: vi.fn()
						} );

						const wasHandled = editor.keystrokes.press( keyEventData );

						expect( wasHandled ).toBe( true );
						expect( keyEventData.preventDefault ).toHaveBeenCalledTimes( 1 );

						expect( dialogPlugin.isOpen ).toBe( true );
						expect( form._focusTracker.focusedElement ).toBe( form._findButtonView );
					} );
				}
			} );

			describe( 'form events and bindings', () => {
				let findAndReplaceEditing, model;

				beforeEach( () => {
					model = editor.model;
					findAndReplaceEditing = editor.plugins.get( 'FindAndReplaceEditing' );
				} );

				it( 'should bind form #highlightOffset to FindAndReplaceState#highlightedResult', () => {
					findAndReplaceEditing.state.highlightedResult = null;

					expect( form.highlightOffset ).toBe( 0 );

					editor.setData( '<p>foo</p>' );

					const firstParagraph = editor.model.document.getRoot().getChild( 0 );
					let markerA, markerB;

					model.change( writer => {
						markerA = writer.addMarker( 'findResult:A', {
							usingOperation: false,
							affectsData: false,
							range: writer.createRange(
								writer.createPositionAt( firstParagraph, 0 ),
								writer.createPositionAt( firstParagraph, 1 )
							)
						} );
					} );

					model.change( writer => {
						markerB = writer.addMarker( 'findResult:B', {
							usingOperation: false,
							affectsData: false,
							range: writer.createRange(
								writer.createPositionAt( firstParagraph, 2 ),
								writer.createPositionAt( firstParagraph, 3 )
							)
						} );
					} );

					const resultA = {
						id: 'A',
						label: 'label',
						marker: markerA
					};

					const resultB = {
						id: 'B',
						label: 'label',
						marker: markerB
					};

					findAndReplaceEditing.state.results.add( resultB, resultA );
					findAndReplaceEditing.state.highlightedResult = resultB;

					expect( form.highlightOffset ).toBe( 1 );
				} );

				it( 'should update form #matchCount when FindAndReplaceState#results change', () => {
					editor.setData( '<p>foo</p>' );

					expect( form.matchCount ).toBe( 0 );

					const firstParagraph = editor.model.document.getRoot().getChild( 0 );
					let marker;

					model.change( writer => {
						marker = writer.addMarker( 'findResult:123456', {
							usingOperation: false,
							affectsData: false,
							range: writer.createRange(
								writer.createPositionAt( firstParagraph, 0 ),
								writer.createPositionAt( firstParagraph, 1 )
							)
						} );
					} );

					const highlightedResult = {
						id: '123456',
						label: 'label',
						marker
					};

					findAndReplaceEditing.state.results.add( highlightedResult );
					findAndReplaceEditing.state.highlightedResult = highlightedResult;

					expect( form.matchCount ).toBe( 1 );
				} );

				it( 'should bind form\'s #_areCommandsEnabled to various editor commands', () => {
					const commands = editor.commands;

					expect( form._areCommandsEnabled ).toEqual( {
						findNext: false,
						findPrevious: false,
						replace: true,
						replaceAll: true
					} );

					commands.get( 'findNext' ).isEnabled = true;
					commands.get( 'findPrevious' ).isEnabled = true;
					commands.get( 'replace' ).isEnabled = false;
					commands.get( 'replaceAll' ).isEnabled = false;

					expect( form._areCommandsEnabled ).toEqual( {
						findNext: true,
						findPrevious: true,
						replace: false,
						replaceAll: false
					} );
				} );

				it( 'should delegate various form events to the UI', () => {
					const findNextSpy = vi.fn();
					const findPreviousSpy = vi.fn();
					const replaceSpy = vi.fn();
					const replaceAllSpy = vi.fn();

					plugin.on( 'findNext', findNextSpy );
					plugin.on( 'findPrevious', findPreviousSpy );
					plugin.on( 'replace', replaceSpy );
					plugin.on( 'replaceAll', replaceAllSpy );

					form.fire( 'findNext', { searchText: 'foo' } );
					form.fire( 'findPrevious', { searchText: 'foo' } );
					form.fire( 'replace', { searchText: 'foo' } );
					form.fire( 'replaceAll', { searchText: 'foo' } );

					expect( findNextSpy ).toHaveBeenCalledTimes( 1 );
					expect( findPreviousSpy ).toHaveBeenCalledTimes( 1 );
					expect( replaceSpy ).toHaveBeenCalledTimes( 1 );
					expect( replaceAllSpy ).toHaveBeenCalledTimes( 1 );
				} );

				it( 'should fire #searchReseted when the form becomes dirty', () => {
					form.isDirty = false;

					const spy = vi.fn();

					plugin.on( 'searchReseted', spy );

					form.isDirty = true;
					expect( spy ).toHaveBeenCalledTimes( 1 );

					form.isDirty = false;
					expect( spy ).toHaveBeenCalledTimes( 1 );
				} );
			} );
		} );

		describe( 'with the UI type specified as dropdown in the config', () => {
			beforeEach( () => {
				editorElement = global.document.createElement( 'div' );
				global.document.body.appendChild( editorElement );

				return ClassicTestEditor
					.create( editorElement, {
						plugins: [ FindAndReplace, Paragraph ],
						findAndReplace: {
							uiType: 'dropdown'
						}
					} )
					.then( newEditor => {
						editor = newEditor;
						dropdown = editor.ui.componentFactory.create( 'findAndReplace' );
						findCommand = editor.commands.get( 'find' );
						plugin = editor.plugins.get( 'FindAndReplaceUI' );

						dropdown.render();
						global.document.body.appendChild( dropdown.element );

						// Trigger lazy init.
						dropdown.isOpen = true;
						dropdown.isOpen = false;

						form = dropdown.panelView.children.get( 0 );
					} );
			} );

			afterEach( () => {
				editorElement.remove();
				dropdown.element.remove();

				return editor.destroy();
			} );

			it( 'should add keystroke accessibility info', () => {
				expect( editor.accessibility.keystrokeInfos.get( 'contentEditing' ).groups.get( 'common' ).keystrokes ).toContainEqual( {
					label: 'Find in the document',
					keystroke: 'CTRL+F'
				} );
			} );

			it( 'should create a dropdown UI component', () => {
				expect( dropdown ).toBeInstanceOf( DropdownView );
			} );

			it( 'should allow creating two instances of the findAndReplace dropdown', () => {
				let secondInstance;

				expect( function createSecondInstance() {
					secondInstance = editor.ui.componentFactory.create( 'findAndReplace' );
				} ).not.toThrow();

				expect( dropdown ).not.toBe( secondInstance );
			} );

			it( 'should implement the CSS transition disabling feature', () => {
				expect( form.disableCssTransitions ).toEqual( expect.any( Function ) );
			} );

			describe( 'findAndReplace dropdown', () => {
				it( 'should not enable dropdown when find command is disabled', () => {
					findCommand.isEnabled = true;
					expect( dropdown ).toHaveProperty( 'isEnabled', true );

					findCommand.isEnabled = false;
					expect( dropdown ).toHaveProperty( 'isEnabled', false );
				} );

				describe( 'upon dropdown open', () => {
					it( 'CSS transitions should be disabled to avoid unnecessary animations (and then enable them again)', () => {
						// (https://github.com/ckeditor/ckeditor5/issues/10008)
						const disableCssTransitionsSpy = vi.spyOn( form, 'disableCssTransitions' );
						const enableCssTransitionsSpy = vi.spyOn( form, 'enableCssTransitions' );
						const selectSpy = vi.spyOn( form._findInputView.fieldView, 'select' );

						dropdown.isOpen = true;

						expect( disableCssTransitionsSpy.mock.invocationCallOrder[ 0 ] )
							.toBeLessThan( selectSpy.mock.invocationCallOrder[ 0 ] );
						expect( selectSpy.mock.invocationCallOrder[ 0 ] )
							.toBeLessThan( enableCssTransitionsSpy.mock.invocationCallOrder[ 0 ] );
					} );

					it( 'the form should be reset', () => {
						const spy = vi.spyOn( form, 'reset' );

						dropdown.isOpen = true;

						expect( spy ).toHaveBeenCalledTimes( 1 );
					} );

					it( 'the find input content should be selected', () => {
						const spy = vi.spyOn( form._findInputView.fieldView, 'select' );

						dropdown.isOpen = true;

						expect( spy ).toHaveBeenCalledTimes( 1 );
					} );

					it( 'the form input content should be focused', () => {
						const spy = vi.spyOn( form, 'focus' );

						dropdown.isOpen = true;

						expect( spy ).toHaveBeenCalledTimes( 1 );
					} );

					it( 'all actions should be executed using the "low" priority to let the default open lister act first', () => {
						const spy = vi.fn();
						const selectSpy = vi.spyOn( form._findInputView.fieldView, 'select' );

						dropdown.on( 'change:isOpen', spy );

						dropdown.isOpen = true;

						expect( spy.mock.invocationCallOrder[ 0 ] ).toBeLessThan( selectSpy.mock.invocationCallOrder[ 0 ] );
					} );
				} );

				describe( 'upon dropdown close', () => {
					it( 'the #searchReseted event should be emitted', () => {
						dropdown.isOpen = true;

						const spy = vi.fn();

						plugin.on( 'searchReseted', spy );

						dropdown.isOpen = false;

						expect( spy ).toHaveBeenCalledTimes( 1 );
					} );
				} );

				describe( 'button', () => {
					it( 'should set an #icon of the #buttonView', () => {
						expect( dropdown.buttonView.icon ).toBe( IconFindReplace );
					} );

					it( 'should set a #label of the #buttonView', () => {
						expect( dropdown.buttonView.label ).toBe( 'Find and replace' );
					} );

					it( 'should set a #tooltip of the #buttonView', () => {
						expect( dropdown.buttonView.tooltip ).toBe( true );
					} );

					it( 'should set a #keystroke of the #buttonView', () => {
						expect( dropdown.buttonView.keystroke ).toBe( 'CTRL+F' );
					} );

					it( 'should not open the dropdown when command is disabled and CTRL+F was pressed', () => {
						findCommand.isEnabled = false;

						expect( dropdown.isOpen ).toBe( false );
						expect( dropdown.isEnabled ).toBe( false );

						const keyEventData = ( {
							keyCode: keyCodes.f,
							ctrlKey: !env.isMac,
							metaKey: env.isMac,
							preventDefault: vi.fn(),
							stopPropagation: vi.fn()
						} );

						const wasHandled = editor.keystrokes.press( keyEventData );

						expect( wasHandled ).toBe( true );
						expect( keyEventData.preventDefault ).not.toHaveBeenCalled();

						expect( dropdown.isOpen ).toBe( false );
					} );

					it( 'should open the dropdown when CTRL+F was pressed', () => {
						const spy = vi.spyOn( form._findInputView.fieldView, 'select' );

						expect( dropdown.isOpen ).toBe( false );

						const keyEventData = ( {
							keyCode: keyCodes.f,
							ctrlKey: !env.isMac,
							metaKey: env.isMac,
							preventDefault: vi.fn(),
							stopPropagation: vi.fn()
						} );

						const wasHandled = editor.keystrokes.press( keyEventData );

						expect( wasHandled ).toBe( true );
						expect( keyEventData.preventDefault ).toHaveBeenCalledTimes( 1 );

						expect( dropdown.isOpen ).toBe( true );
						expect( spy ).toHaveBeenCalledTimes( 1 );
					} );

					it( 'should not close the dropdown if it was open when CTRL+F was pressed', () => {
						dropdown.isOpen = true;

						const keyEventData = ( {
							keyCode: keyCodes.f,
							ctrlKey: !env.isMac,
							metaKey: env.isMac,
							preventDefault: vi.fn(),
							stopPropagation: vi.fn()
						} );

						const wasHandled = editor.keystrokes.press( keyEventData );

						expect( wasHandled ).toBe( true );
						expect( keyEventData.preventDefault ).toHaveBeenCalledTimes( 1 );

						expect( dropdown.isOpen ).toBe( true );
					} );

					it( 'should not change the focus if dropdown was open and CTRL+F was pressed', () => {
						dropdown.isOpen = true;

						form._focusTracker.focusedElement = form._findButtonView;

						const keyEventData = ( {
							keyCode: keyCodes.f,
							ctrlKey: !env.isMac,
							metaKey: env.isMac,
							preventDefault: vi.fn(),
							stopPropagation: vi.fn()
						} );

						const wasHandled = editor.keystrokes.press( keyEventData );

						expect( wasHandled ).toBe( true );
						expect( keyEventData.preventDefault ).toHaveBeenCalledTimes( 1 );
						expect( form._focusTracker.focusedElement ).toBe( form._findButtonView );
					} );
				} );
			} );

			describe( 'form events and bindings', () => {
				let findAndReplaceEditing, model;

				beforeEach( () => {
					model = editor.model;
					findAndReplaceEditing = editor.plugins.get( 'FindAndReplaceEditing' );
				} );

				it( 'should bind form #highlightOffset to FindAndReplaceState#highlightedResult', () => {
					findAndReplaceEditing.state.highlightedResult = null;

					expect( form.highlightOffset ).toBe( 0 );

					editor.setData( '<p>foo</p>' );

					const firstParagraph = editor.model.document.getRoot().getChild( 0 );
					let markerA, markerB;

					model.change( writer => {
						markerA = writer.addMarker( 'findResult:A', {
							usingOperation: false,
							affectsData: false,
							range: writer.createRange(
								writer.createPositionAt( firstParagraph, 0 ),
								writer.createPositionAt( firstParagraph, 1 )
							)
						} );
					} );

					model.change( writer => {
						markerB = writer.addMarker( 'findResult:B', {
							usingOperation: false,
							affectsData: false,
							range: writer.createRange(
								writer.createPositionAt( firstParagraph, 2 ),
								writer.createPositionAt( firstParagraph, 3 )
							)
						} );
					} );

					const resultA = {
						id: 'A',
						label: 'label',
						marker: markerA
					};

					const resultB = {
						id: 'B',
						label: 'label',
						marker: markerB
					};

					findAndReplaceEditing.state.results.add( resultB, resultA );
					findAndReplaceEditing.state.highlightedResult = resultB;

					expect( form.highlightOffset ).toBe( 1 );
				} );

				it( 'should update form #matchCount when FindAndReplaceState#results change', () => {
					editor.setData( '<p>foo</p>' );

					expect( form.matchCount ).toBe( 0 );

					const firstParagraph = editor.model.document.getRoot().getChild( 0 );
					let marker;

					model.change( writer => {
						marker = writer.addMarker( 'findResult:123456', {
							usingOperation: false,
							affectsData: false,
							range: writer.createRange(
								writer.createPositionAt( firstParagraph, 0 ),
								writer.createPositionAt( firstParagraph, 1 )
							)
						} );
					} );

					const highlightedResult = {
						id: '123456',
						label: 'label',
						marker
					};

					findAndReplaceEditing.state.results.add( highlightedResult );
					findAndReplaceEditing.state.highlightedResult = highlightedResult;

					expect( form.matchCount ).toBe( 1 );
				} );

				it( 'should bind form\'s #_areCommandsEnabled to various editor commands', () => {
					const commands = editor.commands;

					expect( form._areCommandsEnabled ).toEqual( {
						findNext: false,
						findPrevious: false,
						replace: true,
						replaceAll: true
					} );

					commands.get( 'findNext' ).isEnabled = true;
					commands.get( 'findPrevious' ).isEnabled = true;
					commands.get( 'replace' ).isEnabled = false;
					commands.get( 'replaceAll' ).isEnabled = false;

					expect( form._areCommandsEnabled ).toEqual( {
						findNext: true,
						findPrevious: true,
						replace: false,
						replaceAll: false
					} );
				} );

				it( 'should delegate various form events to the UI', () => {
					const findNextSpy = vi.fn();
					const findPreviousSpy = vi.fn();
					const replaceSpy = vi.fn();
					const replaceAllSpy = vi.fn();

					plugin.on( 'findNext', findNextSpy );
					plugin.on( 'findPrevious', findPreviousSpy );
					plugin.on( 'replace', replaceSpy );
					plugin.on( 'replaceAll', replaceAllSpy );

					form.fire( 'findNext', { searchText: 'foo' } );
					form.fire( 'findPrevious', { searchText: 'foo' } );
					form.fire( 'replace', { searchText: 'foo' } );
					form.fire( 'replaceAll', { searchText: 'foo' } );

					expect( findNextSpy ).toHaveBeenCalledTimes( 1 );
					expect( findPreviousSpy ).toHaveBeenCalledTimes( 1 );
					expect( replaceSpy ).toHaveBeenCalledTimes( 1 );
					expect( replaceAllSpy ).toHaveBeenCalledTimes( 1 );
				} );

				it( 'should fire #searchReseted when the form becomes dirty', () => {
					form.isDirty = false;

					const spy = vi.fn();

					plugin.on( 'searchReseted', spy );

					form.isDirty = true;
					expect( spy ).toHaveBeenCalledTimes( 1 );

					form.isDirty = false;
					expect( spy ).toHaveBeenCalledTimes( 1 );
				} );
			} );
		} );
	} );

	function wait( time ) {
		return new Promise( res => {
			window.setTimeout( res, time );
		} );
	}
} );
