/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'it': {
		dictionary: {
			// The label of the bookmark toolbar button. Also, a bookmark form header.
			'Bookmark': 'Segnalibro',
			// Button opening the Bookmark editing balloon.
			'Edit bookmark': 'Modifica segnalibro',
			// Toolbar button tooltip for bookmark remove button.
			'Remove bookmark': 'Rimuovi segnalibro',
			// The label of the input in the bookmark insert and update form. Also, the tooltip for the bookmark name in the bookmark preview.
			'Bookmark name': 'Aggiungi ai preferiti il nome',
			// The description of bookmark input in the bookmark insert form.
			'Enter the bookmark name without spaces.': 'Inserisci il nome del segnalibro senza spazi.',
			// The error message. Displayed when the bookmark name is empty.
			'Bookmark must not be empty.': 'Il segnalibro non deve essere vuoto.',
			// The error message. Displayed when provided name includes spaces.
			'Bookmark name cannot contain space characters.': 'Il nome del segnalibro non può contenere spazi.',
			// The error message. Displayed when provided name already exists.
			'Bookmark name already exists.': 'Il nome del segnalibro esiste già.',
			// The label for the bookmark widget.
			'bookmark widget': 'widget segnalibro',
			// The label used by assistive technologies describing an bookmark toolbar attached to a bookmark widget.
			'Bookmark toolbar': 'Barra degli strumenti dei segnalibri',
			// Title for a feature displaying a list of bookmarks.
			'Bookmarks': 'Segnalibri',
			// A message displayed instead of a list of bookmarks if it is empty.
			'No bookmarks available.': 'Nessun segnalibro disponibile.',
			// Tooltip shown after hovering the bookmark link preview.
			'Scroll to bookmark': 'Scorri fino al segnalibro'
		}
	}
};

export default translations;
