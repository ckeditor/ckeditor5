/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'bg': {
		dictionary: {
			// Toolbar button tooltip for inserting an image or file via a CKFinder file browser.
			'Insert image or file': 'Вмъкни изображение или файл',
			// Error message displayed when inserting a resized version of an image failed.
			'Could not obtain resized image URL.': 'Не може да бъде придобит промененият уеб адрес на изображението.',
			// Title of a notification displayed when inserting a resized version of an image failed.
			'Selecting resized image failed': 'Избирането на промененото изображение не е успешно',
			// Error message displayed when an image cannot be inserted at the current position.
			'Could not insert image at the current position.': 'На текущата позиция не може да се вмъкне изображение.',
			// Title of a notification displayed when an image cannot be inserted at the current position.
			'Inserting image failed': 'Вмъкването на изображение не е успешно'
		}
	}
};

export default translations;
