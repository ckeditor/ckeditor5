/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'lt': {
		dictionary: {
			// Label for the Cancel button.
			'Cancel': 'Atšaukti',
			// Label for the Clear button.
			'Clear': 'Išvalyti',
			// The label used by a button next to the color palette in the color picker that removes the color (resets it to an empty value, example usages in font color or table properties).
			'Remove color': 'Pašalinti spalvą',
			// The label used by a button next to the color palette in the color picker that restores the default value if the default table properties are specified.
			'Restore default': 'Atkurti numatytuosius',
			// Label for the Save button.
			'Save': 'Išsaugoti',
			// Label of a toolbar button which reveals more toolbar items.
			'Show more items': 'Rodyti daugiau elementų',
			// Label for an ‘X of Y’ status of a typical next/previous navigation. For instance, ‘Page 5 of 20’ or 'Search result 5 of 20'.
			'%0 of %1': '%0 iš %1',
			// A generic error message displayed on upload failure. The file name is concatenated to this text.
			'Cannot upload file:': 'Negalima įkelti failo:',
			// Accessible label of the specific editing area of the editor acting as a root of the entire application.
			'Rich Text Editor. Editing area: %0': 'Raiškiojo teksto redaktorius. Redagavimo sritis: %0',
			// The label for the insert image with the file manager toolbar button with visible label in insert image dropdown.
			'Insert with file manager': 'Įterpti naudojant failų tvarkyklę',
			// The label for the replace image with the file manager toolbar button with visible label in insert image dropdown.
			'Replace with file manager': 'Pakeisti failų tvarkykle',
			// The label for the insert image with the file manager toolbar button.
			'Insert image with file manager': 'Įterpti paveikslėlį naudojant failų tvarkyklę',
			// The label for the replace image with the file manager toolbar button.
			'Replace image with file manager': 'Pakeisti paveikslėlį failų tvarkytuve',
			// The label for a button that opens a file manager in order to insert a file.
			'File': 'Failas',
			// The label for the insert image with the file manager menu bar button (inside 'Insert' menu)
			'With file manager': 'Naudojant failų tvarkyklę',
			// The button label for the object (e.g. image, table) toolbar for hiding the attached caption.
			'Toggle caption off': 'Išjungti antraštę',
			// The button label for the object (e.g. image, table) toolbar for showing the attached caption.
			'Toggle caption on': 'Įjungti antraštę',
			// Accessibility help dialog category header text for keystrokes related to content creation.
			'Content editing keystrokes': 'Turinio redagavimo klavišų paspaudimai',
			// Accessibility help dialog text further explaining the purpose of the "Content editing keystrokes" category.
			'These keyboard shortcuts allow for quick access to content editing features.': 'Šie spartieji klavišai leidžia greitai pasiekti turinio redagavimo funkcijas.',
			// Accessibility help dialog category header text for keystrokes related to navigation in the user interface.
			'User interface and content navigation keystrokes': 'Naudotojo sąsajos ir turinio navigacijos klavišų paspaudimai',
			// Accessibility help dialog text further explaining the purpose of the "User interface and content navigation keystrokes" category.
			'Use the following keystrokes for more efficient navigation in the CKEditor 5 user interface.': 'Norėdami efektyviau naršyti po „CKEditor 5“ naudotojo sąsają, naudokite toliau nurodytus klavišų paspaudimus.',
			// Keystroke description for assistive technologies: keystroke for closing contextual balloons, dropdowns, and dialogs.
			'Close contextual balloons, dropdowns, and dialogs': 'Uždaryti kontekstinius pranešimus, išskleidžiamuosius meniu ir dialogo langus',
			// Keystroke description for assistive technologies: keystroke for opening the accessibility help dialog.
			'Open the accessibility help dialog': 'Atidaryti prieinamumo pagalbos dialogo langą',
			// Keystroke description for assistive technologies: keystroke for moving between fields.
			'Move focus between form fields (inputs, buttons, etc.)': 'Perkelti fokusą tarp formos laukų (įvesčių, klavišų ir t. t.)',
			// Keystroke description for assistive technologies: keystroke for moving focus to the menu bar.
			'Move focus to the menu bar, navigate between menu bars': 'Perkelti žymeklį į meniu juostą, naršyti tarp meniu juostų',
			// Keystroke description for assistive technologies: keystroke for moving focus to the toolbar.
			'Move focus to the toolbar, navigate between toolbars': 'Perkelti fokusą į įrankių juostą, naršyti tarp įrankių juostų',
			// Keystroke description for assistive technologies: keystroke for navigating through the toolbar.
			'Navigate through the toolbar or menu bar': 'Naršykite po įrankių juostą arba meniu juostą',
			// Keystroke description for assistive technologies: keystroke for executing currently focused button.
			'Execute the currently focused button. Executing buttons that interact with the editor content moves the focus back to the content.': 'Vykdyti šiuo metu sufokusuotą mygtuką. Vykdant su redaktoriaus turiniu sąveikaujančius mygtukus, fokusas yra perkeliamas atgal į turinį.',
			// Label of the button confirming the changes done in the current interface.
			'Accept': 'Priimti',
			// The label of the source editing related features used in toolbar buttons.
			'Source': 'Šaltinis',
			// Dropdown option label for the paragraph format.
			'Paragraph': 'Paragrafas',
			// The label used by assistive technologies describing a button that opens a color picker, where user can choose a configured color for a certain properties (eg.: background color, color, border-color etc.).
			'Color picker': 'Spalvos ieškiklis',
			// Label for the Insert button.
			'Insert': 'Įkelti',
			// Label for the Update button.
			'Update': 'Atnaujinti',
			// Label for the Back button.
			'Back': 'Grįžti',
			// The secondary text of the message shown to the user when no results are available for the search criteria.
			'Please try a different phrase or check the spelling.': 'Išbandykite kitą frazę arba patikrinkite rašybą.',
			// The label for the object (e.g. image, media) style button that wraps text around the object.
			'Wrap text': 'Perkelti tekstą į kitą eilutę',
			// The label for the object (e.g. image, media) style button that breaks the text around the object.
			'Break text': 'Suskaidyti tekstą',
			// The label for the resize option that allows the user to enter a custom size.
			'Custom': 'Tinkinti',
			// The default label for the resize option that resets the size.
			'Original': 'Originalus',
			// Text used as an error label when the user submitted a custom resize form with a blank value.
			'The value must not be empty.': 'Reikšmės laukelis negali būti tuščias.',
			// Text used as an error label when the user submitted a custom resize form with an incorrect value.
			'The value should be a plain number.': 'Reikšmė turi būti sveikasis skaičius.'
		},
		getPluralForm: ( n: number ) => (n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2)
	}
};

export default translations;
