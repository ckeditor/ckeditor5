/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'uk': {
		dictionary: {
			// Toolbar button tooltip for inserting an image or file via a CKFinder file browser.
			'Insert image or file': 'Вставте зображення або файл',
			// Error message displayed when inserting a resized version of an image failed.
			'Could not obtain resized image URL.': 'Не вдалось отримати URL зміненого зображення.',
			// Title of a notification displayed when inserting a resized version of an image failed.
			'Selecting resized image failed': 'Не вдалося вибрати зображення зі зміненим розміром',
			// Error message displayed when an image cannot be inserted at the current position.
			'Could not insert image at the current position.': 'Не можливо вставити зображення в поточну позицію.',
			// Title of a notification displayed when an image cannot be inserted at the current position.
			'Inserting image failed': 'Не вдалось вставити зображення'
		}
	}
};

export default translations;
