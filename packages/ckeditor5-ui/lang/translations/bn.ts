/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'bn': {
		dictionary: {
			// Title of the CKEditor5 editor.
			'Rich Text Editor': 'রিচ টেক্সট এডিটর',
			// Label of the block toolbar icon (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Edit block': 'এডিট ব্লক',
			// First part of the label of the block toolbar icon when functionality of drag and drop is available (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Click to edit block': 'ব্লক এডিট করতে ক্লিক করুন',
			// Second part of the label of the block toolbar icon when functionality of drag and drop is available (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Drag to move': 'সরানোর জন্য টেনে আনুন',
			// Label for a button showing the next thing (tab, page, etc.).
			'Next': 'পরবর্তী',
			// Label for a button showing the previous thing (tab, page, etc.).
			'Previous': 'পূর্ববর্তী',
			// Label used by assistive technologies describing a generic editor toolbar.
			'Editor toolbar': 'সম্পাদক টুলবার',
			// Label used by assistive technologies describing a toolbar displayed inside a dropdown.
			'Dropdown toolbar': 'ড্রপডাউন টুলবার',
			// Label used by assistive technologies describing a menu displayed inside a dropdown.
			'Dropdown menu': 'ড্রপডাউন মেনু',
			// Label of a button that applies a black color in color pickers.
			'Black': 'কালো',
			// Label of a button that applies a dim grey color in color pickers.
			'Dim grey': 'আবছা ধূসর',
			// Label of a button that applies a grey color in color pickers.
			'Grey': 'ধূসর',
			// Label of a button that applies a light grey color in color pickers.
			'Light grey': 'হালকা ধূসর',
			// Label of a button that applies a white color in color pickers.
			'White': 'সাদা',
			// Label of a button that applies a red color in color pickers.
			'Red': 'লাল',
			// Label of a button that applies a orange color in color pickers.
			'Orange': 'কমলা',
			// Label of a button that applies a yellow color in color pickers.
			'Yellow': 'হলুদ ',
			// Label of a button that applies a light green color in color pickers.
			'Light green': 'হালকা সবুজ',
			// Label of a button that applies a green color in color pickers.
			'Green': 'সবুজ',
			// Label of a button that applies a aquamarine color in color pickers.
			'Aquamarine': 'ফেকাশে সবুজবর্ণ',
			// Label of a button that applies a turquoise color in color pickers.
			'Turquoise': 'ফিরোজা',
			// Label of a button that applies a light blue color in color pickers.
			'Light blue': 'হালকা নীল',
			// Label of a button that applies a blue color in color pickers.
			'Blue': 'নীল ',
			// Label of a button that applies a purple color in color pickers.
			'Purple': 'বেগুনি',
			// Accessible label of a toolbar that shows up next to the blocks of content (e.g. headings, paragraphs).
			'Editor block content toolbar': 'সম্পাদক ব্লক কন্টেন্ট টুলবার',
			// Accessible label of a balloon toolbar that shows up right next to the user selection (the caret).
			'Editor contextual toolbar': 'সম্পাদক প্রাসঙ্গিক টুলবার',
			// Label of an input field for typing colors in the HEX color format.
			'HEX': 'HEX',
			// The main text of the message shown to the user when given query does not match any results.
			'No results found': 'কোন ফলাফল পাওয়া যায়নি',
			// The main text of the message shown to the user when no results are available.
			'No searchable items': 'কোনো অনুসন্ধানযোগ্য আইটেম নেই',
			// A default label of a dialog window displayed on top the editor.
			'Editor dialog': 'ইডিটর ডায়ালগ',
			// The label and the tooltip for the close button in the dialog header.
			'Close': 'বন্ধ করুন',
			// Accessibility help dialog assistive technologies label telling users how to exit the dialog.
			'Help Contents. To close this dialog press ESC.': 'সহায়তাকারী কনটেন্টগুলি। এই ডায়ালগটি বন্ধ করতে ESC প্রেস করুন।',
			// Accessibility help dialog text explaining what can be found in that dialog.
			'Below, you can find a list of keyboard shortcuts that can be used in the editor.': 'এডিটরে ব্যবহার করা যেতে পারে এমন কীবোর্ড শর্টকাটগুলির একটি তালিকা আপনি নিচে দেখতে পাবেন।',
			// Accessibility help dialog text displayed next to keystrokes that may require the Fn key on Mac.
			'(may require <kbd>Fn</kbd>)': '(<kbd>Fn[</kbd>] এর প্রয়োজন হতে পারে)',
			// The label for the button that opens the Accessibility help dialog from the application menu bar.
			'Accessibility': 'প্রবেশযোগ্যতা',
			// Accessibility help dialog title.
			'Accessibility help': 'প্রবেশযোগ্যতা জন্য সহায়তা',
			// Assistive technologies label added to each editor editing area informing users about the possibility of opening the accessibility help dialog.
			'Press %0 for help.': 'সহায়তার জন্য %0 প্রেস করুন।',
			// Keystroke description for assistive technologies: keystroke for moving focus out of an active dialog window.
			'Move focus in and out of an active dialog window': 'সক্রিয় ডায়ালগ উইন্ডোর ভিতরে এবং বাইরে ফোকাস স্থানান্তর করুন',
			// The label of the top-level application menu bar menu containing buttons and features related to the whole document (e.g. export to PDF, import from Word, etc.).
			'MENU_BAR_MENU_FILE': 'ফাইল',
			// The label of the top-level application menu bar menu containing buttons and features related to general editing (e.g. undo, redo, select all, etc.).
			'MENU_BAR_MENU_EDIT': 'এডিট করুন',
			// The label of the top-level application menu bar menu containing buttons and features related to the view of the editor (e.g. show source).
			'MENU_BAR_MENU_VIEW': 'দেখুন',
			// The label of the top-level application menu bar menu containing buttons and features that insert content (e.g. insert table, insert image, etc.).
			'MENU_BAR_MENU_INSERT': 'ঢোকান',
			// The label of the top-level application menu bar menu containing buttons and features related to content formatting (e.g. bold, font color, heading, etc.).
			'MENU_BAR_MENU_FORMAT': 'ফরম্যাট',
			// The label of the top-level application menu bar menu containing various editor tools (e.g. AI assistant, track changes, etc.).
			'MENU_BAR_MENU_TOOLS': 'টুলস',
			// The label of the top-level application menu bar menu containing buttons and features helping users to learn about the editor (e.g. accessibility help).
			'MENU_BAR_MENU_HELP': 'সাহায্য',
			// The label of the application menu bar menu containing buttons and features that apply formatting to a text (e.g. bold, italic, etc.).
			'MENU_BAR_MENU_TEXT': 'পাঠ্য',
			// The label of the application menu bar menu containing buttons and features that control the font of the edited content (e.g. font size, font color, etc.).
			'MENU_BAR_MENU_FONT': 'ফন্ট',
			// The accessible label of the editor menu bar used by assistive technologies.
			'Editor menu bar': 'ইডিটর মেনু বার',
			// An error text displayed when user attempted to enter an color that is not in HEX format.
			'Please enter a valid color (e.g. "ff0000").': 'অনুগ্রহ করে একটি ভ্যালিড কালার প্রবেশ করান (e.g. "ff0000").'
		}
	}
};

export default translations;
