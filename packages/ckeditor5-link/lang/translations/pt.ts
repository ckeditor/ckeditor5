/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'pt': {
		dictionary: {
			// Toolbar button tooltip for the Unlink feature.
			'Unlink': 'Desligar',
			// Toolbar button tooltip for the Link feature.
			'Link': 'Hiperligação',
			// Label for the URL input in the Link URL editing balloon.
			'Link URL': 'URL da ligação',
			// An error text displayed when user attempted to enter an empty URL.
			'Link URL must not be empty.': 'O URL da ligação não pode estar em branco.',
			// Label for the image link button.
			'Link image': 'Imagem da hiperligação',
			// Label for the link properties link balloon title.
			'Link properties': 'Propriedades de ligação',
			// Button opening the Link URL editing balloon.
			'Edit link': 'Editar hiperligação',
			// Button opening the link in new browser tab.
			'Open link in new tab': 'Abrir hiperligação num novo separador',
			// The label of the switch button that controls whether the edited link will open in a new tab.
			'Open in a new tab': 'Abrir num novo separador',
			// The label of the switch button that controls whether the edited link refers to downloadable resource.
			'Downloadable': 'Descarregável',
			// Keystroke description for assistive technologies: keystroke for creating a link.
			'Create link': 'Criar ligação',
			// Keystroke description for assistive technologies: keystroke for moving out of a link.
			'Move out of a link': 'Sair de uma ligação',
			// The label of the input field for the displayed text of the link.
			'Displayed text': 'Texto exibido',
			// Placeholder shown when placeholder items view is empty.
			'No links available': 'Sem ligações disponíveis',
			// The label of the switch button shown when link has empty href attribute.
			'This link has no URL': 'Este link não tem URL'
		}
	}
};

export default translations;
