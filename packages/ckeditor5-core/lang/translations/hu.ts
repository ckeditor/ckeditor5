/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'hu': {
		dictionary: {
			// Label for the Cancel button.
			'Cancel': 'Mégsem',
			// Label for the Clear button.
			'Clear': 'Törlés',
			// The label used by a button next to the color palette in the color picker that removes the color (resets it to an empty value, example usages in font color or table properties).
			'Remove color': 'Szín eltávolítása',
			// The label used by a button next to the color palette in the color picker that restores the default value if the default table properties are specified.
			'Restore default': 'Alapértelmezés visszaállítása',
			// Label for the Save button.
			'Save': 'Mentés',
			// Label of a toolbar button which reveals more toolbar items.
			'Show more items': 'További elemek',
			// Label for an ‘X of Y’ status of a typical next/previous navigation. For instance, ‘Page 5 of 20’ or 'Search result 5 of 20'.
			'%0 of %1': '%0 / %1',
			// A generic error message displayed on upload failure. The file name is concatenated to this text.
			'Cannot upload file:': 'Nem sikerült a fájl feltöltése:',
			// Accessible label of the specific editing area of the editor acting as a root of the entire application.
			'Rich Text Editor. Editing area: %0': 'Rich text szerkesztő. Szerkesztési terület: %0',
			// The label for the insert image with the file manager toolbar button with visible label in insert image dropdown.
			'Insert with file manager': 'Beillesztés fájlkezelővel',
			// The label for the replace image with the file manager toolbar button with visible label in insert image dropdown.
			'Replace with file manager': 'Kicserélés fájlkezelővel',
			// The label for the insert image with the file manager toolbar button.
			'Insert image with file manager': 'Illessze be a képet a fájlkezelővel',
			// The label for the replace image with the file manager toolbar button.
			'Replace image with file manager': 'Cserélje ki a képet a fájlkezelővel',
			// The label for a button that opens a file manager in order to insert a file.
			'File': 'Fájl',
			// The label for the insert image with the file manager menu bar button (inside 'Insert' menu)
			'With file manager': 'Fájlkezelővel',
			// The button label for the object (e.g. image, table) toolbar for hiding the attached caption.
			'Toggle caption off': 'Felirat kikapcsolása',
			// The button label for the object (e.g. image, table) toolbar for showing the attached caption.
			'Toggle caption on': 'Felirat bekapcsolása',
			// Accessibility help dialog category header text for keystrokes related to content creation.
			'Content editing keystrokes': 'Tartalom szerkesztési billentyűk',
			// Accessibility help dialog text further explaining the purpose of the "Content editing keystrokes" category.
			'These keyboard shortcuts allow for quick access to content editing features.': 'Ezek a gyorsbillentyű parancsok lehetővé teszik a tartalomszerkesztési funkciók gyors elérését.',
			// Accessibility help dialog category header text for keystrokes related to navigation in the user interface.
			'User interface and content navigation keystrokes': 'Felhasználói felület és tartalom navigációs billentyűparancsok',
			// Accessibility help dialog text further explaining the purpose of the "User interface and content navigation keystrokes" category.
			'Use the following keystrokes for more efficient navigation in the CKEditor 5 user interface.': 'Használd a következő billentyűket a hatékonyabb navigációhoz a CKEditor 5 felhasználói felületen.',
			// Keystroke description for assistive technologies: keystroke for closing contextual balloons, dropdowns, and dialogs.
			'Close contextual balloons, dropdowns, and dialogs': 'A környezetfüggő buborékok, legördülő listák és párbeszédpanelek bezárása',
			// Keystroke description for assistive technologies: keystroke for opening the accessibility help dialog.
			'Open the accessibility help dialog': 'Kisegítő lehetőségek súgó megnyitása',
			// Keystroke description for assistive technologies: keystroke for moving between fields.
			'Move focus between form fields (inputs, buttons, etc.)': 'Fókusz mozgatása a mezők között (inputok, gombok, stb.)',
			// Keystroke description for assistive technologies: keystroke for moving focus to the menu bar.
			'Move focus to the menu bar, navigate between menu bars': 'Fókusz áthelyezése a menüsorra, navigálás a menüsorok között',
			// Keystroke description for assistive technologies: keystroke for moving focus to the toolbar.
			'Move focus to the toolbar, navigate between toolbars': 'Fókusz mozgatása az eszköztárhoz, navigáció az eszköztárak között',
			// Keystroke description for assistive technologies: keystroke for navigating through the toolbar.
			'Navigate through the toolbar or menu bar': 'Navigálás az eszköztáron vagy a menüsoron keresztül',
			// Keystroke description for assistive technologies: keystroke for executing currently focused button.
			'Execute the currently focused button. Executing buttons that interact with the editor content moves the focus back to the content.': 'Az aktuálisan fókuszált gomb végrehajtása. A szerkesztő tartalmával interakcióba lépő gombok végrehajtása visszahelyezi a fókuszt a tartalomra.',
			// Label of the button confirming the changes done in the current interface.
			'Accept': 'Elfogad',
			// The label of the source editing related features used in toolbar buttons.
			'Source': 'Forrás',
			// Dropdown option label for the paragraph format.
			'Paragraph': 'Bekezdés',
			// The label used by assistive technologies describing a button that opens a color picker, where user can choose a configured color for a certain properties (eg.: background color, color, border-color etc.).
			'Color picker': 'Szín választása',
			// Label for the Insert button.
			'Insert': 'Beszúrás',
			// Label for the Update button.
			'Update': 'Frissítés',
			// Label for the Back button.
			'Back': 'Vissza',
			// The secondary text of the message shown to the user when no results are available for the search criteria.
			'Please try a different phrase or check the spelling.': 'Kérjük, próbálkozzon másik kifejezéssel, vagy ellenőrizze a helyesírást.',
			// The label for the object (e.g. image, media) style button that wraps text around the object.
			'Wrap text': 'Körbefuttatás',
			// The label for the object (e.g. image, media) style button that breaks the text around the object.
			'Break text': 'Sortörés',
			// The label for the resize option that allows the user to enter a custom size.
			'Custom': 'Egyéni',
			// The default label for the resize option that resets the size.
			'Original': 'Eredeti',
			// Text used as an error label when the user submitted a custom resize form with a blank value.
			'The value must not be empty.': 'Az érték nem lehet üres.',
			// Text used as an error label when the user submitted a custom resize form with an incorrect value.
			'The value should be a plain number.': 'Az érték egy egyszerű szám kell legyen.'
		},
		getPluralForm: ( n: number ) => (n != 1)
	}
};

export default translations;
