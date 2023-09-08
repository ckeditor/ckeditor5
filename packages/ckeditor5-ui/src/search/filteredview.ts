/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type { FocusableView } from '../focuscycler';
import type View from '../view';

/**
 * @module ui/search/filteredview
 */

/**
 * A view that can be filtered by a {@link module:ui/search/text/searchtextview~SearchTextView}.
 */
export default interface FilteredView extends View, FocusableView {

	/**
	 * Filters the view by the given regular expression.
	 */
	filter( regExp: RegExp | null ): {
		resultsCount: number;
		totalItemsCount: number;
	};
}
