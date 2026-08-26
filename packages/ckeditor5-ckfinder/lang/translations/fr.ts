/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'fr': {
		dictionary: {
			// Toolbar button tooltip for inserting an image or file via a CKFinder file browser.
			'Insert image or file': 'Insérer une image ou un fichier',
			// Error message displayed when inserting a resized version of an image failed.
			'Could not obtain resized image URL.': 'Impossible d\'obtenir l\'image redimensionnée',
			// Title of a notification displayed when inserting a resized version of an image failed.
			'Selecting resized image failed': 'La sélection de l\'image redimensionnée a échoué.',
			// Error message displayed when an image cannot be inserted at the current position.
			'Could not insert image at the current position.': 'Impossible d\'insérer l\'image à la position courante.',
			// Title of a notification displayed when an image cannot be inserted at the current position.
			'Inserting image failed': 'L\'insertion d\'image a échoué.'
		}
	}
};

export default translations;
