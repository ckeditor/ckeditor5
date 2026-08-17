/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'nl': {
		dictionary: {
			// Toolbar button tooltip for inserting an image or file via a CKFinder file browser.
			'Insert image or file': 'Voeg afbeelding of bestand in',
			// Error message displayed when inserting a resized version of an image failed.
			'Could not obtain resized image URL.': 'Het is niet gelukt de geschaalde afbeelding URL te verkrijgen.',
			// Title of a notification displayed when inserting a resized version of an image failed.
			'Selecting resized image failed': 'De geschaalde afbeelding selecteren is niet gelukt',
			// Error message displayed when an image cannot be inserted at the current position.
			'Could not insert image at the current position.': 'Kan afbeelding niet op de huidige positie invoegen.',
			// Title of a notification displayed when an image cannot be inserted at the current position.
			'Inserting image failed': 'Afbeelding invoegen niet gelukt'
		}
	}
};

export default translations;
