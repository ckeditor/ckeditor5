/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'ro': {
		dictionary: {
			// The label used by assistive technologies describing a toolbar attached to a widget.
			'Widget toolbar': 'Bară widget',
			// The title displayed when a mouse is over a button that inserts a paragraph before a block.
			'Insert paragraph before block': 'Inserează un paragraf înaintea blocului',
			// The title displayed when a mouse is over a button that inserts a paragraph after a block.
			'Insert paragraph after block': 'Inserează un paragraf după bloc',
			// Information to be read by screen reader about shortcuts to type around a widget.
			'Press Enter to type after or press Shift + Enter to type before the widget': 'Apăsați Enter pentru a scrie după widget sau Shift+Enter pentru a scrie înaintea acestuia',
			// Accessibility help dialog section title for widget plugin keystrokes.
			'Keystrokes that can be used when a widget is selected (for example: image, table, etc.)': 'Comenzi din tastatură care pot fi utilizate atunci când este selectat un widget (de exemplu: imagine, tabel etc.)',
			// Accessibility help dialog entry explaining the meaning of the keystroke that inserts a paragraph after a widget.
			'Insert a new paragraph directly after a widget': 'Inserează un nou paragraf direct după un widget',
			// Accessibility help dialog entry explaining the meaning of the keystroke that inserts a paragraph before a widget.
			'Insert a new paragraph directly before a widget': 'Inserează un nou paragraf direct înaintea unui widget',
			// Accessibility help dialog entry explaining the meaning of the keystroke that moves the caret before a widget.
			'Move the caret to allow typing directly before a widget': 'Mută cursorul pentru a permite tastarea direct înaintea unui widget',
			// Accessibility help dialog entry explaining the meaning of the keystroke that moves the caret after a widget.
			'Move the caret to allow typing directly after a widget': 'Mută cursorul pentru a permite tastarea direct după un widget',
			// Accessibility help dialog entry explaining the meaning of the keystroke that moves selection from a nested editable area back to the parent widget.
			'Move focus from an editable area back to the parent widget': 'Mutați centrul de interes dintr-o zonă editabilă înapoi la widgetul părinte'
		}
	}
};

export default translations;
