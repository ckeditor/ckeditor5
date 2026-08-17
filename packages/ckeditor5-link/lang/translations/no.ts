/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'no': {
		dictionary: {
			// Toolbar button tooltip for the Unlink feature.
			'Unlink': 'Fjern lenke',
			// Toolbar button tooltip for the Link feature.
			'Link': 'Lenke',
			// Label for the URL input in the Link URL editing balloon.
			'Link URL': 'Lenke-URL',
			// An error text displayed when user attempted to enter an empty URL.
			'Link URL must not be empty.': 'Link-URL kan ikke være tom.',
			// Label for the image link button.
			'Link image': 'Bildelenke',
			// Label for the link properties link balloon title.
			'Link properties': 'Lenkeegenskaper',
			// Button opening the Link URL editing balloon.
			'Edit link': 'Rediger lenke',
			// Button opening the link in new browser tab.
			'Open link in new tab': 'Åpne lenke i ny fane',
			// The label of the switch button that controls whether the edited link will open in a new tab.
			'Open in a new tab': 'Åpne i ny fane',
			// The label of the switch button that controls whether the edited link refers to downloadable resource.
			'Downloadable': 'Nedlastbar',
			// Keystroke description for assistive technologies: keystroke for creating a link.
			'Create link': 'Opprett lenke',
			// Keystroke description for assistive technologies: keystroke for moving out of a link.
			'Move out of a link': 'Flytt ut fra en lenke',
			// The label of the input field for the displayed text of the link.
			'Displayed text': 'Vist tekst',
			// Placeholder shown when placeholder items view is empty.
			'No links available': 'Ingen lenker tilgjengelig',
			// The label of the switch button shown when link has empty href attribute.
			'This link has no URL': 'Denne lenken har ingen URL'
		}
	}
};

export default translations;
