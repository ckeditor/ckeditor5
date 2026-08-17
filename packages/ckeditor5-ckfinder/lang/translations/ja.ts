/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'ja': {
		dictionary: {
			// Toolbar button tooltip for inserting an image or file via a CKFinder file browser.
			'Insert image or file': '画像やファイルの挿入',
			// Error message displayed when inserting a resized version of an image failed.
			'Could not obtain resized image URL.': 'リサイズした画像のURLの取得に失敗しました。',
			// Title of a notification displayed when inserting a resized version of an image failed.
			'Selecting resized image failed': 'リサイズした画像の選択ができませんでした。',
			// Error message displayed when an image cannot be inserted at the current position.
			'Could not insert image at the current position.': '現在のカーソルの場所への画像の挿入に失敗しました。',
			// Title of a notification displayed when an image cannot be inserted at the current position.
			'Inserting image failed': '画像の挿入に失敗しました。'
		}
	}
};

export default translations;
