/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module mention/ui/mentionlistitemview
 */

import { ListItemView } from '@ckeditor/ckeditor5-ui';
import type { Locale } from '@ckeditor/ckeditor5-utils';

import type { MentionFeedItem } from '../mentionconfig.js';

export class MentionListItemView extends ListItemView {
	public item!: MentionFeedItem;

	public marker!: string;

	/**
	 * Controls whether the item is the one currently selected while navigating the list.
	 *
	 * Focus stays in the editable while navigating the mention list (so the user can keep typing),
	 * therefore the selected item is indicated visually with a focus-style ring rather than by moving
	 * DOM focus or marking it as "on".
	 *
	 * @observable
	 * @default false
	 */
	declare public isHighlighted: boolean;

	constructor( locale: Locale ) {
		super( locale );

		const bind = this.bindTemplate;

		this.set( 'isHighlighted', false );

		this.extendTemplate( {
			attributes: {
				class: [
					bind.if( 'isHighlighted', 'ck-mentions__item_focused' )
				]
			}
		} );
	}

	public highlight(): void {
		this.isHighlighted = true;
	}

	public removeHighlight(): void {
		this.isHighlighted = false;
	}
}
