/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { View, LabeledFieldView, ButtonView, ViewCollection, FocusCycler, CollapsibleView, SwitchButtonView } from '@ckeditor/ckeditor5-ui';

import { KeystrokeHandler, FocusTracker, keyCodes } from '@ckeditor/ckeditor5-utils';

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { BoldEditing } from '@ckeditor/ckeditor5-basic-styles';

import { FindAndReplace } from '../../src/findandreplace.js';
import { FindAndReplaceFormView } from '../../src/ui/findandreplaceformview.js';

import { IconPreviousArrow } from '@ckeditor/ckeditor5-icons';

describe( 'FindAndReplaceFormView', () => {
	let view;

	beforeEach( () => {
		view = new FindAndReplaceFormView( { t: val => val } );
		view.render();
		document.body.appendChild( view.element );
	} );

	afterEach( () => {
		view.element.remove();
		view.destroy();
	} );

	describe( 'constructor()', () => {
		describe( 'initial observables state', () => {
			it( 'should set #matchCount', () => {
				expect( view.matchCount ).toBe( 0 );
			} );

			it( 'should set #highlightOffset', () => {
				expect( view.highlightOffset ).toBe( 0 );
			} );

			it( 'should set #isDirty', () => {
				expect( view.isDirty ).toBe( false );
			} );

			it( 'should set #_areCommandsEnabled', () => {
				expect( view._areCommandsEnabled ).toEqual( {} );
			} );

			it( 'should set #_resultsCounterText', () => {
				expect( view._resultsCounterText ).toBe( '%0 of %1' );
			} );

			it( 'should set #_matchCase', () => {
				expect( view._matchCase ).toBe( false );
			} );

			it( 'should set #_wholeWordsOnly', () => {
				expect( view._wholeWordsOnly ).toBe( false );
			} );

			it( 'should set #_searchResultsFound', () => {
				expect( view._searchResultsFound ).toBe( false );
			} );
		} );

		describe( 'template', () => {
			it( 'should create element from template', () => {
				expect( view.element.tagName ).toBe( 'FORM' );
				expect( view.element.classList.contains( 'ck' ) ).toBe( true );
				expect( view.element.classList.contains( 'ck-find-and-replace-form' ) ).toBe( true );
				expect( view.element.getAttribute( 'tabindex' ) ).toBe( '-1' );
			} );

			it( 'should have input and action areas and collapsible options', () => {
				expect( view.template.children[ 0 ].get( 0 ) ).toBe( view._inputsDivView );
				expect( view.template.children[ 0 ].get( 1 ) ).toBe( view._advancedOptionsCollapsibleView );
				expect( view.template.children[ 0 ].get( 2 ) ).toBe( view._actionButtonsDivView );
			} );

			describe( 'inputs area', () => {
				it( 'should have an element created from template', () => {
					expect( view._inputsDivView.element.tagName ).toBe( 'DIV' );
					expect( view._inputsDivView.element.classList.contains( 'ck' ) ).toBe( true );
					expect( view._inputsDivView.element.classList.contains( 'ck-find-and-replace-form__inputs' ) ).toBe( true );
				} );

				it( 'should have children', () => {
					expect( view._inputsDivView.template.children[ 0 ] ).toBe( view._findInputView );
					expect( view._inputsDivView.template.children[ 1 ] ).toBe( view._findPrevButtonView );
					expect( view._inputsDivView.template.children[ 2 ] ).toBe( view._findNextButtonView );
					expect( view._inputsDivView.template.children[ 3 ] ).toBe( view._replaceInputView );
				} );

				describe( 'find input view', () => {
					it( 'should have a label', () => {
						expect( view._findInputView.label ).toMatch( /^Find in text/ );
					} );

					it( 'should have a match counter', () => {
						const counterElement = view._findInputView.element.firstChild.childNodes[ 2 ];

						expect( counterElement.classList.contains( 'ck' ) ).toBe( true );
						expect( counterElement.classList.contains( 'ck-results-counter' ) ).toBe( true );
						expect( counterElement.textContent ).toBe( '%0 of %1' );
					} );
				} );

				describe( 'find previous button view', () => {
					it( 'should have a label', () => {
						expect( view._findPrevButtonView.label ).toBe( 'Previous result' );
					} );

					it( 'should have a class', () => {
						expect( view._findPrevButtonView.class ).toBe( 'ck-button-prev' );
					} );

					it( 'should have a keystroke', () => {
						expect( view._findPrevButtonView.keystroke ).toBe( 'Shift+F3' );
					} );

					it( 'should have an icon', () => {
						expect( view._findPrevButtonView.icon ).toBe( IconPreviousArrow );
					} );

					it( 'should have a tooltip', () => {
						expect( view._findPrevButtonView.tooltip ).toBe( true );
					} );
				} );

				describe( 'find next button view', () => {
					it( 'should have a label', () => {
						expect( view._findNextButtonView.label ).toBe( 'Next result' );
					} );

					it( 'should have a class', () => {
						expect( view._findNextButtonView.class ).toBe( 'ck-button-next' );
					} );

					it( 'should have a keystroke', () => {
						expect( view._findNextButtonView.keystroke ).toBe( 'F3' );
					} );

					it( 'should have an icon', () => {
						expect( view._findNextButtonView.icon ).toBe( IconPreviousArrow );
					} );

					it( 'should have a tooltip', () => {
						expect( view._findNextButtonView.tooltip ).toBe( true );
					} );
				} );

				describe( 'replace input view', () => {
					it( 'should have a label', () => {
						expect( view._replaceInputView.label ).toMatch( /^Replace with/ );
					} );
				} );
			} );

			describe( 'advanced options collapsible', () => {
				let collapsible;

				beforeEach( () => {
					collapsible = view._advancedOptionsCollapsibleView;
				} );

				it( 'should be a CollapsibleView', () => {
					expect( collapsible ).toBeInstanceOf( CollapsibleView );
					expect( collapsible.class ).toBeUndefined();
					expect( collapsible.isCollapsed ).toBe( true );
				} );

				it( 'to have a buttonView', () => {
					expect( collapsible.buttonView.withText ).toBe( true );
					expect( collapsible.buttonView.label ).toBe( 'Advanced options' );
				} );

				it( 'should have a "match case" switch', () => {
					const switchView = collapsible.children.get( 0 );

					expect( switchView.label ).toBe( 'Match case' );
					expect( switchView.withText ).toBe( true );
				} );

				it( 'should have a "whole words only" switch', () => {
					const switchView = collapsible.children.get( 1 );

					expect( switchView.label ).toBe( 'Whole words only' );
					expect( switchView.withText ).toBe( true );
				} );

				it( 'should bind switch states to form properties', () => {
					const matchCaseSwitchView = collapsible.children.get( 0 );
					const wholeWordsSwitchView = collapsible.children.get( 1 );

					view._matchCase = view._wholeWordsOnly = false;

					expect( matchCaseSwitchView.isOn ).toBe( false );
					expect( wholeWordsSwitchView.isOn ).toBe( false );

					view._matchCase = true;

					expect( matchCaseSwitchView.isOn ).toBe( true );
					expect( wholeWordsSwitchView.isOn ).toBe( false );

					view._wholeWordsOnly = true;

					expect( matchCaseSwitchView.isOn ).toBe( true );
					expect( wholeWordsSwitchView.isOn ).toBe( true );
				} );

				it( 'should update form properties when switches are toggled', () => {
					const matchCaseSwitchView = collapsible.children.get( 0 );
					const wholeWordsSwitchView = collapsible.children.get( 1 );

					view._matchCase = view._wholeWordsOnly = false;

					matchCaseSwitchView.fire( 'execute' );

					expect( view._matchCase ).toBe( true );
					expect( view._wholeWordsOnly ).toBe( false );

					matchCaseSwitchView.fire( 'execute' );

					expect( view._matchCase ).toBe( false );
					expect( view._wholeWordsOnly ).toBe( false );

					wholeWordsSwitchView.fire( 'execute' );

					expect( view._matchCase ).toBe( false );
					expect( view._wholeWordsOnly ).toBe( true );

					wholeWordsSwitchView.fire( 'execute' );

					expect( view._matchCase ).toBe( false );
					expect( view._wholeWordsOnly ).toBe( false );
				} );
			} );

			describe( 'actions araea', () => {
				it( 'should have an element created from template', () => {
					expect( view._actionButtonsDivView.element.tagName ).toBe( 'DIV' );
					expect( view._actionButtonsDivView.element.classList.contains( 'ck' ) ).toBe( true );
					expect( view._actionButtonsDivView.element.classList.contains( 'ck-find-and-replace-form__actions' ) ).toBe( true );
				} );

				it( 'should have children', () => {
					expect( view._actionButtonsDivView.template.children[ 0 ] ).toBe( view._replaceAllButtonView );
					expect( view._actionButtonsDivView.template.children[ 1 ] ).toBe( view._replaceButtonView );
					expect( view._actionButtonsDivView.template.children[ 2 ] ).toBe( view._findButtonView );
				} );

				describe( 'replace all button view', () => {
					it( 'should have a label', () => {
						expect( view._replaceAllButtonView.label ).toBe( 'Replace all' );
					} );

					it( 'should have a class', () => {
						expect( view._replaceAllButtonView.class ).toBe( 'ck-button-replaceall' );
					} );

					it( 'should be with text', () => {
						expect( view._replaceAllButtonView.withText ).toBe( true );
					} );
				} );

				describe( 'replace button view', () => {
					it( 'should have a label', () => {
						expect( view._replaceButtonView.label ).toBe( 'Replace' );
					} );

					it( 'should have a class', () => {
						expect( view._replaceButtonView.class ).toBe( 'ck-button-replace' );
					} );

					it( 'should be with text', () => {
						expect( view._replaceButtonView.withText ).toBe( true );
					} );
				} );

				describe( 'find button view', () => {
					it( 'should have a label', () => {
						expect( view._findButtonView.label ).toBe( 'Find' );
					} );

					it( 'should have a class', () => {
						expect( view._findButtonView.class ).toBe( 'ck-button-find ck-button-action' );
					} );

					it( 'should have a text', () => {
						expect( view._findButtonView.withText ).toBe( true );
					} );
				} );
			} );

			it( 'should create child views', () => {
				expect( view._inputsDivView ).toBeInstanceOf( View );
				expect( view._findInputView ).toBeInstanceOf( LabeledFieldView );
				expect( view._findPrevButtonView ).toBeInstanceOf( ButtonView );
				expect( view._findNextButtonView ).toBeInstanceOf( ButtonView );
				expect( view._replaceInputView ).toBeInstanceOf( LabeledFieldView );

				expect( view._advancedOptionsCollapsibleView ).toBeInstanceOf( CollapsibleView );
				expect( view._matchCaseSwitchView ).toBeInstanceOf( SwitchButtonView );
				expect( view._wholeWordsOnlySwitchView ).toBeInstanceOf( SwitchButtonView );

				expect( view._actionButtonsDivView ).toBeInstanceOf( View );
				expect( view._replaceAllButtonView ).toBeInstanceOf( ButtonView );
				expect( view._replaceButtonView ).toBeInstanceOf( ButtonView );
				expect( view._findButtonView ).toBeInstanceOf( ButtonView );
			} );
		} );

		it( 'should create #focusTracker instance', () => {
			expect( view._focusTracker ).toBeInstanceOf( FocusTracker );
		} );

		it( 'should create #keystrokes instance', () => {
			expect( view._keystrokes ).toBeInstanceOf( KeystrokeHandler );
		} );

		it( 'should create #_focusCycler instance', () => {
			expect( view.focusCycler ).toBeInstanceOf( FocusCycler );
		} );

		it( 'should create #_focusables view collection', () => {
			expect( view._focusables ).toBeInstanceOf( ViewCollection );
		} );
	} );

	describe( 'render()', () => {
		describe( 'DOM submit event', () => {
			it( 'should be handled and delegated', () => {
				const spy = vi.fn();

				view.on( 'submit', spy );

				view.element.dispatchEvent( new Event( 'submit' ) );

				expect( spy ).toHaveBeenCalledTimes( 1 );
			} );
		} );

		describe( 'focus cycling, tracking and keyboard support', () => {
			it( 'should register child views in #_focusables', () => {
				const focusables = view._focusables.map( f => f );

				expect( focusables ).toHaveLength( 10 );
				expect( focusables ).toEqual( expect.arrayContaining( [
					view._findInputView,
					view._findPrevButtonView,
					view._findNextButtonView,
					view._replaceInputView,
					view._advancedOptionsCollapsibleView.buttonView,
					view._matchCaseSwitchView,
					view._wholeWordsOnlySwitchView,
					view._replaceAllButtonView,
					view._replaceButtonView,
					view._findButtonView
				] ) );
			} );

			it( 'should register child views\' #element in #focusTracker', () => {
				const view = new FindAndReplaceFormView( { t: val => val } );

				const spy = vi.spyOn( view._focusTracker, 'add' );

				view.render();

				expect( spy.mock.calls ).toEqual( [
					[ view._findInputView.element ],
					[ view._findPrevButtonView.element ],
					[ view._findNextButtonView.element ],
					[ view._replaceInputView.element ],
					[ view._advancedOptionsCollapsibleView.buttonView.element ],
					[ view._matchCaseSwitchView.element ],
					[ view._wholeWordsOnlySwitchView.element ],
					[ view._replaceAllButtonView.element ],
					[ view._replaceButtonView.element ],
					[ view._findButtonView.element ]
				] );

				view.destroy();
			} );

			it( 'starts listening for #keystrokes coming from #element', () => {
				const view = new FindAndReplaceFormView( { t: val => val } );

				const spy = vi.spyOn( view._keystrokes, 'listenTo' );

				view.render();
				expect( spy.mock.calls ).toEqual( [ [ view.element ] ] );

				view.destroy();
			} );

			describe( 'activates keyboard navigation in the form', () => {
				it( 'so "tab" focuses the next focusable item', () => {
					const keyEvtData = {
						keyCode: keyCodes.tab,
						preventDefault: vi.fn(),
						stopPropagation: vi.fn()
					};

					// Mock the url input is focused.
					view._focusTracker.isFocused = true;
					view._focusTracker.focusedElement = view._findNextButtonView.element;

					const spy = vi.spyOn( view._replaceInputView, 'focus' );

					view._keystrokes.press( keyEvtData );
					expect( keyEvtData.preventDefault ).toHaveBeenCalledTimes( 1 );
					expect( keyEvtData.stopPropagation ).toHaveBeenCalledTimes( 1 );
					expect( spy ).toHaveBeenCalledTimes( 1 );
				} );

				it( 'so "shift + tab" focuses the previous focusable item', () => {
					const keyEvtData = {
						keyCode: keyCodes.tab,
						shiftKey: true,
						preventDefault: vi.fn(),
						stopPropagation: vi.fn()
					};

					// Mock the cancel button is focused.
					view._focusTracker.isFocused = true;
					view._focusTracker.focusedElement = view._findNextButtonView.element;

					const spy = vi.spyOn( view._findPrevButtonView, 'focus' );

					view._keystrokes.press( keyEvtData );
					expect( keyEvtData.preventDefault ).toHaveBeenCalledTimes( 1 );
					expect( keyEvtData.stopPropagation ).toHaveBeenCalledTimes( 1 );
					expect( spy ).toHaveBeenCalledTimes( 1 );
				} );
			} );

			it( 'intercepts the arrow* events and overrides the default (parent) toolbar behavior', () => {
				const keyEvtData = {
					stopPropagation: vi.fn()
				};

				keyEvtData.keyCode = keyCodes.arrowdown;
				view._keystrokes.press( keyEvtData );
				expect( keyEvtData.stopPropagation ).toHaveBeenCalledTimes( 1 );

				keyEvtData.keyCode = keyCodes.arrowup;
				view._keystrokes.press( keyEvtData );
				expect( keyEvtData.stopPropagation ).toHaveBeenCalledTimes( 2 );

				keyEvtData.keyCode = keyCodes.arrowleft;
				view._keystrokes.press( keyEvtData );
				expect( keyEvtData.stopPropagation ).toHaveBeenCalledTimes( 3 );

				keyEvtData.keyCode = keyCodes.arrowright;
				view._keystrokes.press( keyEvtData );
				expect( keyEvtData.stopPropagation ).toHaveBeenCalledTimes( 4 );
			} );

			it( 'handles F3 keystroke and extecutes find next', () => {
				const keyEvtData = {
					keyCode: keyCodes.f3,
					preventDefault: vi.fn(),
					stopPropagation: vi.fn()
				};

				const spy = vi.spyOn( view._findNextButtonView, 'fire' );

				view._keystrokes.press( keyEvtData );

				expect( keyEvtData.preventDefault ).toHaveBeenCalledTimes( 1 );
				expect( keyEvtData.stopPropagation ).toHaveBeenCalledTimes( 1 );
				expect( spy.mock.calls ).toEqual( [ [ 'execute' ] ] );
			} );

			it( 'handles Shift+F3 keystroke and executes find previous', () => {
				const keyEvtData = {
					keyCode: keyCodes.f3,
					shiftKey: true,
					preventDefault: vi.fn(),
					stopPropagation: vi.fn()
				};

				const spy = vi.spyOn( view._findPrevButtonView, 'fire' );

				view._keystrokes.press( keyEvtData );

				expect( keyEvtData.preventDefault ).toHaveBeenCalledTimes( 1 );
				expect( keyEvtData.stopPropagation ).toHaveBeenCalledTimes( 1 );
				expect( spy.mock.calls ).toEqual( [ [ 'execute' ] ] );
			} );

			it( 'handles "enter" when pressed in the find input and performs a search', () => {
				const keyEvtData = {
					keyCode: keyCodes.enter,
					preventDefault: vi.fn(),
					stopPropagation: vi.fn(),
					target: view._findInputView.fieldView.element
				};

				const spy = vi.spyOn( view._findButtonView, 'fire' );

				view._keystrokes.press( keyEvtData );

				expect( keyEvtData.preventDefault ).toHaveBeenCalledTimes( 1 );
				expect( keyEvtData.stopPropagation ).toHaveBeenCalledTimes( 1 );
				expect( spy.mock.calls ).toEqual( [ [ 'execute' ] ] );
			} );

			it( 'handles "enter" when pressed in the find input and goes to the next result', () => {
				const keyEvtData = {
					keyCode: keyCodes.enter,
					preventDefault: vi.fn(),
					stopPropagation: vi.fn(),
					target: view._findInputView.fieldView.element
				};

				view._areCommandsEnabled = { findNext: true };

				const spy = vi.spyOn( view._findNextButtonView, 'fire' );

				view._keystrokes.press( keyEvtData );

				expect( keyEvtData.preventDefault ).toHaveBeenCalledTimes( 1 );
				expect( keyEvtData.stopPropagation ).toHaveBeenCalledTimes( 1 );
				expect( spy.mock.calls ).toEqual( [ [ 'execute' ] ] );
			} );

			it( 'handles "shift+enter" when pressed in the find input and performs a search', () => {
				const keyEvtData = {
					keyCode: keyCodes.enter,
					shiftKey: true,
					preventDefault: vi.fn(),
					stopPropagation: vi.fn(),
					target: view._findInputView.fieldView.element
				};

				const spy = vi.spyOn( view._findButtonView, 'fire' );

				view._keystrokes.press( keyEvtData );

				expect( keyEvtData.preventDefault ).toHaveBeenCalledTimes( 1 );
				expect( keyEvtData.stopPropagation ).toHaveBeenCalledTimes( 1 );
				expect( spy.mock.calls ).toEqual( [ [ 'execute' ] ] );
			} );

			it( 'handles "shift+enter" when pressed in the find input and goes to the previous result', () => {
				const keyEvtData = {
					keyCode: keyCodes.enter,
					shiftKey: true,
					preventDefault: vi.fn(),
					stopPropagation: vi.fn(),
					target: view._findInputView.fieldView.element
				};

				view._areCommandsEnabled = { findPrevious: true };

				const spy = vi.spyOn( view._findPrevButtonView, 'fire' );

				view._keystrokes.press( keyEvtData );

				expect( keyEvtData.preventDefault ).toHaveBeenCalledTimes( 1 );
				expect( keyEvtData.stopPropagation ).toHaveBeenCalledTimes( 1 );
				expect( spy.mock.calls ).toEqual( [ [ 'execute' ] ] );
			} );

			it( 'handles "enter" when pressed in the replace input and performs a replacement', () => {
				const keyEvtData = {
					keyCode: keyCodes.enter,
					preventDefault: vi.fn(),
					stopPropagation: vi.fn(),
					target: view._replaceInputView.fieldView.element
				};

				const spy = vi.spyOn( view._replaceButtonView, 'fire' );

				view._keystrokes.press( keyEvtData );

				expect( keyEvtData.preventDefault ).toHaveBeenCalledTimes( 1 );
				expect( keyEvtData.stopPropagation ).toHaveBeenCalledTimes( 1 );
				expect( spy.mock.calls ).toEqual( [ [ 'execute' ] ] );
			} );

			it( 'ignores "enter" when pressed somewhere else', () => {
				const keyEvtData = {
					keyCode: keyCodes.enter,
					preventDefault: vi.fn(),
					stopPropagation: vi.fn()
				};

				const spy = vi.spyOn( view._replaceButtonView, 'fire' );

				view._keystrokes.press( keyEvtData );

				expect( keyEvtData.preventDefault ).not.toHaveBeenCalled();
				expect( keyEvtData.stopPropagation ).not.toHaveBeenCalled();
				expect( spy ).not.toHaveBeenCalled();
			} );

			it( 'skips command execution on "enter" when search phrase input is dirty', () => {
				const keyEvtData = {
					keyCode: keyCodes.enter,
					target: view._replaceInputView.fieldView.element
				};

				const spy = vi.spyOn( view._replaceButtonView, 'fire' );

				view.isDirty = true;
				view._keystrokes.press( keyEvtData );

				expect( spy ).not.toHaveBeenCalled();
			} );

			it( 'ignores "shift+enter" when pressed somewhere else', () => {
				const keyEvtData = {
					keyCode: keyCodes.enter,
					shiftKey: true,
					preventDefault: vi.fn(),
					stopPropagation: vi.fn()
				};

				const spy = vi.spyOn( view._replaceButtonView, 'fire' );

				view._keystrokes.press( keyEvtData );

				expect( keyEvtData.preventDefault ).not.toHaveBeenCalled();
				expect( keyEvtData.stopPropagation ).not.toHaveBeenCalled();
				expect( spy ).not.toHaveBeenCalled();
			} );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should destroy the FocusTracker instance', () => {
			const destroySpy = vi.spyOn( view._focusTracker, 'destroy' );

			view.destroy();

			expect( destroySpy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should destroy the KeystrokeHandler instance', () => {
			const destroySpy = vi.spyOn( view._keystrokes, 'destroy' );

			view.destroy();

			expect( destroySpy ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'focus()', () => {
		it( 'should focus the #findInputView', () => {
			const spy = vi.spyOn( view._findInputView, 'focus' );

			view.focus();

			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should focus the #findButtonView if direction is backwards', () => {
			const spy = vi.spyOn( view._findButtonView, 'focus' );

			view.focus( -1 );

			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'reset()', () => {
		it( 'should reset the form', () => {
			view._findInputView.errorText = 'foo';
			view.isDirty = false;

			view.reset();

			expect( view._findInputView.errorText ).toBeNull();
			expect( view.isDirty ).toBe( true );
		} );
	} );

	describe( '_textToFind()', () => {
		it( 'should return the text of the find input', () => {
			view._findInputView.fieldView.value = 'foo';

			expect( view._textToFind ).toBe( 'foo' );
		} );
	} );

	describe( '_textToReplace()', () => {
		it( 'should return the text of the replace input', () => {
			view._replaceInputView.fieldView.value = 'foo';

			expect( view._textToReplace ).toBe( 'foo' );
		} );
	} );

	describe( 'form state machine', () => {
		let editorElement, editor, view, toolbarButtonView;
		let findInput, replaceInput, replaceButton, replaceAllButton, findButton, findNextButton, findPrevButton;
		let matchCaseSwitch, wholeWordsOnlySwitch, matchCounterElement;

		beforeEach( async () => {
			editorElement = document.createElement( 'div' );

			document.body.appendChild( editorElement );

			editor = await ClassicEditor.create( editorElement, {
				plugins: [ Essentials, Paragraph, BoldEditing, FindAndReplace ],
				toolbar: [ 'findAndReplace' ]
			} );

			toolbarButtonView = editor.ui.view.toolbar.items
				.find( item => item.label == 'Find and replace' );

			toolbarButtonView.fire( 'execute' );

			await wait( 20 );

			view = editor.plugins.get( 'FindAndReplaceUI' ).formView;

			findInput = view._findInputView;
			matchCounterElement = findInput.element.firstChild.childNodes[ 2 ];
			replaceInput = view._replaceInputView;
			findButton = view._findButtonView;
			findNextButton = view._findNextButtonView;
			findPrevButton = view._findPrevButtonView;
			replaceButton = view._replaceButtonView;
			replaceAllButton = view._replaceAllButtonView;

			const advancedOptionsCollapsibleView = view._advancedOptionsCollapsibleView;

			matchCaseSwitch = advancedOptionsCollapsibleView.children.get( 0 );
			wholeWordsOnlySwitch = advancedOptionsCollapsibleView.children.get( 0 );
		} );

		afterEach( async () => {
			await editor.destroy();

			editorElement.remove();
		} );

		async function toggleDialog() {
			toolbarButtonView.fire( 'execute' );

			await wait( 20 );
		}

		describe( 'initial state', () => {
			beforeEach( () => {
				toggleDialog();
			} );

			describe( 'properties', () => {
				it( 'sets isDirty to true', () => {
					expect( view.isDirty ).toBe( true );
				} );
			} );

			describe( 'find', () => {
				it( 'should set the find input empty and enabled', () => {
					expect( findInput.fieldView.element.value ).toBe( '' );
					expect( findInput.isEnabled ).toBe( true );
				} );

				it( 'should hide the match counter', () => {
					expect( matchCounterElement.classList.contains( 'ck-hidden' ) ).toBe( true );
				} );

				it( 'should set the find button enabled', () => {
					expect( findButton.isEnabled ).toBe( true );
				} );

				it( 'should set the find next button disabled', () => {
					expect( findNextButton.isEnabled ).toBe( false );
				} );

				it( 'should set the find previous button disabled', () => {
					expect( findPrevButton.isEnabled ).toBe( false );
				} );
			} );

			describe( 'replace', () => {
				it( 'should set the replace input empty and disabled', () => {
					expect( replaceInput.fieldView.element.value ).toBe( '' );
					expect( replaceInput.isEnabled ).toBe( false );
				} );

				it( 'should set the replace button disabled', () => {
					expect( replaceButton.isEnabled ).toBe( false );
				} );

				it( 'should set the replace all button disabled', () => {
					expect( replaceAllButton.isEnabled ).toBe( false );
				} );
			} );

			describe( 'options', () => {
				it( 'should set the "match case" switch off', () => {
					expect( matchCaseSwitch.isOn ).toBe( false );
				} );

				it( 'should set the "whole words only" switch off', () => {
					expect( wholeWordsOnlySwitch.isOn ).toBe( false );
				} );
			} );
		} );

		it( 'should preserve state after reopening the dialog but reset errors and make the form dirty', () => {
			findInput.fieldView.value = 'foo';
			findInput.errorText = 'error';
			replaceInput.fieldView.value = 'bar';
			matchCaseSwitch.isOn = true;
			wholeWordsOnlySwitch.isOn = true;
			view.isDirty = false;

			toggleDialog();
			toggleDialog();

			expect( view._textToFind ).toBe( 'foo' );
			expect( findInput.errorText ).toBeNull();
			expect( view._textToReplace ).toBe( 'bar' );
			expect( matchCaseSwitch.isOn ).toBe( true );
			expect( wholeWordsOnlySwitch.isOn ).toBe( true );
			expect( view.isDirty ).toBe( true );
		} );

		describe( 'using the "Find" button', () => {
			it( 'hitting "Find" when the find input has text should execute a #findNext event', () => {
				toggleDialog();

				const spy = vi.spyOn( view, 'fire' );
				findInput.fieldView.value = 'foo';

				findButton.fire( 'execute' );
				expect( spy.mock.calls ).toContainEqual( [ 'findNext', { searchText: 'foo', matchCase: false, wholeWords: false } ] );
			} );

			it( 'hitting "Find" when the find input is empty should show an error instead of finding things', () => {
				toggleDialog();

				const spy = vi.spyOn( view, 'fire' );
				findButton.fire( 'execute' );

				expect( findInput.errorText ).toMatch( /^Text to find must not/ );
				expect( spy ).not.toHaveBeenCalled();
			} );

			it( 'hitting "Find" with some results should enable the find previous/next navigation', () => {
				editor.setData( '<p>AAA</p>' );
				toggleDialog();

				findInput.fieldView.value = 'A';

				findButton.fire( 'execute' );

				expect( findNextButton.isEnabled ).toBe( true );
				expect( findPrevButton.isEnabled ).toBe( true );
			} );

			it( 'hitting "Find" with some results should enable the replace UI', () => {
				editor.setData( '<p>AAA</p>' );
				toggleDialog();

				findInput.fieldView.value = 'A';

				findButton.fire( 'execute' );

				expect( replaceInput.isEnabled ).toBe( true );
				expect( replaceButton.isEnabled ).toBe( true );
				expect( replaceAllButton.isEnabled ).toBe( true );
			} );

			it( 'hitting "Find" with some results should show the counter', () => {
				editor.setData( '<p>AAA</p>' );
				toggleDialog();

				findInput.fieldView.value = 'A';

				findButton.fire( 'execute' );

				expect( matchCounterElement.textContent ).toBe( '1 of 3' );
				expect( matchCounterElement.classList.contains( 'ck-hidden' ) ).toBe( false );
			} );

			it( 'hitting "Find" with the same results again should not change the UI', () => {
				editor.setData( '<p>AAA</p>' );
				toggleDialog();

				findInput.fieldView.value = 'A';

				findButton.fire( 'execute' );
				findButton.fire( 'execute' );

				expect( matchCounterElement.textContent ).toBe( '1 of 3' );
				expect( matchCounterElement.classList.contains( 'ck-hidden' ) ).toBe( false );
				expect( replaceInput.isEnabled ).toBe( true );
				expect( replaceButton.isEnabled ).toBe( true );
				expect( replaceAllButton.isEnabled ).toBe( true );
			} );

			it( 'hitting "Find" with no results should keep the replace UI disabled', () => {
				editor.setData( '<p>AAA</p>' );
				toggleDialog();

				findInput.fieldView.value = 'B';

				findButton.fire( 'execute' );

				expect( replaceInput.isEnabled ).toBe( false );
				expect( replaceButton.isEnabled ).toBe( false );
				expect( replaceAllButton.isEnabled ).toBe( false );
			} );

			it( 'hitting "Find" when navigating forward should reset the search', () => {
				editor.setData( '<p>AAA</p>' );
				toggleDialog();

				findInput.fieldView.value = 'A';

				findButton.fire( 'execute' );
				findNextButton.fire( 'execute' );
				expect( matchCounterElement.textContent ).toBe( '2 of 3' );

				findButton.fire( 'execute' );
				expect( matchCounterElement.textContent ).toBe( '1 of 3' );
			} );

			it( 'hitting "Find" with no result should watch document modifications and update highlighted item if not present', () => {
				editor.setData( '' );
				toggleDialog();

				findInput.fieldView.value = 'CupCake';
				findButton.fire( 'execute' );

				expect( matchCounterElement.textContent ).toBe( '0 of 0' );

				editor.setData( 'CupCake' );
				expect( matchCounterElement.textContent ).toBe( '1 of 1' );

				editor.setData( 'CupCake CupCake' );
				expect( matchCounterElement.textContent ).toBe( '1 of 2' );

				editor.setData( '' );
				expect( matchCounterElement.textContent ).toBe( '0 of 0' );
			} );

			it( 'hitting "Find" and toggling "matchCase" affects search results', () => {
				editor.setData( '<p>MatCH casE test</P' );
				toggleDialog();

				findInput.fieldView.value = 'match';
				matchCaseSwitch.fire( 'execute' );

				findButton.fire( 'execute' );
				expect( matchCounterElement.textContent ).toBe( '0 of 0' );

				// try again
				findButton.fire( 'execute' );
				expect( matchCounterElement.textContent ).toBe( '0 of 0' );

				// toggle switch
				matchCaseSwitch.fire( 'execute' );
				findButton.fire( 'execute' );

				expect( matchCounterElement.textContent ).toBe( '1 of 1' );
			} );

			it( 'hitting "Find" and toggling "wholeWords" affects search results', () => {
				editor.setData( '<p>MatCH casE test</P' );
				toggleDialog();

				findInput.fieldView.value = 'matc';
				findButton.fire( 'execute' );

				expect( matchCounterElement.textContent ).toBe( '1 of 1' );

				// toggle switch
				wholeWordsOnlySwitch.fire( 'execute' );
				findButton.fire( 'execute' );

				expect( matchCounterElement.textContent ).toBe( '0 of 0' );
			} );
		} );

		describe( 'find results navigation using previous/next buttons', () => {
			it( 'should bind next button #isEnabled to the "findNext" command', () => {
				const command = editor.commands.get( 'findNext' );

				command.isEnabled = false;
				expect( findNextButton.isEnabled ).toBe( false );

				command.isEnabled = true;
				expect( findNextButton.isEnabled ).toBe( true );
			} );

			it( 'should bind previous button #isEnabled to the "findPrevious" command', () => {
				const command = editor.commands.get( 'findPrevious' );

				command.isEnabled = false;
				expect( findPrevButton.isEnabled ).toBe( false );

				command.isEnabled = true;
				expect( findPrevButton.isEnabled ).toBe( true );
			} );

			it( 'should execute an event when the next button is used', () => {
				editor.setData( '<p>AAA</p>' );
				toggleDialog();

				findInput.fieldView.value = 'A';
				findButton.fire( 'execute' );

				const spy = vi.fn();

				view.on( 'findNext', spy );

				findNextButton.fire( 'execute' );
				expect( spy ).toHaveBeenCalledTimes( 1 );
			} );

			it( 'should execute an event when the previous button is used', () => {
				editor.setData( '<p>AAA</p>' );
				toggleDialog();

				findInput.fieldView.value = 'A';
				findButton.fire( 'execute' );

				const spy = vi.fn();

				view.on( 'findPrevious', spy );

				findPrevButton.fire( 'execute' );
				expect( spy ).toHaveBeenCalledTimes( 1 );
			} );

			it( 'should navigate forward using the next button (counter)', () => {
				editor.setData( '<p>AAA</p>' );
				toggleDialog();

				findInput.fieldView.value = 'A';

				findButton.fire( 'execute' );
				expect( matchCounterElement.textContent ).toBe( '1 of 3' );

				findNextButton.fire( 'execute' );
				expect( matchCounterElement.textContent ).toBe( '2 of 3' );

				findNextButton.fire( 'execute' );
				expect( matchCounterElement.textContent ).toBe( '3 of 3' );

				findNextButton.fire( 'execute' );
				expect( matchCounterElement.textContent ).toBe( '1 of 3' );
			} );

			it( 'should navigate backward using the previous button (counter)', () => {
				editor.setData( '<p>AAA</p>' );
				toggleDialog();

				findInput.fieldView.value = 'A';

				findButton.fire( 'execute' );
				expect( matchCounterElement.textContent ).toBe( '1 of 3' );

				findPrevButton.fire( 'execute' );
				expect( matchCounterElement.textContent ).toBe( '3 of 3' );

				findPrevButton.fire( 'execute' );
				expect( matchCounterElement.textContent ).toBe( '2 of 3' );

				findPrevButton.fire( 'execute' );
				expect( matchCounterElement.textContent ).toBe( '1 of 3' );
			} );

			it.skip( 'should adjust the right padding of the find input depending on the changing size of the counter (LTR editor)', () => {
				editor.setData( `<p>${ new Array( 20 ).join( 'A' ) }</p>` );
				toggleDialog();

				findInput.fieldView.value = 'A';

				expect( findInput.fieldView.element.style.paddingRight ).toBe( '' );

				findButton.fire( 'execute' );

				const paddingBefore = parseInt( window.getComputedStyle( findInput.fieldView.element ).paddingRight );

				expect( matchCounterElement.textContent ).toBe( '1 of 19' );
				expect( findInput.fieldView.element.style.paddingRight )
					.toMatch( /^calc\( 2 \* var\(--ck-spacing-standard\) \+ [\d.]+px \)$/ );

				findPrevButton.fire( 'execute' );

				const paddingAfter = parseInt( window.getComputedStyle( findInput.fieldView.element ).paddingRight );

				expect( matchCounterElement.textContent ).toBe( '19 of 19' );
				expect( findInput.fieldView.element.style.paddingRight )
					.toMatch( /^calc\( 2 \* var\(--ck-spacing-standard\) \+ [\d.]+px \)$/ );

				// "1 of 19" consumes less horizontal space than "19 of 19"
				expect( paddingBefore ).toBeLessThan( paddingAfter );
			} );

			it.skip( 'should adjust the right padding of the find input depending on the changing size of the counter (RTL editor)', () => {
				editor.locale.uiLanguageDirection = 'rtl';

				editor.setData( `<p>${ new Array( 20 ).join( 'A' ) }</p>` );
				toggleDialog();

				findInput.fieldView.value = 'A';

				expect( findInput.fieldView.element.style.paddingLeft ).toBe( '' );

				findButton.fire( 'execute' );

				const paddingBefore = parseInt( window.getComputedStyle( findInput.fieldView.element ).paddingLeft );

				expect( matchCounterElement.textContent ).toBe( '1 of 19' );
				expect( findInput.fieldView.element.style.paddingLeft )
					.toMatch( /^calc\( 2 \* var\(--ck-spacing-standard\) \+ [\d.]+px \)$/ );

				findPrevButton.fire( 'execute' );

				const paddingAfter = parseInt( window.getComputedStyle( findInput.fieldView.element ).paddingLeft );

				expect( matchCounterElement.textContent ).toBe( '19 of 19' );
				expect( findInput.fieldView.element.style.paddingLeft )
					.toMatch( /^calc\( 2 \* var\(--ck-spacing-standard\) \+ [\d.]+px \)$/ );

				// "1 of 19" consumes less horizontal space than "19 of 19"
				expect( paddingBefore ).toBeLessThan( paddingAfter );
			} );

			it.skip( 'should adjust the right padding of the find input depending on the presence of the counter', () => {
				editor.setData( `<p>${ new Array( 20 ).join( 'A' ) }</p>` );
				toggleDialog();

				findInput.fieldView.value = 'A';

				expect( findInput.fieldView.element.style.paddingRight ).toBe( '' );

				findButton.fire( 'execute' );

				expect( matchCounterElement.textContent ).toBe( '1 of 19' );
				expect( findInput.fieldView.element.style.paddingRight ).toMatch( /^calc/ );

				findInput.fieldView.value = 'AA';
				findInput.fieldView.fire( 'input' );

				expect( findInput.fieldView.element.style.paddingRight ).toBe( '' );

				findButton.fire( 'execute' );

				expect( matchCounterElement.textContent ).toBe( '1 of 9' );
				expect( findInput.fieldView.element.style.paddingRight ).toMatch( /^calc/ );
			} );
		} );

		describe( 'using the replace UI', () => {
			it( 'should bind "replace" button #isEnabled to the "replace" command', () => {
				editor.setData( '<p>AAA</p>' );
				toggleDialog();

				findInput.fieldView.value = 'A';
				findButton.fire( 'execute' );

				const command = editor.commands.get( 'replace' );

				command.isEnabled = false;
				expect( replaceButton.isEnabled ).toBe( false );

				command.isEnabled = true;
				expect( replaceButton.isEnabled ).toBe( true );
			} );

			it( 'should bind "replace all" button #isEnabled to the "replaceAll" command', () => {
				editor.setData( '<p>AAA</p>' );
				toggleDialog();

				findInput.fieldView.value = 'A';
				findButton.fire( 'execute' );

				const command = editor.commands.get( 'replaceAll' );

				command.isEnabled = false;
				expect( replaceAllButton.isEnabled ).toBe( false );

				command.isEnabled = true;
				expect( replaceAllButton.isEnabled ).toBe( true );
			} );

			it( 'should bind replace input #isEnabled to the "replace" command', () => {
				editor.setData( '<p>AAA</p>' );
				toggleDialog();

				findInput.fieldView.value = 'A';
				findButton.fire( 'execute' );

				const command = editor.commands.get( 'replace' );

				command.isEnabled = false;
				expect( replaceInput.isEnabled ).toBe( false );

				command.isEnabled = true;
				expect( replaceInput.isEnabled ).toBe( true );
			} );

			it( 'should display a tip when the replace field is disabled but not focused', () => {
				toggleDialog();

				expect( replaceInput.isEnabled ).toBe( false );
				expect( replaceInput.infoText ).toBe( '' );
			} );

			it( 'should display a tip when the replace field is disabled and focused', () => {
				toggleDialog();

				// Note: replaceInput.focus() will not work if the browser window is not focused.
				replaceInput.isFocused = true;

				expect( replaceInput.isEnabled ).toBe( false );
				expect( replaceInput.infoText ).toMatch( /^Tip: Find some text/ );
			} );

			it( 'should fire an event when the "replace" button is hit', () => {
				editor.setData( '<p>AAA</p>' );
				toggleDialog();

				findInput.fieldView.value = 'A';
				findButton.fire( 'execute' );

				const spy = vi.fn();

				view.on( 'replace', spy );

				replaceButton.fire( 'execute' );
				expect( spy ).toHaveBeenCalledTimes( 1 );
			} );

			it( 'should fire an event when the "replace all" button is hit', () => {
				editor.setData( '<p>AAA</p>' );
				toggleDialog();

				findInput.fieldView.value = 'A';
				findButton.fire( 'execute' );

				const spy = vi.fn();

				view.on( 'replaceAll', spy );

				replaceAllButton.fire( 'execute' );
				expect( spy ).toHaveBeenCalledTimes( 1 );
			} );

			it( 'should replace an occurence when the "replace" button is hit', () => {
				editor.setData( '<p>AAA</p>' );
				toggleDialog();

				findInput.fieldView.value = 'A';
				findButton.fire( 'execute' );
				findNextButton.fire( 'execute' );

				expect( matchCounterElement.textContent ).toBe( '2 of 3' );

				replaceButton.fire( 'execute' );
				expect( matchCounterElement.textContent ).toBe( '2 of 2' );

				replaceButton.fire( 'execute' );
				expect( matchCounterElement.textContent ).toBe( '1 of 1' );

				replaceButton.fire( 'execute' );
				expect( matchCounterElement.textContent ).toBe( '0 of 0' );
			} );

			it( 'should replace all occurences when the "replace all" button is hit', () => {
				editor.setData( '<p>AAA</p>' );
				toggleDialog();

				findInput.fieldView.value = 'A';
				findButton.fire( 'execute' );

				expect( matchCounterElement.textContent ).toBe( '1 of 3' );

				findNextButton.fire( 'execute' );

				expect( matchCounterElement.textContent ).toBe( '2 of 3' );

				replaceAllButton.fire( 'execute' );
				expect( matchCounterElement.textContent ).toBe( '0 of 0' );
			} );

			it( 'should focus the find input when "replace all" button is hit', () => {
				editor.setData( '<p>AAA</p>' );

				findInput.fieldView.value = 'A';
				findButton.fire( 'execute' );
				findNextButton.fire( 'execute' );

				const spy = vi.spyOn( findInput, 'focus' );

				// Make sure the input is not focused. Otherwise it won't be focused again
				// and the test will fail.
				view._focusTracker.isFocused = false;
				view._focusTracker.focusedElement = undefined;
				replaceAllButton.fire( 'execute' );

				expect( spy ).toHaveBeenCalledTimes( 1 );
			} );

			it( 'replace items and using undo should set proper hits counter value', () => {
				editor.setData( '<p>Test Test Test</p><p>Test</p>' );
				toggleDialog();

				findInput.fieldView.value = 'Test';
				findButton.fire( 'execute' );

				expect( matchCounterElement.textContent ).toBe( '1 of 4' );

				replaceButton.fire( 'execute' );
				expect( matchCounterElement.textContent ).toBe( '1 of 3' );

				replaceButton.fire( 'execute' );
				expect( matchCounterElement.textContent ).toBe( '1 of 2' );

				replaceButton.fire( 'execute' );
				expect( matchCounterElement.textContent ).toBe( '1 of 1' );

				editor.execute( 'undo' );
				expect( matchCounterElement.textContent ).toBe( '2 of 2' );

				editor.execute( 'undo' );
				expect( matchCounterElement.textContent ).toBe( '3 of 3' );

				editor.execute( 'undo' );
				expect( matchCounterElement.textContent ).toBe( '4 of 4' );
			} );

			it( 'should keep highlighted offset after replacement', () => {
				editor.setData(
					`<p>
						Chocolate <span style="color:#fff700;">cake</span> bar ice cream topping marzipan.
						Powder gingerbread bear claw tootsie roll lollipop marzipan icing bonbon.
					</p>
					<p>
						Chupa chups jelly beans halvah ice cream gingerbread bears candy halvah gummi bears.
						cAke dragée dessert chocolate.
					</p>
					<p>
						Sime text with text highlight: <mark class="marker-green">Chocolate</mark> bonbon
						<mark class="marker-yellow">Chocolate</mark> ice cream <mark class="marker-blue">Chocolate</mark>
						gummies <mark class="pen-green">Chocolate</mark> tootsie roll
					</p>`
				);

				toggleDialog();

				// Let's skip the first found item.
				findInput.fieldView.value = 'Choco';
				findButton.fire( 'execute' );
				findNextButton.fire( 'execute' );

				// Replace second and third one.
				view._replaceInputView.fieldView.value = '###';

				replaceButton.fire( 'execute' );
				replaceButton.fire( 'execute' );

				// And there check if the highlight is still in the right place.
				replaceButton.fire( 'execute' );

				expect( editor.getData() ).toBe(
					'<p>Chocolate cake bar ice cream topping marzipan. Powder gingerbread bear claw tootsie roll' +
					' lollipop marzipan icing bonbon.</p><p>Chupa chups jelly beans halvah ice cream gingerbread ' +
					'bears candy halvah gummi bears. cAke dragée dessert ###late.</p><p>Sime text with text highlight: ' +
					'###late bonbon ###late ice cream Chocolate gummies Chocolate tootsie roll</p>'
				);
			} );
		} );

		describe( 'dirty state of the form', () => {
			it( 'hitting "Find" and finding results should make the form clean', () => {
				editor.setData( '<p>AAA</p>' );
				toggleDialog();

				findInput.fieldView.value = 'A';

				findButton.fire( 'execute' );

				expect( view.isDirty ).toBe( false );
			} );

			it( 'hitting "Find" and not finding any results should make the form clean', () => {
				editor.setData( '<p>AAA</p>' );
				toggleDialog();

				findInput.fieldView.value = 'B';

				findButton.fire( 'execute' );

				expect( view.isDirty ).toBe( false );
			} );

			it( 'typing in the find input when the form is clean should make it dirty', () => {
				editor.setData( '<p>AAA</p>' );
				toggleDialog();

				findInput.fieldView.value = 'B';

				findButton.fire( 'execute' );
				expect( view.isDirty ).toBe( false );

				findInput.fieldView.value = 'C';
				findInput.fieldView.fire( 'input' );
				expect( view.isDirty ).toBe( true );
			} );

			it( 'changing the match case option when the form is clean should make it dirty', () => {
				editor.setData( '<p>AAA</p>' );
				toggleDialog();

				findInput.fieldView.value = 'B';

				findButton.fire( 'execute' );
				expect( view.isDirty ).toBe( false );

				matchCaseSwitch.fire( 'execute' );
				expect( view.isDirty ).toBe( true );
			} );

			it( 'changing the whole words only option when the form is clean should make it dirty', () => {
				editor.setData( '<p>AAA</p>' );
				toggleDialog();

				findInput.fieldView.value = 'B';

				findButton.fire( 'execute' );
				expect( view.isDirty ).toBe( false );

				wholeWordsOnlySwitch.fire( 'execute' );
				expect( view.isDirty ).toBe( true );
			} );
		} );
	} );

	function wait( time ) {
		return new Promise( res => {
			window.setTimeout( res, time );
		} );
	}
} );
