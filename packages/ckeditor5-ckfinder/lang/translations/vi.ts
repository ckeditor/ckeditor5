/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'vi': {
		dictionary: {
			// Toolbar button tooltip for inserting an image or file via a CKFinder file browser.
			'Insert image or file': 'Chèn ảnh hoặc file',
			// Error message displayed when inserting a resized version of an image failed.
			'Could not obtain resized image URL.': 'Không thể lấy được đường dẫn ảnh đã đổi kích thước',
			// Title of a notification displayed when inserting a resized version of an image failed.
			'Selecting resized image failed': 'Chọn ảnh đã đổi kích thước thất bại',
			// Error message displayed when an image cannot be inserted at the current position.
			'Could not insert image at the current position.': 'Không thể chèn ảnh ở vị trí hiện tại',
			// Title of a notification displayed when an image cannot be inserted at the current position.
			'Inserting image failed': 'Chèn ảnh thất bại'
		}
	}
};

export default translations;
