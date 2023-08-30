/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/list/listitemgroupview
 */

import View from '../view';

import type { FocusableView } from '../focuscycler';
import type ViewCollection from '../viewcollection';

import { uid, type Locale } from '@ckeditor/ckeditor5-utils';
import type ListItemView from './listitemview';

/**
 * TODO
 */
export default class ListItemGroupView extends View {
	/**
	 * TODO
	 */
	declare public label: string;

	/**
	 * Collection of the child views inside of the {@link #element}.
	 */
	public readonly items: ViewCollection<ListItemView>;

	/**
	 * Controls whether the item view is visible. Visible by default, list items are hidden
	 * using a CSS class.
	 *
	 * @observable
	 * @default true
	 */
	declare public isVisible: boolean;

	/**
	 * @inheritDoc
	 */
	constructor( locale?: Locale ) {
		super( locale );

		const bind = this.bindTemplate;

		this.set( 'isVisible', true );
		this.items = this.createCollection<ListItemView>();

		const groupLabelId = `ck-editor__label_${ uid() }`;

		this.setTemplate( {
			tag: 'li',

			attributes: {
				class: [
					'ck',
					'ck-list__group',
					bind.if( 'isVisible', 'ck-hidden', value => !value )
				]
			},

			children: [
				{
					tag: 'li',
					attributes: {
						role: 'presentation',
						id: groupLabelId
					},
					children: [
						{
							tag: 'span',
							children: [
								{ text: bind.to( 'label' ) }
							]
						},
						{
							tag: 'ul',
							attributes: {
								role: 'group',
								'aria-labelledby': groupLabelId
							},
							children: this.items
						}
					]
				}
			]
		} );
	}

	/**
	 * Focuses the list item.
	 */
	public focus(): void {
		( this.items.first as FocusableView ).focus();
	}
}
