/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'pt-br': {
		dictionary: {
			// The label of the bookmark toolbar button. Also, a bookmark form header.
			'Bookmark': 'Favorito',
			// Button opening the Bookmark editing balloon.
			'Edit bookmark': 'Editar favorito',
			// Toolbar button tooltip for bookmark remove button.
			'Remove bookmark': 'Remover favorito',
			// The label of the input in the bookmark insert and update form. Also, the tooltip for the bookmark name in the bookmark preview.
			'Bookmark name': 'Nome do favorito',
			// The description of bookmark input in the bookmark insert form.
			'Enter the bookmark name without spaces.': 'Insira o nome do favorito sem espaços.',
			// The error message. Displayed when the bookmark name is empty.
			'Bookmark must not be empty.': 'O favorito não pode estar vazio.',
			// The error message. Displayed when provided name includes spaces.
			'Bookmark name cannot contain space characters.': 'O nome do favorito não pode conter caracteres de espaço.',
			// The error message. Displayed when provided name already exists.
			'Bookmark name already exists.': 'O nome do favorito já existe.',
			// The label for the bookmark widget.
			'bookmark widget': 'widget de favorito',
			// The label used by assistive technologies describing an bookmark toolbar attached to a bookmark widget.
			'Bookmark toolbar': 'Barra de favoritos',
			// Title for a feature displaying a list of bookmarks.
			'Bookmarks': 'Favoritos',
			// A message displayed instead of a list of bookmarks if it is empty.
			'No bookmarks available.': 'Nenhum favorito disponível.',
			// Tooltip shown after hovering the bookmark link preview.
			'Scroll to bookmark': 'Rolar até o favorito'
		}
	}
};

export default translations;
