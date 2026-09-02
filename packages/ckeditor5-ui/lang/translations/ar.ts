/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'ar': {
		dictionary: {
			// Title of the CKEditor5 editor.
			'Rich Text Editor': 'معالج نصوص',
			// Label of the block toolbar icon (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Edit block': 'كتلة التحرير',
			// First part of the label of the block toolbar icon when functionality of drag and drop is available (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Click to edit block': 'انقر لتحرير الوحدة التجميعية',
			// Second part of the label of the block toolbar icon when functionality of drag and drop is available (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Drag to move': 'اسحب للنقل',
			// Label for a button showing the next thing (tab, page, etc.).
			'Next': 'التالي',
			// Label for a button showing the previous thing (tab, page, etc.).
			'Previous': 'السابق',
			// Label used by assistive technologies describing a generic editor toolbar.
			'Editor toolbar': 'شريط أدوات المحرر',
			// Label used by assistive technologies describing a toolbar displayed inside a dropdown.
			'Dropdown toolbar': 'شريط أدوات القائمة المنسدلة',
			// Label used by assistive technologies describing a menu displayed inside a dropdown.
			'Dropdown menu': 'القائمة المنسدلة',
			// Label of a button that applies a black color in color pickers.
			'Black': 'أسود',
			// Label of a button that applies a dim grey color in color pickers.
			'Dim grey': 'رمادي خافت',
			// Label of a button that applies a grey color in color pickers.
			'Grey': 'رمادي',
			// Label of a button that applies a light grey color in color pickers.
			'Light grey': 'رمادي فاتح',
			// Label of a button that applies a white color in color pickers.
			'White': 'أبيض',
			// Label of a button that applies a red color in color pickers.
			'Red': 'أحمر',
			// Label of a button that applies a orange color in color pickers.
			'Orange': 'برتقالي',
			// Label of a button that applies a yellow color in color pickers.
			'Yellow': 'أصفر',
			// Label of a button that applies a light green color in color pickers.
			'Light green': 'أخضر فاتح',
			// Label of a button that applies a green color in color pickers.
			'Green': 'أخضر',
			// Label of a button that applies a aquamarine color in color pickers.
			'Aquamarine': 'أخضر زبرجد',
			// Label of a button that applies a turquoise color in color pickers.
			'Turquoise': 'فيروزي',
			// Label of a button that applies a light blue color in color pickers.
			'Light blue': 'أزرق فاتح',
			// Label of a button that applies a blue color in color pickers.
			'Blue': 'أزرق',
			// Label of a button that applies a purple color in color pickers.
			'Purple': 'أرجواني',
			// Accessible label of a toolbar that shows up next to the blocks of content (e.g. headings, paragraphs).
			'Editor block content toolbar': 'شريط المحرر لأدوات كتلة المحتوى',
			// Accessible label of a balloon toolbar that shows up right next to the user selection (the caret).
			'Editor contextual toolbar': 'شريط المحرر للأدوات السياقية',
			// Label of an input field for typing colors in the HEX color format.
			'HEX': 'لون سداسي عشري',
			// The main text of the message shown to the user when given query does not match any results.
			'No results found': 'لم يتم العثور على نتائج',
			// The main text of the message shown to the user when no results are available.
			'No searchable items': 'لا توجد عناصر قابلة للبحث متاحة',
			// A default label of a dialog window displayed on top the editor.
			'Editor dialog': 'حوار المحرر',
			// The label and the tooltip for the close button in the dialog header.
			'Close': 'إغلاق',
			// Accessibility help dialog assistive technologies label telling users how to exit the dialog.
			'Help Contents. To close this dialog press ESC.': 'محتويات التعليمات. لإغلاق هذا الحوار، اضغطْ على مفتاح ESC.',
			// Accessibility help dialog text explaining what can be found in that dialog.
			'Below, you can find a list of keyboard shortcuts that can be used in the editor.': 'ستجد أدناه قائمة باختصارات لوحة المفاتيح التي يمكن استخدامها في المحرِّر.',
			// Accessibility help dialog text displayed next to keystrokes that may require the Fn key on Mac.
			'(may require <kbd>Fn</kbd>)': '(قد يتطلب <kbd>مفتاح Fn</kbd>)',
			// The label for the button that opens the Accessibility help dialog from the application menu bar.
			'Accessibility': 'إمكانية الوصول',
			// Accessibility help dialog title.
			'Accessibility help': 'تعليمات إمكانية الوصول',
			// Assistive technologies label added to each editor editing area informing users about the possibility of opening the accessibility help dialog.
			'Press %0 for help.': 'اضغط على %0 للحصول على التعليمات.',
			// Keystroke description for assistive technologies: keystroke for moving focus out of an active dialog window.
			'Move focus in and out of an active dialog window': 'انقلْ التركيز داخل وخارج نافذة الحوار النشطة',
			// The label of the top-level application menu bar menu containing buttons and features related to the whole document (e.g. export to PDF, import from Word, etc.).
			'MENU_BAR_MENU_FILE': 'ملف',
			// The label of the top-level application menu bar menu containing buttons and features related to general editing (e.g. undo, redo, select all, etc.).
			'MENU_BAR_MENU_EDIT': 'تحرير',
			// The label of the top-level application menu bar menu containing buttons and features related to the view of the editor (e.g. show source).
			'MENU_BAR_MENU_VIEW': 'عرض',
			// The label of the top-level application menu bar menu containing buttons and features that insert content (e.g. insert table, insert image, etc.).
			'MENU_BAR_MENU_INSERT': 'إدراج',
			// The label of the top-level application menu bar menu containing buttons and features related to content formatting (e.g. bold, font color, heading, etc.).
			'MENU_BAR_MENU_FORMAT': 'صيغة',
			// The label of the top-level application menu bar menu containing various editor tools (e.g. AI assistant, track changes, etc.).
			'MENU_BAR_MENU_TOOLS': 'أدوات',
			// The label of the top-level application menu bar menu containing buttons and features helping users to learn about the editor (e.g. accessibility help).
			'MENU_BAR_MENU_HELP': 'مساعدة',
			// The label of the application menu bar menu containing buttons and features that apply formatting to a text (e.g. bold, italic, etc.).
			'MENU_BAR_MENU_TEXT': 'نص',
			// The label of the application menu bar menu containing buttons and features that control the font of the edited content (e.g. font size, font color, etc.).
			'MENU_BAR_MENU_FONT': 'خط',
			// The accessible label of the editor menu bar used by assistive technologies.
			'Editor menu bar': 'شريط قائمة المحرِّر',
			// An error text displayed when user attempted to enter an color that is not in HEX format.
			'Please enter a valid color (e.g. "ff0000").': 'يُرجى إدخال لون صالح (على سبيل المثال "ff0000").'
		}
	}
};

export default translations;
