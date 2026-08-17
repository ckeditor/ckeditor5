/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'hi': {
		dictionary: {
			// Title of the CKEditor5 editor.
			'Rich Text Editor': 'Rich Text Editor',
			// Label of the block toolbar icon (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Edit block': 'Edit block',
			// First part of the label of the block toolbar icon when functionality of drag and drop is available (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Click to edit block': 'ब्लॉक एडिट करने के लिए क्लिक करें',
			// Second part of the label of the block toolbar icon when functionality of drag and drop is available (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Drag to move': 'मूव करने के लिए ड्रैग करें',
			// Label for a button showing the next thing (tab, page, etc.).
			'Next': 'Next',
			// Label for a button showing the previous thing (tab, page, etc.).
			'Previous': 'Previous',
			// Label used by assistive technologies describing a generic editor toolbar.
			'Editor toolbar': 'Editor toolbar',
			// Label used by assistive technologies describing a toolbar displayed inside a dropdown.
			'Dropdown toolbar': 'Dropdown toolbar',
			// Label used by assistive technologies describing a menu displayed inside a dropdown.
			'Dropdown menu': 'ड्रापडाउन मेन्यू',
			// Label of a button that applies a black color in color pickers.
			'Black': 'Black',
			// Label of a button that applies a dim grey color in color pickers.
			'Dim grey': 'Dim grey',
			// Label of a button that applies a grey color in color pickers.
			'Grey': 'Grey',
			// Label of a button that applies a light grey color in color pickers.
			'Light grey': 'Light grey',
			// Label of a button that applies a white color in color pickers.
			'White': 'White',
			// Label of a button that applies a red color in color pickers.
			'Red': 'Red',
			// Label of a button that applies a orange color in color pickers.
			'Orange': 'Orange',
			// Label of a button that applies a yellow color in color pickers.
			'Yellow': 'Yellow',
			// Label of a button that applies a light green color in color pickers.
			'Light green': 'Light green',
			// Label of a button that applies a green color in color pickers.
			'Green': 'Green',
			// Label of a button that applies a aquamarine color in color pickers.
			'Aquamarine': 'Aquamarine',
			// Label of a button that applies a turquoise color in color pickers.
			'Turquoise': 'Turquoise',
			// Label of a button that applies a light blue color in color pickers.
			'Light blue': 'Light blue',
			// Label of a button that applies a blue color in color pickers.
			'Blue': 'Blue',
			// Label of a button that applies a purple color in color pickers.
			'Purple': 'Purple',
			// Accessible label of a toolbar that shows up next to the blocks of content (e.g. headings, paragraphs).
			'Editor block content toolbar': 'एडीटर ब्लॉक कंटेंट टूलबार',
			// Accessible label of a balloon toolbar that shows up right next to the user selection (the caret).
			'Editor contextual toolbar': 'एडीटर कॉन्टेक्स्टूअल टूलबार',
			// Label of an input field for typing colors in the HEX color format.
			'HEX': 'HEX',
			// The main text of the message shown to the user when given query does not match any results.
			'No results found': 'कोई रिजल्ट नहीं',
			// The main text of the message shown to the user when no results are available.
			'No searchable items': 'कोई खोजने लायक आइटम नहीं',
			// A default label of a dialog window displayed on top the editor.
			'Editor dialog': 'एडिटर डायलॉग',
			// The label and the tooltip for the close button in the dialog header.
			'Close': 'बंद करें',
			// Accessibility help dialog assistive technologies label telling users how to exit the dialog.
			'Help Contents. To close this dialog press ESC.': 'हेल्प कॉन्टेंट्स. इस डायलॉग को बंद करने के लिए ESC दबाएँ.',
			// Accessibility help dialog text explaining what can be found in that dialog.
			'Below, you can find a list of keyboard shortcuts that can be used in the editor.': 'नीचे, आप उन कीबोर्ड शॉर्टकट्स की एक लिस्ट देख सकते हैं जिनका इस्तेमाल एडिटर में किया जा सकता है.',
			// Accessibility help dialog text displayed next to keystrokes that may require the Fn key on Mac.
			'(may require <kbd>Fn</kbd>)': '(इसके लिए <kbd>Fn</kbd> की ज़रूरत हो सकती है)',
			// The label for the button that opens the Accessibility help dialog from the application menu bar.
			'Accessibility': 'पहुँच',
			// Accessibility help dialog title.
			'Accessibility help': 'एक्सेसिबिलिटी हेल्प',
			// Assistive technologies label added to each editor editing area informing users about the possibility of opening the accessibility help dialog.
			'Press %0 for help.': 'हेल्प के लिए %0 दबाएँ.',
			// Keystroke description for assistive technologies: keystroke for moving focus out of an active dialog window.
			'Move focus in and out of an active dialog window': 'एक एक्टिव डायलॉग विंडो में फ़ोकस को अंदर और बाहर मूव करें',
			// The label of the top-level application menu bar menu containing buttons and features related to the whole document (e.g. export to PDF, import from Word, etc.).
			'MENU_BAR_MENU_FILE': 'फाइल',
			// The label of the top-level application menu bar menu containing buttons and features related to general editing (e.g. undo, redo, select all, etc.).
			'MENU_BAR_MENU_EDIT': 'Edit',
			// The label of the top-level application menu bar menu containing buttons and features related to the view of the editor (e.g. show source).
			'MENU_BAR_MENU_VIEW': 'दृश्य',
			// The label of the top-level application menu bar menu containing buttons and features that insert content (e.g. insert table, insert image, etc.).
			'MENU_BAR_MENU_INSERT': 'Insert',
			// The label of the top-level application menu bar menu containing buttons and features related to content formatting (e.g. bold, font color, heading, etc.).
			'MENU_BAR_MENU_FORMAT': 'फॉर्मेट',
			// The label of the top-level application menu bar menu containing various editor tools (e.g. AI assistant, track changes, etc.).
			'MENU_BAR_MENU_TOOLS': 'टूल्स',
			// The label of the top-level application menu bar menu containing buttons and features helping users to learn about the editor (e.g. accessibility help).
			'MENU_BAR_MENU_HELP': 'हेल्प',
			// The label of the application menu bar menu containing buttons and features that apply formatting to a text (e.g. bold, italic, etc.).
			'MENU_BAR_MENU_TEXT': 'टेक्स्ट',
			// The label of the application menu bar menu containing buttons and features that control the font of the edited content (e.g. font size, font color, etc.).
			'MENU_BAR_MENU_FONT': 'फ़ॉन्ट',
			// The accessible label of the editor menu bar used by assistive technologies.
			'Editor menu bar': 'एडिटर मेनू बार',
			// An error text displayed when user attempted to enter an color that is not in HEX format.
			'Please enter a valid color (e.g. "ff0000").': 'कृपया एक वैध रंग दर्ज करें (उदाहरण के लिए "ff0000").'
		}
	}
};

export default translations;
