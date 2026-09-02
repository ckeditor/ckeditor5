/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'id': {
		dictionary: {
			// The label of the bookmark toolbar button. Also, a bookmark form header.
			'Bookmark': 'Penanda',
			// Button opening the Bookmark editing balloon.
			'Edit bookmark': 'Edit penanda',
			// Toolbar button tooltip for bookmark remove button.
			'Remove bookmark': 'Hapus penanda',
			// The label of the input in the bookmark insert and update form. Also, the tooltip for the bookmark name in the bookmark preview.
			'Bookmark name': 'Nama penanda',
			// The description of bookmark input in the bookmark insert form.
			'Enter the bookmark name without spaces.': 'Masukkan nama penanda tanpa spasi.',
			// The error message. Displayed when the bookmark name is empty.
			'Bookmark must not be empty.': 'Penanda tidak boleh kosong.',
			// The error message. Displayed when provided name includes spaces.
			'Bookmark name cannot contain space characters.': 'Nama penanda tidak boleh mengandung spasi.',
			// The error message. Displayed when provided name already exists.
			'Bookmark name already exists.': 'Nama penanda sudah ada.',
			// The label for the bookmark widget.
			'bookmark widget': 'widget penanda',
			// The label used by assistive technologies describing an bookmark toolbar attached to a bookmark widget.
			'Bookmark toolbar': 'Bilah alat penanda halaman',
			// Title for a feature displaying a list of bookmarks.
			'Bookmarks': 'Penanda halaman',
			// A message displayed instead of a list of bookmarks if it is empty.
			'No bookmarks available.': 'Penanda halaman tidak tersedia.',
			// Tooltip shown after hovering the bookmark link preview.
			'Scroll to bookmark': 'Gulir ke penanda halaman'
		}
	}
};

export default translations;
