/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'fa': {
		dictionary: {
			// Toolbar button tooltip for the Unlink feature.
			'Unlink': 'لغو پیوند',
			// Toolbar button tooltip for the Link feature.
			'Link': 'پیوند',
			// Label for the URL input in the Link URL editing balloon.
			'Link URL': 'نشانی اینترنتی پیوند',
			// An error text displayed when user attempted to enter an empty URL.
			'Link URL must not be empty.': '',
			// Label for the image link button.
			'Link image': 'اتصال پیوند به تصویر',
			// Label for the link properties link balloon title.
			'Link properties': '',
			// Button opening the Link URL editing balloon.
			'Edit link': 'ویرایش پیوند',
			// Button opening the link in new browser tab.
			'Open link in new tab': 'باز کردن پیوند در برگه جدید',
			// The label of the switch button that controls whether the edited link will open in a new tab.
			'Open in a new tab': 'بازکردن در برگه جدید',
			// The label of the switch button that controls whether the edited link refers to downloadable resource.
			'Downloadable': 'قابل بارگیری',
			// Keystroke description for assistive technologies: keystroke for creating a link.
			'Create link': '',
			// Keystroke description for assistive technologies: keystroke for moving out of a link.
			'Move out of a link': '',
			// The label of the input field for the displayed text of the link.
			'Displayed text': '',
			// Placeholder shown when placeholder items view is empty.
			'No links available': '',
			// The label of the switch button shown when link has empty href attribute.
			'This link has no URL': ''
		}
	}
};

export default translations;
