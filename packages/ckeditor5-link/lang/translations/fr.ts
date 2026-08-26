/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'fr': {
		dictionary: {
			// Toolbar button tooltip for the Unlink feature.
			'Unlink': 'Supprimer le lien',
			// Toolbar button tooltip for the Link feature.
			'Link': 'Lien',
			// Label for the URL input in the Link URL editing balloon.
			'Link URL': 'URL du lien',
			// An error text displayed when user attempted to enter an empty URL.
			'Link URL must not be empty.': 'L\'URL du lien ne doit pas être vide.',
			// Label for the image link button.
			'Link image': 'Lien d\'image',
			// Label for the link properties link balloon title.
			'Link properties': 'Propriétés du lien',
			// Button opening the Link URL editing balloon.
			'Edit link': 'Modifier le lien',
			// Button opening the link in new browser tab.
			'Open link in new tab': 'Ouvrir le lien dans un nouvel onglet',
			// The label of the switch button that controls whether the edited link will open in a new tab.
			'Open in a new tab': 'Ouvrir dans un nouvel onglet',
			// The label of the switch button that controls whether the edited link refers to downloadable resource.
			'Downloadable': 'Fichier téléchargeable',
			// Keystroke description for assistive technologies: keystroke for creating a link.
			'Create link': 'Créer un lien',
			// Keystroke description for assistive technologies: keystroke for moving out of a link.
			'Move out of a link': 'Sortir d\'un lien',
			// The label of the input field for the displayed text of the link.
			'Displayed text': 'Texte affiché',
			// Placeholder shown when placeholder items view is empty.
			'No links available': 'Aucun lien disponible',
			// The label of the switch button shown when link has empty href attribute.
			'This link has no URL': 'Ce lien ne possède aucune URL'
		}
	}
};

export default translations;
