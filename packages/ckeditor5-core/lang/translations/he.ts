/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'he': {
		dictionary: {
			// Label for the Cancel button.
			'Cancel': 'ביטול',
			// Label for the Clear button.
			'Clear': 'לנקות',
			// The label used by a button next to the color palette in the color picker that removes the color (resets it to an empty value, example usages in font color or table properties).
			'Remove color': 'מחיקת צבע',
			// The label used by a button next to the color palette in the color picker that restores the default value if the default table properties are specified.
			'Restore default': 'שחזור ברירת מחדל',
			// Label for the Save button.
			'Save': 'שמירה',
			// Label of a toolbar button which reveals more toolbar items.
			'Show more items': 'הצג פריטים נוספים',
			// Label for an ‘X of Y’ status of a typical next/previous navigation. For instance, ‘Page 5 of 20’ or 'Search result 5 of 20'.
			'%0 of %1': '%0 מתוך %1',
			// A generic error message displayed on upload failure. The file name is concatenated to this text.
			'Cannot upload file:': 'לא ניתן להעלות את הקובץ הבא:',
			// Accessible label of the specific editing area of the editor acting as a root of the entire application.
			'Rich Text Editor. Editing area: %0': 'עורך פורמט טקסט עשיר. אזור עריכה: %0',
			// The label for the insert image with the file manager toolbar button with visible label in insert image dropdown.
			'Insert with file manager': 'הוספה עם מנהל הקבצים',
			// The label for the replace image with the file manager toolbar button with visible label in insert image dropdown.
			'Replace with file manager': 'החלפה עם מנהל הקבצים',
			// The label for the insert image with the file manager toolbar button.
			'Insert image with file manager': 'הוספת תמונה עם מנהל הקבצים',
			// The label for the replace image with the file manager toolbar button.
			'Replace image with file manager': 'החלפת תמונה עם מנהל הקבצים',
			// The label for a button that opens a file manager in order to insert a file.
			'File': 'קובץ',
			// The label for the insert image with the file manager menu bar button (inside 'Insert' menu)
			'With file manager': 'באמצעות מנהל קבצים',
			// The button label for the object (e.g. image, table) toolbar for hiding the attached caption.
			'Toggle caption off': 'כבה את הכיתוב',
			// The button label for the object (e.g. image, table) toolbar for showing the attached caption.
			'Toggle caption on': 'הפעל את הכיתוב',
			// Accessibility help dialog category header text for keystrokes related to content creation.
			'Content editing keystrokes': 'מקשי עריכת תוכן',
			// Accessibility help dialog text further explaining the purpose of the "Content editing keystrokes" category.
			'These keyboard shortcuts allow for quick access to content editing features.': 'קיצורי מקשים אלה מאפשרים גישה מהירה לתכונות עריכת תוכן.',
			// Accessibility help dialog category header text for keystrokes related to navigation in the user interface.
			'User interface and content navigation keystrokes': 'ממשק משתמש ומקשים לניווט בתוכן',
			// Accessibility help dialog text further explaining the purpose of the "User interface and content navigation keystrokes" category.
			'Use the following keystrokes for more efficient navigation in the CKEditor 5 user interface.': 'השתמשו במקשים הבאים לניווט יעיל יותר בממשק המשתמש של CKEditor 5.',
			// Keystroke description for assistive technologies: keystroke for closing contextual balloons, dropdowns, and dialogs.
			'Close contextual balloons, dropdowns, and dialogs': 'סגירת בלוני הקשר, תפריטים נפתחים ותיבות דו-שיח',
			// Keystroke description for assistive technologies: keystroke for opening the accessibility help dialog.
			'Open the accessibility help dialog': 'פתיחת תיבת הדו-שיח של עזרה בנושא נגישות',
			// Keystroke description for assistive technologies: keystroke for moving between fields.
			'Move focus between form fields (inputs, buttons, etc.)': 'העברת המיקוד בין שדות בטופס (שדות קלט, לחצנים וכו\')',
			// Keystroke description for assistive technologies: keystroke for moving focus to the menu bar.
			'Move focus to the menu bar, navigate between menu bars': 'העברת המיקוד לשורת התפריטים, ניווט בין שורות התפריטים',
			// Keystroke description for assistive technologies: keystroke for moving focus to the toolbar.
			'Move focus to the toolbar, navigate between toolbars': 'העברת המיקוד לסרגל הכלים, ניווט בין סרגלי כלים',
			// Keystroke description for assistive technologies: keystroke for navigating through the toolbar.
			'Navigate through the toolbar or menu bar': 'ניווט בסרגל הכלים או בשורת התפריטים',
			// Keystroke description for assistive technologies: keystroke for executing currently focused button.
			'Execute the currently focused button. Executing buttons that interact with the editor content moves the focus back to the content.': 'הפעלת הלחצן שבמיקוד כעת. הפעלת לחצנים המקיימים אינטראקציה עם תוכן העורך מחזירה את המיקוד לתוכן.',
			// Label of the button confirming the changes done in the current interface.
			'Accept': 'קבל',
			// The label of the source editing related features used in toolbar buttons.
			'Source': 'מקור',
			// Dropdown option label for the paragraph format.
			'Paragraph': 'פיסקה',
			// The label used by assistive technologies describing a button that opens a color picker, where user can choose a configured color for a certain properties (eg.: background color, color, border-color etc.).
			'Color picker': 'בורר הצבעים',
			// Label for the Insert button.
			'Insert': 'הכנס',
			// Label for the Update button.
			'Update': 'עדכן',
			// Label for the Back button.
			'Back': 'חזור',
			// The secondary text of the message shown to the user when no results are available for the search criteria.
			'Please try a different phrase or check the spelling.': 'אנא נסו צירוף מילים שונה או בדקו את האיות.',
			// The label for the object (e.g. image, media) style button that wraps text around the object.
			'Wrap text': 'גלישת טקסט',
			// The label for the object (e.g. image, media) style button that breaks the text around the object.
			'Break text': 'שבירת טקסט',
			// The label for the resize option that allows the user to enter a custom size.
			'Custom': 'מותאם אישית',
			// The default label for the resize option that resets the size.
			'Original': 'גודל מקורי',
			// Text used as an error label when the user submitted a custom resize form with a blank value.
			'The value must not be empty.': 'הערך לא יכול להיות ריק.',
			// Text used as an error label when the user submitted a custom resize form with an incorrect value.
			'The value should be a plain number.': 'הערך צריך להיות מספר רגיל.'
		},
		getPluralForm: ( n: number ) => (n != 1)
	}
};

export default translations;
