/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'fr': {
		dictionary: {
			// Title of the CKEditor5 editor.
			'Rich Text Editor': 'Éditeur de texte enrichi',
			// Label of the block toolbar icon (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Edit block': 'Modifier le bloc',
			// First part of the label of the block toolbar icon when functionality of drag and drop is available (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Click to edit block': 'Cliquer pour modifier le bloc',
			// Second part of the label of the block toolbar icon when functionality of drag and drop is available (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Drag to move': 'Faire glisser pour déplacer',
			// Label for a button showing the next thing (tab, page, etc.).
			'Next': 'Suivant',
			// Label for a button showing the previous thing (tab, page, etc.).
			'Previous': 'Précedent',
			// Label used by assistive technologies describing a generic editor toolbar.
			'Editor toolbar': 'Barre d\'outils de l\'éditeur',
			// Label used by assistive technologies describing a toolbar displayed inside a dropdown.
			'Dropdown toolbar': 'Barre d\'outils dans un menu déroulant',
			// Label used by assistive technologies describing a menu displayed inside a dropdown.
			'Dropdown menu': 'Menu déroulant',
			// Label of a button that applies a black color in color pickers.
			'Black': 'Noir',
			// Label of a button that applies a dim grey color in color pickers.
			'Dim grey': 'Gris pâle',
			// Label of a button that applies a grey color in color pickers.
			'Grey': 'Gris',
			// Label of a button that applies a light grey color in color pickers.
			'Light grey': 'Gris clair',
			// Label of a button that applies a white color in color pickers.
			'White': 'Blanc',
			// Label of a button that applies a red color in color pickers.
			'Red': 'Rouge',
			// Label of a button that applies a orange color in color pickers.
			'Orange': 'Orange',
			// Label of a button that applies a yellow color in color pickers.
			'Yellow': 'Jaune',
			// Label of a button that applies a light green color in color pickers.
			'Light green': 'Vert clair',
			// Label of a button that applies a green color in color pickers.
			'Green': 'Vert',
			// Label of a button that applies a aquamarine color in color pickers.
			'Aquamarine': 'Bleu vert',
			// Label of a button that applies a turquoise color in color pickers.
			'Turquoise': 'Turquoise',
			// Label of a button that applies a light blue color in color pickers.
			'Light blue': 'Bleu clair',
			// Label of a button that applies a blue color in color pickers.
			'Blue': 'Bleu',
			// Label of a button that applies a purple color in color pickers.
			'Purple': 'Violet',
			// Accessible label of a toolbar that shows up next to the blocks of content (e.g. headings, paragraphs).
			'Editor block content toolbar': 'Barre d\'outils du contenu du bloc éditeur',
			// Accessible label of a balloon toolbar that shows up right next to the user selection (the caret).
			'Editor contextual toolbar': 'Barre d\'outils contextuelle de l\'éditeur',
			// Label of an input field for typing colors in the HEX color format.
			'HEX': 'HEX',
			// The main text of the message shown to the user when given query does not match any results.
			'No results found': 'Aucun résultat trouvé',
			// The main text of the message shown to the user when no results are available.
			'No searchable items': 'Aucun élément consultable',
			// A default label of a dialog window displayed on top the editor.
			'Editor dialog': 'Boîte de dialogue de l\'éditeur',
			// The label and the tooltip for the close button in the dialog header.
			'Close': 'Fermer',
			// Accessibility help dialog assistive technologies label telling users how to exit the dialog.
			'Help Contents. To close this dialog press ESC.': 'Contenu de l\'aide. Pour fermer cette boîte de dialogue, appuyez sur ESC.',
			// Accessibility help dialog text explaining what can be found in that dialog.
			'Below, you can find a list of keyboard shortcuts that can be used in the editor.': 'Ci-dessous, vous trouverez une liste de raccourcis clavier pouvant être utilisés dans l’éditeur.',
			// Accessibility help dialog text displayed next to keystrokes that may require the Fn key on Mac.
			'(may require <kbd>Fn</kbd>)': '(peut nécessiter <kbd> Fn </kbd> )',
			// The label for the button that opens the Accessibility help dialog from the application menu bar.
			'Accessibility': 'Accessibilité',
			// Accessibility help dialog title.
			'Accessibility help': 'Aide à l\'accessibilité',
			// Assistive technologies label added to each editor editing area informing users about the possibility of opening the accessibility help dialog.
			'Press %0 for help.': 'Appuyez sur %0 pour obtenir de l\'aide.',
			// Keystroke description for assistive technologies: keystroke for moving focus out of an active dialog window.
			'Move focus in and out of an active dialog window': 'Déplacer le focus vers et hors d\'une fenêtre de dialogue active',
			// The label of the top-level application menu bar menu containing buttons and features related to the whole document (e.g. export to PDF, import from Word, etc.).
			'MENU_BAR_MENU_FILE': 'Fichier',
			// The label of the top-level application menu bar menu containing buttons and features related to general editing (e.g. undo, redo, select all, etc.).
			'MENU_BAR_MENU_EDIT': 'Éditer',
			// The label of the top-level application menu bar menu containing buttons and features related to the view of the editor (e.g. show source).
			'MENU_BAR_MENU_VIEW': 'Afficher',
			// The label of the top-level application menu bar menu containing buttons and features that insert content (e.g. insert table, insert image, etc.).
			'MENU_BAR_MENU_INSERT': 'Insérer',
			// The label of the top-level application menu bar menu containing buttons and features related to content formatting (e.g. bold, font color, heading, etc.).
			'MENU_BAR_MENU_FORMAT': 'Format',
			// The label of the top-level application menu bar menu containing various editor tools (e.g. AI assistant, track changes, etc.).
			'MENU_BAR_MENU_TOOLS': 'Outils',
			// The label of the top-level application menu bar menu containing buttons and features helping users to learn about the editor (e.g. accessibility help).
			'MENU_BAR_MENU_HELP': 'Aide',
			// The label of the application menu bar menu containing buttons and features that apply formatting to a text (e.g. bold, italic, etc.).
			'MENU_BAR_MENU_TEXT': 'Texte',
			// The label of the application menu bar menu containing buttons and features that control the font of the edited content (e.g. font size, font color, etc.).
			'MENU_BAR_MENU_FONT': 'Police de caractère',
			// The accessible label of the editor menu bar used by assistive technologies.
			'Editor menu bar': 'Barre de menu de l\'éditeur',
			// An error text displayed when user attempted to enter an color that is not in HEX format.
			'Please enter a valid color (e.g. "ff0000").': 'Veuillez saisir une couleur valide (par exemple « ff0000 »).'
		}
	}
};

export default translations;
