/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'ca': {
		dictionary: {
			// A toolbar button tooltip for opening the file browser that allows inserting an image or a file to the editor.
			'Open file manager': 'Obrir el gestor de fitxers',
			// A message is displayed when CKEditor 5 cannot associate an image with any of the categories defined in CKBox while uploading an asset.
			'Cannot determine a category for the uploaded file.': 'No es pot determinar una categoria per al fitxer penjat.',
			// A message is displayed when the user is not authorised to access the CKBox workspace configured as default one.
			'Cannot access default workspace.': 'No es pot accedir a l\'espai de treball predeterminat.',
			// The title of the notification displayed when there is no permission to edit assets.
			'You have no image editing permissions.': 'No tens permisos d\'edició d\'imatges.',
			// Image toolbar button tooltip for opening a dialog to manipulate the image.
			'Edit image': 'Edita la imatge',
			// A message stating that image editing is in progress.
			'Processing the edited image.': 'Tractant la imatge editada.',
			// A message is displayed when the server fails to process an image or doesn't respond.
			'Server failed to process the image.': 'El servidor no ha pogut processar la imatge.',
			// A message is displayed when category of the image user wants to edit can't be determined.
			'Failed to determine category of edited image.': 'No s\'ha pogut determinar la categoria de la imatge editada.'
		}
	}
};

export default translations;
