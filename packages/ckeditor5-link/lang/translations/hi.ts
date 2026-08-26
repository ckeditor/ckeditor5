/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'hi': {
		dictionary: {
			// Toolbar button tooltip for the Unlink feature.
			'Unlink': 'Unlink',
			// Toolbar button tooltip for the Link feature.
			'Link': 'Link',
			// Label for the URL input in the Link URL editing balloon.
			'Link URL': 'Link URL',
			// An error text displayed when user attempted to enter an empty URL.
			'Link URL must not be empty.': 'लिंक का URL रिक्त नहीं होना चाहिए.',
			// Label for the image link button.
			'Link image': 'Link image',
			// Label for the link properties link balloon title.
			'Link properties': 'गुण लिंक करें',
			// Button opening the Link URL editing balloon.
			'Edit link': 'Edit link',
			// Button opening the link in new browser tab.
			'Open link in new tab': 'Open link in new tab',
			// The label of the switch button that controls whether the edited link will open in a new tab.
			'Open in a new tab': 'Open in a new tab',
			// The label of the switch button that controls whether the edited link refers to downloadable resource.
			'Downloadable': 'Downloadable',
			// Keystroke description for assistive technologies: keystroke for creating a link.
			'Create link': 'लिंक बनाएँ',
			// Keystroke description for assistive technologies: keystroke for moving out of a link.
			'Move out of a link': 'लिंक के बाहर जाएँ',
			// The label of the input field for the displayed text of the link.
			'Displayed text': 'प्रदर्शित टेक्स्ट',
			// Placeholder shown when placeholder items view is empty.
			'No links available': 'कोई लिंक उपलब्ध नहीं है',
			// The label of the switch button shown when link has empty href attribute.
			'This link has no URL': 'इस लिंक का कोई URL नहीं है.'
		}
	}
};

export default translations;
