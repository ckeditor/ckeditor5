/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'sr-latn': {
		dictionary: {
			// Toolbar button tooltip for inserting an image or file via a CKFinder file browser.
			'Insert image or file': 'Dodaj sliku ili fajl',
			// Error message displayed when inserting a resized version of an image failed.
			'Could not obtain resized image URL.': 'URL slikа promenjeniih dimenzija nije dostupna.',
			// Title of a notification displayed when inserting a resized version of an image failed.
			'Selecting resized image failed': 'Odabir slike promenjenih dimenzija nije uspešnо',
			// Error message displayed when an image cannot be inserted at the current position.
			'Could not insert image at the current position.': 'Nemoguće je dodati sliku na ovo mesto.',
			// Title of a notification displayed when an image cannot be inserted at the current position.
			'Inserting image failed': 'Dodavanje slike je neuspešno'
		}
	}
};

export default translations;
