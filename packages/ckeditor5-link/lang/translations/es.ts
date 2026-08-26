/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'es': {
		dictionary: {
			// Toolbar button tooltip for the Unlink feature.
			'Unlink': 'Quitar enlace',
			// Toolbar button tooltip for the Link feature.
			'Link': 'Enlace',
			// Label for the URL input in the Link URL editing balloon.
			'Link URL': 'URL del enlace',
			// An error text displayed when user attempted to enter an empty URL.
			'Link URL must not be empty.': 'La URL del enlace no puede estar vacía.',
			// Label for the image link button.
			'Link image': 'URL de la imagen',
			// Label for the link properties link balloon title.
			'Link properties': 'Propiedades del enlace',
			// Button opening the Link URL editing balloon.
			'Edit link': 'Editar enlace',
			// Button opening the link in new browser tab.
			'Open link in new tab': 'Abrir enlace en una pestaña nueva',
			// The label of the switch button that controls whether the edited link will open in a new tab.
			'Open in a new tab': 'Abrir en una pestaña nueva ',
			// The label of the switch button that controls whether the edited link refers to downloadable resource.
			'Downloadable': 'Descargable',
			// Keystroke description for assistive technologies: keystroke for creating a link.
			'Create link': 'Crea un enlace',
			// Keystroke description for assistive technologies: keystroke for moving out of a link.
			'Move out of a link': 'Sale de un enlace',
			// The label of the input field for the displayed text of the link.
			'Displayed text': 'Texto mostrado',
			// Placeholder shown when placeholder items view is empty.
			'No links available': 'No hay enlaces disponibles',
			// The label of the switch button shown when link has empty href attribute.
			'This link has no URL': 'Este enlace no tiene URL'
		}
	}
};

export default translations;
