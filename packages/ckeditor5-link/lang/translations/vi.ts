/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'vi': {
		dictionary: {
			// Toolbar button tooltip for the Unlink feature.
			'Unlink': 'Bỏ liên kết',
			// Toolbar button tooltip for the Link feature.
			'Link': 'Chèn liên kết',
			// Label for the URL input in the Link URL editing balloon.
			'Link URL': 'Đường dẫn liên kết',
			// An error text displayed when user attempted to enter an empty URL.
			'Link URL must not be empty.': 'Không được để trống URL đường liên kết.',
			// Label for the image link button.
			'Link image': 'Liên kết của ảnh',
			// Label for the link properties link balloon title.
			'Link properties': 'Thuộc tính đường liên kết',
			// Button opening the Link URL editing balloon.
			'Edit link': 'Sửa liên kết',
			// Button opening the link in new browser tab.
			'Open link in new tab': 'Mở liên kết',
			// The label of the switch button that controls whether the edited link will open in a new tab.
			'Open in a new tab': 'Mở trên tab mới',
			// The label of the switch button that controls whether the edited link refers to downloadable resource.
			'Downloadable': 'Có thể tải về',
			// Keystroke description for assistive technologies: keystroke for creating a link.
			'Create link': 'Tạo liên kết',
			// Keystroke description for assistive technologies: keystroke for moving out of a link.
			'Move out of a link': 'Di chuyển ra khỏi một liên kết',
			// The label of the input field for the displayed text of the link.
			'Displayed text': 'Văn bản đã hiển thị',
			// Placeholder shown when placeholder items view is empty.
			'No links available': 'Không có đường liên kết khả dụng',
			// The label of the switch button shown when link has empty href attribute.
			'This link has no URL': 'Liên kết này không có URL'
		}
	}
};

export default translations;
