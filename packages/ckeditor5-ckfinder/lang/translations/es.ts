/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'es': {
		dictionary: {
			// Toolbar button tooltip for inserting an image or file via a CKFinder file browser.
			'Insert image or file': 'Insertar imagen o archivo',
			// Error message displayed when inserting a resized version of an image failed.
			'Could not obtain resized image URL.': 'No se pudo obtener el URL de la imagen redimensionada.',
			// Title of a notification displayed when inserting a resized version of an image failed.
			'Selecting resized image failed': 'No se pudo seleccionar la imagen redimensionada',
			// Error message displayed when an image cannot be inserted at the current position.
			'Could not insert image at the current position.': 'No se pudo insertar la imagen en la posición actual.',
			// Title of a notification displayed when an image cannot be inserted at the current position.
			'Inserting image failed': 'Error al insertar la imagen'
		}
	}
};

export default translations;
