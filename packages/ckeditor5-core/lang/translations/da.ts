/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'da': {
		dictionary: {
			// Label for the Cancel button.
			'Cancel': 'Annullér',
			// Label for the Clear button.
			'Clear': 'Ryd',
			// The label used by a button next to the color palette in the color picker that removes the color (resets it to an empty value, example usages in font color or table properties).
			'Remove color': 'Fjern farve',
			// The label used by a button next to the color palette in the color picker that restores the default value if the default table properties are specified.
			'Restore default': 'Nulstil',
			// Label for the Save button.
			'Save': 'Gem',
			// Label of a toolbar button which reveals more toolbar items.
			'Show more items': 'Vis flere emner',
			// Label for an ‘X of Y’ status of a typical next/previous navigation. For instance, ‘Page 5 of 20’ or 'Search result 5 of 20'.
			'%0 of %1': '%0 af %1',
			// A generic error message displayed on upload failure. The file name is concatenated to this text.
			'Cannot upload file:': 'Kan ikke uploade fil:',
			// Accessible label of the specific editing area of the editor acting as a root of the entire application.
			'Rich Text Editor. Editing area: %0': 'Rich text redigering. Redigeringsområde: %0',
			// The label for the insert image with the file manager toolbar button with visible label in insert image dropdown.
			'Insert with file manager': 'Indsæt med filhåndtering',
			// The label for the replace image with the file manager toolbar button with visible label in insert image dropdown.
			'Replace with file manager': 'Udskift med filhåndtering',
			// The label for the insert image with the file manager toolbar button.
			'Insert image with file manager': 'Indsæt billede med filhåndtering',
			// The label for the replace image with the file manager toolbar button.
			'Replace image with file manager': 'Udskift billede med filhåndtering',
			// The label for a button that opens a file manager in order to insert a file.
			'File': 'Fil',
			// The label for the insert image with the file manager menu bar button (inside 'Insert' menu)
			'With file manager': 'Med filadministrator',
			// The button label for the object (e.g. image, table) toolbar for hiding the attached caption.
			'Toggle caption off': 'Slå billedtekst fra',
			// The button label for the object (e.g. image, table) toolbar for showing the attached caption.
			'Toggle caption on': 'Slå billedtekst til',
			// Accessibility help dialog category header text for keystrokes related to content creation.
			'Content editing keystrokes': 'Tastaturtryk til redigering af indhold',
			// Accessibility help dialog text further explaining the purpose of the "Content editing keystrokes" category.
			'These keyboard shortcuts allow for quick access to content editing features.': 'Disse tastaturgenveje giver hurtigt adgang til funktioner til redigering af indhold.',
			// Accessibility help dialog category header text for keystrokes related to navigation in the user interface.
			'User interface and content navigation keystrokes': 'Tastatur tryk til brugerflade- og indholdsnavigering',
			// Accessibility help dialog text further explaining the purpose of the "User interface and content navigation keystrokes" category.
			'Use the following keystrokes for more efficient navigation in the CKEditor 5 user interface.': 'Brug følgende tastaturtryk for mere effektiv navigering i CKEditor 5 brugerfladen.',
			// Keystroke description for assistive technologies: keystroke for closing contextual balloons, dropdowns, and dialogs.
			'Close contextual balloons, dropdowns, and dialogs': 'Luk kontekstbetingede balloner, rullemenuer og dialoger',
			// Keystroke description for assistive technologies: keystroke for opening the accessibility help dialog.
			'Open the accessibility help dialog': 'Åbn hjælpedialogen om tilgængelighed',
			// Keystroke description for assistive technologies: keystroke for moving between fields.
			'Move focus between form fields (inputs, buttons, etc.)': 'Flyt fokus mellem formularfelter (input, knapper, osv.)',
			// Keystroke description for assistive technologies: keystroke for moving focus to the menu bar.
			'Move focus to the menu bar, navigate between menu bars': 'Flyt fokus til menulinjen, naviger mellem menulinjerne',
			// Keystroke description for assistive technologies: keystroke for moving focus to the toolbar.
			'Move focus to the toolbar, navigate between toolbars': 'Flyt fokus til værktøjslinjen, naviger mellem værktøjslinjer',
			// Keystroke description for assistive technologies: keystroke for navigating through the toolbar.
			'Navigate through the toolbar or menu bar': 'Naviger gennem værktøjslinjen eller menulinjen',
			// Keystroke description for assistive technologies: keystroke for executing currently focused button.
			'Execute the currently focused button. Executing buttons that interact with the editor content moves the focus back to the content.': 'Udfør den aktuelt fokuserede knap. Udførelse af knapper, der interagerer med editorens indhold, flytter fokus tilbage til indholdet.',
			// Label of the button confirming the changes done in the current interface.
			'Accept': 'Accepter',
			// The label of the source editing related features used in toolbar buttons.
			'Source': 'Kilde',
			// Dropdown option label for the paragraph format.
			'Paragraph': 'Afsnit',
			// The label used by assistive technologies describing a button that opens a color picker, where user can choose a configured color for a certain properties (eg.: background color, color, border-color etc.).
			'Color picker': 'Farvevælger',
			// Label for the Insert button.
			'Insert': 'Indsæt',
			// Label for the Update button.
			'Update': 'Opdater',
			// Label for the Back button.
			'Back': 'Tilbage',
			// The secondary text of the message shown to the user when no results are available for the search criteria.
			'Please try a different phrase or check the spelling.': 'Prøv en anden søgning eller tjek stavemåden.',
			// The label for the object (e.g. image, media) style button that wraps text around the object.
			'Wrap text': 'Ombryd tekst',
			// The label for the object (e.g. image, media) style button that breaks the text around the object.
			'Break text': 'Opdel tekst',
			// The label for the resize option that allows the user to enter a custom size.
			'Custom': 'Brugerdefineret',
			// The default label for the resize option that resets the size.
			'Original': 'Original',
			// Text used as an error label when the user submitted a custom resize form with a blank value.
			'The value must not be empty.': 'Værdien må ikke være tom',
			// Text used as an error label when the user submitted a custom resize form with an incorrect value.
			'The value should be a plain number.': 'Værdien skal være et almindeligt tal'
		},
		getPluralForm: ( n: number ) => (n != 1)
	}
};

export default translations;
