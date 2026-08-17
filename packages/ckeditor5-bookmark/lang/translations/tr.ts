/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'tr': {
		dictionary: {
			// The label of the bookmark toolbar button. Also, a bookmark form header.
			'Bookmark': 'Yer imi',
			// Button opening the Bookmark editing balloon.
			'Edit bookmark': 'Yer imini düzenle',
			// Toolbar button tooltip for bookmark remove button.
			'Remove bookmark': 'Yer imini kaldır',
			// The label of the input in the bookmark insert and update form. Also, the tooltip for the bookmark name in the bookmark preview.
			'Bookmark name': 'Yer imi adı',
			// The description of bookmark input in the bookmark insert form.
			'Enter the bookmark name without spaces.': 'Yer imi adını boşluk bırakmadan gir.',
			// The error message. Displayed when the bookmark name is empty.
			'Bookmark must not be empty.': 'Yer imi boş bırakılamaz.',
			// The error message. Displayed when provided name includes spaces.
			'Bookmark name cannot contain space characters.': 'Yer imi adı, boşluk karakterleri içeremez.',
			// The error message. Displayed when provided name already exists.
			'Bookmark name already exists.': 'Yer imi adı zaten var.',
			// The label for the bookmark widget.
			'bookmark widget': 'yer imi araç takımı',
			// The label used by assistive technologies describing an bookmark toolbar attached to a bookmark widget.
			'Bookmark toolbar': 'Yer imi araç çubuğu',
			// Title for a feature displaying a list of bookmarks.
			'Bookmarks': 'Yer imleri',
			// A message displayed instead of a list of bookmarks if it is empty.
			'No bookmarks available.': 'Yer imi yok.',
			// Tooltip shown after hovering the bookmark link preview.
			'Scroll to bookmark': 'Yer imine kaydır'
		}
	}
};

export default translations;
