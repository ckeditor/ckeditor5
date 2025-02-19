/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/search/text/searchtextview
*/

import { FocusTracker, KeystrokeHandler, type Locale } from '@ckeditor/ckeditor5-utils';
import View from '../../view.js';
import { default as SearchTextQueryView, type SearchTextQueryViewConfig } from './searchtextqueryview.js';
import SearchInfoView from '../searchinfoview.js';
import SearchResultsView from '../searchresultsview.js';
import FocusCycler, { type FocusableView } from '../../focuscycler.js';
import { escapeRegExp } from 'es-toolkit/compat';

import type FilteredView from '../filteredview.js';
import type ViewCollection from '../../viewcollection.js';
import type InputBase from '../../input/inputbase.js';
import type InputTextView from '../../inputtext/inputtextview.js';

import '../../../theme/components/search/search.css';

/**
 * A search component that allows filtering of an arbitrary view based on a search query
 * specified by the user in a text field.
 *
 *```ts
 * // This view must specify the `filter()` and `focus()` methods.
 * const filteredView = ...;
 *
 * const searchView = new SearchTextView( locale, {
 * 	searchFieldLabel: 'Search list items',
 * 	filteredView
 * } );
 *
 * view.render();
 *
 * document.body.append( view.element );
 * ```
 */
export default class SearchTextView<
	TQueryFieldView extends InputBase<HTMLInputElement | HTMLTextAreaElement> = InputTextView
