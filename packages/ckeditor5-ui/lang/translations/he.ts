/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'he': {
		dictionary: {
			// Title of the CKEditor5 editor.
			'Rich Text Editor': 'עורך טקסט עשיר',
			// Label of the block toolbar icon (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Edit block': 'הגדרות בלוק',
			// First part of the label of the block toolbar icon when functionality of drag and drop is available (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Click to edit block': 'להקיש לעריכת בלוק',
			// Second part of the label of the block toolbar icon when functionality of drag and drop is available (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Drag to move': 'לגרור כדי להזיז',
			// Label for a button showing the next thing (tab, page, etc.).
			'Next': 'הבא',
			// Label for a button showing the previous thing (tab, page, etc.).
			'Previous': 'הקודם',
			// Label used by assistive technologies describing a generic editor toolbar.
			'Editor toolbar': 'סרגל הכלים',
			// Label used by assistive technologies describing a toolbar displayed inside a dropdown.
			'Dropdown toolbar': 'סרגל כלים נפתח',
			// Label used by assistive technologies describing a menu displayed inside a dropdown.
			'Dropdown menu': 'תפריט נפתח',
			// Label of a button that applies a black color in color pickers.
			'Black': 'שחור',
			// Label of a button that applies a dim grey color in color pickers.
			'Dim grey': 'אפור עמום',
			// Label of a button that applies a grey color in color pickers.
			'Grey': 'אפור',
			// Label of a button that applies a light grey color in color pickers.
			'Light grey': 'אפור בהיר',
			// Label of a button that applies a white color in color pickers.
			'White': 'לבן',
			// Label of a button that applies a red color in color pickers.
			'Red': 'אדום',
			// Label of a button that applies a orange color in color pickers.
			'Orange': 'כתום',
			// Label of a button that applies a yellow color in color pickers.
			'Yellow': 'צהוב',
			// Label of a button that applies a light green color in color pickers.
			'Light green': 'ירוק בהיר',
			// Label of a button that applies a green color in color pickers.
			'Green': 'ירוק',
			// Label of a button that applies a aquamarine color in color pickers.
			'Aquamarine': 'ירוק-כחלחל',
			// Label of a button that applies a turquoise color in color pickers.
			'Turquoise': 'טורקיז',
			// Label of a button that applies a light blue color in color pickers.
			'Light blue': 'כחול בהיר',
			// Label of a button that applies a blue color in color pickers.
			'Blue': 'כחול',
			// Label of a button that applies a purple color in color pickers.
			'Purple': 'סגול',
			// Accessible label of a toolbar that shows up next to the blocks of content (e.g. headings, paragraphs).
			'Editor block content toolbar': 'סרגל כלים של תוכן בלוק של העורך',
			// Accessible label of a balloon toolbar that shows up right next to the user selection (the caret).
			'Editor contextual toolbar': 'סרגל כלים הקשרי של העורך',
			// Label of an input field for typing colors in the HEX color format.
			'HEX': 'HEX',
			// The main text of the message shown to the user when given query does not match any results.
			'No results found': 'לא נמצאו תוצאות',
			// The main text of the message shown to the user when no results are available.
			'No searchable items': 'אין פריטים ניתנים לחיפוש',
			// A default label of a dialog window displayed on top the editor.
			'Editor dialog': 'חלון דו-שיח של העורך',
			// The label and the tooltip for the close button in the dialog header.
			'Close': 'סגור',
			// Accessibility help dialog assistive technologies label telling users how to exit the dialog.
			'Help Contents. To close this dialog press ESC.': 'תוכן עזרה. כדי לסגור תיבת דו-שיח זו יש להקיש על ESC.',
			// Accessibility help dialog text explaining what can be found in that dialog.
			'Below, you can find a list of keyboard shortcuts that can be used in the editor.': 'להלן, תוכלו למצוא רשימה של קיצורי מקשים בהם ניתן להשתמש בעורך.',
			// Accessibility help dialog text displayed next to keystrokes that may require the Fn key on Mac.
			'(may require <kbd>Fn</kbd>)': '(עשוי לדרוש <kbd>Fn</kbd>)',
			// The label for the button that opens the Accessibility help dialog from the application menu bar.
			'Accessibility': 'נגישות',
			// Accessibility help dialog title.
			'Accessibility help': 'עזרה בנושא נגישות',
			// Assistive technologies label added to each editor editing area informing users about the possibility of opening the accessibility help dialog.
			'Press %0 for help.': 'לחצו על %0 לקבלת עזרה.',
			// Keystroke description for assistive technologies: keystroke for moving focus out of an active dialog window.
			'Move focus in and out of an active dialog window': 'הזזת המיקוד פנימה והחוצה מחלון דו-שיח פעיל',
			// The label of the top-level application menu bar menu containing buttons and features related to the whole document (e.g. export to PDF, import from Word, etc.).
			'MENU_BAR_MENU_FILE': 'קובץ',
			// The label of the top-level application menu bar menu containing buttons and features related to general editing (e.g. undo, redo, select all, etc.).
			'MENU_BAR_MENU_EDIT': 'ערוך',
			// The label of the top-level application menu bar menu containing buttons and features related to the view of the editor (e.g. show source).
			'MENU_BAR_MENU_VIEW': 'תצוגה',
			// The label of the top-level application menu bar menu containing buttons and features that insert content (e.g. insert table, insert image, etc.).
			'MENU_BAR_MENU_INSERT': 'הכנס',
			// The label of the top-level application menu bar menu containing buttons and features related to content formatting (e.g. bold, font color, heading, etc.).
			'MENU_BAR_MENU_FORMAT': 'עיצוב',
			// The label of the top-level application menu bar menu containing various editor tools (e.g. AI assistant, track changes, etc.).
			'MENU_BAR_MENU_TOOLS': 'כלים',
			// The label of the top-level application menu bar menu containing buttons and features helping users to learn about the editor (e.g. accessibility help).
			'MENU_BAR_MENU_HELP': 'עזרה',
			// The label of the application menu bar menu containing buttons and features that apply formatting to a text (e.g. bold, italic, etc.).
			'MENU_BAR_MENU_TEXT': 'טקסט',
			// The label of the application menu bar menu containing buttons and features that control the font of the edited content (e.g. font size, font color, etc.).
			'MENU_BAR_MENU_FONT': 'גופן',
			// The accessible label of the editor menu bar used by assistive technologies.
			'Editor menu bar': 'שורת התפריטים של העורך',
			// An error text displayed when user attempted to enter an color that is not in HEX format.
			'Please enter a valid color (e.g. "ff0000").': 'נא להזין צבע חוקי (למשל "ff0000").'
		}
	}
};

export default translations;
