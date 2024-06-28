/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ListItemGroupView from '../../../../src/list/listitemgroupview.js';

/**
 * Returns an array of objects representing the filtered dropdown menu entries.
 *
 * @param filteredListView The filtered list view.
 * @param attributes Additional dump attributes.
 * @returns An array of objects representing the filtered dropdown menu entries.
 */
export function dumpFoundFilteredDropdownMenuEntries( filteredListView, attributes = {} ) {
	const { htmlLabel } = attributes;
	const { items } = filteredListView;

	function pickLabel( viewElement ) {
		if ( htmlLabel ) {
			return viewElement.labelView.element.innerHTML;
		}

		return viewElement.label;
	}

	return Array.from( items ).map( itemOrGroup => {
		if ( itemOrGroup instanceof ListItemGroupView ) {
			return {
				type: 'Group',
				label: pickLabel( itemOrGroup ),
				children: dumpFoundFilteredDropdownMenuEntries( itemOrGroup, attributes )
			};
		}

		return {
			type: 'Item',
			label: pickLabel( itemOrGroup.children.first )
		};
	} );
}
