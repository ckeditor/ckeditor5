/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/list/listviewfilter
 */

import type ButtonView from '../button/buttonview.js';
import type ButtonLabelWithHighlightView from '../highlightedtext/buttonlabelwithhighlightview.js';
import type LabelWithHighlightView from '../highlightedtext/labelwithhighlightview.js';
import type ViewCollection from '../viewcollection.js';
import type ListItemGroupView from './listitemgroupview.js';
import type ListItemView from './listitemview.js';
import type ListSeparatorView from './listseparatorview.js';

/**
 * A filter function that returns matching item and group names in the list view.
 */
export default function filterIncludingGroupNames(
	regExp: RegExp | null,
	items: ViewCollection<ListItemGroupView | ListItemView | ListSeparatorView>
): {
	resultsCount: number;
	totalItemsCount: number;
} {
	let totalItemsCount = 0;
	let resultsCount = 0;

	for ( const groupView of items ) {
		const group = groupView as ListItemGroupView;
		const groupItems = group.items as ViewCollection<ListItemView>;
		const isGroupLabelMatching = regExp && !!group.label.match( regExp );

		( group.labelView as LabelWithHighlightView ).highlightText( isGroupLabelMatching ? regExp : null );

		for ( const listItemView of groupItems ) {
			const buttonView = listItemView.children.first as ButtonView;
			const labelView = buttonView.labelView as ButtonLabelWithHighlightView;

			if ( !regExp ) {
				listItemView.isVisible = true;
				labelView.highlightText( null );
			} else {
				const isItemLabelMatching = !!buttonView.label!.match( regExp );

				labelView.highlightText( isItemLabelMatching ? regExp : null );

				listItemView.isVisible = isGroupLabelMatching || isItemLabelMatching;
			}
		}

		const visibleInGroupCount = groupItems.filter( listItemView => listItemView.isVisible ).length;

		totalItemsCount += group.items.length;
		resultsCount += isGroupLabelMatching ? group.items.length : visibleInGroupCount;
		group.isVisible = isGroupLabelMatching || !!visibleInGroupCount;
	}

	return {
		resultsCount,
		totalItemsCount
	};
}
