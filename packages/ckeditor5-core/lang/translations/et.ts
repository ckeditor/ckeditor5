/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'et': {
		dictionary: {
			// Label for the Cancel button.
			'Cancel': 'Loobu',
			// Label for the Clear button.
			'Clear': 'Selge',
			// The label used by a button next to the color palette in the color picker that removes the color (resets it to an empty value, example usages in font color or table properties).
			'Remove color': 'Eemalda värv',
			// The label used by a button next to the color palette in the color picker that restores the default value if the default table properties are specified.
			'Restore default': 'Taasta algne',
			// Label for the Save button.
			'Save': 'Salvesta',
			// Label of a toolbar button which reveals more toolbar items.
			'Show more items': 'Näita veel',
			// Label for an ‘X of Y’ status of a typical next/previous navigation. For instance, ‘Page 5 of 20’ or 'Search result 5 of 20'.
			'%0 of %1': '%0 / %1',
			// A generic error message displayed on upload failure. The file name is concatenated to this text.
			'Cannot upload file:': 'Faili ei suudeta üles laadida:',
			// Accessible label of the specific editing area of the editor acting as a root of the entire application.
			'Rich Text Editor. Editing area: %0': 'Rikastekstiredaktor. Redigeerimisala: %0',
			// The label for the insert image with the file manager toolbar button with visible label in insert image dropdown.
			'Insert with file manager': 'Sisesta failihalduriga',
			// The label for the replace image with the file manager toolbar button with visible label in insert image dropdown.
			'Replace with file manager': 'Asenda failihalduriga',
			// The label for the insert image with the file manager toolbar button.
			'Insert image with file manager': 'Sisesta pilt failihalduriga',
			// The label for the replace image with the file manager toolbar button.
			'Replace image with file manager': 'Asenda pilt failihalduriga',
			// The label for a button that opens a file manager in order to insert a file.
			'File': 'Fail',
			// The label for the insert image with the file manager menu bar button (inside 'Insert' menu)
			'With file manager': 'Failihalduriga',
			// The button label for the object (e.g. image, table) toolbar for hiding the attached caption.
			'Toggle caption off': 'Lülita pealdis välja',
			// The button label for the object (e.g. image, table) toolbar for showing the attached caption.
			'Toggle caption on': 'Lülita pealdis sisse',
			// Accessibility help dialog category header text for keystrokes related to content creation.
			'Content editing keystrokes': 'Sisu muutmise klahvikombinatsioonid',
			// Accessibility help dialog text further explaining the purpose of the "Content editing keystrokes" category.
			'These keyboard shortcuts allow for quick access to content editing features.': 'Nende klahvikombinatsioonidega pääseb kiiresti sisu muutmise võimaluste juurde.',
			// Accessibility help dialog category header text for keystrokes related to navigation in the user interface.
			'User interface and content navigation keystrokes': 'Kasutajaliidese ja sisus liikumise klahvikombinatsioonid',
			// Accessibility help dialog text further explaining the purpose of the "User interface and content navigation keystrokes" category.
			'Use the following keystrokes for more efficient navigation in the CKEditor 5 user interface.': 'Järgmiste klahvikombinatsioonidega saab tõhusamalt liikuda redaktori CKEditor 5 kasutajaliideses.',
			// Keystroke description for assistive technologies: keystroke for closing contextual balloons, dropdowns, and dialogs.
			'Close contextual balloons, dropdowns, and dialogs': 'Sulge konteksti mullid, rippmenüüd ja dialoogid',
			// Keystroke description for assistive technologies: keystroke for opening the accessibility help dialog.
			'Open the accessibility help dialog': 'Ava juurdepääsu abidialoog',
			// Keystroke description for assistive technologies: keystroke for moving between fields.
			'Move focus between form fields (inputs, buttons, etc.)': 'Vaheta ankeedi välju (sisendeid, nuppe jne)',
			// Keystroke description for assistive technologies: keystroke for moving focus to the menu bar.
			'Move focus to the menu bar, navigate between menu bars': 'Keskendu menüüribale, vaheta menüüribasid',
			// Keystroke description for assistive technologies: keystroke for moving focus to the toolbar.
			'Move focus to the toolbar, navigate between toolbars': 'Keskendu tööriistaribale, vaheta tööriistaribasid',
			// Keystroke description for assistive technologies: keystroke for navigating through the toolbar.
			'Navigate through the toolbar or menu bar': 'Liigu tööriistaribas või menüüribas',
			// Keystroke description for assistive technologies: keystroke for executing currently focused button.
			'Execute the currently focused button. Executing buttons that interact with the editor content moves the focus back to the content.': 'Vajuta praegu aktiivset nuppu. Redaktori sisu muutvate nuppude vajutamine viib tähelepanu taas sisule.',
			// Label of the button confirming the changes done in the current interface.
			'Accept': 'Nõustu',
			// The label of the source editing related features used in toolbar buttons.
			'Source': 'Allikas',
			// Dropdown option label for the paragraph format.
			'Paragraph': 'Lõik',
			// The label used by assistive technologies describing a button that opens a color picker, where user can choose a configured color for a certain properties (eg.: background color, color, border-color etc.).
			'Color picker': 'Värvi valija',
			// Label for the Insert button.
			'Insert': 'Sisesta',
			// Label for the Update button.
			'Update': 'Uuenda',
			// Label for the Back button.
			'Back': 'Tagasi',
			// The secondary text of the message shown to the user when no results are available for the search criteria.
			'Please try a different phrase or check the spelling.': 'Proovige mõnda muud fraasi või kontrollige õigekirja.',
			// The label for the object (e.g. image, media) style button that wraps text around the object.
			'Wrap text': 'Murra teksti ridu',
			// The label for the object (e.g. image, media) style button that breaks the text around the object.
			'Break text': 'Murra teksti',
			// The label for the resize option that allows the user to enter a custom size.
			'Custom': 'Enda valitud',
			// The default label for the resize option that resets the size.
			'Original': 'Algne',
			// Text used as an error label when the user submitted a custom resize form with a blank value.
			'The value must not be empty.': 'Väärtus peab olema sisestatud.',
			// Text used as an error label when the user submitted a custom resize form with an incorrect value.
			'The value should be a plain number.': 'Väärtus peab olema tavanumber.'
		},
		getPluralForm: ( n: number ) => (n != 1)
	}
};

export default translations;
