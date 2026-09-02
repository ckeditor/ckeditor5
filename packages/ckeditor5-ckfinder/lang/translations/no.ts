/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'no': {
		dictionary: {
			// Toolbar button tooltip for inserting an image or file via a CKFinder file browser.
			'Insert image or file': 'Sett inn bilde eller fil',
			// Error message displayed when inserting a resized version of an image failed.
			'Could not obtain resized image URL.': 'Kunne ikke finne URL for bilde med endret størrelse.',
			// Title of a notification displayed when inserting a resized version of an image failed.
			'Selecting resized image failed': 'Kunne ikke velge bilde med endret størrelse',
			// Error message displayed when an image cannot be inserted at the current position.
			'Could not insert image at the current position.': 'Kunne ikke sette inn bilde på gjeldende posisjon.',
			// Title of a notification displayed when an image cannot be inserted at the current position.
			'Inserting image failed': 'Innsetting av bilde mislyktes'
		}
	}
};

export default translations;
