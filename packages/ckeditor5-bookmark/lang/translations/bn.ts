/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'bn': {
		dictionary: {
			// The label of the bookmark toolbar button. Also, a bookmark form header.
			'Bookmark': 'বুকমার্ক',
			// Button opening the Bookmark editing balloon.
			'Edit bookmark': 'বুকমার্ক এডিট করুন',
			// Toolbar button tooltip for bookmark remove button.
			'Remove bookmark': 'বুকমার্ক অপসারণ করুন',
			// The label of the input in the bookmark insert and update form. Also, the tooltip for the bookmark name in the bookmark preview.
			'Bookmark name': 'বুকমার্কের নাম',
			// The description of bookmark input in the bookmark insert form.
			'Enter the bookmark name without spaces.': 'স্পেস ছাড়া বুকমার্কের নাম লিখুন।',
			// The error message. Displayed when the bookmark name is empty.
			'Bookmark must not be empty.': 'বুকমার্ক খালি রাখা যাবে না।',
			// The error message. Displayed when provided name includes spaces.
			'Bookmark name cannot contain space characters.': 'বুকমার্কের নামে স্পেস ক্যারেক্টার রাখা যাবে না।',
			// The error message. Displayed when provided name already exists.
			'Bookmark name already exists.': 'বুকমার্কের নাম আগে থেকেই বিদ্যমান।',
			// The label for the bookmark widget.
			'bookmark widget': 'বুকমার্ক উইজেট',
			// The label used by assistive technologies describing an bookmark toolbar attached to a bookmark widget.
			'Bookmark toolbar': 'বুকমার্ক টুলবার',
			// Title for a feature displaying a list of bookmarks.
			'Bookmarks': 'বুকমার্কস',
			// A message displayed instead of a list of bookmarks if it is empty.
			'No bookmarks available.': 'কোনো বুকমার্কস উপলব্ধ নেই।',
			// Tooltip shown after hovering the bookmark link preview.
			'Scroll to bookmark': 'বুকমার্কে স্ক্রল করুন'
		}
	}
};

export default translations;
