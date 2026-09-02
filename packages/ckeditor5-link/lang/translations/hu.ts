/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'hu': {
		dictionary: {
			// Toolbar button tooltip for the Unlink feature.
			'Unlink': 'Link eltávolítása',
			// Toolbar button tooltip for the Link feature.
			'Link': 'Link',
			// Label for the URL input in the Link URL editing balloon.
			'Link URL': 'URL link',
			// An error text displayed when user attempted to enter an empty URL.
			'Link URL must not be empty.': 'A link URL-címe nem lehet üres.',
			// Label for the image link button.
			'Link image': 'Hivatkozás',
			// Label for the link properties link balloon title.
			'Link properties': 'Link tulajdonságai',
			// Button opening the Link URL editing balloon.
			'Edit link': 'Link szerkesztése',
			// Button opening the link in new browser tab.
			'Open link in new tab': 'Link megnyitása új ablakban',
			// The label of the switch button that controls whether the edited link will open in a new tab.
			'Open in a new tab': 'Megnyitás új lapon',
			// The label of the switch button that controls whether the edited link refers to downloadable resource.
			'Downloadable': 'Letölthető',
			// Keystroke description for assistive technologies: keystroke for creating a link.
			'Create link': 'Link létrehozása',
			// Keystroke description for assistive technologies: keystroke for moving out of a link.
			'Move out of a link': 'Kilépés egy linkből',
			// The label of the input field for the displayed text of the link.
			'Displayed text': 'Megjelenő szöveg',
			// Placeholder shown when placeholder items view is empty.
			'No links available': 'Nincs elérhető link',
			// The label of the switch button shown when link has empty href attribute.
			'This link has no URL': 'Ennek a hivatkozásnak nincs URL-címe'
		}
	}
};

export default translations;
