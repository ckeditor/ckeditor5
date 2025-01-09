/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { FocusableView } from '../focuscycler.js';

/**
 * @module ui/search/filteredview
 */

/**
 * A view that can be filtered by a {@link module:ui/search/text/searchtextview~SearchTextView}.
 */
export default interface FilteredView extends FocusableView {

	/**
	 * Filters the view by the given regular expression.
	 */
	filter( regExp: RegExp | null ): {
		resultsCount: number;
		totalItemsCount: number;
	};
}

/**
 * Fired when the user selects an autocomplete option. The event data should contain the selected value.
 *
 * @eventName ~FilteredView#execute
 */
export interface FilteredViewExecuteEvent {
	name: 'execute';
	args: [ { value: string } ];
}
