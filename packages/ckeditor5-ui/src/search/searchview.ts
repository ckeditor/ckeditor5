/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/search/searchview
*/

import { FocusTracker, KeystrokeHandler, type Locale } from '@ckeditor/ckeditor5-utils';
import View from '../view';
import SearchFieldView from './searchfieldview';
import SearchResultsView from './searchresultsview';
import type FilteredView from './filteredview';
import { createLabeledInputText } from '../labeledfield/utils';
import { escapeRegExp } from 'lodash-es';
import FocusCycler from '../focuscycler';

import '../../theme/components/search/search.css';

/**
 * TODO: A search component.
 *
 * @extends module:ui/view~View
 */
export default class SearchView extends View {
	/**
	 * Tracks information about the DOM focus in the view.
	 *
	 * @readonly
	 */
	public focusTracker: FocusTracker;

	/**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 *
	 * @readonly
	 */
	public keystrokes: KeystrokeHandler;

	/**
	 * TODO
	 */
	public resultsView: SearchResultsView;

	/**
	 * TODO
	 */
	public filteredView: FilteredView;

	/**
	 * TODO
	 */
	public searchFieldView: SearchFieldView;

	/**
	 * Helps cycling over {@link #children} in the view.
	 *
	 * @readonly
	 * @internal
	 */
	private _focusCycler: FocusCycler;

	/**
	 * Creates an instance of the {@link module:ui/search/searchview~SearchView} class.
	 *
	 * @param locale The localization services instance.
	 * @param commands The object of all grouped commands.
	 * @param label TODO
	 */
	constructor( locale: Locale, config: SearchViewConfig ) {
		super( locale );

		this.filteredView = config.filteredView;
		this.searchFieldView = this._createSearchFieldView( locale, config.searchFieldLabel );
		this.focusTracker = new FocusTracker();
		this.keystrokes = new KeystrokeHandler();
		this.resultsView = new SearchResultsView( locale );

		this.resultsView.children.add( this.filteredView );

		this._focusCycler = new FocusCycler( {
			focusables: this.createCollection( [ this.searchFieldView, this.filteredView ] ),
			focusTracker: this.focusTracker,
			keystrokeHandler: this.keystrokes,
			actions: {
				// Navigate form fields backwards using the Shift + Tab keystroke.
				focusPrevious: 'shift + tab',

				// Navigate form fields forwards using the Tab key.
				focusNext: 'tab'
			}
		} );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-search',
					config.class || null
				],

				tabindex: '-1'
			},
			children: [
				this.searchFieldView,
				this.resultsView
			]
		} );
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		const stopPropagation = ( data: Event ) => data.stopPropagation();

		this.focusTracker.add( this.searchFieldView.element as Element );
		this.focusTracker.add( this.filteredView.element as Element );

		// Start listening for the keystrokes coming from #element.
		this.keystrokes.listenTo( this.element as HTMLElement );

		// Since the form is in the dropdown panel which is a child of the toolbar, the toolbar's
		// keystroke handler would take over the key management in the URL input. We need to prevent
		// this ASAP. Otherwise, the basic caret movement using the arrow keys will be impossible.
		this.keystrokes.set( 'arrowright', stopPropagation );
		this.keystrokes.set( 'arrowleft', stopPropagation );
		this.keystrokes.set( 'arrowup', stopPropagation );
		this.keystrokes.set( 'arrowdown', stopPropagation );
	}

	/**
	 * Focuses the {@link #searchFieldView}.
	 */
	public focus(): void {
		this.searchFieldView.focus();
	}

	/**
	 * Resets the component to its initial state.
	 */
	public reset(): void {
		this.searchFieldView.reset();
		this.search( '' );
	}

	/**
	 * TODO
	 *
	 * @internal
	 * @param query The search query string.
	 */
	public search( query: string ): void {
		const regExp = query ? new RegExp( escapeRegExp( query ), 'ig' ) : null;
		const numberOfResults = this.filteredView.filter( regExp );

		this.fire( 'search', { query, numberOfResults } );
	}

	/**
	 * TODO
	 *
	 * @internal
	 * @param locale The localization services instance.
	 * @param label TODO
	 */
	private _createSearchFieldView( locale: Locale, label: string ): SearchFieldView {
		const searchFieldView = new SearchFieldView( locale, createLabeledInputText, label );

		this.listenTo( searchFieldView.fieldView, 'input', () => {
			this.search( searchFieldView.fieldView.element!.value );
		} );

		searchFieldView.on( 'reset', () => this.reset() );

		return searchFieldView;
	}
}

/**
 * TODO
 */
export type SearchViewConfig = {
	filteredView: FilteredView;
	searchFieldLabel: string;
	class?: string;
};

/**
 * TODO
 *
 * @eventName ~SearchView#search
 */
export type SearchViewSearchEvent = {
	name: 'search';
	args: [ {
		query: string;
		numberOfResults: number;
	} ];
};
