/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'hr': {
		dictionary: {
			// Toolbar button tooltip for inserting an image or file via a CKFinder file browser.
			'Insert image or file': 'Umetni sliku ili datoteku',
			// Error message displayed when inserting a resized version of an image failed.
			'Could not obtain resized image URL.': 'Nije moguće dohvatiti URL slike s promijenjenom veličinom',
			// Title of a notification displayed when inserting a resized version of an image failed.
			'Selecting resized image failed': 'Odabir slike s promijenjenom veličinom nije uspjelo',
			// Error message displayed when an image cannot be inserted at the current position.
			'Could not insert image at the current position.': 'Nije moguće umetnuti sliku na trenutnu poziciju',
			// Title of a notification displayed when an image cannot be inserted at the current position.
			'Inserting image failed': 'Umetanje slike nije uspjelo'
		}
	}
};

export default translations;
