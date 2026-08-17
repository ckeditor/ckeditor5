/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'es': {
		dictionary: {
			// The label of the bookmark toolbar button. Also, a bookmark form header.
			'Bookmark': 'Marcador',
			// Button opening the Bookmark editing balloon.
			'Edit bookmark': 'Editar marcador',
			// Toolbar button tooltip for bookmark remove button.
			'Remove bookmark': 'Eliminar marcador',
			// The label of the input in the bookmark insert and update form. Also, the tooltip for the bookmark name in the bookmark preview.
			'Bookmark name': 'Nombre del marcador',
			// The description of bookmark input in the bookmark insert form.
			'Enter the bookmark name without spaces.': 'Introduzca el nombre del marcador sin espacios.',
			// The error message. Displayed when the bookmark name is empty.
			'Bookmark must not be empty.': 'El marcador no debe estar vacío.',
			// The error message. Displayed when provided name includes spaces.
			'Bookmark name cannot contain space characters.': 'El nombre del marcador no puede contener espacios.',
			// The error message. Displayed when provided name already exists.
			'Bookmark name already exists.': 'Ya existe el nombre del marcador.',
			// The label for the bookmark widget.
			'bookmark widget': 'Módulo interactivo del marcador',
			// The label used by assistive technologies describing an bookmark toolbar attached to a bookmark widget.
			'Bookmark toolbar': 'Barra de marcadores',
			// Title for a feature displaying a list of bookmarks.
			'Bookmarks': 'Marcadores',
			// A message displayed instead of a list of bookmarks if it is empty.
			'No bookmarks available.': 'No hay marcadores disponibles.',
			// Tooltip shown after hovering the bookmark link preview.
			'Scroll to bookmark': 'Desplazarse hasta el marcador'
		}
	}
};

export default translations;
