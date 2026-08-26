/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'fi': {
		dictionary: {
			// Title of the CKEditor5 editor.
			'Rich Text Editor': 'Rikas tekstieditori',
			// Label of the block toolbar icon (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Edit block': 'Muokkaa lohkoa',
			// First part of the label of the block toolbar icon when functionality of drag and drop is available (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Click to edit block': 'Muokkaa lohkoa klikkaamalla',
			// Second part of the label of the block toolbar icon when functionality of drag and drop is available (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Drag to move': 'Siirrä raahamalla',
			// Label for a button showing the next thing (tab, page, etc.).
			'Next': 'Seuraava',
			// Label for a button showing the previous thing (tab, page, etc.).
			'Previous': 'Edellinen',
			// Label used by assistive technologies describing a generic editor toolbar.
			'Editor toolbar': 'Editorin työkalupalkki',
			// Label used by assistive technologies describing a toolbar displayed inside a dropdown.
			'Dropdown toolbar': 'Pudotusvalikon työkalupalkki',
			// Label used by assistive technologies describing a menu displayed inside a dropdown.
			'Dropdown menu': 'Pudotusvalikko',
			// Label of a button that applies a black color in color pickers.
			'Black': 'Musta',
			// Label of a button that applies a dim grey color in color pickers.
			'Dim grey': 'Vaaleanharmaa',
			// Label of a button that applies a grey color in color pickers.
			'Grey': 'Harmaa',
			// Label of a button that applies a light grey color in color pickers.
			'Light grey': 'Vaaleanharmaa',
			// Label of a button that applies a white color in color pickers.
			'White': 'Valkoinen',
			// Label of a button that applies a red color in color pickers.
			'Red': 'Punainen',
			// Label of a button that applies a orange color in color pickers.
			'Orange': 'Oranssi',
			// Label of a button that applies a yellow color in color pickers.
			'Yellow': 'Keltainen',
			// Label of a button that applies a light green color in color pickers.
			'Light green': 'Vaaleanvihreä',
			// Label of a button that applies a green color in color pickers.
			'Green': 'Vihreä',
			// Label of a button that applies a aquamarine color in color pickers.
			'Aquamarine': 'Akvamariini',
			// Label of a button that applies a turquoise color in color pickers.
			'Turquoise': 'Turkoosi',
			// Label of a button that applies a light blue color in color pickers.
			'Light blue': 'Vaaleansininen',
			// Label of a button that applies a blue color in color pickers.
			'Blue': 'Sininen',
			// Label of a button that applies a purple color in color pickers.
			'Purple': 'Purppura',
			// Accessible label of a toolbar that shows up next to the blocks of content (e.g. headings, paragraphs).
			'Editor block content toolbar': 'Editorin lohkon sisällön työkalupalkki',
			// Accessible label of a balloon toolbar that shows up right next to the user selection (the caret).
			'Editor contextual toolbar': 'Editorin kontekstuaalinen työkalupalkki',
			// Label of an input field for typing colors in the HEX color format.
			'HEX': 'HEX',
			// The main text of the message shown to the user when given query does not match any results.
			'No results found': 'Tuloksia ei löytynyt',
			// The main text of the message shown to the user when no results are available.
			'No searchable items': 'Ei haettavia nimikkeitä',
			// A default label of a dialog window displayed on top the editor.
			'Editor dialog': 'Editorin dialogi',
			// The label and the tooltip for the close button in the dialog header.
			'Close': 'Sulje',
			// Accessibility help dialog assistive technologies label telling users how to exit the dialog.
			'Help Contents. To close this dialog press ESC.': 'Tukisisältö. Voit sulkea tämän dialogin painamalla ESC-näppäintä.',
			// Accessibility help dialog text explaining what can be found in that dialog.
			'Below, you can find a list of keyboard shortcuts that can be used in the editor.': 'Ohessa on tässä editointityökalussa käytettävien näppäinoikoteiden lista.',
			// Accessibility help dialog text displayed next to keystrokes that may require the Fn key on Mac.
			'(may require <kbd>Fn</kbd>)': '(Saattaa vaatia <kbd>Fn</kbd>:n)',
			// The label for the button that opens the Accessibility help dialog from the application menu bar.
			'Accessibility': 'Käytettävyys',
			// Accessibility help dialog title.
			'Accessibility help': 'Esteettömyystuki',
			// Assistive technologies label added to each editor editing area informing users about the possibility of opening the accessibility help dialog.
			'Press %0 for help.': 'Paina %0 -näppäintä, jos tarvitset apua.',
			// Keystroke description for assistive technologies: keystroke for moving focus out of an active dialog window.
			'Move focus in and out of an active dialog window': 'Siirry lähemmäs ja kauemmas käytössä olevasta dialogi-ikkunasta',
			// The label of the top-level application menu bar menu containing buttons and features related to the whole document (e.g. export to PDF, import from Word, etc.).
			'MENU_BAR_MENU_FILE': 'Tiedosto',
			// The label of the top-level application menu bar menu containing buttons and features related to general editing (e.g. undo, redo, select all, etc.).
			'MENU_BAR_MENU_EDIT': 'Muokkaa',
			// The label of the top-level application menu bar menu containing buttons and features related to the view of the editor (e.g. show source).
			'MENU_BAR_MENU_VIEW': 'Näytä',
			// The label of the top-level application menu bar menu containing buttons and features that insert content (e.g. insert table, insert image, etc.).
			'MENU_BAR_MENU_INSERT': 'Liitä',
			// The label of the top-level application menu bar menu containing buttons and features related to content formatting (e.g. bold, font color, heading, etc.).
			'MENU_BAR_MENU_FORMAT': 'Muoto',
			// The label of the top-level application menu bar menu containing various editor tools (e.g. AI assistant, track changes, etc.).
			'MENU_BAR_MENU_TOOLS': 'Työkalut',
			// The label of the top-level application menu bar menu containing buttons and features helping users to learn about the editor (e.g. accessibility help).
			'MENU_BAR_MENU_HELP': 'Tuki',
			// The label of the application menu bar menu containing buttons and features that apply formatting to a text (e.g. bold, italic, etc.).
			'MENU_BAR_MENU_TEXT': 'Teksti',
			// The label of the application menu bar menu containing buttons and features that control the font of the edited content (e.g. font size, font color, etc.).
			'MENU_BAR_MENU_FONT': 'Fontti',
			// The accessible label of the editor menu bar used by assistive technologies.
			'Editor menu bar': 'Muokkaustyökalun valikkopalkki',
			// An error text displayed when user attempted to enter an color that is not in HEX format.
			'Please enter a valid color (e.g. "ff0000").': 'Syötäthän pätevän värin (esim. "ff0000").'
		}
	}
};

export default translations;