> extends View {
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
	public infoView: FocusableView | undefined;

	/**
	 * The view that allows the user to enter the search query.
	 */
	public queryView: SearchTextQueryView<TQueryFieldView>;

	/**
	 * Controls whether the component is in read-only mode.
	 *
	 * @default true
	 * @observable
	 */
	declare public isEnabled: boolean;

	/**
	 * The number of results found for the current search query. Updated upon the {@link #search} event.
	 *
	 * @default 0
	 * @observable
	 */
	declare public resultsCount: number;

	/**
	 * The number of the items that can be searched in the {@link #filteredView}. Updated upon the {@link #search} event.
	 *
	 * @default 0
	 * @observable
	 */
	declare public totalItemsCount: number;

	/**
	 * The collection of children of the view.
	 *
	 * @readonly
	 */
	declare public readonly children: ViewCollection;

	/**
	 * The collection of focusable children of the view. Used by the focus management logic.
	 *
	 * @readonly
	 */
	declare public readonly focusableChildren: ViewCollection<FocusableView>;

	public declare locale: Locale;

	/**
	 * Provides the focus management (keyboard navigation) between {@link #queryView} and {@link #filteredView}.
	 *
	 * @readonly
	 */
	public focusCycler: FocusCycler;

	/**
	 * The cached configuration object.
	 *
	 * @internal
	 */
	protected _config: SearchTextViewConfig<TQueryFieldView>;

	/**
	 * Creates an instance of the {@link module:ui/search/text/searchtextview~SearchTextView} class.
	 *
	 * @param locale The localization services instance.
	 * @param config Configuration of the view.
	 */
	constructor( locale: Locale, config: SearchTextViewConfig<TQueryFieldView> ) {
		super( locale );

		this._config = config;

		this.filteredView = config.filteredView;
		this.queryView = this._createSearchTextQueryView();
		this.focusTracker = new FocusTracker();
		this.keystrokes = new KeystrokeHandler();
		this.resultsView = new SearchResultsView( locale );
		this.children = this.createCollection();
		this.focusableChildren = this.createCollection( [ this.queryView, this.resultsView ] );

		this.set( 'isEnabled', true );
		this.set( 'resultsCount', 0 );
		this.set( 'totalItemsCount', 0 );

		if ( config.infoView && config.infoView.instance ) {
			this.infoView = config.infoView.instance;
		} else {
			this.infoView = new SearchInfoView();
			this._enableDefaultInfoViewBehavior();

			this.on( 'render', () => {
				// Initial search that determines if there are any searchable items
				// and displays the corresponding info text.
				this.search( '' );
			} );
		}

		this.resultsView.children.addMany( [ this.infoView, this.filteredView ] );

		this.focusCycler = new FocusCycler( {
			focusables: this.focusableChildren,
			focusTracker: this.focusTracker,
			keystrokeHandler: this.keystrokes,
			actions: {
				// Navigate form fields backwards using the Shift + Tab keystroke.
				focusPrevious: 'shift + tab',

				// Navigate form fields forwards using the Tab key.
				focusNext: 'tab'
			}
		} );

		this.on<SearchTextViewSearchEvent>( 'search', ( evt, { resultsCount, totalItemsCount } ) => {
			this.resultsCount = resultsCount;
			this.totalItemsCount = totalItemsCount;
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
			children: this.children
		} );
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		this.children.addMany( [
			this.queryView,
			this.resultsView
		] );

		const stopPropagation = ( data: Event ) => data.stopPropagation();

		for ( const focusableChild of this.focusableChildren ) {
			this.focusTracker.add( focusableChild.element as HTMLElement );
		}

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
	 * Focuses the {@link #queryView}.
	 */
	public focus(): void {
		this.queryView.focus();
	}

	/**
	 * Resets the component to its initial state.
	 */
	public reset(): void {
		this.queryView.reset();
		this.search( '' );
		this.filteredView.element!.scrollTo( 0, 0 );
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

		this.fire<SearchTextViewSearchEvent>( 'search', { query, ...filteringResults } );
	}

	/**
	 * Creates a search field view based on configured creator..
	 */
	private _createSearchTextQueryView(): SearchTextQueryView<TQueryFieldView> {
		const queryView = new SearchTextQueryView<TQueryFieldView>( this.locale, this._config.queryView );

		this.listenTo( queryView.fieldView, 'input', () => {
			this.search( queryView.fieldView.element!.value );
		} );

		queryView.on( 'reset', () => this.reset() );
		queryView.bind( 'isEnabled' ).to( this );

		return queryView;
	}

	/**
	 * Initializes the default {@link #infoView} behavior with default text labels when no custom info view
	 * was specified in the view config.
	 */
	private _enableDefaultInfoViewBehavior(): void {
		const t = this.locale.t;
		const infoView = this.infoView as SearchInfoView;

		this.on<SearchTextViewSearchEvent>( 'search', ( evt, data ) => {
			if ( !data.resultsCount ) {
				const defaultTextConfig = this._config.infoView && this._config.infoView.text;
				let primaryText, secondaryText;

				if ( data.totalItemsCount ) {
					if ( defaultTextConfig?.notFound ) {
						primaryText = defaultTextConfig.notFound.primary;
						secondaryText = defaultTextConfig.notFound.secondary;
					} else {
						primaryText = t( 'No results found' );
						secondaryText = '';
					}
				} else {
					if ( defaultTextConfig?.noSearchableItems ) {
						primaryText = defaultTextConfig.noSearchableItems.primary;
						secondaryText = defaultTextConfig.noSearchableItems.secondary;
					} else {
						primaryText = t( 'No searchable items' );
						secondaryText = '';
					}
				}

				infoView.set( {
					primaryText: normalizeInfoText( primaryText, data ),
					secondaryText: normalizeInfoText( secondaryText!, data ),
					isVisible: true
				} );
			} else {
				infoView.set( {
					isVisible: false
				} );
			}
		} );

		function normalizeInfoText(
			text: SearchTextViewDefaultInfoText,
			{ query, resultsCount, totalItemsCount }: SearchTextViewSearchEvent[ 'args' ][ 0 ]
		) {
			return typeof text === 'function' ? text( query, resultsCount, totalItemsCount ) : text;
		}
	}
}

/**
 * The configuration of the {@link module:ui/search/text/searchtextview~SearchTextView} class.
 */
export interface SearchTextViewConfig<TConfigSearchField extends InputBase<HTMLInputElement | HTMLTextAreaElement>> {

	/**
	 * The configuration of the view's query field.
	 */
	queryView: SearchTextQueryViewConfig<TConfigSearchField>;

	/**
	 * The view that is filtered by the search query.
	 */
	filteredView: FilteredView;

	/**
	 * The view that displays the information about the search results.
	 */
	infoView?: {

		/**
		 * The view that displays the information about the search results. If not specified,
		 * {@link module:ui/search/searchinfoview~SearchInfoView} is used.
		 */
		instance?: FocusableView;

		/**
		 * The configuration of text labels displayed in the {@link #infoView} in different states
		 * of the search component.
		 *
		 * **Note**: This configuration is only used when the {@link #infoView} is **not** specified.
		 * In other cases, please use the {@link module:ui/search/searchview~SearchTextViewSearchEvent} to bring about
		 * your own info text logic.
		 */
		text?: {
			notFound?: {
				primary: SearchTextViewDefaultInfoText;
				secondary?: SearchTextViewDefaultInfoText;
			};
			noSearchableItems?: {
				primary: SearchTextViewDefaultInfoText;
				secondary?: SearchTextViewDefaultInfoText;
			};
		};
	};

	/**
	 * The custom CSS class name to be added to the search view element.
	 */
	class?: string;
}

/**
 * Describes value of a info text configuration in {@link module:ui/search/text/searchtextview~SearchTextViewConfig}.
 * A string or a function that returns a string with the information about the search results.
 */
export type SearchTextViewDefaultInfoText = string | ( ( query: string, resultsCount: number, totalItemsCount: number ) => string );

/**
 * An event fired when the search query changes fired by {@link module:ui/search/text/searchtextview~SearchTextView#search}.
 *
 * @eventName ~SearchTextView#search
 */
export type SearchTextViewSearchEvent = {
	name: 'search';
	args: [ SearchTextViewSearchEventData ];
};

export type SearchTextViewSearchEventData = {

	/**
	 * The search query string.
	 */
	query: string;

	/**
	 * The number of results found for the current search query.
	 */
	resultsCount: number;

	/**
	 * The number of the items that can be searched.
	 */
	totalItemsCount: number;
};
