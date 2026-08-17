/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'ar': {
		dictionary: {
			// Toolbar button tooltip for inserting an image or file via a CKFinder file browser.
			'Insert image or file': 'إدراج صورة أو ملف',
			// Error message displayed when inserting a resized version of an image failed.
			'Could not obtain resized image URL.': 'تعذر الحصول على عنوان URL الخاص بالصورة التي غُيّرَ حجمُها',
			// Title of a notification displayed when inserting a resized version of an image failed.
			'Selecting resized image failed': 'فشلت عملية تحديد الصورة التي غُيّرَ حجمها',
			// Error message displayed when an image cannot be inserted at the current position.
			'Could not insert image at the current position.': 'تعذر إدراج الصورة في الموضع الحالي.',
			// Title of a notification displayed when an image cannot be inserted at the current position.
			'Inserting image failed': 'فشلت عملية إدراج الصورة'
		}
	}
};

export default translations;
