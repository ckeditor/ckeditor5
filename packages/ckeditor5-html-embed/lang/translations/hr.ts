/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'hr': {
		dictionary: {
			// Toolbar button tooltip for the HTML embed feature.
			'Insert HTML': 'Ubaci HTML',
			// The HTML snippet.
			'HTML snippet': 'HTML isječak',
			// A placeholder that will be displayed in the raw HTML textarea field.
			'Paste raw HTML here...': 'Zalijepi ovdje čisti HTML...',
			// A label of a button that switches the HTML embed to the source editing mode.
			'Edit source': 'Uredi izvorni kod',
			// A label of a button that saves the HTML embed content and navigates back to the preview.
			'Save changes': 'Snimi promjene',
			// An information displayed in the HTML embed preview if the content is not previewable.
			'No preview available': 'Pregled nije dostupan',
			// An information displayed in the HTML embed preview if the HTML snippet has no content.
			'Empty snippet content': 'Ukloni sadržaj isječka'
		}
	}
};

export default translations;
