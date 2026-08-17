/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'ca': {
		dictionary: {
			// Label for the Cancel button.
			'Cancel': 'Cancel·lar',
			// Label for the Clear button.
			'Clear': 'Esborra',
			// The label used by a button next to the color palette in the color picker that removes the color (resets it to an empty value, example usages in font color or table properties).
			'Remove color': 'Eliminar el color',
			// The label used by a button next to the color palette in the color picker that restores the default value if the default table properties are specified.
			'Restore default': 'Restaurar el valor predeterminat',
			// Label for the Save button.
			'Save': 'Desar',
			// Label of a toolbar button which reveals more toolbar items.
			'Show more items': 'Mostrar més elements',
			// Label for an ‘X of Y’ status of a typical next/previous navigation. For instance, ‘Page 5 of 20’ or 'Search result 5 of 20'.
			'%0 of %1': '%0 de %1',
			// A generic error message displayed on upload failure. The file name is concatenated to this text.
			'Cannot upload file:': 'No es pot pujar l\'arxiu:',
			// Accessible label of the specific editing area of the editor acting as a root of the entire application.
			'Rich Text Editor. Editing area: %0': 'Editor de text enriquit. Àrea d\'edició: %0',
			// The label for the insert image with the file manager toolbar button with visible label in insert image dropdown.
			'Insert with file manager': 'Insereix-ho amb un gestor de fitxers',
			// The label for the replace image with the file manager toolbar button with visible label in insert image dropdown.
			'Replace with file manager': 'Substitueix-ho amb un gestor de fitxers',
			// The label for the insert image with the file manager toolbar button.
			'Insert image with file manager': 'Insereix la imatge amb el gestor de fitxers',
			// The label for the replace image with the file manager toolbar button.
			'Replace image with file manager': 'Substitueix la imatge amb un gestor de fitxers',
			// The label for a button that opens a file manager in order to insert a file.
			'File': 'Arxiu',
			// The label for the insert image with the file manager menu bar button (inside 'Insert' menu)
			'With file manager': 'Amb el gestor de fitxers',
			// The button label for the object (e.g. image, table) toolbar for hiding the attached caption.
			'Toggle caption off': 'Desactivar el peu de foto',
			// The button label for the object (e.g. image, table) toolbar for showing the attached caption.
			'Toggle caption on': 'Activar el peu de foto',
			// Accessibility help dialog category header text for keystrokes related to content creation.
			'Content editing keystrokes': 'Tecles edició de contingut',
			// Accessibility help dialog text further explaining the purpose of the "Content editing keystrokes" category.
			'These keyboard shortcuts allow for quick access to content editing features.': 'Aquestes dreceres del teclat permeten un accés ràpid a les accions d\'edició de contingut.',
			// Accessibility help dialog category header text for keystrokes related to navigation in the user interface.
			'User interface and content navigation keystrokes': 'Tecles d\'interfície de l\'usuari i navegació del contingut',
			// Accessibility help dialog text further explaining the purpose of the "User interface and content navigation keystrokes" category.
			'Use the following keystrokes for more efficient navigation in the CKEditor 5 user interface.': 'Empreu les següents tecles per a una navegació més eficient en la interfície de l\'usuari de CKEditor 5.',
			// Keystroke description for assistive technologies: keystroke for closing contextual balloons, dropdowns, and dialogs.
			'Close contextual balloons, dropdowns, and dialogs': 'Tanca finestres contextuals, desplegables i diàlegs',
			// Keystroke description for assistive technologies: keystroke for opening the accessibility help dialog.
			'Open the accessibility help dialog': 'Obre la finestra d\'ajuda d\'accessibilitat',
			// Keystroke description for assistive technologies: keystroke for moving between fields.
			'Move focus between form fields (inputs, buttons, etc.)': 'Desplaça el focus entre els camps d\'un formulari (entrades, botons, etc.)',
			// Keystroke description for assistive technologies: keystroke for moving focus to the menu bar.
			'Move focus to the menu bar, navigate between menu bars': 'Mou el cursor a la barra de menú, navega entre barres de menú',
			// Keystroke description for assistive technologies: keystroke for moving focus to the toolbar.
			'Move focus to the toolbar, navigate between toolbars': 'Desplaça el focus a la barra d\'eines, navega entre barres d\'eines',
			// Keystroke description for assistive technologies: keystroke for navigating through the toolbar.
			'Navigate through the toolbar or menu bar': 'Navega per la barra d\'eines o de menú',
			// Keystroke description for assistive technologies: keystroke for executing currently focused button.
			'Execute the currently focused button. Executing buttons that interact with the editor content moves the focus back to the content.': 'Activa el botó que està seleccionat. Quan s\'activen els botons que interactuen amb el contingut de l\'editor, el cursor torna al contingut.',
			// Label of the button confirming the changes done in the current interface.
			'Accept': 'Accepta',
			// The label of the source editing related features used in toolbar buttons.
			'Source': 'Font',
			// Dropdown option label for the paragraph format.
			'Paragraph': 'Paràgraf',
			// The label used by assistive technologies describing a button that opens a color picker, where user can choose a configured color for a certain properties (eg.: background color, color, border-color etc.).
			'Color picker': 'Selector de colors',
			// Label for the Insert button.
			'Insert': 'Introduir',
			// Label for the Update button.
			'Update': 'Actualitzar',
			// Label for the Back button.
			'Back': 'Enrere',
			// The secondary text of the message shown to the user when no results are available for the search criteria.
			'Please try a different phrase or check the spelling.': 'Prova-ho de nou amb una frase diferent o revisa l\'ortografia.',
			// The label for the object (e.g. image, media) style button that wraps text around the object.
			'Wrap text': 'Embolcallar el text',
			// The label for the object (e.g. image, media) style button that breaks the text around the object.
			'Break text': 'Parteix el text',
			// The label for the resize option that allows the user to enter a custom size.
			'Custom': 'Personalitzat',
			// The default label for the resize option that resets the size.
			'Original': 'Original',
			// Text used as an error label when the user submitted a custom resize form with a blank value.
			'The value must not be empty.': 'El valor no pot estar buit.',
			// Text used as an error label when the user submitted a custom resize form with an incorrect value.
			'The value should be a plain number.': 'El valor ha de ser un nombre senzill.'
		},
		getPluralForm: ( n: number ) => (n != 1)
	}
};

export default translations;
