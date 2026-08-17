/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'el': {
		dictionary: {
			// Title of the CKEditor5 editor.
			'Rich Text Editor': 'Επεξεργαστής εμπλουτισμένου κειμένου',
			// Label of the block toolbar icon (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Edit block': 'Επεξεργασία τμήματος',
			// First part of the label of the block toolbar icon when functionality of drag and drop is available (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Click to edit block': 'Κάντε κλικ για να επεξεργαστείτε το μπλοκ',
			// Second part of the label of the block toolbar icon when functionality of drag and drop is available (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Drag to move': 'Σύρετε για μετακίνηση',
			// Label for a button showing the next thing (tab, page, etc.).
			'Next': 'Επόμενο',
			// Label for a button showing the previous thing (tab, page, etc.).
			'Previous': 'Προηγούμενο',
			// Label used by assistive technologies describing a generic editor toolbar.
			'Editor toolbar': 'Γραμμή εργαλείων επεξεργαστή',
			// Label used by assistive technologies describing a toolbar displayed inside a dropdown.
			'Dropdown toolbar': 'Γραμμή εργαλείων αναδυόμενου μενού',
			// Label used by assistive technologies describing a menu displayed inside a dropdown.
			'Dropdown menu': 'Αναπτυσσόμενο μενού',
			// Label of a button that applies a black color in color pickers.
			'Black': 'Μαύρο',
			// Label of a button that applies a dim grey color in color pickers.
			'Dim grey': 'Θολό γκρι',
			// Label of a button that applies a grey color in color pickers.
			'Grey': 'Γκρι',
			// Label of a button that applies a light grey color in color pickers.
			'Light grey': 'Φωτινό γκρι',
			// Label of a button that applies a white color in color pickers.
			'White': 'Λευκό',
			// Label of a button that applies a red color in color pickers.
			'Red': 'Κόκκινο',
			// Label of a button that applies a orange color in color pickers.
			'Orange': 'Πορτοκαλί',
			// Label of a button that applies a yellow color in color pickers.
			'Yellow': 'Κίτρινο',
			// Label of a button that applies a light green color in color pickers.
			'Light green': 'Φωτινό πράσινο',
			// Label of a button that applies a green color in color pickers.
			'Green': 'Πράσινο',
			// Label of a button that applies a aquamarine color in color pickers.
			'Aquamarine': 'Ακουαμαρίνα',
			// Label of a button that applies a turquoise color in color pickers.
			'Turquoise': 'Τιρκουάζ',
			// Label of a button that applies a light blue color in color pickers.
			'Light blue': 'Φωτινό μπλε',
			// Label of a button that applies a blue color in color pickers.
			'Blue': 'Μπλε',
			// Label of a button that applies a purple color in color pickers.
			'Purple': 'Πορφυρό',
			// Accessible label of a toolbar that shows up next to the blocks of content (e.g. headings, paragraphs).
			'Editor block content toolbar': 'Γραμμή εργαλείων επεξεργασίας περιεχομένου αποκλεισμού',
			// Accessible label of a balloon toolbar that shows up right next to the user selection (the caret).
			'Editor contextual toolbar': 'Γραμμή εργαλείων επεξεργασίας συμφραζομένων',
			// Label of an input field for typing colors in the HEX color format.
			'HEX': 'Δεκαεξαδική μορφή χρωμάτων',
			// The main text of the message shown to the user when given query does not match any results.
			'No results found': 'Δεν βρέθηκαν αποτελέσματα',
			// The main text of the message shown to the user when no results are available.
			'No searchable items': 'Δεν υπάρχει δυνατότητα αναζήτησης στοιχείων',
			// A default label of a dialog window displayed on top the editor.
			'Editor dialog': 'Παράθυρο διαλόγου επεξεργαστή',
			// The label and the tooltip for the close button in the dialog header.
			'Close': 'Κλείσιμο',
			// Accessibility help dialog assistive technologies label telling users how to exit the dialog.
			'Help Contents. To close this dialog press ESC.': 'Περιεχόμενα βοήθειας. Για να κλείσετε αυτό το παράθυρο διαλόγου, πατήστε ESC.',
			// Accessibility help dialog text explaining what can be found in that dialog.
			'Below, you can find a list of keyboard shortcuts that can be used in the editor.': 'Παρακάτω, μπορείτε να βρείτε μια λίστα με συντομεύσεις πληκτρολογίου που μπορείτε να χρησιμοποιήσετε στο εργαλείο επεξεργασίας.',
			// Accessibility help dialog text displayed next to keystrokes that may require the Fn key on Mac.
			'(may require <kbd>Fn</kbd>)': '(μπορεί να απαιτείται το <kbd> Fn</kbd>)',
			// The label for the button that opens the Accessibility help dialog from the application menu bar.
			'Accessibility': 'Προσβασιμότητα',
			// Accessibility help dialog title.
			'Accessibility help': 'Βοήθεια προσβασιμότητας',
			// Assistive technologies label added to each editor editing area informing users about the possibility of opening the accessibility help dialog.
			'Press %0 for help.': 'Πατήστε %0 για βοήθεια.',
			// Keystroke description for assistive technologies: keystroke for moving focus out of an active dialog window.
			'Move focus in and out of an active dialog window': 'Μετακίνηση της εστίασης από ένα ενεργό παράθυρο διαλόγου',
			// The label of the top-level application menu bar menu containing buttons and features related to the whole document (e.g. export to PDF, import from Word, etc.).
			'MENU_BAR_MENU_FILE': 'Αρχείο',
			// The label of the top-level application menu bar menu containing buttons and features related to general editing (e.g. undo, redo, select all, etc.).
			'MENU_BAR_MENU_EDIT': 'Επεξεργασία',
			// The label of the top-level application menu bar menu containing buttons and features related to the view of the editor (e.g. show source).
			'MENU_BAR_MENU_VIEW': 'Προβολή',
			// The label of the top-level application menu bar menu containing buttons and features that insert content (e.g. insert table, insert image, etc.).
			'MENU_BAR_MENU_INSERT': 'Εισαγωγή',
			// The label of the top-level application menu bar menu containing buttons and features related to content formatting (e.g. bold, font color, heading, etc.).
			'MENU_BAR_MENU_FORMAT': 'Μορφή',
			// The label of the top-level application menu bar menu containing various editor tools (e.g. AI assistant, track changes, etc.).
			'MENU_BAR_MENU_TOOLS': 'Εργαλεία',
			// The label of the top-level application menu bar menu containing buttons and features helping users to learn about the editor (e.g. accessibility help).
			'MENU_BAR_MENU_HELP': 'Βοήθεια',
			// The label of the application menu bar menu containing buttons and features that apply formatting to a text (e.g. bold, italic, etc.).
			'MENU_BAR_MENU_TEXT': 'Κείμενο',
			// The label of the application menu bar menu containing buttons and features that control the font of the edited content (e.g. font size, font color, etc.).
			'MENU_BAR_MENU_FONT': 'Γραμματοσειρά',
			// The accessible label of the editor menu bar used by assistive technologies.
			'Editor menu bar': 'Γραμμή μενού επεξεργαστή',
			// An error text displayed when user attempted to enter an color that is not in HEX format.
			'Please enter a valid color (e.g. "ff0000").': 'Παρακαλούμε να εισαγάγετε ένα έγκυρο χρώμα (π.χ. "ff0000").'
		}
	}
};

export default translations;
