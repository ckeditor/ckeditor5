/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'ja': {
		dictionary: {
			// Toolbar button tooltip for the Unlink feature.
			'Unlink': 'リンク解除',
			// Toolbar button tooltip for the Link feature.
			'Link': 'リンク',
			// Label for the URL input in the Link URL editing balloon.
			'Link URL': 'リンクURL',
			// An error text displayed when user attempted to enter an empty URL.
			'Link URL must not be empty.': 'リンクURLは空白にできません。',
			// Label for the image link button.
			'Link image': 'リンク画像',
			// Label for the link properties link balloon title.
			'Link properties': 'リンクのプロパティ',
			// Button opening the Link URL editing balloon.
			'Edit link': 'リンクを編集',
			// Button opening the link in new browser tab.
			'Open link in new tab': '新しいタブでリンクを開く',
			// The label of the switch button that controls whether the edited link will open in a new tab.
			'Open in a new tab': '新しいタブで開く',
			// The label of the switch button that controls whether the edited link refers to downloadable resource.
			'Downloadable': 'ダウンロード可能',
			// Keystroke description for assistive technologies: keystroke for creating a link.
			'Create link': 'リンクを作成する',
			// Keystroke description for assistive technologies: keystroke for moving out of a link.
			'Move out of a link': 'リンクの外に移動する',
			// The label of the input field for the displayed text of the link.
			'Displayed text': '表示されるテキスト',
			// Placeholder shown when placeholder items view is empty.
			'No links available': '利用できるリンクがありません',
			// The label of the switch button shown when link has empty href attribute.
			'This link has no URL': 'このリンクにはURLがありません'
		}
	}
};

export default translations;
