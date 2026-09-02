/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'fi': {
		dictionary: {
			// A toolbar button tooltip for opening the file browser that allows inserting an image or a file to the editor.
			'Open file manager': 'Avaa tiedostonhallinnointityökalu',
			// A message is displayed when CKEditor 5 cannot associate an image with any of the categories defined in CKBox while uploading an asset.
			'Cannot determine a category for the uploaded file.': 'Emme voi määrittää ladatun tiedoston kategoriaa.',
			// A message is displayed when the user is not authorised to access the CKBox workspace configured as default one.
			'Cannot access default workspace.': 'Oletustyötilan käyttöoikeudet puuttuvat.',
			// The title of the notification displayed when there is no permission to edit assets.
			'You have no image editing permissions.': 'Sinulla ei ole vaadittavaa käyttöoikeutta kuvan muokkaamiseen.',
			// Image toolbar button tooltip for opening a dialog to manipulate the image.
			'Edit image': 'Muokkaa kuvaa',
			// A message stating that image editing is in progress.
			'Processing the edited image.': 'Käsitellään muokattua kuvaa.',
			// A message is displayed when the server fails to process an image or doesn't respond.
			'Server failed to process the image.': 'Palvelin ei kyennyt käsittelemään kuvaa.',
			// A message is displayed when category of the image user wants to edit can't be determined.
			'Failed to determine category of edited image.': 'Muokatun kuvan katergorian määrittäminen epäonnistui.'
		}
	}
};

export default translations;
