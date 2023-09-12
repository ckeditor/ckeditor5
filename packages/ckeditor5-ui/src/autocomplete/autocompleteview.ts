/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/autocomplete/autocompleteview
*/

import { getOptimalPosition, type PositioningFunction, type Locale, global, toUnit, Rect } from '@ckeditor/ckeditor5-utils';
import SearchTextView, { type SearchTextViewConfig } from '../search/text/searchtextview';
import type SearchResultsView from '../search/searchresultsview';
import type InputBase from '../input/inputbase';

import '../../theme/components/autocomplete/autocomplete.css';

/**
 * The autocomplete component's view class. It extends the {@link module:ui/search/text/searchtextview~SearchTextView} class
 * with a floating {@link #resultsView} that shows up when the user starts typing and hides when they blur
 * the component.
 */
export default class AutocompleteView<
	TQueryFieldView extends InputBase<HTMLInputElement | HTMLTextAreaElement>
> extends SearchTextView<TQueryFieldView> {
	/**
	 * @inheritDoc
	 */
	constructor( locale: Locale, config: AutocompleteViewConfig<TQueryFieldView> ) {
		super( locale, config );

		const toPx = toUnit( 'px' );

		this.extendTemplate( {
			attributes: {
				class: [ 'ck-autocomplete' ]
			}
		} );

		const resultsView = this.resultsView as AutocompleteResultsView;
		const bindResultsView = resultsView.bindTemplate;

		resultsView.set( 'isVisible', false );
		resultsView.set( '_position', 's' );
		resultsView.set( '_width', 0 );

		this._config = config;

		resultsView.extendTemplate( {
			attributes: {
				class: [
					bindResultsView.if( 'isVisible', 'ck-hidden', value => !value ),
					bindResultsView.to( '_position', value => `ck-search__results_${ value }` )
				],
				style: {
					width: bindResultsView.to( '_width', value => toPx( value ) )
				}
			}
		} );

		this.focusTracker.on( 'change:isFocused', ( evt, name, isFocused ) => {
			resultsView.isVisible = this._shouldShowResults;

			if ( isFocused ) {
				this._updateResultsViewPosition();

				// Reset the scroll position of the results view whenever the autocomplete reopens.
				this.resultsView.element!.scrollTop = 0;
			} else if ( config.resetOnBlur ) {
				this.queryView.reset();
			}
		} );

		// TODO: This needs to be debounced down the road.
		this.listenTo( global.document, 'scroll', () => {
			if ( resultsView.isVisible ) {
				this._updateResultsViewPosition();
			}
		} );

		this.on( 'change:isEnabled', () => {
			if ( !this._shouldShowResults ) {
				resultsView.isVisible = false;
			}
		} );

		this.on( 'search', () => {
			if ( !this._shouldShowResults ) {
				resultsView.isVisible = false;
			}
		}, { priority: 'low' } );
	}

	/**
	 * Updates the position of the results view on demand.
	 */
	private _updateResultsViewPosition() {
		const resultsView = ( this.resultsView as AutocompleteResultsView );

		resultsView._width = new Rect( this.queryView.element! ).width;

		resultsView._position = AutocompleteView._getOptimalPosition( {
			element: this.resultsView.element!,
			target: this.queryView.element!,
			fitInViewport: true,
			positions: AutocompleteView.defaultResultsPositions
		} ).name as string;
	}

	/**
	 * TODO
	 */
	private get _queryLength(): number {
		return this.queryView.fieldView.element!.value.length;
	}

	/**
	 * TODO
	 */
	private get _shouldShowResults(): boolean {
		const config = this._config as AutocompleteViewConfig<TQueryFieldView>;
		const queryMinChars = typeof config.queryMinChars === 'undefined' ? 0 : config.queryMinChars;

		return this.focusTracker.isFocused && this.isEnabled && this._queryLength >= queryMinChars;
	}

	/**
	 * Positions for the autocomplete results view. Two positions are defined by default:
	 * * `s` - below the search field,
	 * * `n` - above the search field.
	 */
	public static defaultResultsPositions: Array<PositioningFunction> = [
		( fieldRect => {
			return {
				top: fieldRect.bottom,
				left: fieldRect.left,
				name: 's'
			};
		} ) as PositioningFunction,
		( ( fieldRect, resultsRect ) => {
			return {
				top: fieldRect.top - resultsRect.height,
				left: fieldRect.left,
				name: 'n'
			};
		} ) as PositioningFunction
	];

	/**
	 * A function used to calculate the optimal position for the dropdown panel.
	 */
	private static _getOptimalPosition = getOptimalPosition;
}

/**
 * An interface describing additional properties of the floating search results view used by the autocomplete plugin.
 */
export interface AutocompleteResultsView extends SearchResultsView {

	/**
	 * Controls the visibility of the results view.
	 *
	 * @observable
	 */
	isVisible: boolean;

	/**
	 * Controls the position (CSS class suffix) of the results view.
	 *
	 * @internal
	*/
	_position: string;

	/**
	 * TODO
	 *
	 * @internal
	 */
	_width: number;
}

export interface AutocompleteViewConfig<
	TConfigInputCreator extends InputBase<HTMLInputElement | HTMLTextAreaElement>
> extends SearchTextViewConfig<TConfigInputCreator> {

	/**
	 * When set `true`, the query view will be reset when the autocomplete view loses focus.
	 */
	resetOnBlur?: boolean;

	/**
	 * Minimum number of characters that need to be typed before the search is performed.
	 */
	queryMinChars?: number;
}
