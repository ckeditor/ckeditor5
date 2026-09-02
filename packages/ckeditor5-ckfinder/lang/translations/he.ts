/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'he': {
		dictionary: {
			// Toolbar button tooltip for inserting an image or file via a CKFinder file browser.
			'Insert image or file': 'הוסף תמונה או קובץ',
			// Error message displayed when inserting a resized version of an image failed.
			'Could not obtain resized image URL.': 'לא ניתן להשיג תמונה מוקטנת',
			// Title of a notification displayed when inserting a resized version of an image failed.
			'Selecting resized image failed': 'בחירת תמונה מוקטנת נכשלה',
			// Error message displayed when an image cannot be inserted at the current position.
			'Could not insert image at the current position.': 'לא ניתן להוסיף תמונה במיקום הנוכחי',
			// Title of a notification displayed when an image cannot be inserted at the current position.
			'Inserting image failed': 'הוספת תמונה נכשלה'
		}
	}
};

export default translations;
