/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'cs': {
		dictionary: {
			// Label for the Cancel button.
			'Cancel': 'Zrušit',
			// Label for the Clear button.
			'Clear': 'Smazat',
			// The label used by a button next to the color palette in the color picker that removes the color (resets it to an empty value, example usages in font color or table properties).
			'Remove color': 'Odstranit barvu',
			// The label used by a button next to the color palette in the color picker that restores the default value if the default table properties are specified.
			'Restore default': 'Obnovit výchozí',
			// Label for the Save button.
			'Save': 'Uložit',
			// Label of a toolbar button which reveals more toolbar items.
			'Show more items': 'Zobrazit další položky',
			// Label for an ‘X of Y’ status of a typical next/previous navigation. For instance, ‘Page 5 of 20’ or 'Search result 5 of 20'.
			'%0 of %1': '%0 z %1',
			// A generic error message displayed on upload failure. The file name is concatenated to this text.
			'Cannot upload file:': 'Soubor nelze nahrát:',
			// Accessible label of the specific editing area of the editor acting as a root of the entire application.
			'Rich Text Editor. Editing area: %0': 'Editační oblast rich text editoru: %0',
			// The label for the insert image with the file manager toolbar button with visible label in insert image dropdown.
			'Insert with file manager': 'Vložit pomocí správce souborů',
			// The label for the replace image with the file manager toolbar button with visible label in insert image dropdown.
			'Replace with file manager': 'Nahradit pomocí správce souborů',
			// The label for the insert image with the file manager toolbar button.
			'Insert image with file manager': 'Vložit obrázek pomocí správce souborů',
			// The label for the replace image with the file manager toolbar button.
			'Replace image with file manager': 'Nahradit obrázek pomocí správce souborů',
			// The label for a button that opens a file manager in order to insert a file.
			'File': 'Soubor',
			// The label for the insert image with the file manager menu bar button (inside 'Insert' menu)
			'With file manager': 'Pomocí správce souborů',
			// The button label for the object (e.g. image, table) toolbar for hiding the attached caption.
			'Toggle caption off': 'Vypnout titulek',
			// The button label for the object (e.g. image, table) toolbar for showing the attached caption.
			'Toggle caption on': 'Zapnout titulek',
			// Accessibility help dialog category header text for keystrokes related to content creation.
			'Content editing keystrokes': 'Klávesy na úpravu obsahu',
			// Accessibility help dialog text further explaining the purpose of the "Content editing keystrokes" category.
			'These keyboard shortcuts allow for quick access to content editing features.': 'Tyto klávesové zkratky vám umožní rychlý přístup k funkcím úpravy obsahu.',
			// Accessibility help dialog category header text for keystrokes related to navigation in the user interface.
			'User interface and content navigation keystrokes': 'Klávesy navigace v uživatelském rozhraní a obsahu',
			// Accessibility help dialog text further explaining the purpose of the "User interface and content navigation keystrokes" category.
			'Use the following keystrokes for more efficient navigation in the CKEditor 5 user interface.': 'Pro efektivní navigaci v uživatelském rozhraní CKEditor 5 použijte následující klávesy.',
			// Keystroke description for assistive technologies: keystroke for closing contextual balloons, dropdowns, and dialogs.
			'Close contextual balloons, dropdowns, and dialogs': 'Zavřít kontextuální balóny, rozbalovací menu a dialogy',
			// Keystroke description for assistive technologies: keystroke for opening the accessibility help dialog.
			'Open the accessibility help dialog': 'Otevřít dialog podpory přístupnosti',
			// Keystroke description for assistive technologies: keystroke for moving between fields.
			'Move focus between form fields (inputs, buttons, etc.)': 'Přesunout zaměření mezi poli formuláře (vstupy, tlačítka atd.)',
			// Keystroke description for assistive technologies: keystroke for moving focus to the menu bar.
			'Move focus to the menu bar, navigate between menu bars': 'Zaměřte se na panel nabídek, procházejte mezi panely nabídek',
			// Keystroke description for assistive technologies: keystroke for moving focus to the toolbar.
			'Move focus to the toolbar, navigate between toolbars': 'Přesunout zaměření na lištu nástrojů, navigace mezi lištami nástrojů',
			// Keystroke description for assistive technologies: keystroke for navigating through the toolbar.
			'Navigate through the toolbar or menu bar': 'Procházení panelu nástrojů nebo panelu nabídek',
			// Keystroke description for assistive technologies: keystroke for executing currently focused button.
			'Execute the currently focused button. Executing buttons that interact with the editor content moves the focus back to the content.': 'Spusťte aktuálně zaměřené tlačítko. Spuštěním tlačítek, která interagují s obsahem editoru, se zaměření přesune zpět na obsah.',
			// Label of the button confirming the changes done in the current interface.
			'Accept': 'Přijmout',
			// The label of the source editing related features used in toolbar buttons.
			'Source': 'Zdroj',
			// Dropdown option label for the paragraph format.
			'Paragraph': 'Odstavec',
			// The label used by assistive technologies describing a button that opens a color picker, where user can choose a configured color for a certain properties (eg.: background color, color, border-color etc.).
			'Color picker': 'Vybrat barvu',
			// Label for the Insert button.
			'Insert': 'Vložit',
			// Label for the Update button.
			'Update': 'Aktualizace',
			// Label for the Back button.
			'Back': 'Zpět',
			// The secondary text of the message shown to the user when no results are available for the search criteria.
			'Please try a different phrase or check the spelling.': 'Zkuste jinou frázi nebo zkontrolujte, zda jste neudělali chybu.',
			// The label for the object (e.g. image, media) style button that wraps text around the object.
			'Wrap text': 'Text nahoře a dole',
			// The label for the object (e.g. image, media) style button that breaks the text around the object.
			'Break text': 'Obtékání textu',
			// The label for the resize option that allows the user to enter a custom size.
			'Custom': 'Vlastní',
			// The default label for the resize option that resets the size.
			'Original': 'Originální',
			// Text used as an error label when the user submitted a custom resize form with a blank value.
			'The value must not be empty.': 'Hodnota nesmí být prázdná',
			// Text used as an error label when the user submitted a custom resize form with an incorrect value.
			'The value should be a plain number.': 'Hodnota musí být prosté číslo.'
		},
		getPluralForm: ( n: number ) => (n == 1 ? 0 : (n >= 2 && n <= 4) ? 1 : 2)
	}
};

export default translations;
