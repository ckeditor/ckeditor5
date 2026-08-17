/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'de': {
		dictionary: {
			// Label for the Cancel button.
			'Cancel': 'Abbrechen',
			// Label for the Clear button.
			'Clear': 'Löschen',
			// The label used by a button next to the color palette in the color picker that removes the color (resets it to an empty value, example usages in font color or table properties).
			'Remove color': 'Farbe entfernen',
			// The label used by a button next to the color palette in the color picker that restores the default value if the default table properties are specified.
			'Restore default': 'Standard wiederherstellen',
			// Label for the Save button.
			'Save': 'Speichern',
			// Label of a toolbar button which reveals more toolbar items.
			'Show more items': 'Mehr anzeigen',
			// Label for an ‘X of Y’ status of a typical next/previous navigation. For instance, ‘Page 5 of 20’ or 'Search result 5 of 20'.
			'%0 of %1': '%0 von %1',
			// A generic error message displayed on upload failure. The file name is concatenated to this text.
			'Cannot upload file:': 'Die Datei kann nicht hochgeladen werden:',
			// Accessible label of the specific editing area of the editor acting as a root of the entire application.
			'Rich Text Editor. Editing area: %0': 'Rich Text Editor. Bearbeitungsbereich: %0',
			// The label for the insert image with the file manager toolbar button with visible label in insert image dropdown.
			'Insert with file manager': 'Mit Dateimanager einfügen',
			// The label for the replace image with the file manager toolbar button with visible label in insert image dropdown.
			'Replace with file manager': 'Mittels Dateimanager ersetzen',
			// The label for the insert image with the file manager toolbar button.
			'Insert image with file manager': 'Bild mit dem Dateimanager einfügen',
			// The label for the replace image with the file manager toolbar button.
			'Replace image with file manager': 'Bild mittels Dateimanager ersetzen',
			// The label for a button that opens a file manager in order to insert a file.
			'File': 'Datei',
			// The label for the insert image with the file manager menu bar button (inside 'Insert' menu)
			'With file manager': 'Mit dem Dateimanager',
			// The button label for the object (e.g. image, table) toolbar for hiding the attached caption.
			'Toggle caption off': 'Tabellenüberschrift deaktivieren',
			// The button label for the object (e.g. image, table) toolbar for showing the attached caption.
			'Toggle caption on': 'Tabellenüberschrift aktivieren',
			// Accessibility help dialog category header text for keystrokes related to content creation.
			'Content editing keystrokes': 'Tastatureingaben zur Inhaltsverarbeitung',
			// Accessibility help dialog text further explaining the purpose of the "Content editing keystrokes" category.
			'These keyboard shortcuts allow for quick access to content editing features.': 'Diese Tastenkombinationen ermöglichen einen schnellen Zugang zu den Inhaltsverarbeitungsfunktionen.',
			// Accessibility help dialog category header text for keystrokes related to navigation in the user interface.
			'User interface and content navigation keystrokes': 'Benutzeroberfläche und Inhaltsnavigationstasten',
			// Accessibility help dialog text further explaining the purpose of the "User interface and content navigation keystrokes" category.
			'Use the following keystrokes for more efficient navigation in the CKEditor 5 user interface.': 'Verwenden Sie die folgenden Tastatureingaben für eine effizientere Navigation auf der CKEditor-5-Benutzeroberfläche.',
			// Keystroke description for assistive technologies: keystroke for closing contextual balloons, dropdowns, and dialogs.
			'Close contextual balloons, dropdowns, and dialogs': 'Kontextsprechblasen, Dropdown-Menü und Dialoge schließen',
			// Keystroke description for assistive technologies: keystroke for opening the accessibility help dialog.
			'Open the accessibility help dialog': 'Den Dialog zur Eingabehilfe öffnen',
			// Keystroke description for assistive technologies: keystroke for moving between fields.
			'Move focus between form fields (inputs, buttons, etc.)': 'Fokus zwischen Formularfeldern verschieben (Eingaben, Tastenfelder etc.)',
			// Keystroke description for assistive technologies: keystroke for moving focus to the menu bar.
			'Move focus to the menu bar, navigate between menu bars': 'Fokus auf die Menüleiste richten, zwischen Menüleisten navigieren',
			// Keystroke description for assistive technologies: keystroke for moving focus to the toolbar.
			'Move focus to the toolbar, navigate between toolbars': 'Fokus auf die Symbolleiste verschieben, zwischen den Symbolleisten navigieren',
			// Keystroke description for assistive technologies: keystroke for navigating through the toolbar.
			'Navigate through the toolbar or menu bar': 'Durch die Werkzeugleiste oder Menüleiste navigieren',
			// Keystroke description for assistive technologies: keystroke for executing currently focused button.
			'Execute the currently focused button. Executing buttons that interact with the editor content moves the focus back to the content.': 'Ausführen der aktuell fokussierten Schaltfläche. Das Ausführen von Schaltflächen, die mit dem Inhalt des Editors interagieren, richtet den Fokus zurück auf den Inhalt.',
			// Label of the button confirming the changes done in the current interface.
			'Accept': 'Akzeptieren',
			// The label of the source editing related features used in toolbar buttons.
			'Source': 'Quelle',
			// Dropdown option label for the paragraph format.
			'Paragraph': 'Absatz',
			// The label used by assistive technologies describing a button that opens a color picker, where user can choose a configured color for a certain properties (eg.: background color, color, border-color etc.).
			'Color picker': 'Farbwähler',
			// Label for the Insert button.
			'Insert': 'Einfügen',
			// Label for the Update button.
			'Update': 'Aktualisieren',
			// Label for the Back button.
			'Back': 'Zurück',
			// The secondary text of the message shown to the user when no results are available for the search criteria.
			'Please try a different phrase or check the spelling.': 'Bitte versuchen Sie einen anderen Ausdruck oder überprüfen Sie die Schreibweise.',
			// The label for the object (e.g. image, media) style button that wraps text around the object.
			'Wrap text': 'Text umfließt Bild',
			// The label for the object (e.g. image, media) style button that breaks the text around the object.
			'Break text': 'Bild teilt Text',
			// The label for the resize option that allows the user to enter a custom size.
			'Custom': 'Benutzerdefiniert',
			// The default label for the resize option that resets the size.
			'Original': 'Original',
			// Text used as an error label when the user submitted a custom resize form with a blank value.
			'The value must not be empty.': 'Der Wert darf nicht leer sein.',
			// Text used as an error label when the user submitted a custom resize form with an incorrect value.
			'The value should be a plain number.': 'Der Wert sollte eine einfache Zahl sein.'
		},
		getPluralForm: ( n: number ) => (n != 1)
	}
};

export default translations;
