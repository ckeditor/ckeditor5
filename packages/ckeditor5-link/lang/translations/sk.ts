/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'sk': {
		dictionary: {
			// Toolbar button tooltip for the Unlink feature.
			'Unlink': 'Zrušiť odkaz',
			// Toolbar button tooltip for the Link feature.
			'Link': 'Odkaz',
			// Label for the URL input in the Link URL editing balloon.
			'Link URL': 'URL adresa',
			// An error text displayed when user attempted to enter an empty URL.
			'Link URL must not be empty.': 'Adresa odkazu URL nesmie byť prázdna.',
			// Label for the image link button.
			'Link image': 'Adresa obrázku',
			// Label for the link properties link balloon title.
			'Link properties': 'Vlastnosti odkazu',
			// Button opening the Link URL editing balloon.
			'Edit link': 'Upraviť odkaz',
			// Button opening the link in new browser tab.
			'Open link in new tab': 'Otvoriť odkaz v novom okne',
			// The label of the switch button that controls whether the edited link will open in a new tab.
			'Open in a new tab': 'Otvoriť v novej záložke',
			// The label of the switch button that controls whether the edited link refers to downloadable resource.
			'Downloadable': 'Na stiahnutie',
			// Keystroke description for assistive technologies: keystroke for creating a link.
			'Create link': 'Vytvoriť odkaz',
			// Keystroke description for assistive technologies: keystroke for moving out of a link.
			'Move out of a link': 'Presunúť sa mimo odkazu',
			// The label of the input field for the displayed text of the link.
			'Displayed text': 'Zobrazený text',
			// Placeholder shown when placeholder items view is empty.
			'No links available': 'Nie sú dostupné žiadne odkazy',
			// The label of the switch button shown when link has empty href attribute.
			'This link has no URL': 'Tento odkaz nemá URL adresu'
		}
	}
};

export default translations;
