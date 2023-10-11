/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type { FocusableView } from '../focuscycler';

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

	selectNext(): void;

	selectPrevious(): void;

	resetSelect(): void;
}

/**
 * Fired when the user picks an autocomplete option (e.g. by clicking on it). The event data should contain the selected value.
 *
 * @eventName ~FilteredView#execute
 */
export interface FilteredViewExecuteEvent {
	name: 'execute';
	args: [ { value: string } ];
}

/**
 * Fired when the user selects an autocomplete option (e.g. by using arrow keys). The event data should contain the selected value.
 *
 * @eventName ~FilteredView#select
 */
export interface FilteredViewSelectEvent {
	name: 'select';
	args: [ {
		selectedValue: any;
	} ];
}
