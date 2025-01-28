/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/list/listitemgroupview
 */

import View from '../view.js';
import type ViewCollection from '../viewcollection.js';
import ListView from './listview.js';
import type ListItemView from './listitemview.js';
import LabelView from '../label/labelview.js';
import ListSeparatorView from './listseparatorview.js';

import { type Locale } from '@ckeditor/ckeditor5-utils';

/**
 * The list item group view class.
 */
export default class ListItemGroupView extends View {
	/**
	 * The visible label of the group.
	 *
	 * @observable
	 * @default ''
	 */
	declare public label: string;

	/**
	 * Label of the group view. Its text is configurable using the {@link #label label attribute}.
	 *
	 * If a custom label view is not passed in `ListItemGroupView` constructor, the label is an instance
	 * of {@link module:ui/label/labelview~LabelView}.
	 */
	public readonly labelView: LabelView;

	/**
	 * Collection of the child list items inside this group.
	 */
	public readonly items: ListView[ 'items' ];

	/**
	 * Collection of the child elements of the group.
	 */
	public readonly children: ViewCollection;

	/**
	 * Controls whether the item view is visible. Visible by default, list items are hidden
	 * using a CSS class.
	 *
	 * @observable
	 * @default true
	 */
	declare public isVisible: boolean;

	/**
	 * Creates an instance of the list item group view class.
	 *
	 * @param locale The {@link module:core/editor/editor~Editor#locale} instance.
	 * @param labelView The instance of the group's label. If not provided, an instance of
	 * {@link module:ui/label/labelview~LabelView} is used.
	 */
	constructor( locale?: Locale, labelView: LabelView = new LabelView() ) {
		super( locale );

		const bind = this.bindTemplate;
		const nestedList = new ListView( locale );

		this.set( {
			label: '',
			isVisible: true
		} );

		this.labelView = labelView;
		this.labelView.bind( 'text' ).to( this, 'label' );

		this.children = this.createCollection();
		this.children.addMany( [ this.labelView, nestedList ] );

		nestedList.set( {
			role: 'group',
			ariaLabelledBy: labelView.id
		} );

		// Disable focus tracking and accessible navigation in the child list.
		nestedList.focusTracker.destroy();
		nestedList.keystrokes.destroy();

		this.items = nestedList.items;

		this.setTemplate( {
			tag: 'li',

			attributes: {
				role: 'presentation',
				class: [
					'ck',
					'ck-list__group',
					bind.if( 'isVisible', 'ck-hidden', value => !value )
				]
			},

			children: this.children
		} );
	}

	/**
	 * Focuses the list item (which is not a separator).
	 */
	public focus(): void {
		if ( this.items ) {
			const firstListItem = this.items.find( item => !( item instanceof ListSeparatorView ) ) as ListItemView | ListItemGroupView;
			if ( firstListItem ) {
				firstListItem.focus();
			}
		}
	}
}
