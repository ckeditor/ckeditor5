/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'de': {
		dictionary: {
			// The label used by assistive technologies describing a toolbar attached to a widget.
			'Widget toolbar': 'Widget Werkzeugleiste',
			// The title displayed when a mouse is over a button that inserts a paragraph before a block.
			'Insert paragraph before block': 'Absatz vor Block einfügen',
			// The title displayed when a mouse is over a button that inserts a paragraph after a block.
			'Insert paragraph after block': 'Absatz nach Block einfügen',
			// Information to be read by screen reader about shortcuts to type around a widget.
			'Press Enter to type after or press Shift + Enter to type before the widget': 'Drücken Sie die Eingabetaste, um nach dem Widget zu tippen oder Shift + Eingabetaste, um vor dem Widget zu tippen.',
			// Accessibility help dialog section title for widget plugin keystrokes.
			'Keystrokes that can be used when a widget is selected (for example: image, table, etc.)': 'Tastatureingaben, die verwendet werden können, wenn ein Widget ausgewählt wurde (zum Beispiel: Bilder, Tabellen etc.)',
			// Accessibility help dialog entry explaining the meaning of the keystroke that inserts a paragraph after a widget.
			'Insert a new paragraph directly after a widget': 'Einen neuen Abschnitt direkt nach einem Widget einfügen',
			// Accessibility help dialog entry explaining the meaning of the keystroke that inserts a paragraph before a widget.
			'Insert a new paragraph directly before a widget': 'Einen neuen Abschnitt direkt vor einem Widget einfügen',
			// Accessibility help dialog entry explaining the meaning of the keystroke that moves the caret before a widget.
			'Move the caret to allow typing directly before a widget': 'Verschieben Sie den Textcursor, um die Eingabe direkt nach dem Widget zu erlauben',
			// Accessibility help dialog entry explaining the meaning of the keystroke that moves the caret after a widget.
			'Move the caret to allow typing directly after a widget': 'Verschieben Sie den Textcursor, um die direkte Eingabe nach dem Widget zu erlauben',
			// Accessibility help dialog entry explaining the meaning of the keystroke that moves selection from a nested editable area back to the parent widget.
			'Move focus from an editable area back to the parent widget': 'Bewegen Sie den Fokus von einem bearbeitbaren Bereich zurück zum übergeordneten Widget'
		}
	}
};

export default translations;
