/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'fi': {
		dictionary: {
			// Toolbar button tooltip for the Unlink feature.
			'Unlink': 'Poista linkki',
			// Toolbar button tooltip for the Link feature.
			'Link': 'Linkki',
			// Label for the URL input in the Link URL editing balloon.
			'Link URL': 'Linkin osoite',
			// An error text displayed when user attempted to enter an empty URL.
			'Link URL must not be empty.': 'Linkin URL ei voi olla tyhjä.',
			// Label for the image link button.
			'Link image': 'Linkkikuva',
			// Label for the link properties link balloon title.
			'Link properties': 'Linkin ominaisuudet',
			// Button opening the Link URL editing balloon.
			'Edit link': 'Muokkaa linkkiä',
			// Button opening the link in new browser tab.
			'Open link in new tab': 'Avaa linkki uudessa välilehdessä',
			// The label of the switch button that controls whether the edited link will open in a new tab.
			'Open in a new tab': 'Avaa uudelle välilehdelle',
			// The label of the switch button that controls whether the edited link refers to downloadable resource.
			'Downloadable': 'Ladattava',
			// Keystroke description for assistive technologies: keystroke for creating a link.
			'Create link': 'Luo linkki',
			// Keystroke description for assistive technologies: keystroke for moving out of a link.
			'Move out of a link': 'Siirrä linkin ulkopuolelle',
			// The label of the input field for the displayed text of the link.
			'Displayed text': 'Näytettävä teksti',
			// Placeholder shown when placeholder items view is empty.
			'No links available': 'Linkkejä ei käytettävissä',
			// The label of the switch button shown when link has empty href attribute.
			'This link has no URL': 'Tällä linkillä ei ole URL-osoitetta'
		}
	}
};

export default translations;
