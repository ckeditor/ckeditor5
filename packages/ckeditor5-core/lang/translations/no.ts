/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'no': {
		dictionary: {
			// Label for the Cancel button.
			'Cancel': 'Avbryt',
			// Label for the Clear button.
			'Clear': 'Slett',
			// The label used by a button next to the color palette in the color picker that removes the color (resets it to an empty value, example usages in font color or table properties).
			'Remove color': 'Fjern farge',
			// The label used by a button next to the color palette in the color picker that restores the default value if the default table properties are specified.
			'Restore default': 'Tilbakestill til standard',
			// Label for the Save button.
			'Save': 'Lagre',
			// Label of a toolbar button which reveals more toolbar items.
			'Show more items': 'Vis flere elementer',
			// Label for an ‘X of Y’ status of a typical next/previous navigation. For instance, ‘Page 5 of 20’ or 'Search result 5 of 20'.
			'%0 of %1': '%0 av %1',
			// A generic error message displayed on upload failure. The file name is concatenated to this text.
			'Cannot upload file:': 'Kan ikke laste opp fil:',
			// Accessible label of the specific editing area of the editor acting as a root of the entire application.
			'Rich Text Editor. Editing area: %0': 'Redigeringsverktøy for rik tekst. Redigeringsområde: %0',
			// The label for the insert image with the file manager toolbar button with visible label in insert image dropdown.
			'Insert with file manager': 'Sett inn med filbehandling',
			// The label for the replace image with the file manager toolbar button with visible label in insert image dropdown.
			'Replace with file manager': 'Erstatt med filbehandling',
			// The label for the insert image with the file manager toolbar button.
			'Insert image with file manager': 'Sett inn bilde med filbehandling',
			// The label for the replace image with the file manager toolbar button.
			'Replace image with file manager': 'Erstatt bilde med filbehandling',
			// The label for a button that opens a file manager in order to insert a file.
			'File': 'Fil',
			// The label for the insert image with the file manager menu bar button (inside 'Insert' menu)
			'With file manager': 'Med filadministrator',
			// The button label for the object (e.g. image, table) toolbar for hiding the attached caption.
			'Toggle caption off': 'Veksle tabelltekst av',
			// The button label for the object (e.g. image, table) toolbar for showing the attached caption.
			'Toggle caption on': 'Veksle tabelltekst på',
			// Accessibility help dialog category header text for keystrokes related to content creation.
			'Content editing keystrokes': 'Tastetrykk for innholdsredigering',
			// Accessibility help dialog text further explaining the purpose of the "Content editing keystrokes" category.
			'These keyboard shortcuts allow for quick access to content editing features.': 'Disse hurtigtastene gir rask tilgang til funksjonene for innholdsredigering.',
			// Accessibility help dialog category header text for keystrokes related to navigation in the user interface.
			'User interface and content navigation keystrokes': 'Brukergrensesnitt og tastetrykk for navigering i innhold',
			// Accessibility help dialog text further explaining the purpose of the "User interface and content navigation keystrokes" category.
			'Use the following keystrokes for more efficient navigation in the CKEditor 5 user interface.': 'Bruk følgende tastetrykk for mer effektiv navigering i grensesnittet for 5-brukerversjonen av CKEditor.',
			// Keystroke description for assistive technologies: keystroke for closing contextual balloons, dropdowns, and dialogs.
			'Close contextual balloons, dropdowns, and dialogs': 'Lukk hjelpebobler, nedtrekkslister og dialoger',
			// Keystroke description for assistive technologies: keystroke for opening the accessibility help dialog.
			'Open the accessibility help dialog': 'Åpne dialogen for tilgjengelighetshjelp',
			// Keystroke description for assistive technologies: keystroke for moving between fields.
			'Move focus between form fields (inputs, buttons, etc.)': 'Flytt fokus mellom skjemafelt (inputer, knapper osv.)',
			// Keystroke description for assistive technologies: keystroke for moving focus to the menu bar.
			'Move focus to the menu bar, navigate between menu bars': 'Flytt fokus til menylinjen, naviger mellom menylinjer',
			// Keystroke description for assistive technologies: keystroke for moving focus to the toolbar.
			'Move focus to the toolbar, navigate between toolbars': 'Flytt fokus til verktøylinjen, naviger mellom verktøylinjer',
			// Keystroke description for assistive technologies: keystroke for navigating through the toolbar.
			'Navigate through the toolbar or menu bar': 'Naviger gjennom verktøylinjen eller menylinjen',
			// Keystroke description for assistive technologies: keystroke for executing currently focused button.
			'Execute the currently focused button. Executing buttons that interact with the editor content moves the focus back to the content.': 'Utløs knappen som nå er i fokus. Utløsing av knapper som påvirker innholdet som redigeres, flytter fokuset tilbake til innholdet.',
			// Label of the button confirming the changes done in the current interface.
			'Accept': 'Godta',
			// The label of the source editing related features used in toolbar buttons.
			'Source': 'Kilde',
			// Dropdown option label for the paragraph format.
			'Paragraph': 'Avsnitt',
			// The label used by assistive technologies describing a button that opens a color picker, where user can choose a configured color for a certain properties (eg.: background color, color, border-color etc.).
			'Color picker': 'Fargevalg ',
			// Label for the Insert button.
			'Insert': 'Sett inn',
			// Label for the Update button.
			'Update': 'Oppdater',
			// Label for the Back button.
			'Back': 'Tilbake',
			// The secondary text of the message shown to the user when no results are available for the search criteria.
			'Please try a different phrase or check the spelling.': 'Vennligst forsøk en annen frase eller sjekk stavemåte.',
			// The label for the object (e.g. image, media) style button that wraps text around the object.
			'Wrap text': 'Omslutt',
			// The label for the object (e.g. image, media) style button that breaks the text around the object.
			'Break text': 'Bryt tekst',
			// The label for the resize option that allows the user to enter a custom size.
			'Custom': 'Tilpasset',
			// The default label for the resize option that resets the size.
			'Original': 'Original',
			// Text used as an error label when the user submitted a custom resize form with a blank value.
			'The value must not be empty.': 'Verdien kan ikke være tom.',
			// Text used as an error label when the user submitted a custom resize form with an incorrect value.
			'The value should be a plain number.': 'Verdien skal være et vanlig tall.'
		},
		getPluralForm: ( n: number ) => (n != 1)
	}
};

export default translations;
