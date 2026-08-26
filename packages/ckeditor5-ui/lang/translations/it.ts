/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'it': {
		dictionary: {
			// Title of the CKEditor5 editor.
			'Rich Text Editor': 'Editor di testo formattato',
			// Label of the block toolbar icon (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Edit block': 'Modifica blocco',
			// First part of the label of the block toolbar icon when functionality of drag and drop is available (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Click to edit block': 'Clicca per modificare il blocco',
			// Second part of the label of the block toolbar icon when functionality of drag and drop is available (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Drag to move': 'Trascina per spostare',
			// Label for a button showing the next thing (tab, page, etc.).
			'Next': 'Avanti',
			// Label for a button showing the previous thing (tab, page, etc.).
			'Previous': 'Indietro',
			// Label used by assistive technologies describing a generic editor toolbar.
			'Editor toolbar': 'Barra degli strumenti dell\'editor',
			// Label used by assistive technologies describing a toolbar displayed inside a dropdown.
			'Dropdown toolbar': 'Barra degli strumenti del menu a discesa',
			// Label used by assistive technologies describing a menu displayed inside a dropdown.
			'Dropdown menu': 'Menu a discesa',
			// Label of a button that applies a black color in color pickers.
			'Black': 'Nero',
			// Label of a button that applies a dim grey color in color pickers.
			'Dim grey': 'Grigio tenue',
			// Label of a button that applies a grey color in color pickers.
			'Grey': 'Grigio',
			// Label of a button that applies a light grey color in color pickers.
			'Light grey': 'Grigio chiaro',
			// Label of a button that applies a white color in color pickers.
			'White': 'Bianco',
			// Label of a button that applies a red color in color pickers.
			'Red': 'Rosso',
			// Label of a button that applies a orange color in color pickers.
			'Orange': 'Arancio',
			// Label of a button that applies a yellow color in color pickers.
			'Yellow': 'Giallo',
			// Label of a button that applies a light green color in color pickers.
			'Light green': 'Verde chiaro',
			// Label of a button that applies a green color in color pickers.
			'Green': 'Verde',
			// Label of a button that applies a aquamarine color in color pickers.
			'Aquamarine': 'Aquamarina',
			// Label of a button that applies a turquoise color in color pickers.
			'Turquoise': 'Turchese',
			// Label of a button that applies a light blue color in color pickers.
			'Light blue': 'Azzurro',
			// Label of a button that applies a blue color in color pickers.
			'Blue': 'Blu',
			// Label of a button that applies a purple color in color pickers.
			'Purple': 'Porpora',
			// Accessible label of a toolbar that shows up next to the blocks of content (e.g. headings, paragraphs).
			'Editor block content toolbar': 'Barra degli strumenti contestuale dell\'editor del blocco',
			// Accessible label of a balloon toolbar that shows up right next to the user selection (the caret).
			'Editor contextual toolbar': 'Barra degli strumenti contestuale dell\'editor',
			// Label of an input field for typing colors in the HEX color format.
			'HEX': 'HEX',
			// The main text of the message shown to the user when given query does not match any results.
			'No results found': 'Nessun risultato trovato',
			// The main text of the message shown to the user when no results are available.
			'No searchable items': 'Nessun elemento ricercabile',
			// A default label of a dialog window displayed on top the editor.
			'Editor dialog': 'Finestra di dialogo dell\'editor',
			// The label and the tooltip for the close button in the dialog header.
			'Close': 'Chiudi',
			// Accessibility help dialog assistive technologies label telling users how to exit the dialog.
			'Help Contents. To close this dialog press ESC.': 'Sommario della guida. Per chiudere questa finestra di dialogo premi ESC.',
			// Accessibility help dialog text explaining what can be found in that dialog.
			'Below, you can find a list of keyboard shortcuts that can be used in the editor.': 'Qui sotto puoi trovare un elenco di scorciatoie da tastiera che possono essere utilizzate nell\'editor.',
			// Accessibility help dialog text displayed next to keystrokes that may require the Fn key on Mac.
			'(may require <kbd>Fn</kbd>)': '(può richiedere <kbd>Fn</kbd>)',
			// The label for the button that opens the Accessibility help dialog from the application menu bar.
			'Accessibility': 'Accessibilità',
			// Accessibility help dialog title.
			'Accessibility help': 'Guida all\'accessibilità',
			// Assistive technologies label added to each editor editing area informing users about the possibility of opening the accessibility help dialog.
			'Press %0 for help.': 'Premi %0 per aprire la guida.',
			// Keystroke description for assistive technologies: keystroke for moving focus out of an active dialog window.
			'Move focus in and out of an active dialog window': 'Seleziona/deseleziona una finestra di dialogo attiva',
			// The label of the top-level application menu bar menu containing buttons and features related to the whole document (e.g. export to PDF, import from Word, etc.).
			'MENU_BAR_MENU_FILE': 'File',
			// The label of the top-level application menu bar menu containing buttons and features related to general editing (e.g. undo, redo, select all, etc.).
			'MENU_BAR_MENU_EDIT': 'Modifica',
			// The label of the top-level application menu bar menu containing buttons and features related to the view of the editor (e.g. show source).
			'MENU_BAR_MENU_VIEW': 'Vista',
			// The label of the top-level application menu bar menu containing buttons and features that insert content (e.g. insert table, insert image, etc.).
			'MENU_BAR_MENU_INSERT': 'Inserisci',
			// The label of the top-level application menu bar menu containing buttons and features related to content formatting (e.g. bold, font color, heading, etc.).
			'MENU_BAR_MENU_FORMAT': 'Formato',
			// The label of the top-level application menu bar menu containing various editor tools (e.g. AI assistant, track changes, etc.).
			'MENU_BAR_MENU_TOOLS': 'Strumenti',
			// The label of the top-level application menu bar menu containing buttons and features helping users to learn about the editor (e.g. accessibility help).
			'MENU_BAR_MENU_HELP': 'Aiuto',
			// The label of the application menu bar menu containing buttons and features that apply formatting to a text (e.g. bold, italic, etc.).
			'MENU_BAR_MENU_TEXT': 'Testo',
			// The label of the application menu bar menu containing buttons and features that control the font of the edited content (e.g. font size, font color, etc.).
			'MENU_BAR_MENU_FONT': 'Carattere',
			// The accessible label of the editor menu bar used by assistive technologies.
			'Editor menu bar': 'Barra dei menu dell\'editor',
			// An error text displayed when user attempted to enter an color that is not in HEX format.
			'Please enter a valid color (e.g. "ff0000").': 'Inserisci un colore valido (ad esempio "ff0000").'
		}
	}
};

export default translations;
