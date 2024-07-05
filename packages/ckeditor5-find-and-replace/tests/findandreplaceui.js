/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import DropdownView from '@ckeditor/ckeditor5-ui/src/dropdown/dropdownview.js';
import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard.js';
import env from '@ckeditor/ckeditor5-utils/src/env.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview.js';
import MenuBarMenuListItemButtonView from '@ckeditor/ckeditor5-ui/src/menubar/menubarmenulistitembuttonview.js';
import DialogView from '@ckeditor/ckeditor5-ui/src/dialog/dialogview.js';
import FindAndReplaceUI from '../src/findandreplaceui.js';
import FindAndReplace from '../src/findandreplace.js';
import loupeIcon from '../theme/icons/find-replace.svg';
import FindAndReplaceFormView from '../src/ui/findandreplaceformview.js';

/* global window */

describe( 'FindAndReplaceUI', () => {
	let editorElement, editor, dropdown, findCommand, form, plugin;

	testUtils.createSinonSandbox();

	it( 'should be named', () => {
		expect( FindAndReplaceUI.pluginName ).to.equal( 'FindAndReplaceUI' );
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
				expect( editor.accessibility.keystrokeInfos.get( 'contentEditing' ).groups.get( 'common' ).keystrokes ).to.deep.include( {
					label: 'Find in the document',
					keystroke: 'CTRL+F'
				} );
			} );

			it( 'should register a button UI compontent', () => {
				expect( toolbarButtonView ).to.be.instanceOf( ButtonView );
			} );

			it( 'should register a menu bar button UI compontent', () => {
				expect( menuBarButtonView ).to.be.instanceOf( MenuBarMenuListItemButtonView );
			} );

			it( 'should display a form inside a dialog', () => {
				expect( dialogView ).to.be.instanceOf( DialogView );
				expect( form ).to.be.instanceOf( FindAndReplaceFormView );
			} );

			it( 'should not create the form until the user opened the dialog (performance enhancement)', async () => {
				const editor = await ClassicTestEditor.create( editorElement, {
					plugins: [ FindAndReplace, Paragraph ]
				} );
				const plugin = editor.plugins.get( 'FindAndReplaceUI' );
				const toolbarButtonView = editor.ui.componentFactory.create( 'findAndReplace' );

				expect( plugin.formView ).to.be.null;

				toolbarButtonView.fire( 'execute' );

				expect( plugin.formView ).to.be.instanceOf( FindAndReplaceFormView );

				await editor.destroy();
			} );

			describe( 'findAndReplace button', () => {
				let button;

				describe( 'in toolbar', () => {
					beforeEach( () => {
						button = toolbarButtonView;
					} );

					it( 'should set a #tooltip of the #buttonView', () => {
						expect( button.tooltip ).to.be.true;
					} );

					testButton();
				} );

				describe( 'in menu bar', () => {
					beforeEach( () => {
						button = menuBarButtonView;
					} );

					testButton();

					it( 'should have proper role set', () => {
						expect( button.role ).to.be.equal( 'menuitemcheckbox' );
					} );
				} );

				function testButton() {
					describe( 'upon dialog open', () => {
						it( 'CSS transitions should be disabled to avoid unnecessary animations (and then enable them again)', () => {
							// (#10008)
							const disableCssTransitionsSpy = sinon.spy( form, 'disableCssTransitions' );
							const enableCssTransitionsSpy = sinon.spy( form, 'enableCssTransitions' );
							const selectSpy = sinon.spy( form._findInputView.fieldView, 'select' );

							// Reopen the dialog.
							button.fire( 'execute' );
							button.fire( 'execute' );

							sinon.assert.callOrder( disableCssTransitionsSpy, selectSpy, enableCssTransitionsSpy );
						} );

						it( 'should be bound to dialog id', () => {
							dialogPlugin.id = 'findAndReplace';

							expect( button.isOn ).to.be.true;

							dialogPlugin.id = null;

							expect( button.isOn ).to.be.false;
						} );

						it( 'the form should be reset', () => {
							const spy = sinon.spy( form, 'reset' );

							// Reopen the dialog.
							button.fire( 'execute' );
							button.fire( 'execute' );

							sinon.assert.calledOnce( spy );
						} );

						it( 'the find input content should be selected', () => {
							const spy = sinon.spy( form._findInputView.fieldView, 'select' );

							// Reopen the dialog.
							button.fire( 'execute' );
							button.fire( 'execute' );

							sinon.assert.calledOnce( spy );
						} );

						it( 'the form input content should be focused', async () => {
							const spy = sinon.spy( form, 'focus' );

							// Reopen the dialog.
							button.fire( 'execute' );
							button.fire( 'execute' );

							// Wait until it's not transparent.
							await wait( 20 );

							sinon.assert.calledOnce( spy );
						} );

						it( 'all actions should be executed using the "low" priority to let the default open lister act first',
							async () => {
								const spy = sinon.spy();
								const selectSpy = sinon.spy( form._findInputView.fieldView, 'select' );

								dialogPlugin.on( 'show', () => {
									spy();
								} );

								// Reopen the dialog.
								button.fire( 'execute' );
								button.fire( 'execute' );

								// Wait until it's not transparent.
								await wait( 20 );

								sinon.assert.callOrder( spy, selectSpy );
							} );
					} );

					describe( 'upon dialog close', () => {
						it( 'the #searchReseted event should be emitted', () => {
							const spy = sinon.spy();

							plugin.on( 'searchReseted', spy );

							// Close the dialog.
							button.fire( 'execute' );

							sinon.assert.calledOnce( spy );
						} );
					} );

					it( 'should be disabled when find command is disabled', () => {
						findCommand.isEnabled = true;
						expect( toolbarButtonView ).to.have.property( 'isEnabled', true );

						findCommand.isEnabled = false;
						expect( toolbarButtonView ).to.have.property( 'isEnabled', false );
					} );

					it( 'should set an #icon of the #buttonView', () => {
						expect( button.icon ).to.equal( loupeIcon );
					} );

					it( 'should set a #label of the #buttonView', () => {
						expect( button.label ).to.equal( 'Find and replace' );
					} );

					it( 'should set a #keystroke of the #buttonView', () => {
						expect( button.keystroke ).to.equal( 'CTRL+F' );
					} );

					it( 'should not open the dialog when command is disabled and CTRL+F was pressed', () => {
						// Close the dialog.
						dialogPlugin.hide();

						findCommand.isEnabled = false;

						expect( dialogPlugin.isOpen ).to.be.false;
						expect( button.isEnabled ).to.be.false;

						const keyEventData = ( {
							keyCode: keyCodes.f,
							ctrlKey: !env.isMac,
							metaKey: env.isMac,
							preventDefault: sinon.spy(),
							stopPropagation: sinon.spy()
						} );

						const wasHandled = editor.keystrokes.press( keyEventData );

						expect( wasHandled ).to.be.true;
						expect( keyEventData.preventDefault.notCalled ).to.be.true;

						expect( dialogPlugin.isOpen ).to.be.false;
					} );

					it( 'should open the dialog if dialog was closed and CTRL+F was pressed', () => {
						// Close the dialog.
						dialogPlugin.hide();

						const spy = sinon.spy( form._findInputView.fieldView, 'select' );

						expect( dialogPlugin.isOpen ).to.be.false;

						const keyEventData = ( {
							keyCode: keyCodes.f,
							ctrlKey: !env.isMac,
							metaKey: env.isMac,
							preventDefault: sinon.spy(),
							stopPropagation: sinon.spy()
						} );

						const wasHandled = editor.keystrokes.press( keyEventData );

						expect( wasHandled ).to.be.true;
						expect( keyEventData.preventDefault.calledOnce ).to.be.true;

						expect( dialogPlugin.isOpen ).to.be.true;
						sinon.assert.calledOnce( spy );
					} );

					it( 'should focus the dialog if dialog was open but blurred and CTRL+F was pressed', () => {
						const spy = sinon.spy( dialogPlugin.view, 'focus' );

						editor.editing.view.focus();

						expect( dialogPlugin.isOpen ).to.be.true;

						const keyEventData = ( {
							keyCode: keyCodes.f,
							ctrlKey: !env.isMac,
							metaKey: env.isMac,
							preventDefault: sinon.spy(),
							stopPropagation: sinon.spy()
						} );

						const wasHandled = editor.keystrokes.press( keyEventData );

						expect( wasHandled ).to.be.true;
						expect( keyEventData.preventDefault.calledOnce ).to.be.true;

						expect( dialogPlugin.isOpen ).to.be.true;
						sinon.assert.calledOnce( spy );
					} );

					it( 'should not change the focus if dialog was open and focused and CTRL+F was pressed', () => {
						form._focusTracker.focusedElement = form._findButtonView;

						const keyEventData = ( {
							keyCode: keyCodes.f,
							ctrlKey: !env.isMac,
							metaKey: env.isMac,
							preventDefault: sinon.spy(),
							stopPropagation: sinon.spy()
						} );

						const wasHandled = editor.keystrokes.press( keyEventData );

						expect( wasHandled ).to.be.true;
						expect( keyEventData.preventDefault.calledOnce ).to.be.true;

						expect( dialogPlugin.isOpen ).to.be.true;
						expect( form._focusTracker.focusedElement ).to.equal( form._findButtonView );
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

					expect( form.highlightOffset ).to.equal( 0 );

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

					expect( form.highlightOffset ).to.equal( 1 );
				} );

				it( 'should update form #matchCount when FindAndReplaceState#results change', () => {
					editor.setData( '<p>foo</p>' );

					expect( form.matchCount ).to.equal( 0 );

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

					expect( form.matchCount ).to.equal( 1 );
				} );

				it( 'should bind form\'s #_areCommandsEnabled to various editor commands', () => {
					const commands = editor.commands;

					expect( form._areCommandsEnabled ).to.deep.equal( {
						findNext: false,
						findPrevious: false,
						replace: true,
						replaceAll: true
					} );

					commands.get( 'findNext' ).isEnabled = true;
					commands.get( 'findPrevious' ).isEnabled = true;
					commands.get( 'replace' ).isEnabled = false;
					commands.get( 'replaceAll' ).isEnabled = false;

					expect( form._areCommandsEnabled ).to.deep.equal( {
						findNext: true,
						findPrevious: true,
						replace: false,
						replaceAll: false
					} );
				} );

				it( 'should delegate various form events to the UI', () => {
					const findNextSpy = sinon.spy();
					const findPreviousSpy = sinon.spy();
					const replaceSpy = sinon.spy();
					const replaceAllSpy = sinon.spy();

					plugin.on( 'findNext', findNextSpy );
					plugin.on( 'findPrevious', findPreviousSpy );
					plugin.on( 'replace', replaceSpy );
					plugin.on( 'replaceAll', replaceAllSpy );

					form.fire( 'findNext', { searchText: 'foo' } );
					form.fire( 'findPrevious', { searchText: 'foo' } );
					form.fire( 'replace', { searchText: 'foo' } );
					form.fire( 'replaceAll', { searchText: 'foo' } );

					sinon.assert.calledOnce( findNextSpy );
					sinon.assert.calledOnce( findPreviousSpy );
					sinon.assert.calledOnce( replaceSpy );
					sinon.assert.calledOnce( replaceAllSpy );
				} );

				it( 'should fire #searchReseted when the form becomes dirty', () => {
					form.isDirty = false;

					const spy = sinon.spy();

					plugin.on( 'searchReseted', spy );

					form.isDirty = true;
					sinon.assert.calledOnce( spy );

					form.isDirty = false;
					sinon.assert.calledOnce( spy );
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
				expect( editor.accessibility.keystrokeInfos.get( 'contentEditing' ).groups.get( 'common' ).keystrokes ).to.deep.include( {
					label: 'Find in the document',
					keystroke: 'CTRL+F'
				} );
			} );

			it( 'should create a dropdown UI component', () => {
				expect( dropdown ).to.be.instanceOf( DropdownView );
			} );

			it( 'should allow creating two instances of the findAndReplace dropdown', () => {
				let secondInstance;

				expect( function createSecondInstance() {
					secondInstance = editor.ui.componentFactory.create( 'findAndReplace' );
				} ).not.to.throw();

				expect( dropdown ).to.not.equal( secondInstance );
			} );

			it( 'should implement the CSS transition disabling feature', () => {
				expect( form.disableCssTransitions ).to.be.a( 'function' );
			} );

			describe( 'findAndReplace dropdown', () => {
				it( 'should not enable dropdown when find command is disabled', () => {
					findCommand.isEnabled = true;
					expect( dropdown ).to.have.property( 'isEnabled', true );

					findCommand.isEnabled = false;
					expect( dropdown ).to.have.property( 'isEnabled', false );
				} );

				describe( 'upon dropdown open', () => {
					it( 'CSS transitions should be disabled to avoid unnecessary animations (and then enable them again)', () => {
						// (#10008)
						const disableCssTransitionsSpy = sinon.spy( form, 'disableCssTransitions' );
						const enableCssTransitionsSpy = sinon.spy( form, 'enableCssTransitions' );
						const selectSpy = sinon.spy( form._findInputView.fieldView, 'select' );

						dropdown.isOpen = true;

						sinon.assert.callOrder( disableCssTransitionsSpy, selectSpy, enableCssTransitionsSpy );
					} );

					it( 'the form should be reset', () => {
						const spy = sinon.spy( form, 'reset' );

						dropdown.isOpen = true;

						sinon.assert.calledOnce( spy );
					} );

					it( 'the find input content should be selected', () => {
						const spy = sinon.spy( form._findInputView.fieldView, 'select' );

						dropdown.isOpen = true;

						sinon.assert.calledOnce( spy );
					} );

					it( 'the form input content should be focused', () => {
						const spy = sinon.spy( form, 'focus' );

						dropdown.isOpen = true;

						sinon.assert.calledOnce( spy );
					} );

					it( 'all actions should be executed using the "low" priority to let the default open lister act first', () => {
						const spy = sinon.spy();
						const selectSpy = sinon.spy( form._findInputView.fieldView, 'select' );

						dropdown.on( 'change:isOpen', () => {
							spy();
						} );

						dropdown.isOpen = true;

						sinon.assert.callOrder( spy, selectSpy );
					} );
				} );

				describe( 'upon dropdown close', () => {
					it( 'the #searchReseted event should be emitted', () => {
						dropdown.isOpen = true;

						const spy = sinon.spy();

						plugin.on( 'searchReseted', spy );

						dropdown.isOpen = false;

						sinon.assert.calledOnce( spy );
					} );
				} );

				describe( 'button', () => {
					it( 'should set an #icon of the #buttonView', () => {
						expect( dropdown.buttonView.icon ).to.equal( loupeIcon );
					} );

					it( 'should set a #label of the #buttonView', () => {
						expect( dropdown.buttonView.label ).to.equal( 'Find and replace' );
					} );

					it( 'should set a #tooltip of the #buttonView', () => {
						expect( dropdown.buttonView.tooltip ).to.be.true;
					} );

					it( 'should set a #keystroke of the #buttonView', () => {
						expect( dropdown.buttonView.keystroke ).to.equal( 'CTRL+F' );
					} );

					it( 'should not open the dropdown when command is disabled and CTRL+F was pressed', () => {
						findCommand.isEnabled = false;

						expect( dropdown.isOpen ).to.be.false;
						expect( dropdown.isEnabled ).to.be.false;

						const keyEventData = ( {
							keyCode: keyCodes.f,
							ctrlKey: !env.isMac,
							metaKey: env.isMac,
							preventDefault: sinon.spy(),
							stopPropagation: sinon.spy()
						} );

						const wasHandled = editor.keystrokes.press( keyEventData );

						expect( wasHandled ).to.be.true;
						expect( keyEventData.preventDefault.notCalled ).to.be.true;

						expect( dropdown.isOpen ).to.be.false;
					} );

					it( 'should open the dropdown when CTRL+F was pressed', () => {
						const spy = sinon.spy( form._findInputView.fieldView, 'select' );

						expect( dropdown.isOpen ).to.be.false;

						const keyEventData = ( {
							keyCode: keyCodes.f,
							ctrlKey: !env.isMac,
							metaKey: env.isMac,
							preventDefault: sinon.spy(),
							stopPropagation: sinon.spy()
						} );

						const wasHandled = editor.keystrokes.press( keyEventData );

						expect( wasHandled ).to.be.true;
						expect( keyEventData.preventDefault.calledOnce ).to.be.true;

						expect( dropdown.isOpen ).to.be.true;
						sinon.assert.calledOnce( spy );
					} );

					it( 'should not close the dropdown if it was open when CTRL+F was pressed', () => {
						dropdown.isOpen = true;

						const keyEventData = ( {
							keyCode: keyCodes.f,
							ctrlKey: !env.isMac,
							metaKey: env.isMac,
							preventDefault: sinon.spy(),
							stopPropagation: sinon.spy()
						} );

						const wasHandled = editor.keystrokes.press( keyEventData );

						expect( wasHandled ).to.be.true;
						expect( keyEventData.preventDefault.calledOnce ).to.be.true;

						expect( dropdown.isOpen ).to.be.true;
					} );

					it( 'should not change the focus if dropdown was open and CTRL+F was pressed', () => {
						dropdown.isOpen = true;

						form._focusTracker.focusedElement = form._findButtonView;

						const keyEventData = ( {
							keyCode: keyCodes.f,
							ctrlKey: !env.isMac,
							metaKey: env.isMac,
							preventDefault: sinon.spy(),
							stopPropagation: sinon.spy()
						} );

						const wasHandled = editor.keystrokes.press( keyEventData );

						expect( wasHandled ).to.be.true;
						expect( keyEventData.preventDefault.calledOnce ).to.be.true;
						expect( form._focusTracker.focusedElement ).to.equal( form._findButtonView );
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

					expect( form.highlightOffset ).to.equal( 0 );

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

					expect( form.highlightOffset ).to.equal( 1 );
				} );

				it( 'should update form #matchCount when FindAndReplaceState#results change', () => {
					editor.setData( '<p>foo</p>' );

					expect( form.matchCount ).to.equal( 0 );

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

					expect( form.matchCount ).to.equal( 1 );
				} );

				it( 'should bind form\'s #_areCommandsEnabled to various editor commands', () => {
					const commands = editor.commands;

					expect( form._areCommandsEnabled ).to.deep.equal( {
						findNext: false,
						findPrevious: false,
						replace: true,
						replaceAll: true
					} );

					commands.get( 'findNext' ).isEnabled = true;
					commands.get( 'findPrevious' ).isEnabled = true;
					commands.get( 'replace' ).isEnabled = false;
					commands.get( 'replaceAll' ).isEnabled = false;

					expect( form._areCommandsEnabled ).to.deep.equal( {
						findNext: true,
						findPrevious: true,
						replace: false,
						replaceAll: false
					} );
				} );

				it( 'should delegate various form events to the UI', () => {
					const findNextSpy = sinon.spy();
					const findPreviousSpy = sinon.spy();
					const replaceSpy = sinon.spy();
					const replaceAllSpy = sinon.spy();

					plugin.on( 'findNext', findNextSpy );
					plugin.on( 'findPrevious', findPreviousSpy );
					plugin.on( 'replace', replaceSpy );
					plugin.on( 'replaceAll', replaceAllSpy );

					form.fire( 'findNext', { searchText: 'foo' } );
					form.fire( 'findPrevious', { searchText: 'foo' } );
					form.fire( 'replace', { searchText: 'foo' } );
					form.fire( 'replaceAll', { searchText: 'foo' } );

					sinon.assert.calledOnce( findNextSpy );
					sinon.assert.calledOnce( findPreviousSpy );
					sinon.assert.calledOnce( replaceSpy );
					sinon.assert.calledOnce( replaceAllSpy );
				} );

				it( 'should fire #searchReseted when the form becomes dirty', () => {
					form.isDirty = false;

					const spy = sinon.spy();

					plugin.on( 'searchReseted', spy );

					form.isDirty = true;
					sinon.assert.calledOnce( spy );

					form.isDirty = false;
					sinon.assert.calledOnce( spy );
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
