/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'fi': {
		dictionary: {
			// The label used by assistive technologies describing a toolbar attached to a widget.
			'Widget toolbar': 'Widget-työkalupalkki',
			// The title displayed when a mouse is over a button that inserts a paragraph before a block.
			'Insert paragraph before block': 'Liitä kappale ennen lohkoa',
			// The title displayed when a mouse is over a button that inserts a paragraph after a block.
			'Insert paragraph after block': 'Liitä kappale lohkon jälkeen',
			// Information to be read by screen reader about shortcuts to type around a widget.
			'Press Enter to type after or press Shift + Enter to type before the widget': 'Paina enter-näppäintä kirjoittaaksesi tai paina shift + enter kirjoittaaksesi ennen widget-sovellusta',
			// Accessibility help dialog section title for widget plugin keystrokes.
			'Keystrokes that can be used when a widget is selected (for example: image, table, etc.)': 'Painallukset, joita voidaan käyttää widgetin valitsemisen yhteydessä (esimerkiksi: kuva, taulukko jne.)',
			// Accessibility help dialog entry explaining the meaning of the keystroke that inserts a paragraph after a widget.
			'Insert a new paragraph directly after a widget': 'Lisää uusi kappale suoraan widgetin jälkeen',
			// Accessibility help dialog entry explaining the meaning of the keystroke that inserts a paragraph before a widget.
			'Insert a new paragraph directly before a widget': 'Lisää uusi kappale suoraan widgetin eteen',
			// Accessibility help dialog entry explaining the meaning of the keystroke that moves the caret before a widget.
			'Move the caret to allow typing directly before a widget': 'Siirrä sirkumfleksimerkkiä voidaksesi kirjoittaa suoraan ennen widgetiä',
			// Accessibility help dialog entry explaining the meaning of the keystroke that moves the caret after a widget.
			'Move the caret to allow typing directly after a widget': 'Siirrä sirkumfleksimerkkiä voidaksesi kirjoittaa suoraan widgetin jälkeen',
			// Accessibility help dialog entry explaining the meaning of the keystroke that moves selection from a nested editable area back to the parent widget.
			'Move focus from an editable area back to the parent widget': 'Siirrä valinta muokattavasta alueesta takaisin pääpienoissovellukseen'
		}
	}
};

export default translations;
