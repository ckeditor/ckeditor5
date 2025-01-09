/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module mention/ui/mentionlistitemview
 */

import { ListItemView } from 'ckeditor5/src/ui.js';

import type { MentionFeedItem } from '../mentionconfig.js';

import type DomWrapperView from './domwrapperview.js';

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
