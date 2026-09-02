/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'pt-br': {
		dictionary: {
			// The label used by assistive technologies describing a toolbar attached to a widget.
			'Widget toolbar': 'Ferramentas de Widgets',
			// The title displayed when a mouse is over a button that inserts a paragraph before a block.
			'Insert paragraph before block': 'Inserir parágrafo antes do bloco',
			// The title displayed when a mouse is over a button that inserts a paragraph after a block.
			'Insert paragraph after block': 'Inserir parágrafo após o bloco',
			// Information to be read by screen reader about shortcuts to type around a widget.
			'Press Enter to type after or press Shift + Enter to type before the widget': 'Pressione Enter para digitar depois ou pressione Shift + Enter para digitar antes do widget',
			// Accessibility help dialog section title for widget plugin keystrokes.
			'Keystrokes that can be used when a widget is selected (for example: image, table, etc.)': 'Teclas que podem ser usadas quando um widget está selecionado (por exemplo: imagem, tabela, etc.)',
			// Accessibility help dialog entry explaining the meaning of the keystroke that inserts a paragraph after a widget.
			'Insert a new paragraph directly after a widget': 'Inserir um novo parágrafo diretamente após um widget',
			// Accessibility help dialog entry explaining the meaning of the keystroke that inserts a paragraph before a widget.
			'Insert a new paragraph directly before a widget': 'Inserir um novo parágrafo diretamente antes de um widget',
			// Accessibility help dialog entry explaining the meaning of the keystroke that moves the caret before a widget.
			'Move the caret to allow typing directly before a widget': 'Mova o cursor para permitir a digitação diretamente antes de um widget',
			// Accessibility help dialog entry explaining the meaning of the keystroke that moves the caret after a widget.
			'Move the caret to allow typing directly after a widget': 'Mova o cursor para permitir a digitação diretamente após um widget',
			// Accessibility help dialog entry explaining the meaning of the keystroke that moves selection from a nested editable area back to the parent widget.
			'Move focus from an editable area back to the parent widget': 'Mova o foco de uma área editável de volta para o widget-pai'
		}
	}
};

export default translations;
