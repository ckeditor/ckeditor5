/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'sv': {
		dictionary: {
			// Toolbar button tooltip for the Unlink feature.
			'Unlink': 'Ta bort länk',
			// Toolbar button tooltip for the Link feature.
			'Link': 'Länk',
			// Label for the URL input in the Link URL editing balloon.
			'Link URL': 'Länkens URL',
			// An error text displayed when user attempted to enter an empty URL.
			'Link URL must not be empty.': 'Länkens URL får inte vara tom.',
			// Label for the image link button.
			'Link image': 'Länka bild',
			// Label for the link properties link balloon title.
			'Link properties': 'Länkegenskaper',
			// Button opening the Link URL editing balloon.
			'Edit link': 'Redigera länk',
			// Button opening the link in new browser tab.
			'Open link in new tab': 'Öppna länk i ny flik',
			// The label of the switch button that controls whether the edited link will open in a new tab.
			'Open in a new tab': 'Öppna i en ny flik',
			// The label of the switch button that controls whether the edited link refers to downloadable resource.
			'Downloadable': 'Nedladdningsbar',
			// Keystroke description for assistive technologies: keystroke for creating a link.
			'Create link': 'Skapa länk',
			// Keystroke description for assistive technologies: keystroke for moving out of a link.
			'Move out of a link': 'Flytta bort från länken',
			// The label of the input field for the displayed text of the link.
			'Displayed text': 'Visad text',
			// Placeholder shown when placeholder items view is empty.
			'No links available': 'Inga länkar tillgängliga',
			// The label of the switch button shown when link has empty href attribute.
			'This link has no URL': 'Den här länken har ingen URL'
		}
	}
};

export default translations;
