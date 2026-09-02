/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'tr': {
		dictionary: {
			// Toolbar button tooltip for inserting an image or file via a CKFinder file browser.
			'Insert image or file': 'Resim veya dosya ekleyin',
			// Error message displayed when inserting a resized version of an image failed.
			'Could not obtain resized image URL.': 'Yeniden boyutlandırılmış resim URL’si alınamadı',
			// Title of a notification displayed when inserting a resized version of an image failed.
			'Selecting resized image failed': 'Yeniden boyutlandırılan resim seçilemedi',
			// Error message displayed when an image cannot be inserted at the current position.
			'Could not insert image at the current position.': 'Resim mevcut konumda eklenemedi.',
			// Title of a notification displayed when an image cannot be inserted at the current position.
			'Inserting image failed': 'Resim eklenemedi'
		}
	}
};

export default translations;
