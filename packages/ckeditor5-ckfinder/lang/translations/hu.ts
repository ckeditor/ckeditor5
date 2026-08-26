/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'hu': {
		dictionary: {
			// Toolbar button tooltip for inserting an image or file via a CKFinder file browser.
			'Insert image or file': 'Kép, vagy fájl beszúrása',
			// Error message displayed when inserting a resized version of an image failed.
			'Could not obtain resized image URL.': 'Az átméretezett kép URL-je nem érhető el.',
			// Title of a notification displayed when inserting a resized version of an image failed.
			'Selecting resized image failed': 'Az átméretezett kép kiválasztása sikertelen',
			// Error message displayed when an image cannot be inserted at the current position.
			'Could not insert image at the current position.': 'A jelenlegi helyen nem szúrható be a kép.',
			// Title of a notification displayed when an image cannot be inserted at the current position.
			'Inserting image failed': 'A kép beszúrása sikertelen'
		}
	}
};

export default translations;
