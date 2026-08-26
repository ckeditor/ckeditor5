/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'de': {
		dictionary: {
			// Toolbar button tooltip for the Unlink feature.
			'Unlink': 'Link entfernen',
			// Toolbar button tooltip for the Link feature.
			'Link': 'Link',
			// Label for the URL input in the Link URL editing balloon.
			'Link URL': 'Linkadresse',
			// An error text displayed when user attempted to enter an empty URL.
			'Link URL must not be empty.': 'Die Link-URL darf nicht leer sein.',
			// Label for the image link button.
			'Link image': 'Bild verlinken',
			// Label for the link properties link balloon title.
			'Link properties': 'Linkeigenschaften',
			// Button opening the Link URL editing balloon.
			'Edit link': 'Link bearbeiten',
			// Button opening the link in new browser tab.
			'Open link in new tab': 'Link im neuen Tab öffnen',
			// The label of the switch button that controls whether the edited link will open in a new tab.
			'Open in a new tab': 'In neuem Tab öffnen',
			// The label of the switch button that controls whether the edited link refers to downloadable resource.
			'Downloadable': 'Herunterladbar',
			// Keystroke description for assistive technologies: keystroke for creating a link.
			'Create link': 'Link erstellen',
			// Keystroke description for assistive technologies: keystroke for moving out of a link.
			'Move out of a link': 'Linkauswahl aufheben',
			// The label of the input field for the displayed text of the link.
			'Displayed text': 'Angezeigter Text',
			// Placeholder shown when placeholder items view is empty.
			'No links available': 'Keine Links verfügbar',
			// The label of the switch button shown when link has empty href attribute.
			'This link has no URL': 'Diesem Link fehlt die URL'
		}
	}
};

export default translations;
