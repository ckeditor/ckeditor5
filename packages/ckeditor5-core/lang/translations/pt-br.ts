/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'pt-br': {
		dictionary: {
			// Label for the Cancel button.
			'Cancel': 'Cancelar',
			// Label for the Clear button.
			'Clear': 'Limpar',
			// The label used by a button next to the color palette in the color picker that removes the color (resets it to an empty value, example usages in font color or table properties).
			'Remove color': 'Remover cor',
			// The label used by a button next to the color palette in the color picker that restores the default value if the default table properties are specified.
			'Restore default': 'Restaurar padrão',
			// Label for the Save button.
			'Save': 'Salvar',
			// Label of a toolbar button which reveals more toolbar items.
			'Show more items': 'Exibir mais itens',
			// Label for an ‘X of Y’ status of a typical next/previous navigation. For instance, ‘Page 5 of 20’ or 'Search result 5 of 20'.
			'%0 of %1': '%0 de %1',
			// A generic error message displayed on upload failure. The file name is concatenated to this text.
			'Cannot upload file:': 'Não foi possível enviar o arquivo:',
			// Accessible label of the specific editing area of the editor acting as a root of the entire application.
			'Rich Text Editor. Editing area: %0': 'Editor de Texto Valioso. Área de edição: %0',
			// The label for the insert image with the file manager toolbar button with visible label in insert image dropdown.
			'Insert with file manager': 'Inserir com gerenciador de arquivos',
			// The label for the replace image with the file manager toolbar button with visible label in insert image dropdown.
			'Replace with file manager': 'Substituir pelo gerenciador de arquivos',
			// The label for the insert image with the file manager toolbar button.
			'Insert image with file manager': 'Inserir imagem com o gerenciador de arquivos',
			// The label for the replace image with the file manager toolbar button.
			'Replace image with file manager': 'Substituir imagem pelo gerenciador de arquivos',
			// The label for a button that opens a file manager in order to insert a file.
			'File': 'Arquivo',
			// The label for the insert image with the file manager menu bar button (inside 'Insert' menu)
			'With file manager': 'Com o gerenciador de arquivos',
			// The button label for the object (e.g. image, table) toolbar for hiding the attached caption.
			'Toggle caption off': 'Desabilitar legenda',
			// The button label for the object (e.g. image, table) toolbar for showing the attached caption.
			'Toggle caption on': 'Habilitar legenda',
			// Accessibility help dialog category header text for keystrokes related to content creation.
			'Content editing keystrokes': 'Teclas de edição de conteúdo',
			// Accessibility help dialog text further explaining the purpose of the "Content editing keystrokes" category.
			'These keyboard shortcuts allow for quick access to content editing features.': 'Estes atalhos de teclado permitem um rápido acesso às funcionalidades de edição de conteúdo.',
			// Accessibility help dialog category header text for keystrokes related to navigation in the user interface.
			'User interface and content navigation keystrokes': 'Teclas de navegação da interface do usuário e do conteúdo',
			// Accessibility help dialog text further explaining the purpose of the "User interface and content navigation keystrokes" category.
			'Use the following keystrokes for more efficient navigation in the CKEditor 5 user interface.': 'Use as seguintes teclas para uma navegação mais eficiente na interface do usuário do CKEditor 5.',
			// Keystroke description for assistive technologies: keystroke for closing contextual balloons, dropdowns, and dialogs.
			'Close contextual balloons, dropdowns, and dialogs': 'Fechar balões contextuais, dropdowns e diálogos',
			// Keystroke description for assistive technologies: keystroke for opening the accessibility help dialog.
			'Open the accessibility help dialog': 'Abrir o diálogo de ajuda de acessibilidade',
			// Keystroke description for assistive technologies: keystroke for moving between fields.
			'Move focus between form fields (inputs, buttons, etc.)': 'Mover o foco entre campos de formulário (entradas, botões, etc.)',
			// Keystroke description for assistive technologies: keystroke for moving focus to the menu bar.
			'Move focus to the menu bar, navigate between menu bars': 'Mova o foco para a barra de menu, navegue entre as barras de menu',
			// Keystroke description for assistive technologies: keystroke for moving focus to the toolbar.
			'Move focus to the toolbar, navigate between toolbars': 'Mover o foco para a barra de ferramentas, navegar entre barras de ferramentas',
			// Keystroke description for assistive technologies: keystroke for navigating through the toolbar.
			'Navigate through the toolbar or menu bar': 'Navegue pela barra de ferramentas ou pela barra de menu',
			// Keystroke description for assistive technologies: keystroke for executing currently focused button.
			'Execute the currently focused button. Executing buttons that interact with the editor content moves the focus back to the content.': 'Execute o botão com o foco atual. Executar botões que interajam com o conteúdo do editor retorna o foco para o conteúdo.',
			// Label of the button confirming the changes done in the current interface.
			'Accept': 'Aceitar',
			// The label of the source editing related features used in toolbar buttons.
			'Source': 'Fonte',
			// Dropdown option label for the paragraph format.
			'Paragraph': 'Parágrafo',
			// The label used by assistive technologies describing a button that opens a color picker, where user can choose a configured color for a certain properties (eg.: background color, color, border-color etc.).
			'Color picker': 'Seletor de cor',
			// Label for the Insert button.
			'Insert': 'Inserir',
			// Label for the Update button.
			'Update': 'Atualizar',
			// Label for the Back button.
			'Back': 'Voltar',
			// The secondary text of the message shown to the user when no results are available for the search criteria.
			'Please try a different phrase or check the spelling.': 'Tente uma frase diferente ou verifique a grafia.',
			// The label for the object (e.g. image, media) style button that wraps text around the object.
			'Wrap text': 'Texto ao redor',
			// The label for the object (e.g. image, media) style button that breaks the text around the object.
			'Break text': 'Quebrar texto',
			// The label for the resize option that allows the user to enter a custom size.
			'Custom': 'Personalizar',
			// The default label for the resize option that resets the size.
			'Original': 'Original',
			// Text used as an error label when the user submitted a custom resize form with a blank value.
			'The value must not be empty.': 'O valor não deve estar vazio.',
			// Text used as an error label when the user submitted a custom resize form with an incorrect value.
			'The value should be a plain number.': 'O valor deve ser um número simples.'
		},
		getPluralForm: ( n: number ) => (n != 1)
	}
};

export default translations;
