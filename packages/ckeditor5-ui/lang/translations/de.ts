/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'de': {
		dictionary: {
			// Title of the CKEditor5 editor.
			'Rich Text Editor': 'Rich Text Editor',
			// Label of the block toolbar icon (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Edit block': 'Absatz bearbeiten',
			// First part of the label of the block toolbar icon when functionality of drag and drop is available (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Click to edit block': 'Zum Bearbeiten des Blocks klicken',
			// Second part of the label of the block toolbar icon when functionality of drag and drop is available (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Drag to move': 'Zum Verschieben ziehen',
			// Label for a button showing the next thing (tab, page, etc.).
			'Next': 'Nächste',
			// Label for a button showing the previous thing (tab, page, etc.).
			'Previous': 'vorherige',
			// Label used by assistive technologies describing a generic editor toolbar.
			'Editor toolbar': 'Editor Werkzeugleiste',
			// Label used by assistive technologies describing a toolbar displayed inside a dropdown.
			'Dropdown toolbar': 'Dropdown-Liste Werkzeugleiste',
			// Label used by assistive technologies describing a menu displayed inside a dropdown.
			'Dropdown menu': 'Dropdown-Menü',
			// Label of a button that applies a black color in color pickers.
			'Black': 'Schwarz',
			// Label of a button that applies a dim grey color in color pickers.
			'Dim grey': 'Dunkelgrau',
			// Label of a button that applies a grey color in color pickers.
			'Grey': 'Grau',
			// Label of a button that applies a light grey color in color pickers.
			'Light grey': 'Hellgrau',
			// Label of a button that applies a white color in color pickers.
			'White': 'Weiß',
			// Label of a button that applies a red color in color pickers.
			'Red': 'Rot',
			// Label of a button that applies a orange color in color pickers.
			'Orange': 'Orange',
			// Label of a button that applies a yellow color in color pickers.
			'Yellow': 'Gelb',
			// Label of a button that applies a light green color in color pickers.
			'Light green': 'Hellgrün',
			// Label of a button that applies a green color in color pickers.
			'Green': 'Grün',
			// Label of a button that applies a aquamarine color in color pickers.
			'Aquamarine': 'Aquamarinblau',
			// Label of a button that applies a turquoise color in color pickers.
			'Turquoise': 'Türkis',
			// Label of a button that applies a light blue color in color pickers.
			'Light blue': 'Hellblau',
			// Label of a button that applies a blue color in color pickers.
			'Blue': 'Blau',
			// Label of a button that applies a purple color in color pickers.
			'Purple': 'Violett',
			// Accessible label of a toolbar that shows up next to the blocks of content (e.g. headings, paragraphs).
			'Editor block content toolbar': 'Editor Blockinhalt-Toolbar',
			// Accessible label of a balloon toolbar that shows up right next to the user selection (the caret).
			'Editor contextual toolbar': 'Editor kontextuelle Toolbar',
			// Label of an input field for typing colors in the HEX color format.
			'HEX': 'HEX',
			// The main text of the message shown to the user when given query does not match any results.
			'No results found': 'Keine Ergebnisse gefunden',
			// The main text of the message shown to the user when no results are available.
			'No searchable items': 'Keine durchsuchbaren Elemente',
			// A default label of a dialog window displayed on top the editor.
			'Editor dialog': 'Editor-Dialog',
			// The label and the tooltip for the close button in the dialog header.
			'Close': 'Schließen',
			// Accessibility help dialog assistive technologies label telling users how to exit the dialog.
			'Help Contents. To close this dialog press ESC.': 'Hilfe zum Inhalt. Drücken Sie die Esc-Taste, um dieses Dialogfenster zu schließen.',
			// Accessibility help dialog text explaining what can be found in that dialog.
			'Below, you can find a list of keyboard shortcuts that can be used in the editor.': 'Unten finden Sie eine Liste mit Tastenkombinationen, die im Editor benutzt werden können.',
			// Accessibility help dialog text displayed next to keystrokes that may require the Fn key on Mac.
			'(may require <kbd>Fn</kbd>)': '(erfordert gegebenenfalls <kbd>Fn</kbd>)',
			// The label for the button that opens the Accessibility help dialog from the application menu bar.
			'Accessibility': 'Bedienungshilfen',
			// Accessibility help dialog title.
			'Accessibility help': 'Hilfe zur Eingabe',
			// Assistive technologies label added to each editor editing area informing users about the possibility of opening the accessibility help dialog.
			'Press %0 for help.': 'Drücken Sie %0 für Hilfe.',
			// Keystroke description for assistive technologies: keystroke for moving focus out of an active dialog window.
			'Move focus in and out of an active dialog window': 'Fokus auf ein aktives Dialogfenster richten oder aufheben',
			// The label of the top-level application menu bar menu containing buttons and features related to the whole document (e.g. export to PDF, import from Word, etc.).
			'MENU_BAR_MENU_FILE': 'Datei',
			// The label of the top-level application menu bar menu containing buttons and features related to general editing (e.g. undo, redo, select all, etc.).
			'MENU_BAR_MENU_EDIT': 'Bearbeiten',
			// The label of the top-level application menu bar menu containing buttons and features related to the view of the editor (e.g. show source).
			'MENU_BAR_MENU_VIEW': 'Anzeigen',
			// The label of the top-level application menu bar menu containing buttons and features that insert content (e.g. insert table, insert image, etc.).
			'MENU_BAR_MENU_INSERT': 'Einfügen',
			// The label of the top-level application menu bar menu containing buttons and features related to content formatting (e.g. bold, font color, heading, etc.).
			'MENU_BAR_MENU_FORMAT': 'Format',
			// The label of the top-level application menu bar menu containing various editor tools (e.g. AI assistant, track changes, etc.).
			'MENU_BAR_MENU_TOOLS': 'Werkzeuge',
			// The label of the top-level application menu bar menu containing buttons and features helping users to learn about the editor (e.g. accessibility help).
			'MENU_BAR_MENU_HELP': 'Hilfe',
			// The label of the application menu bar menu containing buttons and features that apply formatting to a text (e.g. bold, italic, etc.).
			'MENU_BAR_MENU_TEXT': 'Text',
			// The label of the application menu bar menu containing buttons and features that control the font of the edited content (e.g. font size, font color, etc.).
			'MENU_BAR_MENU_FONT': 'Schriftart',
			// The accessible label of the editor menu bar used by assistive technologies.
			'Editor menu bar': 'Menüleiste des Editors',
			// An error text displayed when user attempted to enter an color that is not in HEX format.
			'Please enter a valid color (e.g. "ff0000").': 'Bitte geben Sie eine gültige Farbe ein (z. B. „ff0000“).'
		}
	}
};

export default translations;
