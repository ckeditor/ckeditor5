/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/list/listitemgroupview
 */

import View from '../view';
import ListView from './listview';

import { uid, type Locale } from '@ckeditor/ckeditor5-utils';

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
	 * Collection of the child list items inside this group.
	 */
	public readonly items: ListView[ 'items' ];

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
		const groupLabelId = `ck-editor__label_${ uid() }`;
		const nestedList = new ListView( locale );

		this.set( {
			label: '',
			isVisible: true
		} );

		nestedList.set( {
			role: 'group',
			ariaLabelledBy: groupLabelId
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

			children: [
				{
					tag: 'span',
					attributes: {
						id: groupLabelId
					},
					children: [
						{ text: bind.to( 'label' ) }
					]
				},
				nestedList
			]
		} );
	}

	/**
	 * Focuses the list item.
	 */
	public focus(): void {
		if ( this.items.first ) {
			this.items.first.focus();
		}
	}
}
