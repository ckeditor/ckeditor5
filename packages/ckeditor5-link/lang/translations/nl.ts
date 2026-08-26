/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'nl': {
		dictionary: {
			// Toolbar button tooltip for the Unlink feature.
			'Unlink': 'Verwijder link',
			// Toolbar button tooltip for the Link feature.
			'Link': 'Link',
			// Label for the URL input in the Link URL editing balloon.
			'Link URL': 'Link URL',
			// An error text displayed when user attempted to enter an empty URL.
			'Link URL must not be empty.': 'URL-link mag niet leeg zijn.',
			// Label for the image link button.
			'Link image': 'Link afbeelding',
			// Label for the link properties link balloon title.
			'Link properties': 'Linkeigenschappen',
			// Button opening the Link URL editing balloon.
			'Edit link': 'Bewerk link',
			// Button opening the link in new browser tab.
			'Open link in new tab': 'Open link in nieuw tabblad',
			// The label of the switch button that controls whether the edited link will open in a new tab.
			'Open in a new tab': 'Open een nieuw tabblad',
			// The label of the switch button that controls whether the edited link refers to downloadable resource.
			'Downloadable': 'Downloadbaar',
			// Keystroke description for assistive technologies: keystroke for creating a link.
			'Create link': 'Creëer link',
			// Keystroke description for assistive technologies: keystroke for moving out of a link.
			'Move out of a link': 'Uit een link gaan',
			// The label of the input field for the displayed text of the link.
			'Displayed text': 'Weergegeven tekst',
			// Placeholder shown when placeholder items view is empty.
			'No links available': 'Geen links beschikbaar',
			// The label of the switch button shown when link has empty href attribute.
			'This link has no URL': 'Deze link heeft geen url'
		}
	}
};

export default translations;
