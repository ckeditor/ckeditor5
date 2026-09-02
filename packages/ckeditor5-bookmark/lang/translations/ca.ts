/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'ca': {
		dictionary: {
			// The label of the bookmark toolbar button. Also, a bookmark form header.
			'Bookmark': 'Marcador',
			// Button opening the Bookmark editing balloon.
			'Edit bookmark': 'Edita el marcador',
			// Toolbar button tooltip for bookmark remove button.
			'Remove bookmark': 'Elimina el marcador',
			// The label of the input in the bookmark insert and update form. Also, the tooltip for the bookmark name in the bookmark preview.
			'Bookmark name': 'Nom del marcador',
			// The description of bookmark input in the bookmark insert form.
			'Enter the bookmark name without spaces.': 'Introdueix el nom del marcador sense espais.',
			// The error message. Displayed when the bookmark name is empty.
			'Bookmark must not be empty.': 'El marcador no pot estar buit.',
			// The error message. Displayed when provided name includes spaces.
			'Bookmark name cannot contain space characters.': 'El nom del marcador no pot contenir espais.',
			// The error message. Displayed when provided name already exists.
			'Bookmark name already exists.': 'El nom del marcador ja existeix.',
			// The label for the bookmark widget.
			'bookmark widget': 'giny de marcador',
			// The label used by assistive technologies describing an bookmark toolbar attached to a bookmark widget.
			'Bookmark toolbar': 'Barra d\'eines d\'adreces d\'interès',
			// Title for a feature displaying a list of bookmarks.
			'Bookmarks': 'Adreces d\'interès',
			// A message displayed instead of a list of bookmarks if it is empty.
			'No bookmarks available.': 'No hi ha cap adreça d\'interès disponible.',
			// Tooltip shown after hovering the bookmark link preview.
			'Scroll to bookmark': 'Desplaça\'t fins a les adreces d\'interès'
		}
	}
};

export default translations;
