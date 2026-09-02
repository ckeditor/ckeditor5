/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'fi': {
		dictionary: {
			// Toolbar button tooltip for inserting an image or file via a CKFinder file browser.
			'Insert image or file': 'Lisää kuva tai tiedosto',
			// Error message displayed when inserting a resized version of an image failed.
			'Could not obtain resized image URL.': 'Muokatun kuvan URL-osoitteen hakeminen epäonnistui.',
			// Title of a notification displayed when inserting a resized version of an image failed.
			'Selecting resized image failed': 'Muokatun kuvan valinta epäonnistui',
			// Error message displayed when an image cannot be inserted at the current position.
			'Could not insert image at the current position.': 'Kuvan lisäys nykyiseen sijaintiin epäonnistui',
			// Title of a notification displayed when an image cannot be inserted at the current position.
			'Inserting image failed': 'Kuvan lisäys epäonnistui'
		}
	}
};

export default translations;
