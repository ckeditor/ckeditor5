/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'ja': {
		dictionary: {
			// Toolbar button tooltip for the HTML embed feature.
			'Insert HTML': 'HTMLを挿入',
			// The HTML snippet.
			'HTML snippet': 'HTMLスニペット',
			// A placeholder that will be displayed in the raw HTML textarea field.
			'Paste raw HTML here...': 'ここにRaw HTMLを貼り付ける...',
			// A label of a button that switches the HTML embed to the source editing mode.
			'Edit source': 'ソースを編集',
			// A label of a button that saves the HTML embed content and navigates back to the preview.
			'Save changes': '変更を保存',
			// An information displayed in the HTML embed preview if the content is not previewable.
			'No preview available': 'プレビューは使用できません',
			// An information displayed in the HTML embed preview if the HTML snippet has no content.
			'Empty snippet content': 'スニペットのコンテンツを空にする'
		}
	}
};

export default translations;
