/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'zh': {
		dictionary: {
			// Toolbar button tooltip for inserting an image or file via a CKFinder file browser.
			'Insert image or file': '插入圖片或檔案',
			// Error message displayed when inserting a resized version of an image failed.
			'Could not obtain resized image URL.': '無法取得重設大小的圖片URL',
			// Title of a notification displayed when inserting a resized version of an image failed.
			'Selecting resized image failed': '選擇重設大小的圖片失敗',
			// Error message displayed when an image cannot be inserted at the current position.
			'Could not insert image at the current position.': '無法在這位置插入圖片',
			// Title of a notification displayed when an image cannot be inserted at the current position.
			'Inserting image failed': '插入圖片失敗'
		}
	}
};

export default translations;
