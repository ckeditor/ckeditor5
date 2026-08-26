/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'zh': {
		dictionary: {
			// Toolbar button tooltip for the Unlink feature.
			'Unlink': '移除連結',
			// Toolbar button tooltip for the Link feature.
			'Link': '連結',
			// Label for the URL input in the Link URL editing balloon.
			'Link URL': '連結˙ URL',
			// An error text displayed when user attempted to enter an empty URL.
			'Link URL must not be empty.': '連結 URL 不得為空白。',
			// Label for the image link button.
			'Link image': '圖片連結',
			// Label for the link properties link balloon title.
			'Link properties': '連結屬性',
			// Button opening the Link URL editing balloon.
			'Edit link': '編輯連結',
			// Button opening the link in new browser tab.
			'Open link in new tab': '在新視窗開啟連結',
			// The label of the switch button that controls whether the edited link will open in a new tab.
			'Open in a new tab': '在新視窗開啟',
			// The label of the switch button that controls whether the edited link refers to downloadable resource.
			'Downloadable': '可下載',
			// Keystroke description for assistive technologies: keystroke for creating a link.
			'Create link': '建立連結',
			// Keystroke description for assistive technologies: keystroke for moving out of a link.
			'Move out of a link': '移出連結',
			// The label of the input field for the displayed text of the link.
			'Displayed text': '顯示的文字',
			// Placeholder shown when placeholder items view is empty.
			'No links available': '無可用連結',
			// The label of the switch button shown when link has empty href attribute.
			'This link has no URL': '此連結沒有 URL'
		}
	}
};

export default translations;
