/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'ro': {
		dictionary: {
			// Toolbar button tooltip for the Unlink feature.
			'Unlink': 'Șterge link',
			// Toolbar button tooltip for the Link feature.
			'Link': 'Link',
			// Label for the URL input in the Link URL editing balloon.
			'Link URL': 'Link URL',
			// An error text displayed when user attempted to enter an empty URL.
			'Link URL must not be empty.': 'URL-ul linkului nu trebuie să fie necompletat.',
			// Label for the image link button.
			'Link image': 'Link imagine',
			// Label for the link properties link balloon title.
			'Link properties': 'Proprietățile linkului',
			// Button opening the Link URL editing balloon.
			'Edit link': 'Modifică link',
			// Button opening the link in new browser tab.
			'Open link in new tab': 'Deschide link în tab nou',
			// The label of the switch button that controls whether the edited link will open in a new tab.
			'Open in a new tab': 'Deschide în tab nou',
			// The label of the switch button that controls whether the edited link refers to downloadable resource.
			'Downloadable': 'Descărcabil',
			// Keystroke description for assistive technologies: keystroke for creating a link.
			'Create link': 'Crearea unui link',
			// Keystroke description for assistive technologies: keystroke for moving out of a link.
			'Move out of a link': 'Ieșire dintr-un link',
			// The label of the input field for the displayed text of the link.
			'Displayed text': 'Textul afișat',
			// Placeholder shown when placeholder items view is empty.
			'No links available': 'Niciun link disponibil',
			// The label of the switch button shown when link has empty href attribute.
			'This link has no URL': 'Acest link nu conține niciun URL'
		}
	}
};

export default translations;
