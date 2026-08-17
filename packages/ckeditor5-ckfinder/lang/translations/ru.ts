/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'ru': {
		dictionary: {
			// Toolbar button tooltip for inserting an image or file via a CKFinder file browser.
			'Insert image or file': 'Вставьте изображение или файл',
			// Error message displayed when inserting a resized version of an image failed.
			'Could not obtain resized image URL.': 'Не удалось получить URL с измененным размером изображения.',
			// Title of a notification displayed when inserting a resized version of an image failed.
			'Selecting resized image failed': 'Выбор изображения с измененным размером не удался',
			// Error message displayed when an image cannot be inserted at the current position.
			'Could not insert image at the current position.': 'Нельзя вставить изображение на текущую позицию.',
			// Title of a notification displayed when an image cannot be inserted at the current position.
			'Inserting image failed': 'Вставка изображения не удалась'
		}
	}
};

export default translations;
