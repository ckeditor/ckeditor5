/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'fi': {
		dictionary: {
			// Label for the Cancel button.
			'Cancel': 'Peruuta',
			// Label for the Clear button.
			'Clear': 'Tyhjennä',
			// The label used by a button next to the color palette in the color picker that removes the color (resets it to an empty value, example usages in font color or table properties).
			'Remove color': 'Poista väri',
			// The label used by a button next to the color palette in the color picker that restores the default value if the default table properties are specified.
			'Restore default': 'Palauta oletus',
			// Label for the Save button.
			'Save': 'Tallenna',
			// Label of a toolbar button which reveals more toolbar items.
			'Show more items': 'Näytä lisää toimintoja',
			// Label for an ‘X of Y’ status of a typical next/previous navigation. For instance, ‘Page 5 of 20’ or 'Search result 5 of 20'.
			'%0 of %1': '%0 / %1',
			// A generic error message displayed on upload failure. The file name is concatenated to this text.
			'Cannot upload file:': 'Tiedostoa ei voitu ladata:',
			// Accessible label of the specific editing area of the editor acting as a root of the entire application.
			'Rich Text Editor. Editing area: %0': 'Tekstimuotoilueditori. Muokkausalue: %0',
			// The label for the insert image with the file manager toolbar button with visible label in insert image dropdown.
			'Insert with file manager': 'Tuo tiedostonhallinnalla',
			// The label for the replace image with the file manager toolbar button with visible label in insert image dropdown.
			'Replace with file manager': 'Korvaa tiedostonhallinnalla',
			// The label for the insert image with the file manager toolbar button.
			'Insert image with file manager': 'Tuo kuva tiedostonhallinnalla',
			// The label for the replace image with the file manager toolbar button.
			'Replace image with file manager': 'Korvaa kuva tiedostonhallinnalla',
			// The label for a button that opens a file manager in order to insert a file.
			'File': 'Tiedosto',
			// The label for the insert image with the file manager menu bar button (inside 'Insert' menu)
			'With file manager': 'Tiedostonhallinnasta',
			// The button label for the object (e.g. image, table) toolbar for hiding the attached caption.
			'Toggle caption off': 'Poista taulukon kuvaus',
			// The button label for the object (e.g. image, table) toolbar for showing the attached caption.
			'Toggle caption on': 'Lisää taulukon kuvaus',
			// Accessibility help dialog category header text for keystrokes related to content creation.
			'Content editing keystrokes': 'Sisällönmuokkauspainallukset',
			// Accessibility help dialog text further explaining the purpose of the "Content editing keystrokes" category.
			'These keyboard shortcuts allow for quick access to content editing features.': 'Nämä avainoikotiet mahdollistavat sisällönmuokkausominaisuuksien nopean käytön.',
			// Accessibility help dialog category header text for keystrokes related to navigation in the user interface.
			'User interface and content navigation keystrokes': 'Käyttöliittymän ja sisällössä siirtymisen painallukset',
			// Accessibility help dialog text further explaining the purpose of the "User interface and content navigation keystrokes" category.
			'Use the following keystrokes for more efficient navigation in the CKEditor 5 user interface.': 'Voit tehostaa CKEditor 5:n käyttöliittymässä siirtymistä seuraavilla painalluksilla.',
			// Keystroke description for assistive technologies: keystroke for closing contextual balloons, dropdowns, and dialogs.
			'Close contextual balloons, dropdowns, and dialogs': 'Sulje kontekstipallot, pudotusvalikot ja dialogit',
			// Keystroke description for assistive technologies: keystroke for opening the accessibility help dialog.
			'Open the accessibility help dialog': 'Avaa esteettömyystuen dialogi',
			// Keystroke description for assistive technologies: keystroke for moving between fields.
			'Move focus between form fields (inputs, buttons, etc.)': 'Siirrä tarkennusta eri kaavakekenttien (syötteet, painikkeet yms.) välillä',
			// Keystroke description for assistive technologies: keystroke for moving focus to the menu bar.
			'Move focus to the menu bar, navigate between menu bars': 'Kohdenna valikkopalkkiin ja siirry palkista toiseen',
			// Keystroke description for assistive technologies: keystroke for moving focus to the toolbar.
			'Move focus to the toolbar, navigate between toolbars': 'Siirrä tarkennus työkalupalkkiin, siirry työkalupalkista toiseen',
			// Keystroke description for assistive technologies: keystroke for navigating through the toolbar.
			'Navigate through the toolbar or menu bar': 'Siirry työkalupalkkien tai valikkopalkkien välillä',
			// Keystroke description for assistive technologies: keystroke for executing currently focused button.
			'Execute the currently focused button. Executing buttons that interact with the editor content moves the focus back to the content.': 'Suorita tällä hetkellä kohdennettuna olevan painikkeen toiminto. Muokkaustyökalun sisältöön vaikuttavien painikkeiden käyttö palauttaa kohdennuksen kyseiseen sisältöön.',
			// Label of the button confirming the changes done in the current interface.
			'Accept': 'Hyväksy',
			// The label of the source editing related features used in toolbar buttons.
			'Source': 'Lähde',
			// Dropdown option label for the paragraph format.
			'Paragraph': 'Kappale',
			// The label used by assistive technologies describing a button that opens a color picker, where user can choose a configured color for a certain properties (eg.: background color, color, border-color etc.).
			'Color picker': 'Värin valitsin',
			// Label for the Insert button.
			'Insert': 'Liitä',
			// Label for the Update button.
			'Update': 'Päivitä',
			// Label for the Back button.
			'Back': 'Takaisin',
			// The secondary text of the message shown to the user when no results are available for the search criteria.
			'Please try a different phrase or check the spelling.': 'Kokeilethan toista lausetta tai tarkista oikeinkirjoitus.',
			// The label for the object (e.g. image, media) style button that wraps text around the object.
			'Wrap text': 'Sovita teksti',
			// The label for the object (e.g. image, media) style button that breaks the text around the object.
			'Break text': 'Irrota teksti',
			// The label for the resize option that allows the user to enter a custom size.
			'Custom': 'Mukautettu',
			// The default label for the resize option that resets the size.
			'Original': 'Alkuperäinen',
			// Text used as an error label when the user submitted a custom resize form with a blank value.
			'The value must not be empty.': 'Arvo ei voi olla tyhjä.',
			// Text used as an error label when the user submitted a custom resize form with an incorrect value.
			'The value should be a plain number.': 'Arvon pitää olla pelkkä luku.'
		},
		getPluralForm: ( n: number ) => (n != 1)
	}
};

export default translations;
