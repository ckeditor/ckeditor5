/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/filterview/dropdownmenulistfounditemsview
 */

import type { Locale } from '@ckeditor/ckeditor5-utils';
import type {
	DropdownMenusViewsFilteredFlatItem,
	DropdownMenusViewsFilteredTreeNode
} from '../search/filterdropdownmenutree.js';

import ButtonLabelWithHighlightView from '../../../button/buttonlabelwithhighlightview.js';
import ButtonView from '../../../button/buttonview.js';
import LabelWithHighlightView from '../../../label/labelwithhighlightview.js';
import ListItemGroupView from '../../../list/listitemgroupview.js';
import ListItemView from '../../../list/listitemview.js';
import ListView from '../../../list/listview.js';

import { groupDropdownTreeByFirstFoundParent } from '../search/groupdropdowntreebyfirstfoundparent.js';

/**
 * Represents a view for the found list in the dropdown menu list.
 */
export default class DropdownMenuListFoundItemsView extends ListView {
	/**
	 * Creates a new instance of the DropdownMenuListFoundItemsView class.
	 *
	 * @param locale The locale object.
	 * @param highlightRegex The regular expression used for highlighting.
	 * @param tree The filtered tree node.
	 */
	constructor( locale: Locale, highlightRegex: RegExp | null, tree: DropdownMenusViewsFilteredTreeNode ) {
		super( locale );

		const items = this._createFilteredTreeListBox( highlightRegex, tree );

		this.role = 'listbox';

		if ( items.length ) {
			this.items.addMany( items );
		}
	}

	/**
	 * Creates a filtered tree list box based on the provided highlight regex and tree data.
	 *
	 * @param highlightRegex The regular expression used for highlighting the filtered items.
	 * @param tree The tree data used to create the filtered tree list box.
	 * @returns An array of ListItemGroupView or ListItemView objects representing the filtered tree list box.
	 */
	private _createFilteredTreeListBox(
		highlightRegex: RegExp | null,
		tree: DropdownMenusViewsFilteredTreeNode
	): Array<ListItemGroupView | ListItemView> {
		const { locale } = this;
		const groupedFlatEntries = groupDropdownTreeByFirstFoundParent( tree );

		// Map each flat child node to a ListItemView
		const mapFlatChildNodeToView = ( entry: DropdownMenusViewsFilteredFlatItem ): ListItemView => {
			const listItemView = new ListItemView( locale );
			const labelView = new ButtonLabelWithHighlightView();
			const button = new ButtonView( locale, labelView );

			button.set( {
				label: entry.search.raw,
				withText: true,
				role: 'option'
			} );

			listItemView.children.add( button );
			labelView.highlightText( highlightRegex );

			button.delegate( 'execute' ).to( entry.item );
			button.bind( 'isEnabled' ).to( entry.item, 'isEnabled' );

			return listItemView;
		};

		// Create the filtered tree list box
		return groupedFlatEntries.flatMap<ListItemGroupView | ListItemView>( ( { parent, children } ) => {
			const listItems = children.map( mapFlatChildNodeToView );

			if ( parent.kind === 'Root' ) {
				return listItems;
			}

			const labelView = new LabelWithHighlightView();
			const groupView = new ListItemGroupView( locale, labelView );

			groupView.label = parent.search.raw;
			groupView.items.addMany( listItems );

			labelView.highlightText( highlightRegex );

			return [ groupView ];
		} );
	}
}
