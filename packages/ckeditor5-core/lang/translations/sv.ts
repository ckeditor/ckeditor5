/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'sv': {
		dictionary: {
			// Label for the Cancel button.
			'Cancel': 'Avbryt',
			// Label for the Clear button.
			'Clear': 'Rensa',
			// The label used by a button next to the color palette in the color picker that removes the color (resets it to an empty value, example usages in font color or table properties).
			'Remove color': 'Ta bort färg',
			// The label used by a button next to the color palette in the color picker that restores the default value if the default table properties are specified.
			'Restore default': 'Återställ standard',
			// Label for the Save button.
			'Save': 'Spara',
			// Label of a toolbar button which reveals more toolbar items.
			'Show more items': 'Visa fler objekt',
			// Label for an ‘X of Y’ status of a typical next/previous navigation. For instance, ‘Page 5 of 20’ or 'Search result 5 of 20'.
			'%0 of %1': '%0 av %1',
			// A generic error message displayed on upload failure. The file name is concatenated to this text.
			'Cannot upload file:': 'Kan inte ladda upp fil:',
			// Accessible label of the specific editing area of the editor acting as a root of the entire application.
			'Rich Text Editor. Editing area: %0': 'RTF-redigerare. Redigeringsområde: %0',
			// The label for the insert image with the file manager toolbar button with visible label in insert image dropdown.
			'Insert with file manager': 'Infoga genom filhanteraren',
			// The label for the replace image with the file manager toolbar button with visible label in insert image dropdown.
			'Replace with file manager': 'Ersätt genom filhanteraren',
			// The label for the insert image with the file manager toolbar button.
			'Insert image with file manager': 'Infoga bild genom filhanteraren',
			// The label for the replace image with the file manager toolbar button.
			'Replace image with file manager': 'Ersätt bild genom filhanteraren',
			// The label for a button that opens a file manager in order to insert a file.
			'File': 'Fil',
			// The label for the insert image with the file manager menu bar button (inside 'Insert' menu)
			'With file manager': 'Med filhanteraren',
			// The button label for the object (e.g. image, table) toolbar for hiding the attached caption.
			'Toggle caption off': 'Slå av rubrik',
			// The button label for the object (e.g. image, table) toolbar for showing the attached caption.
			'Toggle caption on': 'Slå på rubrik',
			// Accessibility help dialog category header text for keystrokes related to content creation.
			'Content editing keystrokes': 'Tangenter för innehållsredigering',
			// Accessibility help dialog text further explaining the purpose of the "Content editing keystrokes" category.
			'These keyboard shortcuts allow for quick access to content editing features.': 'Dessa kortkommandon möjliggör snabb innehållsredigering.',
			// Accessibility help dialog category header text for keystrokes related to navigation in the user interface.
			'User interface and content navigation keystrokes': 'Tangenter för användargränssnitt och navigation i innehåll',
			// Accessibility help dialog text further explaining the purpose of the "User interface and content navigation keystrokes" category.
			'Use the following keystrokes for more efficient navigation in the CKEditor 5 user interface.': 'Navigera effektivt i CKEditor 5:s användargränssnitt med följande tangenter.',
			// Keystroke description for assistive technologies: keystroke for closing contextual balloons, dropdowns, and dialogs.
			'Close contextual balloons, dropdowns, and dialogs': 'Stäng kontextballonger, rullgardinsmenyer och dialogrutor',
			// Keystroke description for assistive technologies: keystroke for opening the accessibility help dialog.
			'Open the accessibility help dialog': 'Öppna dialogrutan för hjälp med tillgänglighet',
			// Keystroke description for assistive technologies: keystroke for moving between fields.
			'Move focus between form fields (inputs, buttons, etc.)': 'Flytta fokus mellan formulärfält (inmatningar, knappar m.m.)',
			// Keystroke description for assistive technologies: keystroke for moving focus to the menu bar.
			'Move focus to the menu bar, navigate between menu bars': 'Flytta fokus till menyfältet, navigera mellan menyfält',
			// Keystroke description for assistive technologies: keystroke for moving focus to the toolbar.
			'Move focus to the toolbar, navigate between toolbars': 'Flytta fokus till verktygsfältet, navigera mellan verktygsfält',
			// Keystroke description for assistive technologies: keystroke for navigating through the toolbar.
			'Navigate through the toolbar or menu bar': 'Navigera genom verktygsfältet eller menyfältet',
			// Keystroke description for assistive technologies: keystroke for executing currently focused button.
			'Execute the currently focused button. Executing buttons that interact with the editor content moves the focus back to the content.': 'Kör den knapp som för närvarande är i fokus. När du aktiverar knappar som interagerar med innehållet i redigeraren flyttas fokus tillbaka till innehållet.',
			// Label of the button confirming the changes done in the current interface.
			'Accept': 'Acceptera',
			// The label of the source editing related features used in toolbar buttons.
			'Source': 'Källa',
			// Dropdown option label for the paragraph format.
			'Paragraph': 'Paragraf',
			// The label used by assistive technologies describing a button that opens a color picker, where user can choose a configured color for a certain properties (eg.: background color, color, border-color etc.).
			'Color picker': 'Färgväljare',
			// Label for the Insert button.
			'Insert': 'Infoga',
			// Label for the Update button.
			'Update': 'Uppdatera',
			// Label for the Back button.
			'Back': 'Tillbaka',
			// The secondary text of the message shown to the user when no results are available for the search criteria.
			'Please try a different phrase or check the spelling.': 'Prova en annan fras eller kontrollera stavningen.',
			// The label for the object (e.g. image, media) style button that wraps text around the object.
			'Wrap text': 'Omslut med text',
			// The label for the object (e.g. image, media) style button that breaks the text around the object.
			'Break text': 'Bryt upp text',
			// The label for the resize option that allows the user to enter a custom size.
			'Custom': 'Anpassad',
			// The default label for the resize option that resets the size.
			'Original': 'Ursprunglig',
			// Text used as an error label when the user submitted a custom resize form with a blank value.
			'The value must not be empty.': 'Värdet får inte vara tomt.',
			// Text used as an error label when the user submitted a custom resize form with an incorrect value.
			'The value should be a plain number.': 'Värdet ska vara ett vanligt tal.'
		},
		getPluralForm: ( n: number ) => (n != 1)
	}
};

export default translations;
