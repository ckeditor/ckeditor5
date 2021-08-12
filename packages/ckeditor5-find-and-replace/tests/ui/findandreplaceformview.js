/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals Event */

import { View, FormHeaderView, LabeledFieldView, ButtonView } from '@ckeditor/ckeditor5-ui';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import FocusCycler from '@ckeditor/ckeditor5-ui/src/focuscycler';
import ViewCollection from '@ckeditor/ckeditor5-ui/src/viewcollection';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

import FindAndReplaceFormView from '../../src/ui/findandreplaceformview';
import DropdownView from '@ckeditor/ckeditor5-ui/src/dropdown/dropdownview';

import previousArrow from '@ckeditor/ckeditor5-ui/theme/icons/previous-arrow.svg';

describe( 'FindAndReplaceFormView', () => {
	let view;
	let viewValue;
	let state;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		view = new FindAndReplaceFormView( { t: val => val } );
		view.render();
	} );

	afterEach( () => {
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

			it( 'should set #areCommandsEnabled', () => {
				expect( view.areCommandsEnabled ).to.deep.equal( {} );
			} );

			it( 'should set #isDirty', () => {
				expect( view.isDirty ).to.be.false;
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
				it( 'should have an element create dfrom template', () => {
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

		it( 'should implement the CSS transition disabling feature', () => {
			expect( view.disableCssTransitions ).to.be.a( 'function' );
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
				view = new FindAndReplaceFormView( { t: val => val }, state );

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
			} );

			it( 'starts listening for #keystrokes coming from #element', () => {
				view = new FindAndReplaceFormView( { t: val => val }, state );

				const spy = sinon.spy( view._keystrokes, 'listenTo' );

				view.render();
				sinon.assert.calledOnce( spy );
				sinon.assert.calledWithExactly( spy, view.element );
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
		} );
	} );

	describe( 'focus()', () => {
		it( 'should focus the #findInputView', () => {
			const spy = sinon.spy( view._findInputView, 'focus' );

			view.focus();

			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'textToFind()', () => {
		// TODO
	} );

	describe( 'textToReplace()', () => {
		// TODO
	} );

	describe( 'observable properties', () => {
		describe( 'isDirty', () => {
			it( 'should be initially false', () => {
				expect( view.isDirty ).to.be.false;
			} );

			it( 'should change to true on searchText change', () => {
				view.searchText = 'foo';

				expect( view.isDirty ).to.true;
			} );

			it( 'should change to true on state change', () => {
				state.searchText = 'foo';

				expect( view.isDirty ).to.true;
			} );

			it( 'should be false when state and view have the same value', () => {
				view.searchText = 'foo';
				state.searchText = 'foo';

				expect( view.isDirty ).to.false;
			} );

			it( 'should change to true on matchCase change', () => {
				view.matchCaseView.isChecked = true;

				expect( view.isDirty ).to.true;

				view.matchCaseView.isChecked = false;
				state.matchCase = true;

				expect( view.isDirty ).to.true;
			} );

			it( 'should change to true on matchWholeWords change', () => {
				state.matchWholeWords = true;

				expect( view.isDirty ).to.true;

				view.matchWholeWordsView.isChecked = false;
				state.matchWholeWords = true;

				expect( view.isDirty ).to.true;
			} );

			it( 'should be false when matchCase or matchWholeWords have the same value', () => {
				expect( view.isDirty ).to.false;

				state.matchCase = true;
				view.matchCaseView.isChecked = true;

				expect( view.isDirty ).to.false;

				state.matchWholeWords = true;
				view.matchWholeWordsView.isChecked = true;

				expect( view.isDirty ).to.false;
			} );
		} );
	} );

	describe( 'find and replace events', () => {
		it( 'should trigger findNext twice', () => {
			const spy = sinon.spy();

			view.on( 'findNext', spy );

			view._findNextButtonView.fire( 'execute' );
			view.findButtonView.fire( 'execute' );

			expect( spy.calledTwice ).to.true;
		} );

		it( 'should trigger findPrevious', () => {
			const spy = sinon.spy();

			view.on( 'findPrevious', spy );

			view._findPrevButtonView.fire( 'execute' );

			expect( spy.calledOnce ).to.true;
		} );

		it( 'should trigger replace', () => {
			const spy = sinon.spy();

			view.on( 'replace', spy );

			view._replaceButtonView.fire( 'execute' );

			expect( spy.calledOnce ).to.true;
		} );

		it( 'should trigger replaceAll', () => {
			const spy = sinon.spy();

			view.on( 'replaceAll', spy );

			view._replaceAllButtonView.fire( 'execute' );

			expect( spy.calledOnce ).to.true;
		} );
	} );

	describe( 'find and replace input values', () => {
		it( 'returns the #findInputView DOM value', () => {
			viewValue = view._findInputView.fieldView.element.value;
			viewValue = 'foo';

			expect( viewValue ).to.equal( 'foo' );
		} );

		it( 'returns the #replaceInputView DOM value', () => {
			viewValue = view._replaceInputView.fieldView.element.value;
			viewValue = 'foo';

			expect( viewValue ).to.equal( 'foo' );
		} );

		it( 'sets the #findInputView DOM value', () => {
			viewValue = view._findInputView.fieldView.element.value;
			viewValue = 'bar';
			viewValue = 'foo';

			expect( viewValue ).to.equal( 'foo' );
		} );

		it( 'sets the #replaceInputView DOM value', () => {
			viewValue = view._replaceInputView.fieldView.element.value;
			viewValue = 'bar';
			viewValue = 'foo';

			expect( viewValue ).to.equal( 'foo' );
		} );
	} );
} );
