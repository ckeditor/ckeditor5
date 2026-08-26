/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'pt-br': {
		dictionary: {
			// Toolbar button tooltip for the Unlink feature.
			'Unlink': 'Remover link',
			// Toolbar button tooltip for the Link feature.
			'Link': 'Link',
			// Label for the URL input in the Link URL editing balloon.
			'Link URL': 'URL do link',
			// An error text displayed when user attempted to enter an empty URL.
			'Link URL must not be empty.': 'O URL do link não pode estar vazio.',
			// Label for the image link button.
			'Link image': 'Link com imagem',
			// Label for the link properties link balloon title.
			'Link properties': 'Propriedades do link',
			// Button opening the Link URL editing balloon.
			'Edit link': 'Editar link',
			// Button opening the link in new browser tab.
			'Open link in new tab': 'Abrir link em nova aba',
			// The label of the switch button that controls whether the edited link will open in a new tab.
			'Open in a new tab': 'Abrir em nova aba',
			// The label of the switch button that controls whether the edited link refers to downloadable resource.
			'Downloadable': 'Pode ser baixado',
			// Keystroke description for assistive technologies: keystroke for creating a link.
			'Create link': 'Criar link',
			// Keystroke description for assistive technologies: keystroke for moving out of a link.
			'Move out of a link': 'Sair de um link',
			// The label of the input field for the displayed text of the link.
			'Displayed text': 'Texto mostrado',
			// Placeholder shown when placeholder items view is empty.
			'No links available': 'Nenhum link disponível',
			// The label of the switch button shown when link has empty href attribute.
			'This link has no URL': 'Este link não tem URL'
		}
	}
};

export default translations;
