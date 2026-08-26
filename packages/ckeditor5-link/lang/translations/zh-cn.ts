/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'zh-cn': {
		dictionary: {
			// Toolbar button tooltip for the Unlink feature.
			'Unlink': '取消超链接',
			// Toolbar button tooltip for the Link feature.
			'Link': '超链接',
			// Label for the URL input in the Link URL editing balloon.
			'Link URL': '链接网址',
			// An error text displayed when user attempted to enter an empty URL.
			'Link URL must not be empty.': '链接 URL 不能为空。',
			// Label for the image link button.
			'Link image': '链接图片',
			// Label for the link properties link balloon title.
			'Link properties': '链接属性',
			// Button opening the Link URL editing balloon.
			'Edit link': '修改链接',
			// Button opening the link in new browser tab.
			'Open link in new tab': '在新标签页中打开链接',
			// The label of the switch button that controls whether the edited link will open in a new tab.
			'Open in a new tab': '在新标签页中打开',
			// The label of the switch button that controls whether the edited link refers to downloadable resource.
			'Downloadable': '可下载',
			// Keystroke description for assistive technologies: keystroke for creating a link.
			'Create link': '创建链接',
			// Keystroke description for assistive technologies: keystroke for moving out of a link.
			'Move out of a link': '移出链接',
			// The label of the input field for the displayed text of the link.
			'Displayed text': '显示的文本',
			// Placeholder shown when placeholder items view is empty.
			'No links available': '无可用链接',
			// The label of the switch button shown when link has empty href attribute.
			'This link has no URL': '该链接没有 URL'
		}
	}
};

export default translations;
