/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'sr': {
		dictionary: {
			// Toolbar button tooltip for the Unlink feature.
			'Unlink': 'Отклони линк',
			// Toolbar button tooltip for the Link feature.
			'Link': 'Линк',
			// Label for the URL input in the Link URL editing balloon.
			'Link URL': 'УРЛ линк',
			// An error text displayed when user attempted to enter an empty URL.
			'Link URL must not be empty.': 'URL linka ne sme biti prazan.',
			// Label for the image link button.
			'Link image': 'Линк слике',
			// Label for the link properties link balloon title.
			'Link properties': 'Svojstva veze',
			// Button opening the Link URL editing balloon.
			'Edit link': 'Исправи линк',
			// Button opening the link in new browser tab.
			'Open link in new tab': 'Отвори линк у новом прозору',
			// The label of the switch button that controls whether the edited link will open in a new tab.
			'Open in a new tab': 'Отвори у новој картици',
			// The label of the switch button that controls whether the edited link refers to downloadable resource.
			'Downloadable': 'Могуће преузимање',
			// Keystroke description for assistive technologies: keystroke for creating a link.
			'Create link': 'Napravi vezu',
			// Keystroke description for assistive technologies: keystroke for moving out of a link.
			'Move out of a link': 'Idi sa veze',
			// The label of the input field for the displayed text of the link.
			'Displayed text': 'Prikazani tekst',
			// Placeholder shown when placeholder items view is empty.
			'No links available': 'Nema dostupnih veza',
			// The label of the switch button shown when link has empty href attribute.
			'This link has no URL': 'Ova veza nema URL'
		}
	}
};

export default translations;
