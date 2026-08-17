/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'de-ch': {
		dictionary: {
			// Toolbar button tooltip for inserting an image or file via a CKFinder file browser.
			'Insert image or file': 'Bild oder Datei einfügen',
			// Error message displayed when inserting a resized version of an image failed.
			'Could not obtain resized image URL.': 'Die URL des angepassten Bildes konnte nicht abgerufen werden.',
			// Title of a notification displayed when inserting a resized version of an image failed.
			'Selecting resized image failed': 'Das angepasste Bild konnte nicht ausgewählt werden.',
			// Error message displayed when an image cannot be inserted at the current position.
			'Could not insert image at the current position.': 'Das Bild konnte an der aktuellen Position nicht eingefügt werden.',
			// Title of a notification displayed when an image cannot be inserted at the current position.
			'Inserting image failed': 'Einfügen des Bildes fehlgeschlagen'
		}
	}
};

export default translations;
