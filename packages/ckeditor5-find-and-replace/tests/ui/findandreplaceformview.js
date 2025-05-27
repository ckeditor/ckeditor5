/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import View from '@ckeditor/ckeditor5-ui/src/view.js';
import LabeledFieldView from '@ckeditor/ckeditor5-ui/src/labeledfield/labeledfieldview.js';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview.js';
import ViewCollection from '@ckeditor/ckeditor5-ui/src/viewcollection.js';
import FocusCycler from '@ckeditor/ckeditor5-ui/src/focuscycler.js';
import CollapsibleView from '@ckeditor/ckeditor5-ui/src/collapsible/collapsibleview.js';
import SwitchButtonView from '@ckeditor/ckeditor5-ui/src/button/switchbuttonview.js';

import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler.js';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker.js';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard.js';

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import BoldEditing from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting.js';

import FindAndReplace from '../../src/findandreplace.js';
import FindAndReplaceFormView from '../../src/ui/findandreplaceformview.js';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { IconPreviousArrow } from 'ckeditor5/src/icons.js';

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

			it( 'should have input and action areas and collapsible options', () => {
				expect( view.template.children[ 0 ].get( 0 ) ).to.equal( view._inputsDivView );
				expect( view.template.children[ 0 ].get( 1 ) ).to.equal( view._advancedOptionsCollapsibleView );
				expect( view.template.children[ 0 ].get( 2 ) ).to.equal( view._actionButtonsDivView );
			} );

			describe( 'inputs area', () => {
				it( 'should have an element created from template', () => {
					expect( view._inputsDivView.element.tagName ).to.equal( 'DIV' );
					expect( view._inputsDivView.element.classList.contains( 'ck' ) ).to.true;
					expect( view._inputsDivView.element.classList.contains( 'ck-find-and-replace-form__inputs' ) ).to.be.true;
				} );

				it( 'should have children', () => {
					expect( view._inputsDivView.template.children[ 0 ] ).to.equal( view._findInputView );
					expect( view._inputsDivView.template.children[ 1 ] ).to.equal( view._findPrevButtonView );
					expect( view._inputsDivView.template.children[ 2 ] ).to.equal( view._findNextButtonView );
					expect( view._inputsDivView.template.children[ 3 ] ).to.equal( view._replaceInputView );
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
						expect( view._findPrevButtonView.icon ).to.equal( IconPreviousArrow );
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
						expect( view._findNextButtonView.icon ).to.equal( IconPreviousArrow );
					} );

					it( 'should have a tooltip', () => {
						expect( view._findNextButtonView.tooltip ).to.be.true;
					} );
				} );

				describe( 'replace input view', () => {
					it( 'should have a label', () => {
						expect( view._replaceInputView.label ).to.match( /^Replace with/ );
					} );
				} );
			} );

			describe( 'advanced options collapsible', () => {
				let collapsible;

				beforeEach( () => {
					collapsible = view._advancedOptionsCollapsibleView;
				} );

				it( 'should be a CollapsibleView', () => {
					expect( collapsible ).to.be.instanceOf( CollapsibleView );
					expect( collapsible.class ).to.be.undefined;
					expect( collapsible.isCollapsed ).to.be.true;
				} );

				it( 'to have a buttonView', () => {
					expect( collapsible.buttonView.withText ).to.equal( true );
					expect( collapsible.buttonView.label ).to.equal( 'Advanced options' );
				} );

				it( 'should have a "match case" switch', () => {
					const switchView = collapsible.children.get( 0 );

					expect( switchView.label ).to.equal( 'Match case' );
					expect( switchView.withText ).to.be.true;
				} );

				it( 'should have a "whole words only" switch', () => {
					const switchView = collapsible.children.get( 1 );

					expect( switchView.label ).to.equal( 'Whole words only' );
					expect( switchView.withText ).to.be.true;
				} );

				it( 'should bind switch states to form properties', () => {
					const matchCaseSwitchView = collapsible.children.get( 0 );
					const wholeWordsSwitchView = collapsible.children.get( 1 );

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
					const matchCaseSwitchView = collapsible.children.get( 0 );
					const wholeWordsSwitchView = collapsible.children.get( 1 );

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

			describe( 'actions araea', () => {
				it( 'should have an element created from template', () => {
					expect( view._actionButtonsDivView.element.tagName ).to.equal( 'DIV' );
					expect( view._actionButtonsDivView.element.classList.contains( 'ck' ) ).to.true;
					expect( view._actionButtonsDivView.element.classList.contains( 'ck-find-and-replace-form__actions' ) ).to.be.true;
				} );

				it( 'should have children', () => {
					expect( view._actionButtonsDivView.template.children[ 0 ] ).to.equal( view._replaceAllButtonView );
					expect( view._actionButtonsDivView.template.children[ 1 ] ).to.equal( view._replaceButtonView );
					expect( view._actionButtonsDivView.template.children[ 2 ] ).to.equal( view._findButtonView );
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
			} );

			it( 'should create child views', () => {
				expect( view._inputsDivView ).to.be.instanceOf( View );
				expect( view._findInputView ).to.be.instanceOf( LabeledFieldView );
				expect( view._findPrevButtonView ).to.be.instanceOf( ButtonView );
				expect( view._findNextButtonView ).to.be.instanceOf( ButtonView );
				expect( view._replaceInputView ).to.be.instanceOf( LabeledFieldView );

				expect( view._advancedOptionsCollapsibleView ).to.be.instanceOf( CollapsibleView );
				expect( view._matchCaseSwitchView ).to.be.instanceOf( SwitchButtonView );
				expect( view._wholeWordsOnlySwitchView ).to.be.instanceOf( SwitchButtonView );

				expect( view._actionButtonsDivView ).to.be.instanceOf( View );
				expect( view._replaceAllButtonView ).to.be.instanceOf( ButtonView );
				expect( view._replaceButtonView ).to.be.instanceOf( ButtonView );
				expect( view._findButtonView ).to.be.instanceOf( ButtonView );
			} );
		} );

		it( 'should create #focusTracker instance', () => {
			expect( view._focusTracker ).to.be.instanceOf( FocusTracker );
		} );

		it( 'should create #keystrokes instance', () => {
			expect( view._keystrokes ).to.be.instanceOf( KeystrokeHandler );
		} );

		it( 'should create #_focusCycler instance', () => {
			expect( view.focusCycler ).to.be.instanceOf( FocusCycler );
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
					view._findPrevButtonView,
					view._findNextButtonView,
					view._replaceInputView,
					view._advancedOptionsCollapsibleView.buttonView,
					view._matchCaseSwitchView,
					view._wholeWordsOnlySwitchView,
					view._replaceAllButtonView,
					view._replaceButtonView,
					view._findButtonView
				] );
			} );

			it( 'should register child views\' #element in #focusTracker', () => {
				const view = new FindAndReplaceFormView( { t: val => val } );

				const spy = testUtils.sinon.spy( view._focusTracker, 'add' );

				view.render();

				sinon.assert.calledWithExactly( spy.getCall( 0 ), view._findInputView.element );
				sinon.assert.calledWithExactly( spy.getCall( 1 ), view._findPrevButtonView.element );
				sinon.assert.calledWithExactly( spy.getCall( 2 ), view._findNextButtonView.element );
				sinon.assert.calledWithExactly( spy.getCall( 3 ), view._replaceInputView.element );
				sinon.assert.calledWithExactly( spy.getCall( 4 ), view._advancedOptionsCollapsibleView.buttonView.element );
				sinon.assert.calledWithExactly( spy.getCall( 5 ), view._matchCaseSwitchView.element );
				sinon.assert.calledWithExactly( spy.getCall( 6 ), view._wholeWordsOnlySwitchView.element );
				sinon.assert.calledWithExactly( spy.getCall( 7 ), view._replaceAllButtonView.element );
				sinon.assert.calledWithExactly( spy.getCall( 8 ), view._replaceButtonView.element );
				sinon.assert.calledWithExactly( spy.getCall( 9 ), view._findButtonView.element );

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

		it( 'should focus the #findButtonView if direction is backwards', () => {
			const spy = sinon.spy( view._findButtonView, 'focus' );

			view.focus( -1 );

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

		it( 'should preserve state after reopening the dialog but reset errors and make the form dirty', () => {
			findInput.fieldView.value = 'foo';
			findInput.errorText = 'error';
			replaceInput.fieldView.value = 'bar';
			matchCaseSwitch.isOn = true;
			wholeWordsOnlySwitch.isOn = true;
			view.isDirty = false;

			toggleDialog();
			toggleDialog();

			expect( view._textToFind ).to.equal( 'foo' );
			expect( findInput.errorText ).to.be.null;
			expect( view._textToReplace ).to.equal( 'bar' );
			expect( matchCaseSwitch.isOn ).to.be.true;
			expect( wholeWordsOnlySwitch.isOn ).to.be.true;
			expect( view.isDirty ).to.be.true;
		} );

		describe( 'using the "Find" button', () => {
			it( 'hitting "Find" when the find input has text should execute a #findNext event', () => {
				toggleDialog();

				const spy = sinon.spy( view, 'fire' );
				findInput.fieldView.value = 'foo';

				findButton.fire( 'execute' );
				sinon.assert.calledWithExactly( spy, 'findNext', { searchText: 'foo', matchCase: false, wholeWords: false } );
			} );

			it( 'hitting "Find" when the find input is empty should show an error instead of finding things', () => {
				toggleDialog();

				const spy = sinon.spy( view, 'fire' );
				findButton.fire( 'execute' );

				expect( findInput.errorText ).to.match( /^Text to find must not/ );
				sinon.assert.notCalled( spy );
			} );

			it( 'hitting "Find" with some results should enable the find previous/next navigation', () => {
				editor.setData( '<p>AAA</p>' );
				toggleDialog();

				findInput.fieldView.value = 'A';

				findButton.fire( 'execute' );

				expect( findNextButton.isEnabled ).to.be.true;
				expect( findPrevButton.isEnabled ).to.be.true;
			} );

			it( 'hitting "Find" with some results should enable the replace UI', () => {
				editor.setData( '<p>AAA</p>' );
				toggleDialog();

				findInput.fieldView.value = 'A';

				findButton.fire( 'execute' );

				expect( replaceInput.isEnabled ).to.be.true;
				expect( replaceButton.isEnabled ).to.be.true;
				expect( replaceAllButton.isEnabled ).to.be.true;
			} );

			it( 'hitting "Find" with some results should show the counter', () => {
				editor.setData( '<p>AAA</p>' );
				toggleDialog();

				findInput.fieldView.value = 'A';

				findButton.fire( 'execute' );

				expect( matchCounterElement.textContent ).to.equal( '1 of 3' );
				expect( matchCounterElement.classList.contains( 'ck-hidden' ) ).to.be.false;
			} );

			it( 'hitting "Find" with the same results again should not change the UI', () => {
				editor.setData( '<p>AAA</p>' );
				toggleDialog();

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
				toggleDialog();

				findInput.fieldView.value = 'B';

				findButton.fire( 'execute' );

				expect( replaceInput.isEnabled ).to.be.false;
				expect( replaceButton.isEnabled ).to.be.false;
				expect( replaceAllButton.isEnabled ).to.be.false;
			} );

			it( 'hitting "Find" when navigating forward should reset the search', () => {
				editor.setData( '<p>AAA</p>' );
				toggleDialog();

				findInput.fieldView.value = 'A';

				findButton.fire( 'execute' );
				findNextButton.fire( 'execute' );
				expect( matchCounterElement.textContent ).to.equal( '2 of 3' );

				findButton.fire( 'execute' );
				expect( matchCounterElement.textContent ).to.equal( '1 of 3' );
			} );

			it( 'hitting "Find" with no result should watch document modifications and update highlighted item if not present', () => {
				editor.setData( '' );
				toggleDialog();

				findInput.fieldView.value = 'CupCake';
				findButton.fire( 'execute' );

				expect( matchCounterElement.textContent ).to.equal( '0 of 0' );

				editor.setData( 'CupCake' );
				expect( matchCounterElement.textContent ).to.equal( '1 of 1' );

				editor.setData( 'CupCake CupCake' );
				expect( matchCounterElement.textContent ).to.equal( '1 of 2' );

				editor.setData( '' );
				expect( matchCounterElement.textContent ).to.equal( '0 of 0' );
			} );

			it( 'hitting "Find" and toggling "matchCase" affects search results', () => {
				editor.setData( '<p>MatCH casE test</P' );
				toggleDialog();

				findInput.fieldView.value = 'match';
				matchCaseSwitch.fire( 'execute' );

				findButton.fire( 'execute' );
				expect( matchCounterElement.textContent ).to.equal( '0 of 0' );

				// try again
				findButton.fire( 'execute' );
				expect( matchCounterElement.textContent ).to.equal( '0 of 0' );

				// toggle switch
				matchCaseSwitch.fire( 'execute' );
				findButton.fire( 'execute' );

				expect( matchCounterElement.textContent ).to.equal( '1 of 1' );
			} );

			it( 'hitting "Find" and toggling "wholeWords" affects search results', () => {
				editor.setData( '<p>MatCH casE test</P' );
				toggleDialog();

				findInput.fieldView.value = 'matc';
				findButton.fire( 'execute' );

				expect( matchCounterElement.textContent ).to.equal( '1 of 1' );

				// toggle switch
				wholeWordsOnlySwitch.fire( 'execute' );
				findButton.fire( 'execute' );

				expect( matchCounterElement.textContent ).to.equal( '0 of 0' );
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
				toggleDialog();

				findInput.fieldView.value = 'A';
				findButton.fire( 'execute' );

				const spy = sinon.spy();

				view.on( 'findNext', spy );

				findNextButton.fire( 'execute' );
				sinon.assert.calledOnce( spy );
			} );

			it( 'should execute an event when the previous button is used', () => {
				editor.setData( '<p>AAA</p>' );
				toggleDialog();

				findInput.fieldView.value = 'A';
				findButton.fire( 'execute' );

				const spy = sinon.spy();

				view.on( 'findPrevious', spy );

				findPrevButton.fire( 'execute' );
				sinon.assert.calledOnce( spy );
			} );

			it( 'should navigate forward using the next button (counter)', () => {
				editor.setData( '<p>AAA</p>' );
				toggleDialog();

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
				toggleDialog();

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

			it.skip( 'should adjust the right padding of the find input depending on the changing size of the counter (LTR editor)', () => {
				editor.setData( `<p>${ new Array( 20 ).join( 'A' ) }</p>` );
				toggleDialog();

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

			it.skip( 'should adjust the right padding of the find input depending on the changing size of the counter (RTL editor)', () => {
				editor.locale.uiLanguageDirection = 'rtl';

				editor.setData( `<p>${ new Array( 20 ).join( 'A' ) }</p>` );
				toggleDialog();

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

			it.skip( 'should adjust the right padding of the find input depending on the presence of the counter', () => {
				editor.setData( `<p>${ new Array( 20 ).join( 'A' ) }</p>` );
				toggleDialog();

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
				toggleDialog();

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
				toggleDialog();

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
				toggleDialog();

				findInput.fieldView.value = 'A';
				findButton.fire( 'execute' );

				const command = editor.commands.get( 'replace' );

				command.isEnabled = false;
				expect( replaceInput.isEnabled ).to.be.false;

				command.isEnabled = true;
				expect( replaceInput.isEnabled ).to.be.true;
			} );

			it( 'should display a tip when the replace field is disabled but not focused', () => {
				toggleDialog();

				expect( replaceInput.isEnabled ).to.be.false;
				expect( replaceInput.infoText ).to.equal( '' );
			} );

			it( 'should display a tip when the replace field is disabled and focused', () => {
				toggleDialog();

				// Note: replaceInput.focus() will not work if the browser window is not focused.
				replaceInput.isFocused = true;

				expect( replaceInput.isEnabled ).to.be.false;
				expect( replaceInput.infoText ).to.match( /^Tip: Find some text/ );
			} );

			it( 'should fire an event when the "replace" button is hit', () => {
				editor.setData( '<p>AAA</p>' );
				toggleDialog();

				findInput.fieldView.value = 'A';
				findButton.fire( 'execute' );

				const spy = sinon.spy();

				view.on( 'replace', spy );

				replaceButton.fire( 'execute' );
				sinon.assert.calledOnce( spy );
			} );

			it( 'should fire an event when the "replace all" button is hit', () => {
				editor.setData( '<p>AAA</p>' );
				toggleDialog();

				findInput.fieldView.value = 'A';
				findButton.fire( 'execute' );

				const spy = sinon.spy();

				view.on( 'replaceAll', spy );

				replaceAllButton.fire( 'execute' );
				sinon.assert.calledOnce( spy );
			} );

			it( 'should replace an occurence when the "replace" button is hit', () => {
				editor.setData( '<p>AAA</p>' );
				toggleDialog();

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
				toggleDialog();

				findInput.fieldView.value = 'A';
				findButton.fire( 'execute' );

				expect( matchCounterElement.textContent ).to.equal( '1 of 3' );

				findNextButton.fire( 'execute' );

				expect( matchCounterElement.textContent ).to.equal( '2 of 3' );

				replaceAllButton.fire( 'execute' );
				expect( matchCounterElement.textContent ).to.equal( '0 of 0' );
			} );

			it( 'should focus the find input when "replace all" button is hit', () => {
				editor.setData( '<p>AAA</p>' );

				findInput.fieldView.value = 'A';
				findButton.fire( 'execute' );
				findNextButton.fire( 'execute' );

				const spy = sinon.spy( findInput, 'focus' );

				// Make sure the input is not focused. Otherwise it won't be focused again
				// and the test will fail.
				view._focusTracker.isFocused = false;
				view._focusTracker.focusedElement = undefined;
				replaceAllButton.fire( 'execute' );

				sinon.assert.calledOnce( spy );
			} );

			it( 'replace items and using undo should set proper hits counter value', () => {
				editor.setData( '<p>Test Test Test</p><p>Test</p>' );
				toggleDialog();

				findInput.fieldView.value = 'Test';
				findButton.fire( 'execute' );

				expect( matchCounterElement.textContent ).to.equal( '1 of 4' );

				replaceButton.fire( 'execute' );
				expect( matchCounterElement.textContent ).to.equal( '1 of 3' );

				replaceButton.fire( 'execute' );
				expect( matchCounterElement.textContent ).to.equal( '1 of 2' );

				replaceButton.fire( 'execute' );
				expect( matchCounterElement.textContent ).to.equal( '1 of 1' );

				editor.execute( 'undo' );
				expect( matchCounterElement.textContent ).to.equal( '2 of 2' );

				editor.execute( 'undo' );
				expect( matchCounterElement.textContent ).to.equal( '3 of 3' );

				editor.execute( 'undo' );
				expect( matchCounterElement.textContent ).to.equal( '4 of 4' );
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

				expect( editor.getData() ).to.be.equal(
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

				expect( view.isDirty ).to.be.false;
			} );

			it( 'hitting "Find" and not finding any results should make the form clean', () => {
				editor.setData( '<p>AAA</p>' );
				toggleDialog();

				findInput.fieldView.value = 'B';

				findButton.fire( 'execute' );

				expect( view.isDirty ).to.be.false;
			} );

			it( 'typing in the find input when the form is clean should make it dirty', () => {
				editor.setData( '<p>AAA</p>' );
				toggleDialog();

				findInput.fieldView.value = 'B';

				findButton.fire( 'execute' );
				expect( view.isDirty ).to.be.false;

				findInput.fieldView.value = 'C';
				findInput.fieldView.fire( 'input' );
				expect( view.isDirty ).to.be.true;
			} );

			it( 'changing the match case option when the form is clean should make it dirty', () => {
				editor.setData( '<p>AAA</p>' );
				toggleDialog();

				findInput.fieldView.value = 'B';

				findButton.fire( 'execute' );
				expect( view.isDirty ).to.be.false;

				matchCaseSwitch.fire( 'execute' );
				expect( view.isDirty ).to.be.true;
			} );

			it( 'changing the whole words only option when the form is clean should make it dirty', () => {
				editor.setData( '<p>AAA</p>' );
				toggleDialog();

				findInput.fieldView.value = 'B';

				findButton.fire( 'execute' );
				expect( view.isDirty ).to.be.false;

				wholeWordsOnlySwitch.fire( 'execute' );
				expect( view.isDirty ).to.be.true;
			} );
		} );
	} );

	function wait( time ) {
		return new Promise( res => {
			window.setTimeout( res, time );
		} );
	}
} );
