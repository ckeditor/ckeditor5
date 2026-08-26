/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'nl': {
		dictionary: {
			// Label for the Cancel button.
			'Cancel': 'Annuleren',
			// Label for the Clear button.
			'Clear': 'Wissen',
			// The label used by a button next to the color palette in the color picker that removes the color (resets it to an empty value, example usages in font color or table properties).
			'Remove color': 'Verwijder kleur',
			// The label used by a button next to the color palette in the color picker that restores the default value if the default table properties are specified.
			'Restore default': 'Standaardinstellingen terugzetten',
			// Label for the Save button.
			'Save': 'Opslaan',
			// Label of a toolbar button which reveals more toolbar items.
			'Show more items': 'Meer items weergeven',
			// Label for an ‘X of Y’ status of a typical next/previous navigation. For instance, ‘Page 5 of 20’ or 'Search result 5 of 20'.
			'%0 of %1': '%0 van %1',
			// A generic error message displayed on upload failure. The file name is concatenated to this text.
			'Cannot upload file:': 'Kan bestand niet uploaden:',
			// Accessible label of the specific editing area of the editor acting as a root of the entire application.
			'Rich Text Editor. Editing area: %0': 'Rich Text Editor. Bewerkingsgebied: %0',
			// The label for the insert image with the file manager toolbar button with visible label in insert image dropdown.
			'Insert with file manager': 'Invoegen met bestandsbeheer',
			// The label for the replace image with the file manager toolbar button with visible label in insert image dropdown.
			'Replace with file manager': 'Vervangen met bestandsbeheerder',
			// The label for the insert image with the file manager toolbar button.
			'Insert image with file manager': 'Afbeelding invoegen met bestandsbeheer',
			// The label for the replace image with the file manager toolbar button.
			'Replace image with file manager': 'Afbeelding vervangen met bestandsbeheerder',
			// The label for a button that opens a file manager in order to insert a file.
			'File': 'Bestand',
			// The label for the insert image with the file manager menu bar button (inside 'Insert' menu)
			'With file manager': 'Met bestandsbeheer',
			// The button label for the object (e.g. image, table) toolbar for hiding the attached caption.
			'Toggle caption off': 'Bijschrift uitzetten',
			// The button label for the object (e.g. image, table) toolbar for showing the attached caption.
			'Toggle caption on': 'Bijschrift aanzetten',
			// Accessibility help dialog category header text for keystrokes related to content creation.
			'Content editing keystrokes': 'Toetsaanslagen om inhoud aan te passen',
			// Accessibility help dialog text further explaining the purpose of the "Content editing keystrokes" category.
			'These keyboard shortcuts allow for quick access to content editing features.': 'Deze sneltoetsen geven snel toegang tot functies om inhoud aan te passen',
			// Accessibility help dialog category header text for keystrokes related to navigation in the user interface.
			'User interface and content navigation keystrokes': 'Toetsaanslagen voor het navigeren door de gebruikersinterface en inhoud',
			// Accessibility help dialog text further explaining the purpose of the "User interface and content navigation keystrokes" category.
			'Use the following keystrokes for more efficient navigation in the CKEditor 5 user interface.': 'Gebruik de volgende toetsaanslagen om efficiënter door de gebruikersinterface van CKEditor 5 te navigeren.',
			// Keystroke description for assistive technologies: keystroke for closing contextual balloons, dropdowns, and dialogs.
			'Close contextual balloons, dropdowns, and dialogs': 'Sluit contextvensters, dropdown vensters, en dialoogvensters',
			// Keystroke description for assistive technologies: keystroke for opening the accessibility help dialog.
			'Open the accessibility help dialog': 'Open het hulpvenster voor toegankelijkheid',
			// Keystroke description for assistive technologies: keystroke for moving between fields.
			'Move focus between form fields (inputs, buttons, etc.)': 'Beweeg de focus tussen velden in een formulier (invoervensters, knoppen, enz.)',
			// Keystroke description for assistive technologies: keystroke for moving focus to the menu bar.
			'Move focus to the menu bar, navigate between menu bars': 'Focus naar de menubalk verplaatsen, tussen menubalken navigeren',
			// Keystroke description for assistive technologies: keystroke for moving focus to the toolbar.
			'Move focus to the toolbar, navigate between toolbars': 'Beweeg focus naar de werkbalk, navigeer tussen werkbalken',
			// Keystroke description for assistive technologies: keystroke for navigating through the toolbar.
			'Navigate through the toolbar or menu bar': 'Door de werkbalk of menubalk navigeren',
			// Keystroke description for assistive technologies: keystroke for executing currently focused button.
			'Execute the currently focused button. Executing buttons that interact with the editor content moves the focus back to the content.': 'De momenteel gefocuste knop gebruiken. Door knoppen te gebruiken die interactie hebben met de inhoud van de editor, wordt de focus terug naar de inhoud verplaatst.',
			// Label of the button confirming the changes done in the current interface.
			'Accept': 'Accepteren',
			// The label of the source editing related features used in toolbar buttons.
			'Source': 'Bron',
			// Dropdown option label for the paragraph format.
			'Paragraph': 'Paragraaf',
			// The label used by assistive technologies describing a button that opens a color picker, where user can choose a configured color for a certain properties (eg.: background color, color, border-color etc.).
			'Color picker': 'Kleurkiezer',
			// Label for the Insert button.
			'Insert': 'Invoegen',
			// Label for the Update button.
			'Update': 'Update',
			// Label for the Back button.
			'Back': 'Terug',
			// The secondary text of the message shown to the user when no results are available for the search criteria.
			'Please try a different phrase or check the spelling.': 'Probeer een andere term of controleer de spelling.',
			// The label for the object (e.g. image, media) style button that wraps text around the object.
			'Wrap text': 'Tekstterugloop',
			// The label for the object (e.g. image, media) style button that breaks the text around the object.
			'Break text': 'Tekst afbreken',
			// The label for the resize option that allows the user to enter a custom size.
			'Custom': 'Aangepast',
			// The default label for the resize option that resets the size.
			'Original': 'Origineel',
			// Text used as an error label when the user submitted a custom resize form with a blank value.
			'The value must not be empty.': 'De waarde mag niet leeg zijn.',
			// Text used as an error label when the user submitted a custom resize form with an incorrect value.
			'The value should be a plain number.': 'De waarde moet een gewoon getal zijn.'
		},
		getPluralForm: ( n: number ) => (n != 1)
	}
};

export default translations;
