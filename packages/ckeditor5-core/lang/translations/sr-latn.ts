/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'sr-latn': {
		dictionary: {
			// Label for the Cancel button.
			'Cancel': 'Odustani',
			// Label for the Clear button.
			'Clear': 'Obriši',
			// The label used by a button next to the color palette in the color picker that removes the color (resets it to an empty value, example usages in font color or table properties).
			'Remove color': 'Otkloni boju',
			// The label used by a button next to the color palette in the color picker that restores the default value if the default table properties are specified.
			'Restore default': 'Vrati podrazumevano',
			// Label for the Save button.
			'Save': 'Sačuvaj',
			// Label of a toolbar button which reveals more toolbar items.
			'Show more items': 'Prikaži još stavki',
			// Label for an ‘X of Y’ status of a typical next/previous navigation. For instance, ‘Page 5 of 20’ or 'Search result 5 of 20'.
			'%0 of %1': '%0 of %1',
			// A generic error message displayed on upload failure. The file name is concatenated to this text.
			'Cannot upload file:': 'Postavljanje fajla je neuspešno:',
			// Accessible label of the specific editing area of the editor acting as a root of the entire application.
			'Rich Text Editor. Editing area: %0': 'Uređivač bogatijeg teksta. Prostor za uređivanje:  %0',
			// The label for the insert image with the file manager toolbar button with visible label in insert image dropdown.
			'Insert with file manager': 'Ubacite pomoću menadžera datoteka',
			// The label for the replace image with the file manager toolbar button with visible label in insert image dropdown.
			'Replace with file manager': 'Zamenite menadžerom datoteka',
			// The label for the insert image with the file manager toolbar button.
			'Insert image with file manager': 'Umetnite sliku pomoću menadžera datoteka',
			// The label for the replace image with the file manager toolbar button.
			'Replace image with file manager': 'Zamenite sliku menadžerom datoteka',
			// The label for a button that opens a file manager in order to insert a file.
			'File': 'File',
			// The label for the insert image with the file manager menu bar button (inside 'Insert' menu)
			'With file manager': 'Sa menadžerom datoteka',
			// The button label for the object (e.g. image, table) toolbar for hiding the attached caption.
			'Toggle caption off': 'Isključivanje natpisa',
			// The button label for the object (e.g. image, table) toolbar for showing the attached caption.
			'Toggle caption on': 'Uključite naslov',
			// Accessibility help dialog category header text for keystrokes related to content creation.
			'Content editing keystrokes': 'Pritisci na tastere za uređivanje sadržaja',
			// Accessibility help dialog text further explaining the purpose of the "Content editing keystrokes" category.
			'These keyboard shortcuts allow for quick access to content editing features.': 'Ove prečice na tastaturi omogućavaju brz pristup funkcijama za uređivanje sadržaja.',
			// Accessibility help dialog category header text for keystrokes related to navigation in the user interface.
			'User interface and content navigation keystrokes': 'Korisnički interfejs i tasteri za navigaciju sadržaja  ',
			// Accessibility help dialog text further explaining the purpose of the "User interface and content navigation keystrokes" category.
			'Use the following keystrokes for more efficient navigation in the CKEditor 5 user interface.': 'Koristite sledeće tastere za efikasniju navigaciju u korisničkom interfejsu CKEditor 5.',
			// Keystroke description for assistive technologies: keystroke for closing contextual balloons, dropdowns, and dialogs.
			'Close contextual balloons, dropdowns, and dialogs': 'Zatvorite kontekstualne balone, padajuće menije i dijaloge',
			// Keystroke description for assistive technologies: keystroke for opening the accessibility help dialog.
			'Open the accessibility help dialog': 'Otvorite dijalog pomoći za pristupačnost',
			// Keystroke description for assistive technologies: keystroke for moving between fields.
			'Move focus between form fields (inputs, buttons, etc.)': 'Pomerite fokus između polja obrasca (unosi, dugmad, itd.)',
			// Keystroke description for assistive technologies: keystroke for moving focus to the menu bar.
			'Move focus to the menu bar, navigate between menu bars': 'Premestite fokus na traku menija, navigirajte između traka menija',
			// Keystroke description for assistive technologies: keystroke for moving focus to the toolbar.
			'Move focus to the toolbar, navigate between toolbars': 'Premestite fokus na traku sa alatkama, navigirajte između traka sa alatkama',
			// Keystroke description for assistive technologies: keystroke for navigating through the toolbar.
			'Navigate through the toolbar or menu bar': 'Krećite se kroz traku sa alatkama ili traku menija',
			// Keystroke description for assistive technologies: keystroke for executing currently focused button.
			'Execute the currently focused button. Executing buttons that interact with the editor content moves the focus back to the content.': 'Izvršite trenutno fokusirano dugme. Izvršavanje dugmadi koja su u interakciji sa sadržajem uređivača pomera fokus nazad na sadržaj.',
			// Label of the button confirming the changes done in the current interface.
			'Accept': 'Prihvati',
			// The label of the source editing related features used in toolbar buttons.
			'Source': '',
			// Dropdown option label for the paragraph format.
			'Paragraph': 'Pasus',
			// The label used by assistive technologies describing a button that opens a color picker, where user can choose a configured color for a certain properties (eg.: background color, color, border-color etc.).
			'Color picker': 'Birač boja',
			// Label for the Insert button.
			'Insert': '',
			// Label for the Update button.
			'Update': '',
			// Label for the Back button.
			'Back': '',
			// The secondary text of the message shown to the user when no results are available for the search criteria.
			'Please try a different phrase or check the spelling.': 'Pokušajte sa drugom frazom ili proverite pravopis.',
			// The label for the object (e.g. image, media) style button that wraps text around the object.
			'Wrap text': 'Prelomiti tekst',
			// The label for the object (e.g. image, media) style button that breaks the text around the object.
			'Break text': 'Prelom teksta',
			// The label for the resize option that allows the user to enter a custom size.
			'Custom': 'Prilagodjen',
			// The default label for the resize option that resets the size.
			'Original': 'Original',
			// Text used as an error label when the user submitted a custom resize form with a blank value.
			'The value must not be empty.': 'Vrednost ne sme biti prazna.',
			// Text used as an error label when the user submitted a custom resize form with an incorrect value.
			'The value should be a plain number.': 'Vrednost treba da bude običan broj.'
		},
		getPluralForm: ( n: number ) => (n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2)
	}
};

export default translations;
