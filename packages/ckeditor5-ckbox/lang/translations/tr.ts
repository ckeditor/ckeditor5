/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'tr': {
		dictionary: {
			// A toolbar button tooltip for opening the file browser that allows inserting an image or a file to the editor.
			'Open file manager': 'Dosya yöneticisini aç',
			// A message is displayed when CKEditor 5 cannot associate an image with any of the categories defined in CKBox while uploading an asset.
			'Cannot determine a category for the uploaded file.': 'Yüklenen dosya için bir kategori belirlenemiyor.',
			// A message is displayed when the user is not authorised to access the CKBox workspace configured as default one.
			'Cannot access default workspace.': 'Varsayılan çalışma alanına erişilemiyor.',
			// The title of the notification displayed when there is no permission to edit assets.
			'You have no image editing permissions.': 'Görüntü düzenleme izniniz yok.',
			// Image toolbar button tooltip for opening a dialog to manipulate the image.
			'Edit image': 'Görüntüyü düzenle',
			// A message stating that image editing is in progress.
			'Processing the edited image.': 'Düzenlenen görüntü işleniyor.',
			// A message is displayed when the server fails to process an image or doesn't respond.
			'Server failed to process the image.': 'Sunucu görüntüyü işlemede başarısız oldu.',
			// A message is displayed when category of the image user wants to edit can't be determined.
			'Failed to determine category of edited image.': 'Düzenlenen görselin kategorisinin belirlenmesi başarısız oldu.'
		}
	}
};

export default translations;
