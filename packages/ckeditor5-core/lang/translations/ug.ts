/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'ug': {
		dictionary: {
			// Label for the Cancel button.
			'Cancel': 'ۋاز كەچ',
			// Label for the Clear button.
			'Clear': 'تازىلا',
			// The label used by a button next to the color palette in the color picker that removes the color (resets it to an empty value, example usages in font color or table properties).
			'Remove color': 'رەڭنى چىقىرىۋەت',
			// The label used by a button next to the color palette in the color picker that restores the default value if the default table properties are specified.
			'Restore default': 'كۆڭۈلدىكىگە قايتۇر',
			// Label for the Save button.
			'Save': 'ساقلا',
			// Label of a toolbar button which reveals more toolbar items.
			'Show more items': 'تېخىمۇ كۆپ تۈرنى كۆرسەت',
			// Label for an ‘X of Y’ status of a typical next/previous navigation. For instance, ‘Page 5 of 20’ or 'Search result 5 of 20'.
			'%0 of %1': '%0 / %1',
			// A generic error message displayed on upload failure. The file name is concatenated to this text.
			'Cannot upload file:': 'يۈكلەشكە بولمايدىغان ھۆججەت:',
			// Accessible label of the specific editing area of the editor acting as a root of the entire application.
			'Rich Text Editor. Editing area: %0': 'مول تېكىست تەھرىرلىگۈچ. تەھرىرلەش رايونى: %0',
			// The label for the insert image with the file manager toolbar button with visible label in insert image dropdown.
			'Insert with file manager': 'ھۆججەت باشقۇرغۇچ بىلەن قىستۇر',
			// The label for the replace image with the file manager toolbar button with visible label in insert image dropdown.
			'Replace with file manager': 'ھۆججەت باشقۇرغۇچتا ئالماشتۇر',
			// The label for the insert image with the file manager toolbar button.
			'Insert image with file manager': 'سۈرەتنى ھۆججەت باشقۇرغۇچ بىلەن قىستۇرىدۇ',
			// The label for the replace image with the file manager toolbar button.
			'Replace image with file manager': 'سۈرەتنى ھۆججەت باشقۇرغۇچ بىلەن ئالماشتۇرىدۇ',
			// The label for a button that opens a file manager in order to insert a file.
			'File': 'ھۆججەت',
			// The label for the insert image with the file manager menu bar button (inside 'Insert' menu)
			'With file manager': 'ھۆججەت باشقۇرغۇچ بىلەن',
			// The button label for the object (e.g. image, table) toolbar for hiding the attached caption.
			'Toggle caption off': 'جەدۋەل ماۋزۇسى تاقاق',
			// The button label for the object (e.g. image, table) toolbar for showing the attached caption.
			'Toggle caption on': 'جەدۋەل ماۋزۇسى ئوچۇق',
			// Accessibility help dialog category header text for keystrokes related to content creation.
			'Content editing keystrokes': 'مەزمۇن تەھرىرلەش كۇنۇپكا بېسىلىشى',
			// Accessibility help dialog text further explaining the purpose of the "Content editing keystrokes" category.
			'These keyboard shortcuts allow for quick access to content editing features.': '',
			// Accessibility help dialog category header text for keystrokes related to navigation in the user interface.
			'User interface and content navigation keystrokes': '',
			// Accessibility help dialog text further explaining the purpose of the "User interface and content navigation keystrokes" category.
			'Use the following keystrokes for more efficient navigation in the CKEditor 5 user interface.': '',
			// Keystroke description for assistive technologies: keystroke for closing contextual balloons, dropdowns, and dialogs.
			'Close contextual balloons, dropdowns, and dialogs': '',
			// Keystroke description for assistive technologies: keystroke for opening the accessibility help dialog.
			'Open the accessibility help dialog': '',
			// Keystroke description for assistive technologies: keystroke for moving between fields.
			'Move focus between form fields (inputs, buttons, etc.)': '',
			// Keystroke description for assistive technologies: keystroke for moving focus to the menu bar.
			'Move focus to the menu bar, navigate between menu bars': '',
			// Keystroke description for assistive technologies: keystroke for moving focus to the toolbar.
			'Move focus to the toolbar, navigate between toolbars': '',
			// Keystroke description for assistive technologies: keystroke for navigating through the toolbar.
			'Navigate through the toolbar or menu bar': '',
			// Keystroke description for assistive technologies: keystroke for executing currently focused button.
			'Execute the currently focused button. Executing buttons that interact with the editor content moves the focus back to the content.': '',
			// Label of the button confirming the changes done in the current interface.
			'Accept': 'قوشۇل',
			// The label of the source editing related features used in toolbar buttons.
			'Source': '',
			// Dropdown option label for the paragraph format.
			'Paragraph': 'ئابزاس',
			// The label used by assistive technologies describing a button that opens a color picker, where user can choose a configured color for a certain properties (eg.: background color, color, border-color etc.).
			'Color picker': 'رەڭ تاللىغۇچ',
			// Label for the Insert button.
			'Insert': '',
			// Label for the Update button.
			'Update': '',
			// Label for the Back button.
			'Back': '',
			// The secondary text of the message shown to the user when no results are available for the search criteria.
			'Please try a different phrase or check the spelling.': '',
			// The label for the object (e.g. image, media) style button that wraps text around the object.
			'Wrap text': 'تېكىست چۆرىدەت',
			// The label for the object (e.g. image, media) style button that breaks the text around the object.
			'Break text': 'تېكىست ئۈز',
			// The label for the resize option that allows the user to enter a custom size.
			'Custom': 'ئىختىيارى',
			// The default label for the resize option that resets the size.
			'Original': 'ئەسلى',
			// Text used as an error label when the user submitted a custom resize form with a blank value.
			'The value must not be empty.': 'قىممىتى بوش قالدۇرۇلمايدۇ.',
			// Text used as an error label when the user submitted a custom resize form with an incorrect value.
			'The value should be a plain number.': 'مەزكۇر قىممەت سان بولۇشى كېرەك.'
		},
		getPluralForm: ( n: number ) => 0
	}
};

export default translations;
