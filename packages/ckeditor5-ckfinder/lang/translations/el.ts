/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'el': {
		dictionary: {
			// Toolbar button tooltip for inserting an image or file via a CKFinder file browser.
			'Insert image or file': 'Εισαγωγή εικόνας ή αρχείου',
			// Error message displayed when inserting a resized version of an image failed.
			'Could not obtain resized image URL.': 'Αδύνατη η λήψη URL εικόνας με αλλαγμένο μέγεθος.',
			// Title of a notification displayed when inserting a resized version of an image failed.
			'Selecting resized image failed': 'Η επιλογή εικόνας με αλλαγμένο μέγεθος απέτυχε',
			// Error message displayed when an image cannot be inserted at the current position.
			'Could not insert image at the current position.': 'Αδύνατη η εισαγωγή εικόνας στην τρέχουσα θέση.',
			// Title of a notification displayed when an image cannot be inserted at the current position.
			'Inserting image failed': 'Η εισαγωγή εικόνας απέτυχε.'
		}
	}
};

export default translations;
