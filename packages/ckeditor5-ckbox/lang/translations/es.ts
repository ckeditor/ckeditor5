/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'es': {
		dictionary: {
			// A toolbar button tooltip for opening the file browser that allows inserting an image or a file to the editor.
			'Open file manager': 'Abrir gestor de archivos',
			// A message is displayed when CKEditor 5 cannot associate an image with any of the categories defined in CKBox while uploading an asset.
			'Cannot determine a category for the uploaded file.': 'No se puede determinar una categoría para el archivo subido.',
			// A message is displayed when the user is not authorised to access the CKBox workspace configured as default one.
			'Cannot access default workspace.': 'No se puede acceder al espacio de trabajo predeterminado.',
			// The title of the notification displayed when there is no permission to edit assets.
			'You have no image editing permissions.': 'No tienes permiso para editar imágenes.',
			// Image toolbar button tooltip for opening a dialog to manipulate the image.
			'Edit image': 'Editar imagen',
			// A message stating that image editing is in progress.
			'Processing the edited image.': 'Procesando la imagen editada.',
			// A message is displayed when the server fails to process an image or doesn't respond.
			'Server failed to process the image.': 'El servidor no pudo procesar la imagen.',
			// A message is displayed when category of the image user wants to edit can't be determined.
			'Failed to determine category of edited image.': 'No se pudo determinar la categoría de la imagen editada.'
		}
	}
};

export default translations;
