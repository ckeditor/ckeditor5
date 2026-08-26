/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'lt': {
		dictionary: {
			// Title of the CKEditor5 editor.
			'Rich Text Editor': 'Raiškiojo teksto redaktorius',
			// Label of the block toolbar icon (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Edit block': 'Redaguoti bloką',
			// First part of the label of the block toolbar icon when functionality of drag and drop is available (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Click to edit block': 'Spustelėkite norėdami redaguoti bloką',
			// Second part of the label of the block toolbar icon when functionality of drag and drop is available (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Drag to move': 'Vilkite, kad perkeltumėte',
			// Label for a button showing the next thing (tab, page, etc.).
			'Next': 'Kitas',
			// Label for a button showing the previous thing (tab, page, etc.).
			'Previous': 'Buvęs',
			// Label used by assistive technologies describing a generic editor toolbar.
			'Editor toolbar': 'Redaktoriaus įrankių juosta',
			// Label used by assistive technologies describing a toolbar displayed inside a dropdown.
			'Dropdown toolbar': 'Įrankių juosta pasirenkamajame sąraše',
			// Label used by assistive technologies describing a menu displayed inside a dropdown.
			'Dropdown menu': 'Išskleidžiamasis meniu',
			// Label of a button that applies a black color in color pickers.
			'Black': 'Juoda',
			// Label of a button that applies a dim grey color in color pickers.
			'Dim grey': 'Pilkšva',
			// Label of a button that applies a grey color in color pickers.
			'Grey': 'Pilka',
			// Label of a button that applies a light grey color in color pickers.
			'Light grey': 'Šviesiai pilka',
			// Label of a button that applies a white color in color pickers.
			'White': 'Balta',
			// Label of a button that applies a red color in color pickers.
			'Red': 'Raudona',
			// Label of a button that applies a orange color in color pickers.
			'Orange': 'Oranžinė',
			// Label of a button that applies a yellow color in color pickers.
			'Yellow': 'Geltona',
			// Label of a button that applies a light green color in color pickers.
			'Light green': 'Šviesiai žalia',
			// Label of a button that applies a green color in color pickers.
			'Green': 'Žalia',
			// Label of a button that applies a aquamarine color in color pickers.
			'Aquamarine': 'Aquamarine',
			// Label of a button that applies a turquoise color in color pickers.
			'Turquoise': 'Turkio',
			// Label of a button that applies a light blue color in color pickers.
			'Light blue': 'Šviesiai mėlyna',
			// Label of a button that applies a blue color in color pickers.
			'Blue': 'Mėlyna',
			// Label of a button that applies a purple color in color pickers.
			'Purple': 'Violetinė',
			// Accessible label of a toolbar that shows up next to the blocks of content (e.g. headings, paragraphs).
			'Editor block content toolbar': 'Redaktoriaus bloko turinio įrankių juosta',
			// Accessible label of a balloon toolbar that shows up right next to the user selection (the caret).
			'Editor contextual toolbar': 'Redaktoriaus kontekstinė įrankių juosta',
			// Label of an input field for typing colors in the HEX color format.
			'HEX': 'Šešioliktainė reikšmė (angl. HEX)',
			// The main text of the message shown to the user when given query does not match any results.
			'No results found': 'Nieko nerasta',
			// The main text of the message shown to the user when no results are available.
			'No searchable items': 'Nėra paieškos elementų',
			// A default label of a dialog window displayed on top the editor.
			'Editor dialog': 'Redaktoriaus dialogo langas',
			// The label and the tooltip for the close button in the dialog header.
			'Close': 'Uždaryti',
			// Accessibility help dialog assistive technologies label telling users how to exit the dialog.
			'Help Contents. To close this dialog press ESC.': 'Pagalbos turinys. Norėdami uždaryti šį dialogo langą, spauskite „ESC“.',
			// Accessibility help dialog text explaining what can be found in that dialog.
			'Below, you can find a list of keyboard shortcuts that can be used in the editor.': 'Žemiau galite rasti sparčiųjų klavišų, kuriuos galima naudoti redaktoriuje, sąrašą.',
			// Accessibility help dialog text displayed next to keystrokes that may require the Fn key on Mac.
			'(may require <kbd>Fn</kbd>)': '(gali reikalauti <kbd>Fn</kbd>)',
			// The label for the button that opens the Accessibility help dialog from the application menu bar.
			'Accessibility': 'Prieinamumas',
			// Accessibility help dialog title.
			'Accessibility help': 'Prieinamumo pagalba',
			// Assistive technologies label added to each editor editing area informing users about the possibility of opening the accessibility help dialog.
			'Press %0 for help.': 'Spauskite %0, norėdami gauti pagalbą.',
			// Keystroke description for assistive technologies: keystroke for moving focus out of an active dialog window.
			'Move focus in and out of an active dialog window': 'Perkelti fokusą į ir iš aktyvaus dialogo lango',
			// The label of the top-level application menu bar menu containing buttons and features related to the whole document (e.g. export to PDF, import from Word, etc.).
			'MENU_BAR_MENU_FILE': 'Failas',
			// The label of the top-level application menu bar menu containing buttons and features related to general editing (e.g. undo, redo, select all, etc.).
			'MENU_BAR_MENU_EDIT': 'Redaguoti',
			// The label of the top-level application menu bar menu containing buttons and features related to the view of the editor (e.g. show source).
			'MENU_BAR_MENU_VIEW': 'Žiūrėti',
			// The label of the top-level application menu bar menu containing buttons and features that insert content (e.g. insert table, insert image, etc.).
			'MENU_BAR_MENU_INSERT': 'Įkelti',
			// The label of the top-level application menu bar menu containing buttons and features related to content formatting (e.g. bold, font color, heading, etc.).
			'MENU_BAR_MENU_FORMAT': 'Formatuoti',
			// The label of the top-level application menu bar menu containing various editor tools (e.g. AI assistant, track changes, etc.).
			'MENU_BAR_MENU_TOOLS': 'Įrankiai',
			// The label of the top-level application menu bar menu containing buttons and features helping users to learn about the editor (e.g. accessibility help).
			'MENU_BAR_MENU_HELP': 'Pagalba',
			// The label of the application menu bar menu containing buttons and features that apply formatting to a text (e.g. bold, italic, etc.).
			'MENU_BAR_MENU_TEXT': 'Tekstas',
			// The label of the application menu bar menu containing buttons and features that control the font of the edited content (e.g. font size, font color, etc.).
			'MENU_BAR_MENU_FONT': 'Šriftas',
			// The accessible label of the editor menu bar used by assistive technologies.
			'Editor menu bar': 'Redaktoriaus meniu juosta',
			// An error text displayed when user attempted to enter an color that is not in HEX format.
			'Please enter a valid color (e.g. "ff0000").': 'Įveskite teisingą spalvos formatą (pvz., „ff0000“).'
		}
	}
};

export default translations;
