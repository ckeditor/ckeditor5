/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module mention/ui/mentionlistitemview
 */

import { ListItemView } from 'ckeditor5/src/ui';

import type { MentionFeedItem } from '../mentionconfig';

import type DomWrapperView from './domwrapperview';

export default class MentionListItemView extends ListItemView {
	public item!: MentionFeedItem;

	public marker!: string;

	public highlight(): void {
		const child = this.children.first as DomWrapperView;

		child.isOn = true;
	}

	public removeHighlight(): void {
		const child = this.children.first as DomWrapperView;

		child.isOn = false;
	}
}
