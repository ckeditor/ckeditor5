/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import { FocusTracker, KeystrokeHandler } from '@ckeditor/ckeditor5-utils';
import {
	FocusCycler,
	InputNumberView,
	InputTextView,
	LabeledFieldView,
	ListView,
	SearchInfoView,
	SearchView,
	View,
	createLabeledInputNumber
} from '../../src';
import Locale from '@ckeditor/ckeditor5-utils/src/locale';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'SearchView', () => {
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

		view = new SearchView( new Locale(), {
			filteredView,
			searchFieldLabel: 'test label'
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
		it( 'creates and element from template with CSS classes and attributes', () => {
			expect( view.element.classList.contains( 'ck' ) ).to.true;
			expect( view.element.classList.contains( 'ck-search' ) ).to.true;
			expect( view.element.getAttribute( 'tabindex' ) ).to.equal( '-1' );
		} );

		it( 'supports extra CSS class in the config', () => {
			const view = new SearchView( new Locale(), {
				filteredView,
				searchFieldLabel: 'foo',
				class: 'bar'
			} );

			view.render();

			expect( view.element.classList.contains( 'bar' ) ).to.true;

			view.destroy();
		} );

		it( 'creates an instance of FocusTracker', () => {
			expect( view.focusTracker ).to.be.instanceOf( FocusTracker );
		} );

		it( 'creates an instance of KeystrokeHandler', () => {
			expect( view.keystrokes ).to.be.instanceOf( KeystrokeHandler );
		} );

		it( 'creates and instance of FocusCycle', () => {
			expect( view._focusCycler ).to.be.instanceOf( FocusCycler );
		} );

		it( 'assigns an instance of a view to #filteredView', () => {
			expect( view.filteredView ).to.equal( filteredView );
		} );

		it( 'creates a #resultsView as a container for the #filteredView', () => {
			expect( view.resultsView ).to.be.instanceOf( View );

			expect( view.resultsView.element.classList.contains( 'ck' ) ).to.true;
			expect( view.resultsView.element.classList.contains( 'ck-search__results' ) ).to.true;

			expect( view.resultsView.children.first ).to.equal( view.infoView );
			expect( view.resultsView.children.last ).to.equal( filteredView );
		} );

		describe( 'focus tracking and cycling', () => {
			describe( 'activates keyboard navigation', () => {
				it( 'makes "tab" focus the next focusable item', () => {
					const keyEvtData = {
						keyCode: keyCodes.tab,
						preventDefault: sinon.spy(),
						stopPropagation: sinon.spy()
					};

					// Mock the query input is focused.
					view.focusTracker.isFocused = true;
					view.focusTracker.focusedElement = view.searchFieldView.element;

					const spy = sinon.spy( filteredView, 'focus' );

					view.keystrokes.press( keyEvtData );
					sinon.assert.calledOnce( keyEvtData.preventDefault );
					sinon.assert.calledOnce( keyEvtData.stopPropagation );
					sinon.assert.calledOnce( spy );
				} );

				it( 'makes "shift + tab" focus the previous focusable item', () => {
					const keyEvtData = {
						keyCode: keyCodes.tab,
						shiftKey: true,
						preventDefault: sinon.spy(),
						stopPropagation: sinon.spy()
					};

					// Mock the results are focused.
					view.focusTracker.isFocused = true;
					view.focusTracker.focusedElement = filteredView.element;

					const spy = sinon.spy( view.searchFieldView, 'focus' );

					view.keystrokes.press( keyEvtData );
					sinon.assert.calledOnce( keyEvtData.preventDefault );
					sinon.assert.calledOnce( keyEvtData.stopPropagation );
					sinon.assert.calledOnce( spy );
				} );
			} );

			it( 'intercepts the arrow* events and overrides the default toolbar behavior', () => {
				const keyEvtData = {
					stopPropagation: sinon.spy()
				};

				keyEvtData.keyCode = keyCodes.arrowdown;
				view.keystrokes.press( keyEvtData );
				sinon.assert.calledOnce( keyEvtData.stopPropagation );

				keyEvtData.keyCode = keyCodes.arrowup;
				view.keystrokes.press( keyEvtData );
				sinon.assert.calledTwice( keyEvtData.stopPropagation );

				keyEvtData.keyCode = keyCodes.arrowleft;
				view.keystrokes.press( keyEvtData );
				sinon.assert.calledThrice( keyEvtData.stopPropagation );

				keyEvtData.keyCode = keyCodes.arrowright;
				view.keystrokes.press( keyEvtData );
				sinon.assert.callCount( keyEvtData.stopPropagation, 4 );
			} );
		} );

		describe( '#searchFieldView', () => {
			it( 'gets created as labeled text view if not configured otherwise', () => {
				expect( view.searchFieldView ).to.be.instanceOf( LabeledFieldView );
				expect( view.searchFieldView.fieldView ).to.be.instanceOf( InputTextView );
				expect( view.searchFieldView.label ).to.equal( 'test label' );
			} );

			it( 'gets created by a custom view creator configured by the user', () => {
				const view = new SearchView( new Locale(), {
					filteredView,
					searchFieldInputCreator: createLabeledInputNumber,
					searchFieldLabel: 'foo',
					class: 'bar'
				} );

				view.render();

				expect( view.searchFieldView ).to.be.instanceOf( LabeledFieldView );
				expect( view.searchFieldView.fieldView ).to.be.instanceOf( InputNumberView );

				view.destroy();
			} );

			it( 'shoud trigger #search() upon #input', () => {
				const spy = sinon.spy( view, 'search' );

				view.searchFieldView.fieldView.fire( 'input' );

				sinon.assert.calledOnce( spy );
			} );

			it( 'should reset the entire view if fired #reset', () => {
				const spy = sinon.spy( view, 'reset' );

				view.searchFieldView.fire( 'reset' );

				sinon.assert.calledOnce( spy );
			} );
		} );

		describe( '#infoView', () => {
			let view;

			beforeEach( () => {
				filteredView.filter = () => {
					return {
						resultsCount: 5,
						totalItemsCount: 5
					};
				};

				view = new SearchView( new Locale(), {
					filteredView,
					searchFieldLabel: 'test label'
				} );

				view.render();
				document.body.appendChild( view.element );
			} );

			afterEach( () => {
				view.destroy();
				view.element.remove();
			} );

			describe( 'if not specified', () => {
				it( 'is an instance of SearchInfoView if not specified in the config', () => {
					expect( view.infoView ).to.be.instanceOf( SearchInfoView );
					expect( view.infoView.isVisible ).to.be.false;
				} );

				it( 'comes with a default behavior for no search results', () => {
					filteredView.filter = () => {
						return {
							resultsCount: 0,
							totalItemsCount: 5
						};
					};

					const view = new SearchView( new Locale(), {
						filteredView,
						searchFieldLabel: 'test label'
					} );

					view.render();
					view.search( 'will not be found' );

					expect( view.infoView.isVisible ).to.be.true;
					expect( view.infoView.primaryText ).to.equal( 'No results found' );
					expect( view.infoView.secondaryText ).to.equal( '' );

					view.destroy();
				} );

				it( 'comes with a default behavior for no searchable items', () => {
					filteredView.filter = () => {
						return {
							resultsCount: 0,
							totalItemsCount: 0
						};
					};

					const view = new SearchView( new Locale(), {
						filteredView,
						searchFieldLabel: 'test label'
					} );

					view.render();

					expect( view.infoView.isVisible ).to.be.true;
					expect( view.infoView.primaryText ).to.equal( 'No searchable items' );
					expect( view.infoView.secondaryText ).to.equal( '' );

					view.destroy();
				} );

				it( 'allows customization of info texts', () => {
					filteredView.filter = () => {
						return {
							resultsCount: 0,
							totalItemsCount: 0
						};
					};

					const view = new SearchView( new Locale(), {
						filteredView,
						searchFieldLabel: 'test label',
						infoViewTextConfig: {
							notFound: {
								primary: 'foo',
								secondary: 'bar'
							},
							noSearchableItems: {
								primary: 'baz',
								secondary: 'qux'
							}
						}
					} );

					view.render();

					expect( view.infoView.isVisible ).to.be.true;
					expect( view.infoView.primaryText ).to.equal( 'baz' );
					expect( view.infoView.secondaryText ).to.equal( 'qux' );

					filteredView.filter = () => {
						return {
							resultsCount: 0,
							totalItemsCount: 5
						};
					};

					view.search( 'test' );

					expect( view.infoView.isVisible ).to.be.true;
					expect( view.infoView.primaryText ).to.equal( 'foo' );
					expect( view.infoView.secondaryText ).to.equal( 'bar' );

					view.destroy();
				} );

				it( 'allows info texts specified as functions', () => {
					filteredView.filter = () => {
						return {
							resultsCount: 0,
							totalItemsCount: 0
						};
					};

					const dynamicLabelText = ( query, resultsCount, totalItemsCount ) =>
						`"${ query }" ${ resultsCount } of ${ totalItemsCount }`;

					const view = new SearchView( new Locale(), {
						filteredView,
						searchFieldLabel: 'test label',
						infoViewTextConfig: {
							notFound: {
								primary: dynamicLabelText,
								secondary: dynamicLabelText
							},
							noSearchableItems: {
								primary: dynamicLabelText,
								secondary: dynamicLabelText
							}
						}
					} );

					view.render();

					expect( view.infoView.isVisible ).to.be.true;
					expect( view.infoView.primaryText ).to.equal( '"" 0 of 0' );
					expect( view.infoView.secondaryText ).to.equal( '"" 0 of 0' );

					filteredView.filter = () => {
						return {
							resultsCount: 0,
							totalItemsCount: 5
						};
					};

					view.search( 'test' );

					expect( view.infoView.isVisible ).to.be.true;
					expect( view.infoView.primaryText ).to.equal( '"test" 0 of 5' );
					expect( view.infoView.secondaryText ).to.equal( '"test" 0 of 5' );

					view.destroy();
				} );
			} );

			it( 'accpets a view from the configuration', () => {
				const customInfoView = new View();
				customInfoView.setTemplate( {
					tag: 'div',
					attributes: {
						class: 'custom'
					}
				} );

				const view = new SearchView( new Locale(), {
					filteredView,
					searchFieldLabel: 'test label',
					infoView: customInfoView
				} );

				view.render();

				expect( view.infoView ).to.equal( customInfoView );
				expect( view.resultsView.children.first ).to.equal( customInfoView );
				expect( view.resultsView.children.last ).to.equal( filteredView );

				view.destroy();
			} );
		} );
	} );

	describe( 'focus()', () => {
		it( 'focuses the #searchFieldView', () => {
			const spy = sinon.spy( view.searchFieldView, 'focus' );

			view.focus();

			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'reset()', () => {
		it( 'resets the #searchFieldView', () => {
			const spy = sinon.spy( view.searchFieldView, 'reset' );

			view.reset();

			sinon.assert.calledOnce( spy );
		} );

		it( 'resets the search results', () => {
			const spy = sinon.spy( view, 'search' );

			view.reset();

			sinon.assert.calledOnceWithExactly( spy, '' );
		} );
	} );

	describe( 'search()', () => {
		it( 'should escape the query when creating a RegExp to avoid mismatches', () => {
			const spy = sinon.spy( filteredView, 'filter' );

			view.search( 'foo[ar]' );
			sinon.assert.calledOnceWithExactly( spy, /foo\[ar\]/gi );

			view.search( 'foo/bar' );
			sinon.assert.calledWithExactly( spy.secondCall, /foo\/bar/gi );
		} );

		it( 'should filter the #filteredView', () => {
			const spy = sinon.spy( filteredView, 'filter' );

			view.search( 'foo' );

			sinon.assert.calledOnceWithExactly( spy, /foo/gi );
		} );

		it( 'should fire the #search event with the query and search stats', done => {
			filteredView.filter = () => {
				return {
					resultsCount: 1,
					totalItemsCount: 10
				};
			};

			view.on( 'search', ( evt, data ) => {
				expect( data ).to.deep.equal( {
					query: 'foo',
					resultsCount: 1,
					totalItemsCount: 10
				} );

				done();
			} );

			view.search( 'foo' );
		} );
	} );
} );
