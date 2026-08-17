/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'es': {
		dictionary: {
			// Label for the Cancel button.
			'Cancel': 'Cancelar',
			// Label for the Clear button.
			'Clear': 'Borrar',
			// The label used by a button next to the color palette in the color picker that removes the color (resets it to an empty value, example usages in font color or table properties).
			'Remove color': 'Quitar color',
			// The label used by a button next to the color palette in the color picker that restores the default value if the default table properties are specified.
			'Restore default': 'Restaurar valores predeterminados',
			// Label for the Save button.
			'Save': 'Guardar',
			// Label of a toolbar button which reveals more toolbar items.
			'Show more items': 'Mostrar más elementos',
			// Label for an ‘X of Y’ status of a typical next/previous navigation. For instance, ‘Page 5 of 20’ or 'Search result 5 of 20'.
			'%0 of %1': '%0 de %1',
			// A generic error message displayed on upload failure. The file name is concatenated to this text.
			'Cannot upload file:': 'No se pudo cargar el archivo:',
			// Accessible label of the specific editing area of the editor acting as a root of the entire application.
			'Rich Text Editor. Editing area: %0': 'Editor de texto enriquecido. Área de edición: %0',
			// The label for the insert image with the file manager toolbar button with visible label in insert image dropdown.
			'Insert with file manager': 'Insertar con administrador de archivos',
			// The label for the replace image with the file manager toolbar button with visible label in insert image dropdown.
			'Replace with file manager': 'Reemplazar con administrador de archivos',
			// The label for the insert image with the file manager toolbar button.
			'Insert image with file manager': 'Insertar imagen con administrador de archivos',
			// The label for the replace image with the file manager toolbar button.
			'Replace image with file manager': 'Reemplazar imagen con administrador de archivos',
			// The label for a button that opens a file manager in order to insert a file.
			'File': 'Archivo',
			// The label for the insert image with the file manager menu bar button (inside 'Insert' menu)
			'With file manager': 'Con el administrador de archivos',
			// The button label for the object (e.g. image, table) toolbar for hiding the attached caption.
			'Toggle caption off': 'Desactivar título',
			// The button label for the object (e.g. image, table) toolbar for showing the attached caption.
			'Toggle caption on': 'Activar título',
			// Accessibility help dialog category header text for keystrokes related to content creation.
			'Content editing keystrokes': 'Teclas de edición de contenido',
			// Accessibility help dialog text further explaining the purpose of the "Content editing keystrokes" category.
			'These keyboard shortcuts allow for quick access to content editing features.': 'Estos atajos de teclado permiten acceder rápidamente a las funciones de edición de contenido.',
			// Accessibility help dialog category header text for keystrokes related to navigation in the user interface.
			'User interface and content navigation keystrokes': 'Teclas de navegación de contenido e interfaz de usuario',
			// Accessibility help dialog text further explaining the purpose of the "User interface and content navigation keystrokes" category.
			'Use the following keystrokes for more efficient navigation in the CKEditor 5 user interface.': 'Utilice las siguientes combinaciones de teclas para una navegación más eficiente en la interfaz de usuario de CKEditor 5.',
			// Keystroke description for assistive technologies: keystroke for closing contextual balloons, dropdowns, and dialogs.
			'Close contextual balloons, dropdowns, and dialogs': 'Cierra globos contextuales, menús desplegables y cuadros de diálogo',
			// Keystroke description for assistive technologies: keystroke for opening the accessibility help dialog.
			'Open the accessibility help dialog': 'Abre el cuadro de diálogo de ayuda de accesibilidad',
			// Keystroke description for assistive technologies: keystroke for moving between fields.
			'Move focus between form fields (inputs, buttons, etc.)': 'Mueve el foco entre campos de formulario (entradas, botones, etc.)',
			// Keystroke description for assistive technologies: keystroke for moving focus to the menu bar.
			'Move focus to the menu bar, navigate between menu bars': 'Mover el foco a la barra de menú, navegar entre las barras de menú',
			// Keystroke description for assistive technologies: keystroke for moving focus to the toolbar.
			'Move focus to the toolbar, navigate between toolbars': 'Mueve el foco a la barra de herramientas y navega entre barras de herramientas',
			// Keystroke description for assistive technologies: keystroke for navigating through the toolbar.
			'Navigate through the toolbar or menu bar': 'Navegar por la barra de herramientas o la barra de menú',
			// Keystroke description for assistive technologies: keystroke for executing currently focused button.
			'Execute the currently focused button. Executing buttons that interact with the editor content moves the focus back to the content.': 'Ejecutar el botón actualmente enfocado. Al ejecutar botones que interactúan con el contenido del editor, el foco vuelve al contenido.',
			// Label of the button confirming the changes done in the current interface.
			'Accept': 'Aceptar',
			// The label of the source editing related features used in toolbar buttons.
			'Source': 'Fuente',
			// Dropdown option label for the paragraph format.
			'Paragraph': 'Párrafo',
			// The label used by assistive technologies describing a button that opens a color picker, where user can choose a configured color for a certain properties (eg.: background color, color, border-color etc.).
			'Color picker': 'Selector de color',
			// Label for the Insert button.
			'Insert': 'Insertar',
			// Label for the Update button.
			'Update': 'Actualizar',
			// Label for the Back button.
			'Back': 'Volver',
			// The secondary text of the message shown to the user when no results are available for the search criteria.
			'Please try a different phrase or check the spelling.': 'Intente con una frase diferente o revise la ortografía.',
			// The label for the object (e.g. image, media) style button that wraps text around the object.
			'Wrap text': 'Mantener texto unido',
			// The label for the object (e.g. image, media) style button that breaks the text around the object.
			'Break text': 'Permitir quebrar texto',
			// The label for the resize option that allows the user to enter a custom size.
			'Custom': 'Personalizar',
			// The default label for the resize option that resets the size.
			'Original': 'Original',
			// Text used as an error label when the user submitted a custom resize form with a blank value.
			'The value must not be empty.': 'El valor no puede estar vacío.',
			// Text used as an error label when the user submitted a custom resize form with an incorrect value.
			'The value should be a plain number.': 'El valor debe ser un número simple.'
		},
		getPluralForm: ( n: number ) => (n != 1)
	}
};

export default translations;
