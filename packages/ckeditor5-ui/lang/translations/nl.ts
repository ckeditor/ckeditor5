/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'nl': {
		dictionary: {
			// Title of the CKEditor5 editor.
			'Rich Text Editor': 'Tekstbewerker',
			// Label of the block toolbar icon (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Edit block': 'Blok aanpassen',
			// First part of the label of the block toolbar icon when functionality of drag and drop is available (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Click to edit block': 'Klik om blok te bewerken',
			// Second part of the label of the block toolbar icon when functionality of drag and drop is available (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Drag to move': 'Sleep om te verplaatsen',
			// Label for a button showing the next thing (tab, page, etc.).
			'Next': 'Volgende',
			// Label for a button showing the previous thing (tab, page, etc.).
			'Previous': 'Vorige',
			// Label used by assistive technologies describing a generic editor toolbar.
			'Editor toolbar': 'Editor welkbalk',
			// Label used by assistive technologies describing a toolbar displayed inside a dropdown.
			'Dropdown toolbar': 'Drop-down werkbalk',
			// Label used by assistive technologies describing a menu displayed inside a dropdown.
			'Dropdown menu': 'Keuzemenu',
			// Label of a button that applies a black color in color pickers.
			'Black': 'Zwart',
			// Label of a button that applies a dim grey color in color pickers.
			'Dim grey': 'Gedimd grijs',
			// Label of a button that applies a grey color in color pickers.
			'Grey': 'Grijs',
			// Label of a button that applies a light grey color in color pickers.
			'Light grey': 'Lichtgrijs',
			// Label of a button that applies a white color in color pickers.
			'White': 'Wit',
			// Label of a button that applies a red color in color pickers.
			'Red': 'Rood',
			// Label of a button that applies a orange color in color pickers.
			'Orange': 'Oranje',
			// Label of a button that applies a yellow color in color pickers.
			'Yellow': 'Geel',
			// Label of a button that applies a light green color in color pickers.
			'Light green': 'Lichtgroen',
			// Label of a button that applies a green color in color pickers.
			'Green': 'Groen',
			// Label of a button that applies a aquamarine color in color pickers.
			'Aquamarine': 'Aquamarijn',
			// Label of a button that applies a turquoise color in color pickers.
			'Turquoise': 'Turquoise',
			// Label of a button that applies a light blue color in color pickers.
			'Light blue': 'Lichtblauw',
			// Label of a button that applies a blue color in color pickers.
			'Blue': 'Blauw',
			// Label of a button that applies a purple color in color pickers.
			'Purple': 'Paars',
			// Accessible label of a toolbar that shows up next to the blocks of content (e.g. headings, paragraphs).
			'Editor block content toolbar': 'Inhoud werkbalk voor editorblok',
			// Accessible label of a balloon toolbar that shows up right next to the user selection (the caret).
			'Editor contextual toolbar': 'Contextuele werkbalk van editor',
			// Label of an input field for typing colors in the HEX color format.
			'HEX': 'HEX',
			// The main text of the message shown to the user when given query does not match any results.
			'No results found': 'Geen zoekresultaten',
			// The main text of the message shown to the user when no results are available.
			'No searchable items': 'Geen zoekbare items',
			// A default label of a dialog window displayed on top the editor.
			'Editor dialog': 'Dialoog bewerker',
			// The label and the tooltip for the close button in the dialog header.
			'Close': 'Sluiten',
			// Accessibility help dialog assistive technologies label telling users how to exit the dialog.
			'Help Contents. To close this dialog press ESC.': 'Inhoud Hulp. Druk op ESC om dit dialoogvenster te sluiten.',
			// Accessibility help dialog text explaining what can be found in that dialog.
			'Below, you can find a list of keyboard shortcuts that can be used in the editor.': 'Hieronder vindt u een lijst met sneltoetsen die in de editor gebruikt kunnen worden.',
			// Accessibility help dialog text displayed next to keystrokes that may require the Fn key on Mac.
			'(may require <kbd>Fn</kbd>)': '(<kbd>Fn</kbd>-toets is mogelijk vereist)',
			// The label for the button that opens the Accessibility help dialog from the application menu bar.
			'Accessibility': 'Toegankelijkheid',
			// Accessibility help dialog title.
			'Accessibility help': 'Hulp bij toegankelijkheid',
			// Assistive technologies label added to each editor editing area informing users about the possibility of opening the accessibility help dialog.
			'Press %0 for help.': 'Druk op %0 voor hulp.',
			// Keystroke description for assistive technologies: keystroke for moving focus out of an active dialog window.
			'Move focus in and out of an active dialog window': 'Beweeg de focus naar een actief dialoogvenster of er vandaan',
			// The label of the top-level application menu bar menu containing buttons and features related to the whole document (e.g. export to PDF, import from Word, etc.).
			'MENU_BAR_MENU_FILE': 'Bestand',
			// The label of the top-level application menu bar menu containing buttons and features related to general editing (e.g. undo, redo, select all, etc.).
			'MENU_BAR_MENU_EDIT': 'Wijzigen',
			// The label of the top-level application menu bar menu containing buttons and features related to the view of the editor (e.g. show source).
			'MENU_BAR_MENU_VIEW': 'Bekijk',
			// The label of the top-level application menu bar menu containing buttons and features that insert content (e.g. insert table, insert image, etc.).
			'MENU_BAR_MENU_INSERT': 'Invoegen',
			// The label of the top-level application menu bar menu containing buttons and features related to content formatting (e.g. bold, font color, heading, etc.).
			'MENU_BAR_MENU_FORMAT': 'Formaat',
			// The label of the top-level application menu bar menu containing various editor tools (e.g. AI assistant, track changes, etc.).
			'MENU_BAR_MENU_TOOLS': 'Gereedschap',
			// The label of the top-level application menu bar menu containing buttons and features helping users to learn about the editor (e.g. accessibility help).
			'MENU_BAR_MENU_HELP': 'Hulp',
			// The label of the application menu bar menu containing buttons and features that apply formatting to a text (e.g. bold, italic, etc.).
			'MENU_BAR_MENU_TEXT': 'Tekst',
			// The label of the application menu bar menu containing buttons and features that control the font of the edited content (e.g. font size, font color, etc.).
			'MENU_BAR_MENU_FONT': 'Lettertype',
			// The accessible label of the editor menu bar used by assistive technologies.
			'Editor menu bar': 'Menubalk editor',
			// An error text displayed when user attempted to enter an color that is not in HEX format.
			'Please enter a valid color (e.g. "ff0000").': 'Voer een geldige kleur in (bijvoorbeeld "ff0000").'
		}
	}
};

export default translations;
