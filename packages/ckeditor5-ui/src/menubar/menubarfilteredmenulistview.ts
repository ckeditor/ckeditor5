/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/menubar/menubarmenulistview
 */

import type { Locale } from '@ckeditor/ckeditor5-utils';
import ListView from '../list/listview.js';
import type FilteredView from '../search/filteredview.js';
import MenuBarMenuListView from './menubarmenulistview.js';

/**
 * A list of menu bar items, a child of {@link module:ui/menubar/menubarmenuview~MenuBarMenuView#panelView}.
 *
 * Use this class to create a list of items (options, buttons) to be displayed in a menu bar.
 *
 * To populate this list, use {@link module:ui/menubar/menubarmenulistitemview~MenuBarMenuListItemView} instances.
 */
export default class MenuBarFilteredMenuListView extends MenuBarMenuListView implements FilteredView {
	/**
	 * Creates an instance of the list view.
	 *
	 * @param locale The localization services instance.
	 */
	constructor( locale: Locale ) {
		super( locale );

		this.role = 'menu';
	}

	/**
	 * @inheritDoc
	 */
	public filter( regExp: RegExp | null ): { resultsCount: number; totalItemsCount: number } {
		// const items: ViewCollection<ListItemGroupView | ListItemView | ListSeparatorView> = this.items;

		const totalItemsCount = 1;
		const resultsCount = 1;

		// for ( const groupView of items ) {
		// 	const group = groupView as ListItemGroupView;
		// 	const groupItems = group.items as ViewCollection<ListItemView>;
		// 	const isGroupLabelMatching = regExp && !!group.label.match( regExp );

		// 	( group.labelView as LabelWithHighlightView ).highlightText( isGroupLabelMatching ? regExp : null );

		// 	for ( const listItemView of groupItems ) {
		// 		const buttonView = listItemView.children.first as ButtonView;
		// 		const labelView = buttonView.labelView as ButtonLabelWithHighlightView;

		// 		if ( !regExp ) {
		// 			listItemView.isVisible = true;
		// 			labelView.highlightText( null );
		// 		} else {
		// 			const isItemLabelMatching = !!buttonView.label!.match( regExp );

		// 			labelView.highlightText( isItemLabelMatching ? regExp : null );

		// 			listItemView.isVisible = isGroupLabelMatching || isItemLabelMatching;
		// 		}
		// 	}

		// 	const visibleInGroupCount = groupItems.filter( listItemView => listItemView.isVisible ).length;

		// 	totalItemsCount += group.items.length;
		// 	resultsCount += isGroupLabelMatching ? group.items.length : visibleInGroupCount;
		// 	group.isVisible = isGroupLabelMatching || !!visibleInGroupCount;
		// }

		return {
			resultsCount,
			totalItemsCount
		};
	}
}
