/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'it': {
		dictionary: {
			// Label for the Cancel button.
			'Cancel': 'Annulla',
			// Label for the Clear button.
			'Clear': 'Cancella',
			// The label used by a button next to the color palette in the color picker that removes the color (resets it to an empty value, example usages in font color or table properties).
			'Remove color': 'Rimuovi colore',
			// The label used by a button next to the color palette in the color picker that restores the default value if the default table properties are specified.
			'Restore default': 'Ripristina predefinito',
			// Label for the Save button.
			'Save': 'Salva',
			// Label of a toolbar button which reveals more toolbar items.
			'Show more items': 'Mostra più elementi',
			// Label for an ‘X of Y’ status of a typical next/previous navigation. For instance, ‘Page 5 of 20’ or 'Search result 5 of 20'.
			'%0 of %1': '%0 di %1',
			// A generic error message displayed on upload failure. The file name is concatenated to this text.
			'Cannot upload file:': 'Impossibile caricare il file:',
			// Accessible label of the specific editing area of the editor acting as a root of the entire application.
			'Rich Text Editor. Editing area: %0': 'Editor Rich Text. Area di modifica: %0',
			// The label for the insert image with the file manager toolbar button with visible label in insert image dropdown.
			'Insert with file manager': 'Inserisci con file manager',
			// The label for the replace image with the file manager toolbar button with visible label in insert image dropdown.
			'Replace with file manager': 'Sostituisci con file manager',
			// The label for the insert image with the file manager toolbar button.
			'Insert image with file manager': 'Inserisci l\'immagine con il file manager',
			// The label for the replace image with the file manager toolbar button.
			'Replace image with file manager': 'Sostituisci l\'immagine con il file manager',
			// The label for a button that opens a file manager in order to insert a file.
			'File': 'File',
			// The label for the insert image with the file manager menu bar button (inside 'Insert' menu)
			'With file manager': 'Con gestione file',
			// The button label for the object (e.g. image, table) toolbar for hiding the attached caption.
			'Toggle caption off': 'Disattiva didascalia',
			// The button label for the object (e.g. image, table) toolbar for showing the attached caption.
			'Toggle caption on': 'Attiva didascalia',
			// Accessibility help dialog category header text for keystrokes related to content creation.
			'Content editing keystrokes': 'Tasti per la modifica del contenuto',
			// Accessibility help dialog text further explaining the purpose of the "Content editing keystrokes" category.
			'These keyboard shortcuts allow for quick access to content editing features.': 'Queste scorciatoie da tastiera permettono di accedere velocemente alle funzionalità di modifica del contenuto.',
			// Accessibility help dialog category header text for keystrokes related to navigation in the user interface.
			'User interface and content navigation keystrokes': 'Tasti per la navigazione nell\'interfaccia utente e nei contenuti',
			// Accessibility help dialog text further explaining the purpose of the "User interface and content navigation keystrokes" category.
			'Use the following keystrokes for more efficient navigation in the CKEditor 5 user interface.': 'Utilizza i seguenti tasti per una navigazione più efficiente nell\'interfaccia utente di CKEditor 5.',
			// Keystroke description for assistive technologies: keystroke for closing contextual balloons, dropdowns, and dialogs.
			'Close contextual balloons, dropdowns, and dialogs': 'Chiude menu a discesa, finestre di dialogo e callout contestuali',
			// Keystroke description for assistive technologies: keystroke for opening the accessibility help dialog.
			'Open the accessibility help dialog': 'Apre la finestra di dialogo della guida all\'accessibilità',
			// Keystroke description for assistive technologies: keystroke for moving between fields.
			'Move focus between form fields (inputs, buttons, etc.)': 'Seleziona/deseleziona i diversi campi del modulo (inserimenti, pulsanti ecc.)',
			// Keystroke description for assistive technologies: keystroke for moving focus to the menu bar.
			'Move focus to the menu bar, navigate between menu bars': 'Sposta la selezione sulla barra dei menu, naviga tra le barre dei menu',
			// Keystroke description for assistive technologies: keystroke for moving focus to the toolbar.
			'Move focus to the toolbar, navigate between toolbars': 'Seleziona la barra degli strumenti, permette di spostarsi tra le barre degli strumenti',
			// Keystroke description for assistive technologies: keystroke for navigating through the toolbar.
			'Navigate through the toolbar or menu bar': 'Naviga nella barra degli strumenti o nella barra dei menu',
			// Keystroke description for assistive technologies: keystroke for executing currently focused button.
			'Execute the currently focused button. Executing buttons that interact with the editor content moves the focus back to the content.': 'Esegui il pulsante attualmente selezionato. L\'esecuzione dei pulsanti che interagiscono con il contenuto dell\'editor riporta la selezione sul contenuto.',
			// Label of the button confirming the changes done in the current interface.
			'Accept': 'Accetta',
			// The label of the source editing related features used in toolbar buttons.
			'Source': 'Fonte',
			// Dropdown option label for the paragraph format.
			'Paragraph': 'Paragrafo',
			// The label used by assistive technologies describing a button that opens a color picker, where user can choose a configured color for a certain properties (eg.: background color, color, border-color etc.).
			'Color picker': 'Selezione colore',
			// Label for the Insert button.
			'Insert': 'Inserisci',
			// Label for the Update button.
			'Update': 'Aggiornamento',
			// Label for the Back button.
			'Back': 'Indietro',
			// The secondary text of the message shown to the user when no results are available for the search criteria.
			'Please try a different phrase or check the spelling.': 'Prova una frase diversa o controlla l\'ortografia.',
			// The label for the object (e.g. image, media) style button that wraps text around the object.
			'Wrap text': 'Testo a capo',
			// The label for the object (e.g. image, media) style button that breaks the text around the object.
			'Break text': 'Interrompi testo',
			// The label for the resize option that allows the user to enter a custom size.
			'Custom': 'Personalizzato',
			// The default label for the resize option that resets the size.
			'Original': 'Originale',
			// Text used as an error label when the user submitted a custom resize form with a blank value.
			'The value must not be empty.': 'Il valore non può essere essere lasciato in bianco.',
			// Text used as an error label when the user submitted a custom resize form with an incorrect value.
			'The value should be a plain number.': 'Il valore deve essere un numero intero.'
		},
		getPluralForm: ( n: number ) => (n != 1)
	}
};

export default translations;
