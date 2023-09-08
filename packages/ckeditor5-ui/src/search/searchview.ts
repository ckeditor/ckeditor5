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
import SearchInfoView from './searchinfoview';
import SearchResultsView from './searchresultsview';
import type LabeledFieldView from '../labeledfield/labeledfieldview';
import type InputView from '../input/inputview';
import type FilteredView from './filteredview';
import { escapeRegExp } from 'lodash-es';
import FocusCycler from '../focuscycler';

import '../../theme/components/search/search.css';

/**
 * A search component that allows filtering of an arbitrary view based on a search query
 * specified by the user.
 *
 *```ts
 * // This view must specify the `filter()` and `focus()` methods.
 * const filteredView = ...;
 *
 * const searchView = new SearchView( locale, {
 * 	searchFieldLabel: 'Search list items',
 * 	filteredView
 * } );
 *
 * view.render();
 *
 * document.body.append( view.element );
 * ```
 */
export default class SearchView extends View {
	/**
	 * Tracks information about the DOM focus in the view.
	 *
	 * @readonly
	 */
	public focusTracker: FocusTracker;

	/**
	 * An instance of the keystroke handler managing user interaction and accessibility.
	 *
	 * @readonly
	 */
	public keystrokes: KeystrokeHandler;

	/**
	 * A view hosting the {@link #filteredView} passed in the configuration and the {@link #infoView}.
	 */
	public resultsView: SearchResultsView;

	/**
	 * The view that is filtered by the search query.
	 */
	public filteredView: FilteredView;

	/**
	 * The view that displays the information about the search results.
	 */
	public infoView: View | undefined;

	/**
	 * The view that allows the user to enter the search query.
	 */
	public searchFieldView: SearchFieldView;

	/**
	 * Provides the focus management (keyboard navigation) between {@link #searchFieldView} and {@link #filteredView}.
	 *
	 * @readonly
	 */
	private _focusCycler: FocusCycler;

	/**
	 * The cached configuration object.
	 *
	 * @internal
	 */
	private _config: SearchViewConfig;

	/**
	 * Creates an instance of the {@link module:ui/search/searchview~SearchView} class.
	 *
	 * @param locale The localization services instance.
	 * @param config Configuration of the view.
	 */
	constructor( locale: Locale, config: SearchViewConfig ) {
		super( locale );

		this._config = config;

		this.filteredView = config.filteredView;
		this.searchFieldView = this._createSearchFieldView( locale, config.searchFieldLabel );
		this.focusTracker = new FocusTracker();
		this.keystrokes = new KeystrokeHandler();
		this.resultsView = new SearchResultsView( locale );

		if ( !config.infoView ) {
			this.infoView = new SearchInfoView();
			this._enableDefaultInfoViewBehavior();

			this.on( 'render', () => {
				// Initial search that determines if there are any searchable items
				// and displays the corresponding info text.
				this.search( '' );
			} );
		} else {
			this.infoView = config.infoView;
		}

		this.resultsView.children.addMany( [ this.infoView, this.filteredView ] );

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
	 * Searches the {@link #filteredView} for the given query.
	 *
	 * @internal
	 * @param query The search query string.
	 */
	public search( query: string ): void {
		const regExp = query ? new RegExp( escapeRegExp( query ), 'ig' ) : null;
		const filteringResults = this.filteredView.filter( regExp );

		this.fire( 'search', { query, ...filteringResults } );
	}

	/**
	 * Creates a search field view based on configured creator..
	 *
	 * @param locale The localization services instance.
	 * @param label The label of the search field.
	 */
	private _createSearchFieldView( locale: Locale, label: string ): SearchFieldView {
		const searchFieldView = new SearchFieldView( locale, this._config.searchFieldInputCreator, label );

		this.listenTo( searchFieldView.fieldView, 'input', () => {
			this.search( searchFieldView.fieldView.element!.value );
		} );

		searchFieldView.on( 'reset', () => this.reset() );

		return searchFieldView;
	}

	/**
	 * Initializes the default {@link #infoView} behavior with default text labels when no custom info view
	 * was specified in the view config.
	 */
	private _enableDefaultInfoViewBehavior(): void {
		const t = this.locale!.t;
		const infoView = this.infoView as SearchInfoView;

		this.on<SearchViewSearchEvent>( 'search', ( evt, data ) => {
			if ( !data.resultsCount ) {
				const infoViewTextConfig = this._config.infoViewTextConfig;
				let primaryText, secondaryText;

				if ( data.totalItemsCount ) {
					primaryText = infoViewTextConfig?.notFound?.primary || t( 'No results found' );
					secondaryText = infoViewTextConfig?.notFound?.secondary || '';
				} else {
					primaryText = infoViewTextConfig?.noSearchableItems?.primary || t( 'No searchable items' );
					secondaryText = infoViewTextConfig?.noSearchableItems?.secondary || '';
				}

				infoView.set( {
					primaryText: normalizeInfoText( primaryText, data ),
					secondaryText: normalizeInfoText( secondaryText, data ),
					isVisible: true
				} );
			} else {
				infoView.set( {
					isVisible: false
				} );
			}
		} );

		function normalizeInfoText(
			text: SearchViewDefaultInfoText,
			{ query, resultsCount, totalItemsCount }: SearchViewSearchEvent[ 'args' ][ 0 ]
		) {
			return typeof text === 'function' ? text( query, resultsCount, totalItemsCount ) : text;
		}
	}
}

/**
 * The configuration of the {@link module:ui/search/searchview~SearchView} class.
 */
export type SearchViewConfig = {

	/**
	 * The view that is filtered by the search query.
	 */
	filteredView: FilteredView;

	/**
	 * The human-readable label of the search field.
	 */
	searchFieldLabel: string;

	/**
	 * The function that creates the search field input view. By default, a plain
	 * {@link module:ui/inputtext/inputtextview~InputTextView} is used for this purpose.
	 */
	searchFieldInputCreator?: ConstructorParameters<typeof LabeledFieldView<InputView>>[ 1 ];

	/**
	 * The custom CSS class name to be added to the search view element.
	 */
	class?: string;

	/**
	 * The view that displays the information about the search results. If not specified,
	 * {@link module:ui/search/searchinfoview~SearchInfoView} is used.
	 */
	infoView?: View;

	/**
	 * The configuration of text labels displayed in the {@link #infoView} in different states
	 * of the search component.
	 *
	 * **Note**: This configuration is only used when the {@link #infoView} is **not** specified.
	 * In other cases, please use the {@link module:ui/search/searchview~SearchViewSearchEvent} to bring about
	 * your own info text logic.
	 */
	infoViewTextConfig?: {
		notFound?: {
			primary: SearchViewDefaultInfoText;
			secondary?: SearchViewDefaultInfoText;
		};
		noSearchableItems?: {
			primary: SearchViewDefaultInfoText;
			secondary?: SearchViewDefaultInfoText;
		};
	};
};

/**
 * Describes value of a info text configuration in {@link module:ui/search/searchview~SearchViewConfig}.
 * A string or a function that returns a string with the information about the search results.
 */
export type SearchViewDefaultInfoText = string | ( ( query: string, resultsCount: number, totalItemsCount: number ) => string );

/**
 * An event fired when the search query changes fired by {@link module:ui/search/searchview~SearchView#search}.
 *
 * @eventName ~SearchView#search
 */
export type SearchViewSearchEvent = {
	name: 'search';
	args: [ {
		query: string;
		resultsCount: number;
		totalItemsCount: number;
	} ];
};
