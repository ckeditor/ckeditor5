/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'pl': {
		dictionary: {
			// Label for the Cancel button.
			'Cancel': 'Anuluj',
			// Label for the Clear button.
			'Clear': 'Wyczyść',
			// The label used by a button next to the color palette in the color picker that removes the color (resets it to an empty value, example usages in font color or table properties).
			'Remove color': 'Usuń kolor',
			// The label used by a button next to the color palette in the color picker that restores the default value if the default table properties are specified.
			'Restore default': 'Przywróć domyślne',
			// Label for the Save button.
			'Save': 'Zapisz',
			// Label of a toolbar button which reveals more toolbar items.
			'Show more items': 'Pokaż więcej',
			// Label for an ‘X of Y’ status of a typical next/previous navigation. For instance, ‘Page 5 of 20’ or 'Search result 5 of 20'.
			'%0 of %1': '%0 z %1',
			// A generic error message displayed on upload failure. The file name is concatenated to this text.
			'Cannot upload file:': 'Nie można przesłać pliku:',
			// Accessible label of the specific editing area of the editor acting as a root of the entire application.
			'Rich Text Editor. Editing area: %0': 'Edytor tekstu. Obszar edycji: %0',
			// The label for the insert image with the file manager toolbar button with visible label in insert image dropdown.
			'Insert with file manager': 'Wstaw za pomocą menedżera plików',
			// The label for the replace image with the file manager toolbar button with visible label in insert image dropdown.
			'Replace with file manager': 'Zastąp za pomocą menedżera plików',
			// The label for the insert image with the file manager toolbar button.
			'Insert image with file manager': 'Wstaw obraz za pomocą menedżera plików',
			// The label for the replace image with the file manager toolbar button.
			'Replace image with file manager': 'Zastąp obraz za pomocą menedżera plików',
			// The label for a button that opens a file manager in order to insert a file.
			'File': 'Plik',
			// The label for the insert image with the file manager menu bar button (inside 'Insert' menu)
			'With file manager': 'Przez menedżer plików',
			// The button label for the object (e.g. image, table) toolbar for hiding the attached caption.
			'Toggle caption off': 'Ukryj podpis tabeli',
			// The button label for the object (e.g. image, table) toolbar for showing the attached caption.
			'Toggle caption on': 'Pokaż podpis tabeli',
			// Accessibility help dialog category header text for keystrokes related to content creation.
			'Content editing keystrokes': 'Klawisze edycji zawartości',
			// Accessibility help dialog text further explaining the purpose of the "Content editing keystrokes" category.
			'These keyboard shortcuts allow for quick access to content editing features.': 'Te skróty klawiszowe umożliwiają szybki dostęp do funkcji edycji zawartości.',
			// Accessibility help dialog category header text for keystrokes related to navigation in the user interface.
			'User interface and content navigation keystrokes': 'Klawisze umożliwiające poruszanie się po interfejsie użytkownika i zawartości',
			// Accessibility help dialog text further explaining the purpose of the "User interface and content navigation keystrokes" category.
			'Use the following keystrokes for more efficient navigation in the CKEditor 5 user interface.': 'Aby łatwiej poruszać się po interfejsie użytkownika CKEditor 5, użyj następujących skrótów klawiszowych.',
			// Keystroke description for assistive technologies: keystroke for closing contextual balloons, dropdowns, and dialogs.
			'Close contextual balloons, dropdowns, and dialogs': 'Zamyka podpowiedzi kontekstowe, menu rozwijane i okna dialogowe',
			// Keystroke description for assistive technologies: keystroke for opening the accessibility help dialog.
			'Open the accessibility help dialog': 'Otwiera okno pomocy dotyczącej dostępności',
			// Keystroke description for assistive technologies: keystroke for moving between fields.
			'Move focus between form fields (inputs, buttons, etc.)': 'Przenosi fokus pomiędzy polami formularza (polami wprowadzania, przyciskami itd.)',
			// Keystroke description for assistive technologies: keystroke for moving focus to the menu bar.
			'Move focus to the menu bar, navigate between menu bars': 'Zmień ukierunkowanie na pasek menu, nawiguj między paskami menu',
			// Keystroke description for assistive technologies: keystroke for moving focus to the toolbar.
			'Move focus to the toolbar, navigate between toolbars': 'Przenosi fokus na pasek narzędzi, umożliwia poruszanie się pomiędzy paskami narzędzi',
			// Keystroke description for assistive technologies: keystroke for navigating through the toolbar.
			'Navigate through the toolbar or menu bar': 'Nawiguj za pomocą paska narzędzi lub paska menu',
			// Keystroke description for assistive technologies: keystroke for executing currently focused button.
			'Execute the currently focused button. Executing buttons that interact with the editor content moves the focus back to the content.': 'Uruchom aktualnie aktywny przycisk. Uruchomienie przycisków wchodzących w interakcję z zawartością edytora przywraca ukierunkowanie na zawartość.',
			// Label of the button confirming the changes done in the current interface.
			'Accept': 'Zaakceptuj',
			// The label of the source editing related features used in toolbar buttons.
			'Source': 'Źródło',
			// Dropdown option label for the paragraph format.
			'Paragraph': 'Akapit',
			// The label used by assistive technologies describing a button that opens a color picker, where user can choose a configured color for a certain properties (eg.: background color, color, border-color etc.).
			'Color picker': 'Wybór koloru',
			// Label for the Insert button.
			'Insert': 'Wstaw',
			// Label for the Update button.
			'Update': 'Zaktualizuj',
			// Label for the Back button.
			'Back': 'Wróć',
			// The secondary text of the message shown to the user when no results are available for the search criteria.
			'Please try a different phrase or check the spelling.': 'Spróbuj wyszukać inną frazą lub sprawdź poprawność ortograficzną wyszukiwania.',
			// The label for the object (e.g. image, media) style button that wraps text around the object.
			'Wrap text': 'Zawijaj tekst',
			// The label for the object (e.g. image, media) style button that breaks the text around the object.
			'Break text': 'Rozbijaj tekst',
			// The label for the resize option that allows the user to enter a custom size.
			'Custom': 'Niestandardowy',
			// The default label for the resize option that resets the size.
			'Original': 'Oryginalny',
			// Text used as an error label when the user submitted a custom resize form with a blank value.
			'The value must not be empty.': 'Wartość nie może być pusta.',
			// Text used as an error label when the user submitted a custom resize form with an incorrect value.
			'The value should be a plain number.': 'Wartość powinna zawierać tylko liczbę.'
		},
		getPluralForm: ( n: number ) => (n == 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2)
	}
};

export default translations;
