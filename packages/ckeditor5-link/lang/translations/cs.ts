/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'cs': {
		dictionary: {
			// Toolbar button tooltip for the Unlink feature.
			'Unlink': 'Odstranit odkaz',
			// Toolbar button tooltip for the Link feature.
			'Link': 'Odkaz',
			// Label for the URL input in the Link URL editing balloon.
			'Link URL': 'URL odkazu',
			// An error text displayed when user attempted to enter an empty URL.
			'Link URL must not be empty.': 'Adresa URL odkazu nesmí být prázdná.',
			// Label for the image link button.
			'Link image': 'Adresa obrázku',
			// Label for the link properties link balloon title.
			'Link properties': 'Vlastnosti odkazu',
			// Button opening the Link URL editing balloon.
			'Edit link': 'Upravit odkaz',
			// Button opening the link in new browser tab.
			'Open link in new tab': 'Otevřít odkaz v nové kartě',
			// The label of the switch button that controls whether the edited link will open in a new tab.
			'Open in a new tab': 'Otevřít v nové kartě',
			// The label of the switch button that controls whether the edited link refers to downloadable resource.
			'Downloadable': 'Ke stažení',
			// Keystroke description for assistive technologies: keystroke for creating a link.
			'Create link': 'Vytvořit odkaz',
			// Keystroke description for assistive technologies: keystroke for moving out of a link.
			'Move out of a link': 'Odejít z odkazu',
			// The label of the input field for the displayed text of the link.
			'Displayed text': 'Zobrazený text',
			// Placeholder shown when placeholder items view is empty.
			'No links available': 'Žádné dostupné odkazy',
			// The label of the switch button shown when link has empty href attribute.
			'This link has no URL': 'Tento odkaz nemá adresu URL'
		}
	}
};

export default translations;
