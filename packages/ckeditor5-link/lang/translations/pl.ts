/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'pl': {
		dictionary: {
			// Toolbar button tooltip for the Unlink feature.
			'Unlink': 'Usuń odnośnik',
			// Toolbar button tooltip for the Link feature.
			'Link': 'Wstaw odnośnik',
			// Label for the URL input in the Link URL editing balloon.
			'Link URL': 'Adres URL',
			// An error text displayed when user attempted to enter an empty URL.
			'Link URL must not be empty.': 'Adres URL linku nie może być pusty',
			// Label for the image link button.
			'Link image': 'Wstaw odnośnik do obrazka',
			// Label for the link properties link balloon title.
			'Link properties': 'Właściwości linku',
			// Button opening the Link URL editing balloon.
			'Edit link': 'Edytuj odnośnik',
			// Button opening the link in new browser tab.
			'Open link in new tab': 'Otwórz odnośnik w nowej zakładce',
			// The label of the switch button that controls whether the edited link will open in a new tab.
			'Open in a new tab': 'Otwórz w nowej zakładce',
			// The label of the switch button that controls whether the edited link refers to downloadable resource.
			'Downloadable': 'Do pobrania',
			// Keystroke description for assistive technologies: keystroke for creating a link.
			'Create link': 'Tworzy link',
			// Keystroke description for assistive technologies: keystroke for moving out of a link.
			'Move out of a link': 'Umożliwia wyjście z linku',
			// The label of the input field for the displayed text of the link.
			'Displayed text': 'Wyświetlany tekst',
			// Placeholder shown when placeholder items view is empty.
			'No links available': 'Brak dostępnych linków',
			// The label of the switch button shown when link has empty href attribute.
			'This link has no URL': 'Ten link nie ma adresu URL'
		}
	}
};

export default translations;
