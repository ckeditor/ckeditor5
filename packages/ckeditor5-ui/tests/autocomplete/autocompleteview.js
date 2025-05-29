/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	ListView,
	AutocompleteView,
	SearchTextView
} from '../../src/index.js';
import Locale from '@ckeditor/ckeditor5-utils/src/locale.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { Rect, global, keyCodes } from '@ckeditor/ckeditor5-utils';

describe( 'AutocompleteView', () => {
	let view, filteredView;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		filteredView = new ListView();
		filteredView.filter = () => {
			return {
				resultsCount: 1,
				totalItemsCount: 5
			};
		};

		view = new AutocompleteView( new Locale(), {
			filteredView,
			queryView: {
				label: 'test label'
			}
		} );

		view.render();

		document.body.appendChild( view.element );
	} );

	afterEach( () => {
		filteredView.destroy();
		view.destroy();
		view.element.remove();
	} );

	describe( 'constructor()', () => {
		it( 'extends SearchTextView', () => {
			expect( view ).to.be.instanceOf( SearchTextView );
		} );

		describe( '#resultsView', () => {
			it( 'has #isVisible property with a DOM binding', () => {
				expect( view.resultsView.isVisible ).to.be.false;
				expect( view.resultsView.element.classList.contains( 'ck-hidden' ) ).to.be.true;

				view.resultsView.isVisible = true;
				expect( view.resultsView.element.classList.contains( 'ck-hidden' ) ).to.be.false;
			} );

			it( 'should update the value and close results when the filtered view fired the execute event', () => {
				const focusSpy = sinon.spy( view, 'focus' );

				view.resultsView.isVisible = true;

				view.filteredView.fire( 'execute', { value: 'foo bar baz' } );

				expect( view.resultsView.isVisible ).to.be.false;
				sinon.assert.calledOnce( focusSpy );
				expect( view.queryView.fieldView.value ).to.equal( 'foo bar baz' );
				expect( view.queryView.fieldView.element.value ).to.equal( 'foo bar baz' );
			} );

			it( 'has a #_position property with a DOM binding', () => {
				expect( view.resultsView._position ).to.equal( 's' );
				expect( view.resultsView.element.classList.contains( 'ck-search__results_s' ) ).to.be.true;

				view.resultsView._position = 'n';
				expect( view.resultsView.element.classList.contains( 'ck-search__results_n' ) ).to.be.true;
			} );

			it( 'should update results position on document scroll (if results are visible)', () => {
				const getOptimalPositionSpy = sinon.spy( AutocompleteView, '_getOptimalPosition' );

				// A default that will get overridden.
				view.resultsView._position = 'n';

				view.focusTracker.isFocused = true;
				sinon.assert.calledOnce( getOptimalPositionSpy );
				sinon.assert.calledOnceWithExactly( getOptimalPositionSpy, {
					element: view.resultsView.element,
					target: view.queryView.element,
					fitInViewport: true,
					positions: AutocompleteView.defaultResultsPositions
				} );

				global.document.dispatchEvent( new Event( 'scroll' ) );

				sinon.assert.calledTwice( getOptimalPositionSpy );

				view.focusTracker.isFocused = false;
				global.document.dispatchEvent( new Event( 'scroll' ) );

				sinon.assert.calledTwice( getOptimalPositionSpy );

				// Default when the are no obstacles
				expect( view.resultsView._position ).to.equal( 's' );
			} );

			it( 'should use the first results position on document scroll if the optimal one couldn\'t be found', () => {
				const getOptimalPositionSpy = sinon.spy( AutocompleteView, '_getOptimalPosition' );

				sinon.stub( view.queryView.element, 'getBoundingClientRect' ).returns( {
					top: -100,
					right: -100,
					bottom: -90,
					left: -90,
					width: 10,
					height: 10
				} );

				// A default that will get overridden.
				view.resultsView._position = 'n';

				view.focusTracker.isFocused = true;
				sinon.assert.calledOnce( getOptimalPositionSpy );
				sinon.assert.calledOnceWithExactly( getOptimalPositionSpy, {
					element: view.resultsView.element,
					target: view.queryView.element,
					fitInViewport: true,
					positions: AutocompleteView.defaultResultsPositions
				} );

				global.document.dispatchEvent( new Event( 'scroll' ) );

				sinon.assert.calledTwice( getOptimalPositionSpy );

				// First position in defaultResultsPositions.
				expect( view.resultsView._position ).to.equal( 's' );
			} );

			describe( 'Esc key handling', () => {
				it( 'should focus the #queryView and hide the #resultsView upon pressing Esc if the results view is visible', () => {
					const keyEvtData = {
						keyCode: keyCodes.esc,
						preventDefault: sinon.spy(),
						stopPropagation: sinon.spy()
					};

					const queryFocusSpy = sinon.spy( view.queryView, 'focus' );
					const resultsIsVisibleChangeSpy = sinon.spy();

					view.resultsView.isVisible = true;
					view.resultsView.on( 'change:isVisible', resultsIsVisibleChangeSpy );

					view.keystrokes.press( keyEvtData );

					sinon.assert.calledOnce( queryFocusSpy );
					sinon.assert.calledOnce( resultsIsVisibleChangeSpy );
					sinon.assert.callOrder( queryFocusSpy, resultsIsVisibleChangeSpy );
					expect( view.resultsView.isVisible ).to.be.false;

					sinon.assert.calledOnce( keyEvtData.preventDefault );
					sinon.assert.calledOnce( keyEvtData.stopPropagation );
				} );

				it( 'should pass the DOM event through upon pressing Esc if the #resultsView is invisible', () => {
					const keyEvtData = {
						keyCode: keyCodes.esc,
						preventDefault: sinon.spy(),
						stopPropagation: sinon.spy()
					};

					const queryFocusSpy = sinon.spy( view.queryView, 'focus' );

					view.keystrokes.press( keyEvtData );

					sinon.assert.notCalled( queryFocusSpy );
					expect( view.resultsView.isVisible ).to.be.false;
					sinon.assert.notCalled( keyEvtData.preventDefault );
					sinon.assert.notCalled( keyEvtData.stopPropagation );
				} );
			} );

			it( 'should hide the results upon disabling the view', () => {
				view.resultsView.isVisible = true;

				view.isEnabled = false;

				expect( view.resultsView.isVisible ).to.be.false;
			} );

			it( 'should not display the results upon searching if the query is shorter than configured #queryMinChars', () => {
				const view = new AutocompleteView( new Locale(), {
					filteredView,
					queryMinChars: 3,
					queryView: {
						label: 'test label'
					}
				} );

				view.render();
				document.body.appendChild( view.element );
				view.focusTracker.isFocused = true;

				expect( view.resultsView.isVisible ).to.be.false;

				view.queryView.fieldView.value = 'a';
				view.fire( 'search', { query: 'a', resultsCount: 1, totalItemsCount: 5 } );
				expect( view.resultsView.isVisible ).to.be.false;

				view.queryView.fieldView.value = 'ab';
				view.fire( 'search', { query: 'ab', resultsCount: 1, totalItemsCount: 5 } );
				expect( view.resultsView.isVisible ).to.be.false;

				view.queryView.fieldView.value = 'abc';
				view.fire( 'search', { query: 'abc', resultsCount: 1, totalItemsCount: 5 } );
				expect( view.resultsView.isVisible ).to.be.true;

				view.destroy();
				view.element.remove();
			} );

			it( 'should update view position, width, and visibility upon #search event', () => {
				const view = new AutocompleteView( new Locale(), {
					filteredView,
					queryMinChars: 3,
					queryView: {
						label: 'test label'
					}
				} );

				view.render();
				document.body.appendChild( view.element );
				expect( view.resultsView.isVisible ).to.be.false;

				view.queryView.fieldView.value = 'abc';
				view.focusTracker.isFocused = true;
				expect( view.resultsView.isVisible ).to.be.true;

				testUtils.sinon.stub( AutocompleteView, '_getOptimalPosition' ).returns( { name: 'foo' } );
				testUtils.sinon.stub( view.queryView.fieldView.element, 'getBoundingClientRect' ).returns( { width: '1234' } );

				// Query too short.
				view.queryView.fieldView.value = 'a';
				view.fire( 'search', { query: 'a', resultsCount: 1, totalItemsCount: 5 } );

				expect( view.resultsView.isVisible ).to.be.false;
				expect( view.resultsView.element.classList.contains( 'ck-search__results_foo' ) ).to.be.false;
				expect( view.resultsView.element.style.width ).to.not.equal( '1234px' );

				// Query long enough.
				view.queryView.fieldView.value = 'abcd';
				view.fire( 'search', { query: 'abcd', resultsCount: 1, totalItemsCount: 5 } );

				expect( view.resultsView.isVisible ).to.be.true;
				expect( view.resultsView.element.classList.contains( 'ck-search__results_foo' ) ).to.be.true;
				expect( view.resultsView.element.style.width ).to.equal( '1234px' );

				view.destroy();
				view.element.remove();
			} );

			describe( '#defaultResultsPositions', () => {
				it( 'should be able to position results above the search field (north)', () => {
					const northPositioningFunction = AutocompleteView.defaultResultsPositions[ 0 ];
					const fieldRectMock = new Rect( { top: 0, right: 100, bottom: 100, left: 0, width: 100, height: 100 } );

					expect( northPositioningFunction( fieldRectMock ) ).to.deep.equal( {
						left: 0,
						top: 100,
						name: 's'
					} );
				} );

				it( 'should be able to position results below the search field (south)', () => {
					const northPositioningFunction = AutocompleteView.defaultResultsPositions[ 1 ];
					const fieldRectMock = new Rect( { top: 0, right: 100, bottom: 100, left: 0, width: 100, height: 100 } );
					const resultsRectMock = new Rect( { top: 0, right: 100, bottom: 50, left: 0, width: 100, height: 50 } );

					expect( northPositioningFunction( fieldRectMock, resultsRectMock ) ).to.deep.equal( {
						left: 0,
						top: -50,
						name: 'n'
					} );
				} );
			} );
		} );

		describe( '#execute event handling', () => {
			it( 'should focus the view upon #execute', () => {
				const focusSpy = sinon.spy( view, 'focus' );

				filteredView.fire( 'execute', { value: 'foo bar baz' } );

				sinon.assert.calledOnce( focusSpy );
			} );

			it( 'should set the #value upon #execute', () => {
				filteredView.fire( 'execute', { value: 'foo bar baz' } );

				expect( view.queryView.fieldView.value ).to.equal( 'foo bar baz' );
			} );

			it( 'should set the query view\'s DOM element value upon #execute', () => {
				view.queryView.fieldView.element.value = 'abc';

				filteredView.fire( 'execute', { value: 'foo bar baz' } );

				expect( view.queryView.fieldView.element.value ).to.equal( 'foo bar baz' );
			} );

			it( 'should hide the #resultsView', () => {
				view.resultsView.isVisible = true;

				filteredView.fire( 'execute', { value: 'foo bar baz' } );

				expect( view.resultsView.isVisible ).to.be.false;
			} );
		} );

		describe( 'focus tracking behavior', () => {
			it( 'displays autocomplete results upon focusing the view', () => {
				expect( view.resultsView.isVisible ).to.be.false;

				view.focusTracker.isFocused = true;

				expect( view.resultsView.isVisible ).to.be.true;
			} );

			it( 'updates autocomplete results\' position upon focusing the view', () => {
				view.resultsView._position = 'foo';

				view.focusTracker.isFocused = true;

				expect( view.resultsView._position ).to.equal( 's' );
			} );

			describe( 'reset on blur', () => {
				it( 'resets the view when blurred if configured to do so', () => {
					const view = new AutocompleteView( new Locale(), {
						filteredView,
						resetOnBlur: true,
						queryView: {
							label: 'test label'
						}
					} );

					view.render();
					document.body.appendChild( view.element );

					const resetSpy = sinon.spy( view.queryView, 'reset' );

					view.focusTracker.isFocused = true;
					view.focusTracker.isFocused = false;

					sinon.assert.calledOnce( resetSpy );

					view.destroy();
					view.element.remove();
				} );

				it( 'does not reset the view when blurred if not configured', () => {
					const resetSpy = sinon.spy( view.queryView, 'reset' );

					view.focusTracker.isFocused = true;
					view.focusTracker.isFocused = false;

					sinon.assert.notCalled( resetSpy );
				} );
			} );
		} );
	} );
} );
