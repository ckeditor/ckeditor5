/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'gl': {
		dictionary: {
			// Label for the Cancel button.
			'Cancel': 'Cancelar',
			// Label for the Clear button.
			'Clear': 'Limpar',
			// The label used by a button next to the color palette in the color picker that removes the color (resets it to an empty value, example usages in font color or table properties).
			'Remove color': 'Retirar a cor',
			// The label used by a button next to the color palette in the color picker that restores the default value if the default table properties are specified.
			'Restore default': 'Restaurar valores predeterminados',
			// Label for the Save button.
			'Save': 'Gardar',
			// Label of a toolbar button which reveals more toolbar items.
			'Show more items': 'Amosar máis elementos',
			// Label for an ‘X of Y’ status of a typical next/previous navigation. For instance, ‘Page 5 of 20’ or 'Search result 5 of 20'.
			'%0 of %1': '%0 de %1',
			// A generic error message displayed on upload failure. The file name is concatenated to this text.
			'Cannot upload file:': 'Non é posíbel enviar o ficheiro:',
			// Accessible label of the specific editing area of the editor acting as a root of the entire application.
			'Rich Text Editor. Editing area: %0': 'Editor de texto mellorado. Área de edición: %0',
			// The label for the insert image with the file manager toolbar button with visible label in insert image dropdown.
			'Insert with file manager': 'Inserir co xestor de ficheiros',
			// The label for the replace image with the file manager toolbar button with visible label in insert image dropdown.
			'Replace with file manager': 'Substituír co xestor de ficheiros',
			// The label for the insert image with the file manager toolbar button.
			'Insert image with file manager': 'Inserir imaxe co xestor de ficheiros',
			// The label for the replace image with the file manager toolbar button.
			'Replace image with file manager': 'Substituír imaxe co xestor de ficheiros',
			// The label for a button that opens a file manager in order to insert a file.
			'File': 'Ficheiro',
			// The label for the insert image with the file manager menu bar button (inside 'Insert' menu)
			'With file manager': 'Co xestor de ficheiros',
			// The button label for the object (e.g. image, table) toolbar for hiding the attached caption.
			'Toggle caption off': 'Desactivar os subtítulos',
			// The button label for the object (e.g. image, table) toolbar for showing the attached caption.
			'Toggle caption on': 'Activar os subtítulos',
			// Accessibility help dialog category header text for keystrokes related to content creation.
			'Content editing keystrokes': 'Teclas de atallo de edición de contido',
			// Accessibility help dialog text further explaining the purpose of the "Content editing keystrokes" category.
			'These keyboard shortcuts allow for quick access to content editing features.': 'Estes atallos de teclado permiten un acceso rápido ás funcións de edición de contido.',
			// Accessibility help dialog category header text for keystrokes related to navigation in the user interface.
			'User interface and content navigation keystrokes': 'Interface de usuario e teclas de atallo de navegación de contido',
			// Accessibility help dialog text further explaining the purpose of the "User interface and content navigation keystrokes" category.
			'Use the following keystrokes for more efficient navigation in the CKEditor 5 user interface.': 'Use as seguintes teclas de atallo para unha navegación máis eficiente na interface de usuario de CKEditor 5.',
			// Keystroke description for assistive technologies: keystroke for closing contextual balloons, dropdowns, and dialogs.
			'Close contextual balloons, dropdowns, and dialogs': 'Pechar os bocadillos contextuais, menús despregábeis e diálogos',
			// Keystroke description for assistive technologies: keystroke for opening the accessibility help dialog.
			'Open the accessibility help dialog': 'Abrir o diálogo de axuda de accesibilidade',
			// Keystroke description for assistive technologies: keystroke for moving between fields.
			'Move focus between form fields (inputs, buttons, etc.)': 'Mover o foco entre os campos do formulario (entradas, botóns, etc.)',
			// Keystroke description for assistive technologies: keystroke for moving focus to the menu bar.
			'Move focus to the menu bar, navigate between menu bars': 'Mover o foco á barra de menú, navegar entre as barras de menús',
			// Keystroke description for assistive technologies: keystroke for moving focus to the toolbar.
			'Move focus to the toolbar, navigate between toolbars': 'Mover o foco á barra de ferramentas, navegar entre as barras de ferramentas',
			// Keystroke description for assistive technologies: keystroke for navigating through the toolbar.
			'Navigate through the toolbar or menu bar': 'Navegar pola barra de ferramentas ou barra de menú',
			// Keystroke description for assistive technologies: keystroke for executing currently focused button.
			'Execute the currently focused button. Executing buttons that interact with the editor content moves the focus back to the content.': 'Executar o botón enfocado actualmente. Ao executar botóns que interactúan co contido do editor, o foco volve ao contido.',
			// Label of the button confirming the changes done in the current interface.
			'Accept': 'Aceptar',
			// The label of the source editing related features used in toolbar buttons.
			'Source': '',
			// Dropdown option label for the paragraph format.
			'Paragraph': 'Parágrafo',
			// The label used by assistive technologies describing a button that opens a color picker, where user can choose a configured color for a certain properties (eg.: background color, color, border-color etc.).
			'Color picker': 'Selector de cores',
			// Label for the Insert button.
			'Insert': '',
			// Label for the Update button.
			'Update': '',
			// Label for the Back button.
			'Back': '',
			// The secondary text of the message shown to the user when no results are available for the search criteria.
			'Please try a different phrase or check the spelling.': 'Probe cunha frase diferente ou revise a ortografía.',
			// The label for the object (e.g. image, media) style button that wraps text around the object.
			'Wrap text': 'Envolver o texto',
			// The label for the object (e.g. image, media) style button that breaks the text around the object.
			'Break text': 'Romper o texto',
			// The label for the resize option that allows the user to enter a custom size.
			'Custom': 'Personalizado',
			// The default label for the resize option that resets the size.
			'Original': 'Orixinal',
			// Text used as an error label when the user submitted a custom resize form with a blank value.
			'The value must not be empty.': 'O valor non debe estar baleiro.',
			// Text used as an error label when the user submitted a custom resize form with an incorrect value.
			'The value should be a plain number.': 'O valor debe ser un número simple.'
		},
		getPluralForm: ( n: number ) => (n != 1)
	}
};

export default translations;
