/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'de': {
		dictionary: {
			// A toolbar button tooltip for opening the file browser that allows inserting an image or a file to the editor.
			'Open file manager': 'Dateimanager öffnen',
			// A message is displayed when CKEditor 5 cannot associate an image with any of the categories defined in CKBox while uploading an asset.
			'Cannot determine a category for the uploaded file.': 'Die Kategorie für die hochgeladene Datei konnte nicht bestimmt werden.',
			// A message is displayed when the user is not authorised to access the CKBox workspace configured as default one.
			'Cannot access default workspace.': 'Zugriff auf Standardarbeitsbereich nicht möglich.',
			// The title of the notification displayed when there is no permission to edit assets.
			'You have no image editing permissions.': 'Sie haben keine Berechtigung zum Bearbeiten von Bildern.',
			// Image toolbar button tooltip for opening a dialog to manipulate the image.
			'Edit image': 'Bild bearbeiten',
			// A message stating that image editing is in progress.
			'Processing the edited image.': 'Das bearbeitete Bild wird verarbeitet.',
			// A message is displayed when the server fails to process an image or doesn't respond.
			'Server failed to process the image.': 'Der Server konnte das Bild nicht verarbeiten.',
			// A message is displayed when category of the image user wants to edit can't be determined.
			'Failed to determine category of edited image.': 'Es konnte für das bearbeitete Bild keine Kategorie ermittelt werden.'
		}
	}
};

export default translations;
