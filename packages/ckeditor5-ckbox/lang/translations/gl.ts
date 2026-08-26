/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'gl': {
		dictionary: {
			// A toolbar button tooltip for opening the file browser that allows inserting an image or a file to the editor.
			'Open file manager': 'Abrir o xestor de ficheiros',
			// A message is displayed when CKEditor 5 cannot associate an image with any of the categories defined in CKBox while uploading an asset.
			'Cannot determine a category for the uploaded file.': 'Non é posíbel determinar unha categoría para o ficheiro enviado.',
			// A message is displayed when the user is not authorised to access the CKBox workspace configured as default one.
			'Cannot access default workspace.': 'Non é posíbel acceder ao espazo de traballo predeterminado.',
			// The title of the notification displayed when there is no permission to edit assets.
			'You have no image editing permissions.': 'Vde. non ten permisos de edición de imaxes.',
			// Image toolbar button tooltip for opening a dialog to manipulate the image.
			'Edit image': 'Editar imaxe',
			// A message stating that image editing is in progress.
			'Processing the edited image.': 'Procesando a imaxe editada.',
			// A message is displayed when the server fails to process an image or doesn't respond.
			'Server failed to process the image.': 'Produciuse un fallo no servidor ao procesar a imaxe.',
			// A message is displayed when category of the image user wants to edit can't be determined.
			'Failed to determine category of edited image.': 'Produciuse un fallo ao determinar a categoría da imaxe editada.'
		}
	}
};

export default translations;
