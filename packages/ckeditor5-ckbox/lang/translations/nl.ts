/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'nl': {
		dictionary: {
			// A toolbar button tooltip for opening the file browser that allows inserting an image or a file to the editor.
			'Open file manager': 'Open bestandsmanager',
			// A message is displayed when CKEditor 5 cannot associate an image with any of the categories defined in CKBox while uploading an asset.
			'Cannot determine a category for the uploaded file.': 'Kan geen categorie bepalen voor het geüploade bestand.',
			// A message is displayed when the user is not authorised to access the CKBox workspace configured as default one.
			'Cannot access default workspace.': 'Geen toegang mogelijk tot standaard werkplek.',
			// The title of the notification displayed when there is no permission to edit assets.
			'You have no image editing permissions.': 'U heeft geen toestemming om afbeeldingen te bewerken.',
			// Image toolbar button tooltip for opening a dialog to manipulate the image.
			'Edit image': 'Afbeelding bewerken',
			// A message stating that image editing is in progress.
			'Processing the edited image.': 'De bewerkte afbeelding verwerken.',
			// A message is displayed when the server fails to process an image or doesn't respond.
			'Server failed to process the image.': 'De server heeft de afbeelding niet verwerkt.',
			// A message is displayed when category of the image user wants to edit can't be determined.
			'Failed to determine category of edited image.': 'Het is niet gelukt om de categorie van de bewerkte afbeelding te bepalen.'
		}
	}
};

export default translations;
