/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'pt': {
		dictionary: {
			// The label of the bookmark toolbar button. Also, a bookmark form header.
			'Bookmark': 'Marcador',
			// Button opening the Bookmark editing balloon.
			'Edit bookmark': 'Editar marcador',
			// Toolbar button tooltip for bookmark remove button.
			'Remove bookmark': 'Remover marcador',
			// The label of the input in the bookmark insert and update form. Also, the tooltip for the bookmark name in the bookmark preview.
			'Bookmark name': 'Nome do marcador',
			// The description of bookmark input in the bookmark insert form.
			'Enter the bookmark name without spaces.': 'Introduza o nome do marcador sem espaços.',
			// The error message. Displayed when the bookmark name is empty.
			'Bookmark must not be empty.': 'O marcador não deve estar vazio.',
			// The error message. Displayed when provided name includes spaces.
			'Bookmark name cannot contain space characters.': 'O nome do marcador não pode conter caracteres de espaço.',
			// The error message. Displayed when provided name already exists.
			'Bookmark name already exists.': 'O nome do marcador já existe.',
			// The label for the bookmark widget.
			'bookmark widget': 'widget de marcador',
			// The label used by assistive technologies describing an bookmark toolbar attached to a bookmark widget.
			'Bookmark toolbar': 'Barra de marcadores',
			// Title for a feature displaying a list of bookmarks.
			'Bookmarks': 'Marcadores',
			// A message displayed instead of a list of bookmarks if it is empty.
			'No bookmarks available.': 'Sem marcadores disponíveis.',
			// Tooltip shown after hovering the bookmark link preview.
			'Scroll to bookmark': 'Ir para o marcador'
		}
	}
};

export default translations;
