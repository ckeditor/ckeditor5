/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'hu': {
		dictionary: {
			// Title of the CKEditor5 editor.
			'Rich Text Editor': 'Bővített szövegszerkesztő',
			// Label of the block toolbar icon (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Edit block': 'Blokk szerkesztése',
			// First part of the label of the block toolbar icon when functionality of drag and drop is available (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Click to edit block': 'Kattintson a blokk szerkesztéséhez',
			// Second part of the label of the block toolbar icon when functionality of drag and drop is available (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Drag to move': 'Húzza a mozgatáshoz',
			// Label for a button showing the next thing (tab, page, etc.).
			'Next': 'Következő',
			// Label for a button showing the previous thing (tab, page, etc.).
			'Previous': 'Előző',
			// Label used by assistive technologies describing a generic editor toolbar.
			'Editor toolbar': 'Szerkesztő eszköztár',
			// Label used by assistive technologies describing a toolbar displayed inside a dropdown.
			'Dropdown toolbar': 'Lenyíló eszköztár',
			// Label used by assistive technologies describing a menu displayed inside a dropdown.
			'Dropdown menu': 'Legördülő menü',
			// Label of a button that applies a black color in color pickers.
			'Black': 'Fekete',
			// Label of a button that applies a dim grey color in color pickers.
			'Dim grey': 'Halvány szürke',
			// Label of a button that applies a grey color in color pickers.
			'Grey': 'Szürke',
			// Label of a button that applies a light grey color in color pickers.
			'Light grey': 'Világosszürke',
			// Label of a button that applies a white color in color pickers.
			'White': 'Fehér',
			// Label of a button that applies a red color in color pickers.
			'Red': 'Piros',
			// Label of a button that applies a orange color in color pickers.
			'Orange': 'Narancs',
			// Label of a button that applies a yellow color in color pickers.
			'Yellow': 'Sárga',
			// Label of a button that applies a light green color in color pickers.
			'Light green': 'Világoszöld',
			// Label of a button that applies a green color in color pickers.
			'Green': 'Zöld',
			// Label of a button that applies a aquamarine color in color pickers.
			'Aquamarine': 'Kékeszöld',
			// Label of a button that applies a turquoise color in color pickers.
			'Turquoise': 'Türkiz',
			// Label of a button that applies a light blue color in color pickers.
			'Light blue': 'Világoskék',
			// Label of a button that applies a blue color in color pickers.
			'Blue': 'Kék',
			// Label of a button that applies a purple color in color pickers.
			'Purple': 'Lila',
			// Accessible label of a toolbar that shows up next to the blocks of content (e.g. headings, paragraphs).
			'Editor block content toolbar': 'Szerkesztő - tartalomblokk  eszköztár',
			// Accessible label of a balloon toolbar that shows up right next to the user selection (the caret).
			'Editor contextual toolbar': 'Szerkesztő - szövegre vonatkozó eszköztár',
			// Label of an input field for typing colors in the HEX color format.
			'HEX': 'HEX színkód',
			// The main text of the message shown to the user when given query does not match any results.
			'No results found': 'Nincs találat',
			// The main text of the message shown to the user when no results are available.
			'No searchable items': 'Nincsenek kereshető elemek',
			// A default label of a dialog window displayed on top the editor.
			'Editor dialog': 'Szerkesztői párbeszédpanel',
			// The label and the tooltip for the close button in the dialog header.
			'Close': 'Bezárás',
			// Accessibility help dialog assistive technologies label telling users how to exit the dialog.
			'Help Contents. To close this dialog press ESC.': 'Súgó tartalmak. A párbeszéd ablak bezárásához használd az ESC billentyűt.',
			// Accessibility help dialog text explaining what can be found in that dialog.
			'Below, you can find a list of keyboard shortcuts that can be used in the editor.': 'Alább megtalálod a szerkesztéshez használható gyorsbillentyűk listáját.',
			// Accessibility help dialog text displayed next to keystrokes that may require the Fn key on Mac.
			'(may require <kbd>Fn</kbd>)': '(szükség lehet a <kbd>Fn</kbd> használatára)',
			// The label for the button that opens the Accessibility help dialog from the application menu bar.
			'Accessibility': 'Elérhetőség',
			// Accessibility help dialog title.
			'Accessibility help': 'Kisegítő lehetőségek',
			// Assistive technologies label added to each editor editing area informing users about the possibility of opening the accessibility help dialog.
			'Press %0 for help.': 'Segítségért nyomd le a %0 billentyűt.',
			// Keystroke description for assistive technologies: keystroke for moving focus out of an active dialog window.
			'Move focus in and out of an active dialog window': 'Mozdítsd ki és be az aktív párbeszéd ablakot',
			// The label of the top-level application menu bar menu containing buttons and features related to the whole document (e.g. export to PDF, import from Word, etc.).
			'MENU_BAR_MENU_FILE': 'Fájl',
			// The label of the top-level application menu bar menu containing buttons and features related to general editing (e.g. undo, redo, select all, etc.).
			'MENU_BAR_MENU_EDIT': 'Szerkesztés',
			// The label of the top-level application menu bar menu containing buttons and features related to the view of the editor (e.g. show source).
			'MENU_BAR_MENU_VIEW': 'Megjelenítés',
			// The label of the top-level application menu bar menu containing buttons and features that insert content (e.g. insert table, insert image, etc.).
			'MENU_BAR_MENU_INSERT': 'Beszúrás',
			// The label of the top-level application menu bar menu containing buttons and features related to content formatting (e.g. bold, font color, heading, etc.).
			'MENU_BAR_MENU_FORMAT': 'Formátum',
			// The label of the top-level application menu bar menu containing various editor tools (e.g. AI assistant, track changes, etc.).
			'MENU_BAR_MENU_TOOLS': 'Eszközök',
			// The label of the top-level application menu bar menu containing buttons and features helping users to learn about the editor (e.g. accessibility help).
			'MENU_BAR_MENU_HELP': 'Súgó',
			// The label of the application menu bar menu containing buttons and features that apply formatting to a text (e.g. bold, italic, etc.).
			'MENU_BAR_MENU_TEXT': 'Szöveg',
			// The label of the application menu bar menu containing buttons and features that control the font of the edited content (e.g. font size, font color, etc.).
			'MENU_BAR_MENU_FONT': 'Betűtípus',
			// The accessible label of the editor menu bar used by assistive technologies.
			'Editor menu bar': 'Szerkesztő menüsora',
			// An error text displayed when user attempted to enter an color that is not in HEX format.
			'Please enter a valid color (e.g. "ff0000").': 'Adjon meg egy érvényes színt (pl. "ff0000").'
		}
	}
};

export default translations;
