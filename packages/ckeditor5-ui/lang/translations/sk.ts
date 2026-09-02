/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'sk': {
		dictionary: {
			// Title of the CKEditor5 editor.
			'Rich Text Editor': 'Editor s formátovaním',
			// Label of the block toolbar icon (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Edit block': 'Upraviť odsek',
			// First part of the label of the block toolbar icon when functionality of drag and drop is available (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Click to edit block': 'Úprava bloku kliknutím',
			// Second part of the label of the block toolbar icon when functionality of drag and drop is available (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Drag to move': 'Potiahnuť a presunúť',
			// Label for a button showing the next thing (tab, page, etc.).
			'Next': 'Ďalšie',
			// Label for a button showing the previous thing (tab, page, etc.).
			'Previous': 'Predchádzajúce',
			// Label used by assistive technologies describing a generic editor toolbar.
			'Editor toolbar': 'Panel nástrojov editora',
			// Label used by assistive technologies describing a toolbar displayed inside a dropdown.
			'Dropdown toolbar': 'Panel nástrojov roletového menu',
			// Label used by assistive technologies describing a menu displayed inside a dropdown.
			'Dropdown menu': 'Rozbaľovacia ponuka',
			// Label of a button that applies a black color in color pickers.
			'Black': 'Čierna',
			// Label of a button that applies a dim grey color in color pickers.
			'Dim grey': 'Tmavosivá',
			// Label of a button that applies a grey color in color pickers.
			'Grey': 'Sivá',
			// Label of a button that applies a light grey color in color pickers.
			'Light grey': 'Bledosivá',
			// Label of a button that applies a white color in color pickers.
			'White': 'Biela',
			// Label of a button that applies a red color in color pickers.
			'Red': 'Červená',
			// Label of a button that applies a orange color in color pickers.
			'Orange': 'Oranžová',
			// Label of a button that applies a yellow color in color pickers.
			'Yellow': 'Žltá',
			// Label of a button that applies a light green color in color pickers.
			'Light green': 'Bledozelená',
			// Label of a button that applies a green color in color pickers.
			'Green': 'Zelená',
			// Label of a button that applies a aquamarine color in color pickers.
			'Aquamarine': 'Akvamarínová',
			// Label of a button that applies a turquoise color in color pickers.
			'Turquoise': 'Tyrkysová',
			// Label of a button that applies a light blue color in color pickers.
			'Light blue': 'Bledomodrá',
			// Label of a button that applies a blue color in color pickers.
			'Blue': 'Modrá',
			// Label of a button that applies a purple color in color pickers.
			'Purple': 'Fialová',
			// Accessible label of a toolbar that shows up next to the blocks of content (e.g. headings, paragraphs).
			'Editor block content toolbar': 'Panel s nástrojmi obsahu bloku editora',
			// Accessible label of a balloon toolbar that shows up right next to the user selection (the caret).
			'Editor contextual toolbar': 'Kontextový panel nástrojov editora',
			// Label of an input field for typing colors in the HEX color format.
			'HEX': 'HEX',
			// The main text of the message shown to the user when given query does not match any results.
			'No results found': 'Neboli nájdené žiadne výsledky',
			// The main text of the message shown to the user when no results are available.
			'No searchable items': 'Žiadne vyhľadávateľné položky',
			// A default label of a dialog window displayed on top the editor.
			'Editor dialog': 'Dialóg editora',
			// The label and the tooltip for the close button in the dialog header.
			'Close': 'Zatvoriť',
			// Accessibility help dialog assistive technologies label telling users how to exit the dialog.
			'Help Contents. To close this dialog press ESC.': 'Obsah pomocníka. Toto dialógové okno zavriete klávesom Esc.',
			// Accessibility help dialog text explaining what can be found in that dialog.
			'Below, you can find a list of keyboard shortcuts that can be used in the editor.': 'Nižšie nájdete zoznam klávesových skratiek, ktoré môžete používať v editore.',
			// Accessibility help dialog text displayed next to keystrokes that may require the Fn key on Mac.
			'(may require <kbd>Fn</kbd>)': '(môže si vyžadovať stlačenie klávesu <kbd>Fn</kbd>)',
			// The label for the button that opens the Accessibility help dialog from the application menu bar.
			'Accessibility': 'Dostupnosť',
			// Accessibility help dialog title.
			'Accessibility help': 'Pomoc so zjednodušením ovládania',
			// Assistive technologies label added to each editor editing area informing users about the possibility of opening the accessibility help dialog.
			'Press %0 for help.': 'Ak potrebujete pomoc, stlačte %0.',
			// Keystroke description for assistive technologies: keystroke for moving focus out of an active dialog window.
			'Move focus in and out of an active dialog window': 'Presunúť zameranie z/do aktívneho dialógového okna',
			// The label of the top-level application menu bar menu containing buttons and features related to the whole document (e.g. export to PDF, import from Word, etc.).
			'MENU_BAR_MENU_FILE': 'Súbor',
			// The label of the top-level application menu bar menu containing buttons and features related to general editing (e.g. undo, redo, select all, etc.).
			'MENU_BAR_MENU_EDIT': 'Upraviť',
			// The label of the top-level application menu bar menu containing buttons and features related to the view of the editor (e.g. show source).
			'MENU_BAR_MENU_VIEW': 'Zobraziť',
			// The label of the top-level application menu bar menu containing buttons and features that insert content (e.g. insert table, insert image, etc.).
			'MENU_BAR_MENU_INSERT': 'Vložiť',
			// The label of the top-level application menu bar menu containing buttons and features related to content formatting (e.g. bold, font color, heading, etc.).
			'MENU_BAR_MENU_FORMAT': 'Formát',
			// The label of the top-level application menu bar menu containing various editor tools (e.g. AI assistant, track changes, etc.).
			'MENU_BAR_MENU_TOOLS': 'Nástroje',
			// The label of the top-level application menu bar menu containing buttons and features helping users to learn about the editor (e.g. accessibility help).
			'MENU_BAR_MENU_HELP': 'Pomoc',
			// The label of the application menu bar menu containing buttons and features that apply formatting to a text (e.g. bold, italic, etc.).
			'MENU_BAR_MENU_TEXT': 'Text',
			// The label of the application menu bar menu containing buttons and features that control the font of the edited content (e.g. font size, font color, etc.).
			'MENU_BAR_MENU_FONT': 'Font',
			// The accessible label of the editor menu bar used by assistive technologies.
			'Editor menu bar': 'Lišta ponuky editora',
			// An error text displayed when user attempted to enter an color that is not in HEX format.
			'Please enter a valid color (e.g. "ff0000").': 'Zadajte platnú farbu (napr. „ff0000“).'
		}
	}
};

export default translations;
