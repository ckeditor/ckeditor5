/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'lt': {
		dictionary: {
			// Toolbar button tooltip for the Unlink feature.
			'Unlink': 'Pašalinti nuorodą',
			// Toolbar button tooltip for the Link feature.
			'Link': 'Pridėti nuorodą',
			// Label for the URL input in the Link URL editing balloon.
			'Link URL': 'Nuorodos URL',
			// An error text displayed when user attempted to enter an empty URL.
			'Link URL must not be empty.': 'Nuorodos URL negali būti tuščias.',
			// Label for the image link button.
			'Link image': 'Susieti paveikslėlį',
			// Label for the link properties link balloon title.
			'Link properties': 'Nuorodos savybės',
			// Button opening the Link URL editing balloon.
			'Edit link': 'Keisti nuorodą',
			// Button opening the link in new browser tab.
			'Open link in new tab': 'Atidaryti nuorodą naujame skirtuke',
			// The label of the switch button that controls whether the edited link will open in a new tab.
			'Open in a new tab': 'Atverti naujoje kortelėje',
			// The label of the switch button that controls whether the edited link refers to downloadable resource.
			'Downloadable': 'Parsisiunčiamas',
			// Keystroke description for assistive technologies: keystroke for creating a link.
			'Create link': 'Sukurti nuorodą',
			// Keystroke description for assistive technologies: keystroke for moving out of a link.
			'Move out of a link': 'Išeiti iš nuorodos',
			// The label of the input field for the displayed text of the link.
			'Displayed text': 'Rodomas tekstas',
			// Placeholder shown when placeholder items view is empty.
			'No links available': 'Nėra jokių nuorodų',
			// The label of the switch button shown when link has empty href attribute.
			'This link has no URL': 'Ši nuoroda neturi URL'
		}
	}
};

export default translations;
