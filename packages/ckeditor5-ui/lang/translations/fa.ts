/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'fa': {
		dictionary: {
			// Title of the CKEditor5 editor.
			'Rich Text Editor': 'ویرایشگر متن غنی',
			// Label of the block toolbar icon (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Edit block': 'ویرایش قطعه',
			// First part of the label of the block toolbar icon when functionality of drag and drop is available (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Click to edit block': 'برای ویرایش بلوک کلیک کنید',
			// Second part of the label of the block toolbar icon when functionality of drag and drop is available (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Drag to move': 'برای حرکت دادن بکشید',
			// Label for a button showing the next thing (tab, page, etc.).
			'Next': 'بعدی',
			// Label for a button showing the previous thing (tab, page, etc.).
			'Previous': 'قبلی',
			// Label used by assistive technologies describing a generic editor toolbar.
			'Editor toolbar': 'نوارابزار ویرایشگر',
			// Label used by assistive technologies describing a toolbar displayed inside a dropdown.
			'Dropdown toolbar': 'نوارابزار کشویی',
			// Label used by assistive technologies describing a menu displayed inside a dropdown.
			'Dropdown menu': '',
			// Label of a button that applies a black color in color pickers.
			'Black': 'سیاه',
			// Label of a button that applies a dim grey color in color pickers.
			'Dim grey': 'خاکستری تیره',
			// Label of a button that applies a grey color in color pickers.
			'Grey': 'خاکستری',
			// Label of a button that applies a light grey color in color pickers.
			'Light grey': 'خاکستری روشن',
			// Label of a button that applies a white color in color pickers.
			'White': 'سفید',
			// Label of a button that applies a red color in color pickers.
			'Red': 'قرمز',
			// Label of a button that applies a orange color in color pickers.
			'Orange': 'نارنجی',
			// Label of a button that applies a yellow color in color pickers.
			'Yellow': 'زرد',
			// Label of a button that applies a light green color in color pickers.
			'Light green': 'سبز روشن',
			// Label of a button that applies a green color in color pickers.
			'Green': 'سبز',
			// Label of a button that applies a aquamarine color in color pickers.
			'Aquamarine': 'زمرد کبود',
			// Label of a button that applies a turquoise color in color pickers.
			'Turquoise': 'فیروزه ای',
			// Label of a button that applies a light blue color in color pickers.
			'Light blue': 'آبی روشن',
			// Label of a button that applies a blue color in color pickers.
			'Blue': 'آبی',
			// Label of a button that applies a purple color in color pickers.
			'Purple': 'بنفش',
			// Accessible label of a toolbar that shows up next to the blocks of content (e.g. headings, paragraphs).
			'Editor block content toolbar': 'نوار ابزار محتوای بلوک ویرایشگر',
			// Accessible label of a balloon toolbar that shows up right next to the user selection (the caret).
			'Editor contextual toolbar': '',
			// Label of an input field for typing colors in the HEX color format.
			'HEX': 'هگز',
			// The main text of the message shown to the user when given query does not match any results.
			'No results found': 'نتیجه ای یافت نشد',
			// The main text of the message shown to the user when no results are available.
			'No searchable items': 'موارد قابل جستجو وجود ندارد',
			// A default label of a dialog window displayed on top the editor.
			'Editor dialog': '',
			// The label and the tooltip for the close button in the dialog header.
			'Close': 'بستن',
			// Accessibility help dialog assistive technologies label telling users how to exit the dialog.
			'Help Contents. To close this dialog press ESC.': '',
			// Accessibility help dialog text explaining what can be found in that dialog.
			'Below, you can find a list of keyboard shortcuts that can be used in the editor.': 'در زیر، می توانید لیستی از میانبرهای صفحه کلید را که می توان در ویرایشگر استفاده کرد، پیدا کنید.',
			// Accessibility help dialog text displayed next to keystrokes that may require the Fn key on Mac.
			'(may require <kbd>Fn</kbd>)': '',
			// The label for the button that opens the Accessibility help dialog from the application menu bar.
			'Accessibility': 'دسترسی',
			// Accessibility help dialog title.
			'Accessibility help': '',
			// Assistive technologies label added to each editor editing area informing users about the possibility of opening the accessibility help dialog.
			'Press %0 for help.': '',
			// Keystroke description for assistive technologies: keystroke for moving focus out of an active dialog window.
			'Move focus in and out of an active dialog window': '',
			// The label of the top-level application menu bar menu containing buttons and features related to the whole document (e.g. export to PDF, import from Word, etc.).
			'MENU_BAR_MENU_FILE': 'فایل',
			// The label of the top-level application menu bar menu containing buttons and features related to general editing (e.g. undo, redo, select all, etc.).
			'MENU_BAR_MENU_EDIT': 'ویرایش',
			// The label of the top-level application menu bar menu containing buttons and features related to the view of the editor (e.g. show source).
			'MENU_BAR_MENU_VIEW': 'نمایش',
			// The label of the top-level application menu bar menu containing buttons and features that insert content (e.g. insert table, insert image, etc.).
			'MENU_BAR_MENU_INSERT': '',
			// The label of the top-level application menu bar menu containing buttons and features related to content formatting (e.g. bold, font color, heading, etc.).
			'MENU_BAR_MENU_FORMAT': 'قالب',
			// The label of the top-level application menu bar menu containing various editor tools (e.g. AI assistant, track changes, etc.).
			'MENU_BAR_MENU_TOOLS': 'ابزار ها',
			// The label of the top-level application menu bar menu containing buttons and features helping users to learn about the editor (e.g. accessibility help).
			'MENU_BAR_MENU_HELP': 'کمک',
			// The label of the application menu bar menu containing buttons and features that apply formatting to a text (e.g. bold, italic, etc.).
			'MENU_BAR_MENU_TEXT': 'متن',
			// The label of the application menu bar menu containing buttons and features that control the font of the edited content (e.g. font size, font color, etc.).
			'MENU_BAR_MENU_FONT': 'فونت',
			// The accessible label of the editor menu bar used by assistive technologies.
			'Editor menu bar': '',
			// An error text displayed when user attempted to enter an color that is not in HEX format.
			'Please enter a valid color (e.g. "ff0000").': ''
		}
	}
};

export default translations;
