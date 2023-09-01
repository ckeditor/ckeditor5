/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/autocomplete/autocompleteview
*/

import { getOptimalPosition, type PositioningFunction, type Locale, global } from '@ckeditor/ckeditor5-utils';
import SearchView, { type SearchViewConfig } from '../search/searchview';
import type SearchResultsView from '../search/searchresultsview';

import '../../theme/components/autocomplete/autocomplete.css';

/**
 * TODO
 */
export default class AutocompleteView extends SearchView {
	/**
	 * TODO
	 *
	 * @param locale
	 * @param config
	 */
	constructor( locale: Locale, config: SearchViewConfig ) {
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

			this._updateResultsViewPosition();

			if ( !isFocused ) {
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
	 * TODO
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
	 * TODO
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
 * TODO
 */
interface AutocompleteResultsView extends SearchResultsView {

	/**
	 * TODO
	 */
	isVisible: boolean;

	/**
	 * TODO
	 *
	 * @internal
	 */
	_position: string;
}
