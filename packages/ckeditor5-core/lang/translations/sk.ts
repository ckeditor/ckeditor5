/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'sk': {
		dictionary: {
			// Label for the Cancel button.
			'Cancel': 'Zrušiť',
			// Label for the Clear button.
			'Clear': 'Vyčistiť',
			// The label used by a button next to the color palette in the color picker that removes the color (resets it to an empty value, example usages in font color or table properties).
			'Remove color': 'Zrušiť farbu',
			// The label used by a button next to the color palette in the color picker that restores the default value if the default table properties are specified.
			'Restore default': 'Obnoviť predvolené',
			// Label for the Save button.
			'Save': 'Uložiť',
			// Label of a toolbar button which reveals more toolbar items.
			'Show more items': 'Zobraziť viac položiek',
			// Label for an ‘X of Y’ status of a typical next/previous navigation. For instance, ‘Page 5 of 20’ or 'Search result 5 of 20'.
			'%0 of %1': '%0 z %1',
			// A generic error message displayed on upload failure. The file name is concatenated to this text.
			'Cannot upload file:': 'Nie je možné nahrať súbor:',
			// Accessible label of the specific editing area of the editor acting as a root of the entire application.
			'Rich Text Editor. Editing area: %0': 'Rich Text Editor. Oblasť úprav: %0',
			// The label for the insert image with the file manager toolbar button with visible label in insert image dropdown.
			'Insert with file manager': 'Vložiť pomocou správcu súborov',
			// The label for the replace image with the file manager toolbar button with visible label in insert image dropdown.
			'Replace with file manager': 'Nahradiť správcom súborov',
			// The label for the insert image with the file manager toolbar button.
			'Insert image with file manager': 'Vložiť obrázok pomocou správcu súborov',
			// The label for the replace image with the file manager toolbar button.
			'Replace image with file manager': 'Nahradiť obrázok pomocou správcu súborov',
			// The label for a button that opens a file manager in order to insert a file.
			'File': 'Súbor',
			// The label for the insert image with the file manager menu bar button (inside 'Insert' menu)
			'With file manager': 'So správcom súborov',
			// The button label for the object (e.g. image, table) toolbar for hiding the attached caption.
			'Toggle caption off': 'Vypnúť titulok',
			// The button label for the object (e.g. image, table) toolbar for showing the attached caption.
			'Toggle caption on': 'Zapnúť titulok',
			// Accessibility help dialog category header text for keystrokes related to content creation.
			'Content editing keystrokes': 'Klávesy na úpravu obsahu',
			// Accessibility help dialog text further explaining the purpose of the "Content editing keystrokes" category.
			'These keyboard shortcuts allow for quick access to content editing features.': 'Tieto klávesové skratky vám poskytnú rýchly prístup k funkciám na úpravu obsahu.',
			// Accessibility help dialog category header text for keystrokes related to navigation in the user interface.
			'User interface and content navigation keystrokes': 'Používateľské rozhranie a klávesy na prechádzanie obsahom',
			// Accessibility help dialog text further explaining the purpose of the "User interface and content navigation keystrokes" category.
			'Use the following keystrokes for more efficient navigation in the CKEditor 5 user interface.': 'Nasledujúce klávesy vám umožnia jednoduchšie používanie používateľského rozhrania programu CKEditor 5.',
			// Keystroke description for assistive technologies: keystroke for closing contextual balloons, dropdowns, and dialogs.
			'Close contextual balloons, dropdowns, and dialogs': 'Zatvoriť kontextové bubliny, rozbaľovacie ponuky a dialógové okná',
			// Keystroke description for assistive technologies: keystroke for opening the accessibility help dialog.
			'Open the accessibility help dialog': 'Otvoriť dialógové okno o zjednodušení ovládania',
			// Keystroke description for assistive technologies: keystroke for moving between fields.
			'Move focus between form fields (inputs, buttons, etc.)': 'Presunúť zameranie do ďalšieho prvku na zadávanie údajov (napríklad textové pole alebo tlačidlo)',
			// Keystroke description for assistive technologies: keystroke for moving focus to the menu bar.
			'Move focus to the menu bar, navigate between menu bars': 'Presuňte pozornosť na panel ponuky, prechádzajte medzi panelmi ponuky',
			// Keystroke description for assistive technologies: keystroke for moving focus to the toolbar.
			'Move focus to the toolbar, navigate between toolbars': 'Presunúť zameranie do panela nástrojov, presúvať sa medzi panelmi nástrojov',
			// Keystroke description for assistive technologies: keystroke for navigating through the toolbar.
			'Navigate through the toolbar or menu bar': 'Prechádzajte cpanelom nástrojov alebo panelom ponúk',
			// Keystroke description for assistive technologies: keystroke for executing currently focused button.
			'Execute the currently focused button. Executing buttons that interact with the editor content moves the focus back to the content.': 'Vykonajte aktuálne zaostrené tlačidlo. Spustenie tlačidiel, ktoré interagujú s obsahom editora, presunie zameranie späť na obsah.',
			// Label of the button confirming the changes done in the current interface.
			'Accept': 'Potvrdiť',
			// The label of the source editing related features used in toolbar buttons.
			'Source': 'Zdroj',
			// Dropdown option label for the paragraph format.
			'Paragraph': 'Odsek',
			// The label used by assistive technologies describing a button that opens a color picker, where user can choose a configured color for a certain properties (eg.: background color, color, border-color etc.).
			'Color picker': 'Vybrať farbu',
			// Label for the Insert button.
			'Insert': 'Vložiť',
			// Label for the Update button.
			'Update': 'Aktualizovať',
			// Label for the Back button.
			'Back': 'Naspäť',
			// The secondary text of the message shown to the user when no results are available for the search criteria.
			'Please try a different phrase or check the spelling.': 'Skúste inú frázu alebo skontrolujte pravopis.',
			// The label for the object (e.g. image, media) style button that wraps text around the object.
			'Wrap text': 'Obtekanie textu',
			// The label for the object (e.g. image, media) style button that breaks the text around the object.
			'Break text': 'Zalomenie textu',
			// The label for the resize option that allows the user to enter a custom size.
			'Custom': 'Vlastné',
			// The default label for the resize option that resets the size.
			'Original': 'Originál',
			// Text used as an error label when the user submitted a custom resize form with a blank value.
			'The value must not be empty.': 'Hodnota nesmie byť prázdna.',
			// Text used as an error label when the user submitted a custom resize form with an incorrect value.
			'The value should be a plain number.': 'Hodnota by mala byť obyčajné číslo.'
		},
		getPluralForm: ( n: number ) => (n == 1 ? 0 : (n >= 2 && n <= 4) ? 1 : 2)
	}
};

export default translations;
