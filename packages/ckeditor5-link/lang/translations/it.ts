/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'it': {
		dictionary: {
			// Toolbar button tooltip for the Unlink feature.
			'Unlink': 'Elimina collegamento',
			// Toolbar button tooltip for the Link feature.
			'Link': 'Collegamento',
			// Label for the URL input in the Link URL editing balloon.
			'Link URL': 'URL del collegamento',
			// An error text displayed when user attempted to enter an empty URL.
			'Link URL must not be empty.': 'L\'URL del link non può essere lasciato in bianco.',
			// Label for the image link button.
			'Link image': 'Collega immagine',
			// Label for the link properties link balloon title.
			'Link properties': 'Proprietà del link',
			// Button opening the Link URL editing balloon.
			'Edit link': 'Modifica collegamento',
			// Button opening the link in new browser tab.
			'Open link in new tab': 'Apri collegamento in nuova scheda',
			// The label of the switch button that controls whether the edited link will open in a new tab.
			'Open in a new tab': 'Apri in una nuova scheda',
			// The label of the switch button that controls whether the edited link refers to downloadable resource.
			'Downloadable': 'Scaricabile',
			// Keystroke description for assistive technologies: keystroke for creating a link.
			'Create link': 'Crea un link',
			// Keystroke description for assistive technologies: keystroke for moving out of a link.
			'Move out of a link': 'Esce da un link',
			// The label of the input field for the displayed text of the link.
			'Displayed text': 'Testo visualizzato',
			// Placeholder shown when placeholder items view is empty.
			'No links available': 'Nessun link disponibile',
			// The label of the switch button shown when link has empty href attribute.
			'This link has no URL': 'Questo link non include un URL'
		}
	}
};

export default translations;
