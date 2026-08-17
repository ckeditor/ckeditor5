/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'fr': {
		dictionary: {
			// Toolbar button tooltip for the HTML embed feature.
			'Insert HTML': 'Insérer du code HTML',
			// The HTML snippet.
			'HTML snippet': 'Code HTML',
			// A placeholder that will be displayed in the raw HTML textarea field.
			'Paste raw HTML here...': 'Collez le code HTML brut ici...',
			// A label of a button that switches the HTML embed to the source editing mode.
			'Edit source': 'Modifier la source',
			// A label of a button that saves the HTML embed content and navigates back to the preview.
			'Save changes': 'Enregistrer les changements',
			// An information displayed in the HTML embed preview if the content is not previewable.
			'No preview available': 'Aucun aperçu disponible',
			// An information displayed in the HTML embed preview if the HTML snippet has no content.
			'Empty snippet content': 'Aucun contenu pour ce fragment de code'
		}
	}
};

export default translations;
