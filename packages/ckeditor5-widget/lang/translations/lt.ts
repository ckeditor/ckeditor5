/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'lt': {
		dictionary: {
			// The label used by assistive technologies describing a toolbar attached to a widget.
			'Widget toolbar': 'Valdiklių įrankių juosta',
			// The title displayed when a mouse is over a button that inserts a paragraph before a block.
			'Insert paragraph before block': 'Įkelti pastraipą prieš bloką',
			// The title displayed when a mouse is over a button that inserts a paragraph after a block.
			'Insert paragraph after block': 'Įkelti pastraipą po bloko',
			// Information to be read by screen reader about shortcuts to type around a widget.
			'Press Enter to type after or press Shift + Enter to type before the widget': 'Paspauskite Enter, jei norite rašyti po valdiklio, arba paspauskite Shift + Enter, jei norite rašyti prieš valdiklį.',
			// Accessibility help dialog section title for widget plugin keystrokes.
			'Keystrokes that can be used when a widget is selected (for example: image, table, etc.)': 'Klavišų paspaudimai, kuriuos galima naudoti pasirinkus valdiklį (pavyzdžiui, vaizdą, lentelę ir t. t.)',
			// Accessibility help dialog entry explaining the meaning of the keystroke that inserts a paragraph after a widget.
			'Insert a new paragraph directly after a widget': 'Įterpti naują pastraipą iškart po valdiklio',
			// Accessibility help dialog entry explaining the meaning of the keystroke that inserts a paragraph before a widget.
			'Insert a new paragraph directly before a widget': 'Įterpti naują pastraipą iškart prieš valdiklį',
			// Accessibility help dialog entry explaining the meaning of the keystroke that moves the caret before a widget.
			'Move the caret to allow typing directly before a widget': 'Perkelkite žymeklį, kad būtų galima rašyti iškart prieš valdiklį',
			// Accessibility help dialog entry explaining the meaning of the keystroke that moves the caret after a widget.
			'Move the caret to allow typing directly after a widget': 'Perkelkite žymeklį, kad būtų galima rašyti iškart po valdiklio',
			// Accessibility help dialog entry explaining the meaning of the keystroke that moves selection from a nested editable area back to the parent widget.
			'Move focus from an editable area back to the parent widget': 'Perkelti fokusą iš redaguojamos srities atgal į pagrindinį valdiklį'
		}
	}
};

export default translations;
