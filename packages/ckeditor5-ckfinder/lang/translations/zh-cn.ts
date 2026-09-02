/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'zh-cn': {
		dictionary: {
			// Toolbar button tooltip for inserting an image or file via a CKFinder file browser.
			'Insert image or file': '插入图片或文件',
			// Error message displayed when inserting a resized version of an image failed.
			'Could not obtain resized image URL.': '无法获取重设大小的图片URL',
			// Title of a notification displayed when inserting a resized version of an image failed.
			'Selecting resized image failed': '选择重设大小的图片失败',
			// Error message displayed when an image cannot be inserted at the current position.
			'Could not insert image at the current position.': '无法在当前位置插入图片',
			// Title of a notification displayed when an image cannot be inserted at the current position.
			'Inserting image failed': '插入图片失败'
		}
	}
};

export default translations;
