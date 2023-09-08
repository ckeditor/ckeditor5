/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/autocomplete/autocompleteview
*/

import { getOptimalPosition, type PositioningFunction, type Locale, global } from '@ckeditor/ckeditor5-utils';
import SearchTextView, { type SearchTextViewConfig } from '../search/text/searchtextview';
import type SearchResultsView from '../search/searchresultsview';

import '../../theme/components/autocomplete/autocomplete.css';

/**
 * The autocomplete component's view class. It extends the {@link module:ui/search/text/searchtextview~SearchTextView} class
 * with a floating {@link #resultsView} that shows up when the user starts typing and hides when they blur
 * the component.
 */
export default class AutocompleteView extends SearchTextView {
	/**
	 * @inheritDoc
	 */
	constructor( locale: Locale, config: SearchTextViewConfig ) {
		super( locale, config );

		this.extendTemplate( {
			attributes: {
				class: [ 'ck-autocomplete' ]
			}
		} );

		const resultsView = this.resultsView as AutocompleteResultsView;
		const bindResultsView = resultsView.bindTemplate;

		resultsView.set( 'isVisible', false );
		resultsView.set( '_position', 's' );

		resultsView.extendTemplate( {
			attributes: {
				class: [
					bindResultsView.if( 'isVisible', 'ck-hidden', value => !value ),
					bindResultsView.to( '_position', value => `ck-search__results_${ value }` )
				]
			}
		} );

		this.focusTracker.on( 'change:isFocused', ( evt, name, isFocused ) => {
			resultsView.isVisible = isFocused;

			if ( isFocused ) {
				this._updateResultsViewPosition();
			} else {
				this.searchFieldView.reset();
			}
		} );

		// TODO: This needs to be debounced down the road.
		this.listenTo( global.document, 'scroll', () => {
			if ( resultsView.isVisible ) {
				this._updateResultsViewPosition();
			}
		} );
	}

	/**
	 * Updates the position of the results view on demand.
	 */
	private _updateResultsViewPosition() {
		( this.resultsView as AutocompleteResultsView )._position = AutocompleteView._getOptimalPosition( {
			element: this.resultsView.element!,
			target: this.searchFieldView.element!,
			fitInViewport: true,
			positions: AutocompleteView.defaultResultsPositions
		} ).name as string;
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
interface AutocompleteResultsView extends SearchResultsView {

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
}
