/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document, Event */

import {
	View,
	FormHeaderView,
	LabeledFieldView,
	ButtonView,
	ListView,
	ViewCollection,
	FocusCycler
} from '@ckeditor/ckeditor5-ui';

// Non-DLL.
import DropdownView from '@ckeditor/ckeditor5-ui/src/dropdown/dropdownview';

import {
	KeystrokeHandler,
	FocusTracker,
	keyCodes
} from '@ckeditor/ckeditor5-utils';

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import BoldEditing from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting';

import FindAndReplace from '../../src/findandreplace';
import FindAndReplaceFormView from '../../src/ui/findandreplaceformview';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import previousArrow from '@ckeditor/ckeditor5-ui/theme/icons/previous-arrow.svg';
import { icons } from 'ckeditor5/src/core';

describe( 'FindAndReplaceFormView', () => {
	let view;

	testUtils.createSinonSandbox();

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
				expect( view.matchCount ).to.equal( 0 );
			} );

			it( 'should set #highlightOffset', () => {
				expect( view.highlightOffset ).to.equal( 0 );
			} );

			it( 'should set #isDirty', () => {
				expect( view.isDirty ).to.be.false;
			} );

			it( 'should set #_areCommandsEnabled', () => {
				expect( view._areCommandsEnabled ).to.deep.equal( {} );
			} );

			it( 'should set #_resultsCounterText', () => {
				expect( view._resultsCounterText ).to.equal( '%0 of %1' );
			} );

			it( 'should set #_matchCase', () => {
				expect( view._matchCase ).to.be.false;
			} );

			it( 'should set #_wholeWordsOnly', () => {
				expect( view._wholeWordsOnly ).to.be.false;
			} );

			it( 'should set #_searchResultsFound', () => {
				expect( view._searchResultsFound ).to.be.false;
			} );
		} );

		describe( 'template', () => {
			it( 'should create element from template', () => {
				expect( view.element.tagName ).to.equal( 'FORM' );
				expect( view.element.classList.contains( 'ck' ) ).to.true;
				expect( view.element.classList.contains( 'ck-find-and-replace-form' ) ).to.be.true;
				expect( view.element.getAttribute( 'tabindex' ) ).to.equal( '-1' );
			} );

			it( 'should have a header', () => {
				expect( view.template.children[ 0 ] ).to.be.instanceOf( FormHeaderView );
				expect( view.template.children[ 0 ].label ).to.equal( 'Find and replace' );
			} );

			it( 'should have find and replace fieldsets', () => {
				expect( view.template.children[ 1 ] ).to.equal( view._findFieldsetView );
				expect( view.template.children[ 2 ] ).to.equal( view._replaceFieldsetView );
			} );

			describe( 'find fieldset', () => {
				it( 'should have an element created from template', () => {
					expect( view._findFieldsetView.element.tagName ).to.equal( 'FIELDSET' );
					expect( view._findFieldsetView.element.classList.contains( 'ck' ) ).to.true;
					expect( view._findFieldsetView.element.classList.contains( 'ck-find-and-replace-form__find' ) ).to.be.true;
				} );

				it( 'should have children', () => {
					expect( view._findFieldsetView.template.children[ 0 ] ).to.equal( view._findInputView );
					expect( view._findFieldsetView.template.children[ 1 ] ).to.equal( view._findButtonView );
					expect( view._findFieldsetView.template.children[ 2 ] ).to.equal( view._findPrevButtonView );
					expect( view._findFieldsetView.template.children[ 3 ] ).to.equal( view._findNextButtonView );
				} );

				describe( 'find input view', () => {
					it( 'should have a label', () => {
						expect( view._findInputView.label ).to.match( /^Find in text/ );
					} );

					it( 'should have a match counter', () => {
						const counterElement = view._findInputView.element.firstChild.childNodes[ 2 ];

						expect( counterElement.classList.contains( 'ck' ) ).to.be.true;
						expect( counterElement.classList.contains( 'ck-results-counter' ) ).to.be.true;
						expect( counterElement.textContent ).to.equal( '%0 of %1' );
					} );
				} );

				describe( 'find button view', () => {
					it( 'should have a label', () => {
						expect( view._findButtonView.label ).to.equal( 'Find' );
					} );

					it( 'should have a class', () => {
						expect( view._findButtonView.class ).to.equal( 'ck-button-find ck-button-action' );
					} );

					it( 'should have a text', () => {
						expect( view._findButtonView.withText ).to.be.true;
					} );
				} );

				describe( 'find previous button view', () => {
					it( 'should have a label', () => {
						expect( view._findPrevButtonView.label ).to.equal( 'Previous result' );
					} );

					it( 'should have a class', () => {
						expect( view._findPrevButtonView.class ).to.equal( 'ck-button-prev' );
					} );

					it( 'should have a keystroke', () => {
						expect( view._findPrevButtonView.keystroke ).to.equal( 'Shift+F3' );
					} );

					it( 'should have an icon', () => {
						expect( view._findPrevButtonView.icon ).to.equal( previousArrow );
					} );

					it( 'should have a tooltip', () => {
						expect( view._findPrevButtonView.tooltip ).to.be.true;
					} );
				} );

				describe( 'find next button view', () => {
					it( 'should have a label', () => {
						expect( view._findNextButtonView.label ).to.equal( 'Next result' );
					} );

					it( 'should have a class', () => {
						expect( view._findNextButtonView.class ).to.equal( 'ck-button-next' );
					} );

					it( 'should have a keystroke', () => {
						expect( view._findNextButtonView.keystroke ).to.equal( 'F3' );
					} );

					it( 'should have an icon', () => {
						expect( view._findNextButtonView.icon ).to.equal( previousArrow );
					} );

					it( 'should have a tooltip', () => {
						expect( view._findNextButtonView.tooltip ).to.be.true;
					} );
				} );
			} );

			describe( 'replace fieldset', () => {
				it( 'should have an element created from template', () => {
					expect( view._replaceFieldsetView.element.tagName ).to.equal( 'FIELDSET' );
					expect( view._replaceFieldsetView.element.classList.contains( 'ck' ) ).to.true;
					expect( view._replaceFieldsetView.element.classList.contains( 'ck-find-and-replace-form__replace' ) ).to.be.true;
				} );

				it( 'should have children', () => {
					expect( view._replaceFieldsetView.template.children[ 0 ] ).to.equal( view._replaceInputView );
					expect( view._replaceFieldsetView.template.children[ 1 ] ).to.equal( view._optionsDropdown );
					expect( view._replaceFieldsetView.template.children[ 2 ] ).to.equal( view._replaceButtonView );
					expect( view._replaceFieldsetView.template.children[ 3 ] ).to.equal( view._replaceAllButtonView );
				} );

				describe( 'replace input view', () => {
					it( 'should have a label', () => {
						expect( view._replaceInputView.label ).to.match( /^Replace with/ );
					} );
				} );

				describe( 'options dropdown', () => {
					beforeEach( () => {
						// Trigger lazy init.
						view._optionsDropdown.isOpen = true;
						view._optionsDropdown.isOpen = false;
					} );

					it( 'should be a dropdown', () => {
						expect( view._optionsDropdown ).to.be.instanceOf( DropdownView );
						expect( view._optionsDropdown.class ).to.equal( 'ck-options-dropdown' );
						expect( view._optionsDropdown.class ).to.equal( 'ck-options-dropdown' );

						expect( view._optionsDropdown.buttonView.withText ).to.equal( false );
						expect( view._optionsDropdown.buttonView.label ).to.equal( 'Show options' );
						expect( view._optionsDropdown.buttonView.icon ).to.equal( icons.cog );
						expect( view._optionsDropdown.buttonView.tooltip ).to.equal( true );
					} );

					it( 'should have a list', () => {
						expect( view._optionsDropdown.panelView.children.get( 0 ) ).to.be.instanceOf( ListView );
					} );

					it( 'should have a "match case" switch', () => {
						const listView = view._optionsDropdown.panelView.children.get( 0 );
						const listItemView = listView.items.get( 0 );
						const switchView = listItemView.children.get( 0 );

						expect( switchView.label ).to.equal( 'Match case' );
						expect( switchView.withText ).to.be.true;
					} );

					it( 'should have a "whole words only" switch', () => {
						const listView = view._optionsDropdown.panelView.children.get( 0 );
						const listItemView = listView.items.get( 1 );
						const switchView = listItemView.children.get( 0 );

						expect( switchView.label ).to.equal( 'Whole words only' );
						expect( switchView.withText ).to.be.true;
					} );

					it( 'should bind switch states to form properties', () => {
						const listView = view._optionsDropdown.panelView.children.get( 0 );
						const matchCaseSwitchView = listView.items.get( 0 ).children.get( 0 );
						const wholeWordsSwitchView = listView.items.get( 1 ).children.get( 0 );

						view._matchCase = view._wholeWordsOnly = false;

						expect( matchCaseSwitchView.isOn ).to.be.false;
						expect( wholeWordsSwitchView.isOn ).to.be.false;

						view._matchCase = true;

						expect( matchCaseSwitchView.isOn ).to.be.true;
						expect( wholeWordsSwitchView.isOn ).to.be.false;

						view._wholeWordsOnly = true;

						expect( matchCaseSwitchView.isOn ).to.be.true;
						expect( wholeWordsSwitchView.isOn ).to.be.true;
					} );

					it( 'should update form properties when switches are toggled', () => {
						const listView = view._optionsDropdown.panelView.children.get( 0 );
						const matchCaseSwitchView = listView.items.get( 0 ).children.get( 0 );
						const wholeWordsSwitchView = listView.items.get( 1 ).children.get( 0 );

						view._matchCase = view._wholeWordsOnly = false;

						matchCaseSwitchView.fire( 'execute' );

						expect( view._matchCase ).to.be.true;
						expect( view._wholeWordsOnly ).to.be.false;

						matchCaseSwitchView.fire( 'execute' );

						expect( view._matchCase ).to.be.false;
						expect( view._wholeWordsOnly ).to.be.false;

						wholeWordsSwitchView.fire( 'execute' );

						expect( view._matchCase ).to.be.false;
						expect( view._wholeWordsOnly ).to.be.true;

						wholeWordsSwitchView.fire( 'execute' );

						expect( view._matchCase ).to.be.false;
						expect( view._wholeWordsOnly ).to.be.false;
					} );
				} );

				describe( 'replace button view', () => {
					it( 'should have a label', () => {
						expect( view._replaceButtonView.label ).to.equal( 'Replace' );
					} );

					it( 'should have a class', () => {
						expect( view._replaceButtonView.class ).to.equal( 'ck-button-replace' );
					} );

					it( 'should be with text', () => {
						expect( view._replaceButtonView.withText ).to.be.true;
					} );
				} );

				describe( 'replace all button view', () => {
					it( 'should have a label', () => {
						expect( view._replaceAllButtonView.label ).to.equal( 'Replace all' );
					} );

					it( 'should have a class', () => {
						expect( view._replaceAllButtonView.class ).to.equal( 'ck-button-replaceall' );
					} );

					it( 'should be with text', () => {
						expect( view._replaceAllButtonView.withText ).to.be.true;
					} );
				} );
			} );

			it( 'should create child views', () => {
				expect( view._findPrevButtonView ).to.be.instanceOf( ButtonView );
				expect( view._findNextButtonView ).to.be.instanceOf( ButtonView );
				expect( view._replaceButtonView ).to.be.instanceOf( ButtonView );
				expect( view._replaceAllButtonView ).to.be.instanceOf( ButtonView );
				expect( view._findInputView ).to.be.instanceOf( LabeledFieldView );
				expect( view._replaceInputView ).to.be.instanceOf( LabeledFieldView );
				expect( view._findFieldsetView ).to.be.instanceOf( View );
				expect( view._replaceFieldsetView ).to.be.instanceOf( View );
				expect( view._optionsDropdown ).to.be.instanceOf( DropdownView );
			} );
		} );

		it( 'should create #focusTracker instance', () => {
			expect( view._focusTracker ).to.be.instanceOf( FocusTracker );
		} );

		it( 'should create #keystrokes instance', () => {
			expect( view._keystrokes ).to.be.instanceOf( KeystrokeHandler );
		} );

		it( 'should create #_focusCycler instance', () => {
			expect( view._focusCycler ).to.be.instanceOf( FocusCycler );
		} );

		it( 'should create #_focusables view collection', () => {
			expect( view._focusables ).to.be.instanceOf( ViewCollection );
		} );
	} );

	describe( 'render()', () => {
		describe( 'DOM submit event', () => {
			it( 'should be handled and delegated', () => {
				const spy = sinon.spy();

				view.on( 'submit', spy );

				view.element.dispatchEvent( new Event( 'submit' ) );

				expect( spy.calledOnce ).to.true;
			} );
		} );

		describe( 'focus cycling, tracking and keyboard support', () => {
			it( 'should register child views in #_focusables', () => {
				expect( view._focusables.map( f => f ) ).to.have.members( [
					view._findInputView,
					view._findButtonView,
					view._findPrevButtonView,
					view._findNextButtonView,
					view._replaceInputView,
					view._optionsDropdown,
					view._replaceButtonView,
					view._replaceAllButtonView
				] );
			} );

			it( 'should register child views\' #element in #focusTracker', () => {
				const view = new FindAndReplaceFormView( { t: val => val } );

				const spy = testUtils.sinon.spy( view._focusTracker, 'add' );

				view.render();

				sinon.assert.calledWithExactly( spy.getCall( 0 ), view._findInputView.element );
				sinon.assert.calledWithExactly( spy.getCall( 1 ), view._findButtonView.element );
				sinon.assert.calledWithExactly( spy.getCall( 2 ), view._findPrevButtonView.element );
				sinon.assert.calledWithExactly( spy.getCall( 3 ), view._findNextButtonView.element );
				sinon.assert.calledWithExactly( spy.getCall( 4 ), view._replaceInputView.element );
				sinon.assert.calledWithExactly( spy.getCall( 5 ), view._optionsDropdown.element );
				sinon.assert.calledWithExactly( spy.getCall( 6 ), view._replaceButtonView.element );
				sinon.assert.calledWithExactly( spy.getCall( 7 ), view._replaceAllButtonView.element );

				view.destroy();
			} );

			it( 'starts listening for #keystrokes coming from #element', () => {
				const view = new FindAndReplaceFormView( { t: val => val } );

				const spy = sinon.spy( view._keystrokes, 'listenTo' );

				view.render();
				sinon.assert.calledOnce( spy );
				sinon.assert.calledWithExactly( spy, view.element );

				view.destroy();
			} );

			describe( 'activates keyboard navigation in the form', () => {
				it( 'so "tab" focuses the next focusable item', () => {
					const keyEvtData = {
						keyCode: keyCodes.tab,
						preventDefault: sinon.spy(),
						stopPropagation: sinon.spy()
					};

					// Mock the url input is focused.
					view._focusTracker.isFocused = true;
					view._focusTracker.focusedElement = view._findNextButtonView.element;

					const spy = sinon.spy( view._replaceInputView, 'focus' );

					view._keystrokes.press( keyEvtData );
					sinon.assert.calledOnce( keyEvtData.preventDefault );
					sinon.assert.calledOnce( keyEvtData.stopPropagation );
					sinon.assert.calledOnce( spy );
				} );

				it( 'so "shift + tab" focuses the previous focusable item', () => {
					const keyEvtData = {
						keyCode: keyCodes.tab,
						shiftKey: true,
						preventDefault: sinon.spy(),
						stopPropagation: sinon.spy()
					};

					// Mock the cancel button is focused.
					view._focusTracker.isFocused = true;
					view._focusTracker.focusedElement = view._findNextButtonView.element;

					const spy = sinon.spy( view._findPrevButtonView, 'focus' );

					view._keystrokes.press( keyEvtData );
					sinon.assert.calledOnce( keyEvtData.preventDefault );
					sinon.assert.calledOnce( keyEvtData.stopPropagation );
					sinon.assert.calledOnce( spy );
				} );
			} );

			it( 'intercepts the arrow* events and overrides the default (parent) toolbar behavior', () => {
				const keyEvtData = {
					stopPropagation: sinon.spy()
				};

				keyEvtData.keyCode = keyCodes.arrowdown;
				view._keystrokes.press( keyEvtData );
				sinon.assert.calledOnce( keyEvtData.stopPropagation );

				keyEvtData.keyCode = keyCodes.arrowup;
				view._keystrokes.press( keyEvtData );
				sinon.assert.calledTwice( keyEvtData.stopPropagation );

				keyEvtData.keyCode = keyCodes.arrowleft;
				view._keystrokes.press( keyEvtData );
				sinon.assert.calledThrice( keyEvtData.stopPropagation );

				keyEvtData.keyCode = keyCodes.arrowright;
				view._keystrokes.press( keyEvtData );
				sinon.assert.callCount( keyEvtData.stopPropagation, 4 );
			} );

			it( 'intercepts the "selectstart" in the #findInputView with the high priority to unlock select all', () => {
				const spy = sinon.spy();
				const event = new Event( 'selectstart', {
					bubbles: true,
					cancelable: true
				} );

				event.stopPropagation = spy;

				view._findInputView.element.dispatchEvent( event );
				sinon.assert.calledOnce( spy );
			} );

			it( 'intercepts the "selectstart" in the #replaceInputView with the high priority to unlock select all', () => {
				const spy = sinon.spy();
				const event = new Event( 'selectstart', {
					bubbles: true,
					cancelable: true
				} );

				event.stopPropagation = spy;

				view._replaceInputView.element.dispatchEvent( event );
				sinon.assert.calledOnce( spy );
			} );

			it( 'handles F3 keystroke and extecutes find next', () => {
				const keyEvtData = {
					keyCode: keyCodes.f3,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				const spy = sinon.spy( view._findNextButtonView, 'fire' );

				view._keystrokes.press( keyEvtData );

				sinon.assert.calledOnce( keyEvtData.preventDefault );
				sinon.assert.calledOnce( keyEvtData.stopPropagation );

				sinon.assert.calledOnce( spy );
				sinon.assert.calledOnceWithExactly( spy, 'execute' );
			} );

			it( 'handles Shift+F3 keystroke and executes find previous', () => {
				const keyEvtData = {
					keyCode: keyCodes.f3,
					shiftKey: true,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				const spy = sinon.spy( view._findPrevButtonView, 'fire' );

				view._keystrokes.press( keyEvtData );

				sinon.assert.calledOnce( keyEvtData.preventDefault );
				sinon.assert.calledOnce( keyEvtData.stopPropagation );

				sinon.assert.calledOnce( spy );
				sinon.assert.calledOnceWithExactly( spy, 'execute' );
			} );

			it( 'handles "enter" when pressed in the find input and performs a search', () => {
				const keyEvtData = {
					keyCode: keyCodes.enter,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy(),
					target: view._findInputView.fieldView.element
				};

				const spy = sinon.spy( view._findButtonView, 'fire' );

				view._keystrokes.press( keyEvtData );

				sinon.assert.calledOnce( keyEvtData.preventDefault );
				sinon.assert.calledOnce( keyEvtData.stopPropagation );

				sinon.assert.calledOnce( spy );
				sinon.assert.calledOnceWithExactly( spy, 'execute' );
			} );

			it( 'handles "enter" when pressed in the find input and goes to the next result', () => {
				const keyEvtData = {
					keyCode: keyCodes.enter,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy(),
					target: view._findInputView.fieldView.element
				};

				view._areCommandsEnabled = { findNext: true };

				const spy = sinon.spy( view._findNextButtonView, 'fire' );

				view._keystrokes.press( keyEvtData );

				sinon.assert.calledOnce( keyEvtData.preventDefault );
				sinon.assert.calledOnce( keyEvtData.stopPropagation );

				sinon.assert.calledOnce( spy );
				sinon.assert.calledOnceWithExactly( spy, 'execute' );
			} );

			it( 'handles "shift+enter" when pressed in the find input and performs a search', () => {
				const keyEvtData = {
					keyCode: keyCodes.enter,
					shiftKey: true,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy(),
					target: view._findInputView.fieldView.element
				};

				const spy = sinon.spy( view._findButtonView, 'fire' );

				view._keystrokes.press( keyEvtData );

				sinon.assert.calledOnce( keyEvtData.preventDefault );
				sinon.assert.calledOnce( keyEvtData.stopPropagation );

				sinon.assert.calledOnce( spy );
				sinon.assert.calledOnceWithExactly( spy, 'execute' );
			} );

			it( 'handles "shift+enter" when pressed in the find input and goes to the previous result', () => {
				const keyEvtData = {
					keyCode: keyCodes.enter,
					shiftKey: true,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy(),
					target: view._findInputView.fieldView.element
				};

				view._areCommandsEnabled = { findPrevious: true };

				const spy = sinon.spy( view._findPrevButtonView, 'fire' );

				view._keystrokes.press( keyEvtData );

				sinon.assert.calledOnce( keyEvtData.preventDefault );
				sinon.assert.calledOnce( keyEvtData.stopPropagation );

				sinon.assert.calledOnce( spy );
				sinon.assert.calledOnceWithExactly( spy, 'execute' );
			} );

			it( 'handles "enter" when pressed in the replace input and performs a replacement', () => {
				const keyEvtData = {
					keyCode: keyCodes.enter,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy(),
					target: view._replaceInputView.fieldView.element
				};

				const spy = sinon.spy( view._replaceButtonView, 'fire' );

				view._keystrokes.press( keyEvtData );

				sinon.assert.calledOnce( keyEvtData.preventDefault );
				sinon.assert.calledOnce( keyEvtData.stopPropagation );

				sinon.assert.calledOnce( spy );
				sinon.assert.calledOnceWithExactly( spy, 'execute' );
			} );

			it( 'ignores "enter" when pressed somewhere else', () => {
				const keyEvtData = {
					keyCode: keyCodes.enter,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				const spy = sinon.spy( view._replaceButtonView, 'fire' );

				view._keystrokes.press( keyEvtData );

				sinon.assert.notCalled( keyEvtData.preventDefault );
				sinon.assert.notCalled( keyEvtData.stopPropagation );
				sinon.assert.notCalled( spy );
			} );

			it( 'skips command execution on "enter" when search phrase input is dirty', () => {
				const keyEvtData = {
					keyCode: keyCodes.enter,
					target: view._replaceInputView.fieldView.element
				};

				const spy = sinon.spy( view._replaceButtonView, 'fire' );

				view.isDirty = true;
				view._keystrokes.press( keyEvtData );

				sinon.assert.notCalled( spy );
			} );

			it( 'ignores "shift+enter" when pressed somewhere else', () => {
				const keyEvtData = {
					keyCode: keyCodes.enter,
					shiftKey: true,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				const spy = sinon.spy( view._replaceButtonView, 'fire' );

				view._keystrokes.press( keyEvtData );

				sinon.assert.notCalled( keyEvtData.preventDefault );
				sinon.assert.notCalled( keyEvtData.stopPropagation );
				sinon.assert.notCalled( spy );
			} );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should destroy the FocusTracker instance', () => {
			const destroySpy = sinon.spy( view._focusTracker, 'destroy' );

			view.destroy();

			sinon.assert.calledOnce( destroySpy );
		} );

		it( 'should destroy the KeystrokeHandler instance', () => {
			const destroySpy = sinon.spy( view._keystrokes, 'destroy' );

			view.destroy();

			sinon.assert.calledOnce( destroySpy );
		} );
	} );

	describe( 'focus()', () => {
		it( 'should focus the #findInputView', () => {
			const spy = sinon.spy( view._findInputView, 'focus' );

			view.focus();

			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'reset()', () => {
		it( 'should reset the form', () => {
			view._findInputView.errorText = 'foo';
			view.isDirty = false;

			view.reset();

			expect( view._findInputView.errorText ).to.be.null;
			expect( view.isDirty ).to.be.true;
		} );
	} );

	describe( '_textToFind()', () => {
		it( 'should return the text of the find input', () => {
			view._findInputView.fieldView.value = 'foo';

			expect( view._textToFind ).to.equal( 'foo' );
		} );
	} );

	describe( '_textToReplace()', () => {
		it( 'should return the text of the replace input', () => {
			view._replaceInputView.fieldView.value = 'foo';

			expect( view._textToReplace ).to.equal( 'foo' );
		} );
	} );

	describe( 'form state machine', () => {
		let editorElement, editor, view, dropdown;
		let findInput, replaceInput, replaceButton, replaceAllButton, findButton, findNextButton, findPrevButton;
		let matchCaseSwitch, wholeWordsOnlySwitch, matchCounterElement;

		beforeEach( async () => {
			editorElement = document.createElement( 'div' );

			document.body.appendChild( editorElement );

			editor = await ClassicEditor.create( editorElement, {
				plugins: [ Essentials, Paragraph, BoldEditing, FindAndReplace ],
				toolbar: [ 'findAndReplace' ]
			} );

			dropdown = editor.ui.view.toolbar.items
				.find( item => item.buttonView && item.buttonView.label == 'Find and replace' );

			// Trigger lazy init.
			dropdown.isOpen = true;

			view = editor.plugins.get( 'FindAndReplaceUI' ).formView;

			findInput = view._findInputView;
			matchCounterElement = findInput.element.firstChild.childNodes[ 2 ];
			replaceInput = view._replaceInputView;
			findButton = view._findButtonView;
			findNextButton = view._findNextButtonView;
			findPrevButton = view._findPrevButtonView;
			replaceButton = view._replaceButtonView;
			replaceAllButton = view._replaceAllButtonView;

			// Trigger lazy init.
			view._optionsDropdown.isOpen = true;
			view._optionsDropdown.isOpen = false;

			const optionsListView = view._optionsDropdown.panelView.children.get( 0 );

			matchCaseSwitch = optionsListView.items.get( 0 ).children.get( 0 );
			wholeWordsOnlySwitch = optionsListView.items.get( 1 ).children.get( 0 );
		} );

		afterEach( async () => {
			await editor.destroy();

			editorElement.remove();
		} );

		function openDropdown() {
			dropdown.isOpen = true;
		}

		function closeDropdown() {
			dropdown.isOpen = false;
		}

		describe( 'initial state', () => {
			beforeEach( () => {
				openDropdown();
			} );

			describe( 'properties', () => {
				it( 'sets isDirty to true', () => {
					expect( view.isDirty ).to.be.true;
				} );
			} );

			describe( 'find', () => {
				it( 'should set the find input empty and enabled', () => {
					expect( findInput.fieldView.element.value ).to.equal( '' );
					expect( findInput.isEnabled ).to.be.true;
				} );

				it( 'should hide the match counter', () => {
					expect( matchCounterElement.classList.contains( 'ck-hidden' ) ).to.be.true;
				} );

				it( 'should set the find button enabled', () => {
					expect( findButton.isEnabled ).to.be.true;
				} );

				it( 'should set the find next button disabled', () => {
					expect( findNextButton.isEnabled ).to.be.false;
				} );

				it( 'should set the find previous button disabled', () => {
					expect( findPrevButton.isEnabled ).to.be.false;
				} );
			} );

			describe( 'replace', () => {
				it( 'should set the replace input empty and disabled', () => {
					expect( replaceInput.fieldView.element.value ).to.equal( '' );
					expect( replaceInput.isEnabled ).to.be.false;
				} );

				it( 'should set the replace button disabled', () => {
					expect( replaceButton.isEnabled ).to.be.false;
				} );

				it( 'should set the replace all button disabled', () => {
					expect( replaceAllButton.isEnabled ).to.be.false;
				} );
			} );

			describe( 'options', () => {
				it( 'should set the "match case" switch off', () => {
					expect( matchCaseSwitch.isOn ).to.be.false;
				} );

				it( 'should set the "whole words only" switch off', () => {
					expect( wholeWordsOnlySwitch.isOn ).to.be.false;
				} );
			} );
		} );

		it( 'should preserve state after reopening the dropdown but reset errors and make the form dirty', () => {
			findInput.fieldView.value = 'foo';
			findInput.errorText = 'error';
			replaceInput.fieldView.value = 'bar';
			matchCaseSwitch.isOn = true;
			wholeWordsOnlySwitch.isOn = true;
			view.isDirty = false;

			closeDropdown();
			openDropdown();

			expect( view._textToFind ).to.equal( 'foo' );
			expect( findInput.errorText ).to.be.null;
			expect( view._textToReplace ).to.equal( 'bar' );
			expect( matchCaseSwitch.isOn ).to.be.true;
			expect( wholeWordsOnlySwitch.isOn ).to.be.true;
			expect( view.isDirty ).to.be.true;
		} );

		describe( 'using the "Find" button', () => {
			it( 'hitting "Find" when the find input has text should execute a #findNext event', () => {
				openDropdown();

				const spy = sinon.spy( view, 'fire' );
				findInput.fieldView.value = 'foo';

				findButton.fire( 'execute' );
				sinon.assert.calledWithExactly( spy, 'findNext', { searchText: 'foo', matchCase: false, wholeWords: false } );
			} );

			it( 'hitting "Find" when the find input is empty should show an error instead of finding things', () => {
				openDropdown();

				const spy = sinon.spy( view, 'fire' );
				findButton.fire( 'execute' );

				expect( findInput.errorText ).to.match( /^Text to find must not/ );
				sinon.assert.notCalled( spy );
			} );

			it( 'hitting "Find" with some results should enable the find previous/next navigation', () => {
				editor.setData( '<p>AAA</p>' );
				openDropdown();

				findInput.fieldView.value = 'A';

				findButton.fire( 'execute' );

				expect( findNextButton.isEnabled ).to.be.true;
				expect( findPrevButton.isEnabled ).to.be.true;
			} );

			it( 'hitting "Find" with some results should enable the replace UI', () => {
				editor.setData( '<p>AAA</p>' );
				openDropdown();

				findInput.fieldView.value = 'A';

				findButton.fire( 'execute' );

				expect( replaceInput.isEnabled ).to.be.true;
				expect( replaceButton.isEnabled ).to.be.true;
				expect( replaceAllButton.isEnabled ).to.be.true;
			} );

			it( 'hitting "Find" with some results should show the counter', () => {
				editor.setData( '<p>AAA</p>' );
				openDropdown();

				findInput.fieldView.value = 'A';

				findButton.fire( 'execute' );

				expect( matchCounterElement.textContent ).to.equal( '1 of 3' );
				expect( matchCounterElement.classList.contains( 'ck-hidden' ) ).to.be.false;
			} );

			it( 'hitting "Find" with the same results again should not change the UI', () => {
				editor.setData( '<p>AAA</p>' );
				openDropdown();

				findInput.fieldView.value = 'A';

				findButton.fire( 'execute' );
				findButton.fire( 'execute' );

				expect( matchCounterElement.textContent ).to.equal( '1 of 3' );
				expect( matchCounterElement.classList.contains( 'ck-hidden' ) ).to.be.false;
				expect( replaceInput.isEnabled ).to.be.true;
				expect( replaceButton.isEnabled ).to.be.true;
				expect( replaceAllButton.isEnabled ).to.be.true;
			} );

			it( 'hitting "Find" with no results should keep the replace UI disabled', () => {
				editor.setData( '<p>AAA</p>' );
				openDropdown();

				findInput.fieldView.value = 'B';

				findButton.fire( 'execute' );

				expect( replaceInput.isEnabled ).to.be.false;
				expect( replaceButton.isEnabled ).to.be.false;
				expect( replaceAllButton.isEnabled ).to.be.false;
			} );

			it( 'hitting "Find" when navigating forward should reset the search', () => {
				editor.setData( '<p>AAA</p>' );
				openDropdown();

				findInput.fieldView.value = 'A';

				findButton.fire( 'execute' );
				findNextButton.fire( 'execute' );
				expect( matchCounterElement.textContent ).to.equal( '2 of 3' );

				findButton.fire( 'execute' );
				expect( matchCounterElement.textContent ).to.equal( '1 of 3' );
			} );
		} );

		describe( 'find results navigation using previous/next buttons', () => {
			it( 'should bind next button #isEnabled to the "findNext" command', () => {
				const command = editor.commands.get( 'findNext' );

				command.isEnabled = false;
				expect( findNextButton.isEnabled ).to.be.false;

				command.isEnabled = true;
				expect( findNextButton.isEnabled ).to.be.true;
			} );

			it( 'should bind previous button #isEnabled to the "findPrevious" command', () => {
				const command = editor.commands.get( 'findPrevious' );

				command.isEnabled = false;
				expect( findPrevButton.isEnabled ).to.be.false;

				command.isEnabled = true;
				expect( findPrevButton.isEnabled ).to.be.true;
			} );

			it( 'should execute an event when the next button is used', () => {
				editor.setData( '<p>AAA</p>' );
				openDropdown();

				findInput.fieldView.value = 'A';
				findButton.fire( 'execute' );

				const spy = sinon.spy();

				view.on( 'findNext', spy );

				findNextButton.fire( 'execute' );
				sinon.assert.calledOnce( spy );
			} );

			it( 'should execute an event when the previous button is used', () => {
				editor.setData( '<p>AAA</p>' );
				openDropdown();

				findInput.fieldView.value = 'A';
				findButton.fire( 'execute' );

				const spy = sinon.spy();

				view.on( 'findPrevious', spy );

				findPrevButton.fire( 'execute' );
				sinon.assert.calledOnce( spy );
			} );

			it( 'should navigate forward using the next button (counter)', () => {
				editor.setData( '<p>AAA</p>' );
				openDropdown();

				findInput.fieldView.value = 'A';

				findButton.fire( 'execute' );
				expect( matchCounterElement.textContent ).to.equal( '1 of 3' );

				findNextButton.fire( 'execute' );
				expect( matchCounterElement.textContent ).to.equal( '2 of 3' );

				findNextButton.fire( 'execute' );
				expect( matchCounterElement.textContent ).to.equal( '3 of 3' );

				findNextButton.fire( 'execute' );
				expect( matchCounterElement.textContent ).to.equal( '1 of 3' );
			} );

			it( 'should navigate backward using the previous button (counter)', () => {
				editor.setData( '<p>AAA</p>' );
				openDropdown();

				findInput.fieldView.value = 'A';

				findButton.fire( 'execute' );
				expect( matchCounterElement.textContent ).to.equal( '1 of 3' );

				findPrevButton.fire( 'execute' );
				expect( matchCounterElement.textContent ).to.equal( '3 of 3' );

				findPrevButton.fire( 'execute' );
				expect( matchCounterElement.textContent ).to.equal( '2 of 3' );

				findPrevButton.fire( 'execute' );
				expect( matchCounterElement.textContent ).to.equal( '1 of 3' );
			} );

			it( 'should adjust the right padding of the find input depending on the changing size of the counter (LTR editor)', () => {
				editor.setData( `<p>${ new Array( 20 ).join( 'A' ) }</p>` );
				openDropdown();

				findInput.fieldView.value = 'A';

				expect( findInput.fieldView.element.style.paddingRight ).to.equal( '' );

				findButton.fire( 'execute' );

				const paddingBefore = parseInt( window.getComputedStyle( findInput.fieldView.element ).paddingRight );

				expect( matchCounterElement.textContent ).to.equal( '1 of 19' );
				expect( findInput.fieldView.element.style.paddingRight )
					.to.match( /^calc\( 2 \* var\(--ck-spacing-standard\) \+ [\d.]+px \)$/ );

				findPrevButton.fire( 'execute' );

				const paddingAfter = parseInt( window.getComputedStyle( findInput.fieldView.element ).paddingRight );

				expect( matchCounterElement.textContent ).to.equal( '19 of 19' );
				expect( findInput.fieldView.element.style.paddingRight )
					.to.match( /^calc\( 2 \* var\(--ck-spacing-standard\) \+ [\d.]+px \)$/ );

				// "1 of 19" consumes less horizontal space than "19 of 19"
				expect( paddingBefore ).to.be.below( paddingAfter );
			} );

			it( 'should adjust the right padding of the find input depending on the changing size of the counter (RTL editor)', () => {
				editor.locale.uiLanguageDirection = 'rtl';

				editor.setData( `<p>${ new Array( 20 ).join( 'A' ) }</p>` );
				openDropdown();

				findInput.fieldView.value = 'A';

				expect( findInput.fieldView.element.style.paddingLeft ).to.equal( '' );

				findButton.fire( 'execute' );

				const paddingBefore = parseInt( window.getComputedStyle( findInput.fieldView.element ).paddingLeft );

				expect( matchCounterElement.textContent ).to.equal( '1 of 19' );
				expect( findInput.fieldView.element.style.paddingLeft )
					.to.match( /^calc\( 2 \* var\(--ck-spacing-standard\) \+ [\d.]+px \)$/ );

				findPrevButton.fire( 'execute' );

				const paddingAfter = parseInt( window.getComputedStyle( findInput.fieldView.element ).paddingLeft );

				expect( matchCounterElement.textContent ).to.equal( '19 of 19' );
				expect( findInput.fieldView.element.style.paddingLeft )
					.to.match( /^calc\( 2 \* var\(--ck-spacing-standard\) \+ [\d.]+px \)$/ );

				// "1 of 19" consumes less horizontal space than "19 of 19"
				expect( paddingBefore ).to.be.below( paddingAfter );
			} );

			it( 'should adjust the right padding of the find input depending on the presence of the counter', () => {
				editor.setData( `<p>${ new Array( 20 ).join( 'A' ) }</p>` );
				openDropdown();

				findInput.fieldView.value = 'A';

				expect( findInput.fieldView.element.style.paddingRight ).to.equal( '' );

				findButton.fire( 'execute' );

				expect( matchCounterElement.textContent ).to.equal( '1 of 19' );
				expect( findInput.fieldView.element.style.paddingRight ).to.match( /^calc/ );

				findInput.fieldView.value = 'AA';
				findInput.fieldView.fire( 'input' );

				expect( findInput.fieldView.element.style.paddingRight ).to.equal( '' );

				findButton.fire( 'execute' );

				expect( matchCounterElement.textContent ).to.equal( '1 of 9' );
				expect( findInput.fieldView.element.style.paddingRight ).to.match( /^calc/ );
			} );
		} );

		describe( 'using the replace UI', () => {
			it( 'should bind "replace" button #isEnabled to the "replace" command', () => {
				editor.setData( '<p>AAA</p>' );
				openDropdown();

				findInput.fieldView.value = 'A';
				findButton.fire( 'execute' );

				const command = editor.commands.get( 'replace' );

				command.isEnabled = false;
				expect( replaceButton.isEnabled ).to.be.false;

				command.isEnabled = true;
				expect( replaceButton.isEnabled ).to.be.true;
			} );

			it( 'should bind "replace all" button #isEnabled to the "replaceAll" command', () => {
				editor.setData( '<p>AAA</p>' );
				openDropdown();

				findInput.fieldView.value = 'A';
				findButton.fire( 'execute' );

				const command = editor.commands.get( 'replaceAll' );

				command.isEnabled = false;
				expect( replaceAllButton.isEnabled ).to.be.false;

				command.isEnabled = true;
				expect( replaceAllButton.isEnabled ).to.be.true;
			} );

			it( 'should bind replace input #isEnabled to the "replace" command', () => {
				editor.setData( '<p>AAA</p>' );
				openDropdown();

				findInput.fieldView.value = 'A';
				findButton.fire( 'execute' );

				const command = editor.commands.get( 'replace' );

				command.isEnabled = false;
				expect( replaceInput.isEnabled ).to.be.false;

				command.isEnabled = true;
				expect( replaceInput.isEnabled ).to.be.true;
			} );

			it( 'should display a tip when the replace field is disabled but not focused', () => {
				openDropdown();

				expect( replaceInput.isEnabled ).to.be.false;
				expect( replaceInput.infoText ).to.equal( '' );
			} );

			it( 'should display a tip when the replace field is disabled and focused', () => {
				openDropdown();

				// Note: replaceInput.focus() will not work if the browser window is not focused.
				replaceInput.isFocused = true;

				expect( replaceInput.isEnabled ).to.be.false;
				expect( replaceInput.infoText ).to.match( /^Tip: Find some text/ );
			} );

			it( 'should fire an event when the "replace" button is hit', () => {
				editor.setData( '<p>AAA</p>' );
				openDropdown();

				findInput.fieldView.value = 'A';
				findButton.fire( 'execute' );

				const spy = sinon.spy();

				view.on( 'replace', spy );

				replaceButton.fire( 'execute' );
				sinon.assert.calledOnce( spy );
			} );

			it( 'should fire an event when the "replace all" button is hit', () => {
				editor.setData( '<p>AAA</p>' );
				openDropdown();

				findInput.fieldView.value = 'A';
				findButton.fire( 'execute' );

				const spy = sinon.spy();

				view.on( 'replaceAll', spy );

				replaceAllButton.fire( 'execute' );
				sinon.assert.calledOnce( spy );
			} );

			it( 'should replace an occurence when the "replace" button is hit', () => {
				editor.setData( '<p>AAA</p>' );
				openDropdown();

				findInput.fieldView.value = 'A';
				findButton.fire( 'execute' );
				findNextButton.fire( 'execute' );

				expect( matchCounterElement.textContent ).to.equal( '2 of 3' );

				replaceButton.fire( 'execute' );
				expect( matchCounterElement.textContent ).to.equal( '2 of 2' );

				replaceButton.fire( 'execute' );
				expect( matchCounterElement.textContent ).to.equal( '1 of 1' );

				replaceButton.fire( 'execute' );
				expect( matchCounterElement.textContent ).to.equal( '0 of 0' );
			} );

			it( 'should replace all occurences when the "replace all" button is hit', () => {
				editor.setData( '<p>AAA</p>' );
				openDropdown();

				findInput.fieldView.value = 'A';
				findButton.fire( 'execute' );
				findNextButton.fire( 'execute' );

				expect( matchCounterElement.textContent ).to.equal( '2 of 3' );

				replaceAllButton.fire( 'execute' );
				expect( matchCounterElement.textContent ).to.equal( '0 of 0' );
			} );

			it( 'should focus the find input when "replace all" button is hit', () => {
				editor.setData( '<p>AAA</p>' );
				openDropdown();

				findInput.fieldView.value = 'A';
				findButton.fire( 'execute' );
				findNextButton.fire( 'execute' );

				const spy = sinon.spy( findInput, 'focus' );

				replaceAllButton.fire( 'execute' );

				sinon.assert.calledOnce( spy );
			} );
		} );

		describe( 'dirty state of the form', () => {
			it( 'hitting "Find" and finding results should make the form clean', () => {
				editor.setData( '<p>AAA</p>' );
				openDropdown();

				findInput.fieldView.value = 'A';

				findButton.fire( 'execute' );

				expect( view.isDirty ).to.be.false;
			} );

			it( 'hitting "Find" and not finding any results should make the form clean', () => {
				editor.setData( '<p>AAA</p>' );
				openDropdown();

				findInput.fieldView.value = 'B';

				findButton.fire( 'execute' );

				expect( view.isDirty ).to.be.false;
			} );

			it( 'typing in the find input when the form is clean should make it dirty', () => {
				editor.setData( '<p>AAA</p>' );
				openDropdown();

				findInput.fieldView.value = 'B';

				findButton.fire( 'execute' );
				expect( view.isDirty ).to.be.false;

				findInput.fieldView.value = 'C';
				findInput.fieldView.fire( 'input' );
				expect( view.isDirty ).to.be.true;
			} );

			it( 'changing the match case option when the form is clean should make it dirty', () => {
				editor.setData( '<p>AAA</p>' );
				openDropdown();

				findInput.fieldView.value = 'B';

				findButton.fire( 'execute' );
				expect( view.isDirty ).to.be.false;

				matchCaseSwitch.fire( 'execute' );
				expect( view.isDirty ).to.be.true;
			} );

			it( 'changing the whole words only option when the form is clean should make it dirty', () => {
				editor.setData( '<p>AAA</p>' );
				openDropdown();

				findInput.fieldView.value = 'B';

				findButton.fire( 'execute' );
				expect( view.isDirty ).to.be.false;

				wholeWordsOnlySwitch.fire( 'execute' );
				expect( view.isDirty ).to.be.true;
			} );
		} );
	} );
} );
