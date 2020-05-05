/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module mention/ui/mentionlistitemview
 */

import ListItemView from '@ckeditor/ckeditor5-ui/src/list/listitemview';

export default class MentionListItemView extends ListItemView {
	highlight() {
		const child = this.children.first;

		child.isOn = true;
	}

	removeHighlight() {
		const child = this.children.first;

		child.isOn = false;
	}
}
