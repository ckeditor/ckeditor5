/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'zh': {
		dictionary: {
			// Toolbar button tooltip for the HTML embed feature.
			'Insert HTML': '輸入HTML',
			// The HTML snippet.
			'HTML snippet': 'HTML標籤',
			// A placeholder that will be displayed in the raw HTML textarea field.
			'Paste raw HTML here...': '在此貼上純HTML',
			// A label of a button that switches the HTML embed to the source editing mode.
			'Edit source': '編輯HTML',
			// A label of a button that saves the HTML embed content and navigates back to the preview.
			'Save changes': '儲存變更',
			// An information displayed in the HTML embed preview if the content is not previewable.
			'No preview available': '無法顯示預覽',
			// An information displayed in the HTML embed preview if the HTML snippet has no content.
			'Empty snippet content': 'HTML標籤中無內容'
		}
	}
};

export default translations;
