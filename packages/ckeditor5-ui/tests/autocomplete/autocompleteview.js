/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, Event */

import {
	ListView,
	AutocompleteView,
	SearchTextView
} from '../../src';
import Locale from '@ckeditor/ckeditor5-utils/src/locale';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { Rect, global } from '@ckeditor/ckeditor5-utils';

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
					target: view.searchFieldView.element,
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

			it( 'resets the view when blurred', () => {
				const resetSpy = sinon.spy( view.searchFieldView, 'reset' );

				view.focusTracker.isFocused = true;
				view.focusTracker.isFocused = false;

				sinon.assert.calledOnce( resetSpy );
			} );
		} );
	} );
} );
