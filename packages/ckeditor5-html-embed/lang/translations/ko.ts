/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'ko': {
		dictionary: {
			// Toolbar button tooltip for the HTML embed feature.
			'Insert HTML': 'HTML 삽입',
			// The HTML snippet.
			'HTML snippet': 'HTML 코드 조각',
			// A placeholder that will be displayed in the raw HTML textarea field.
			'Paste raw HTML here...': '원시 HTML을 여기에 붙여넣으세요...',
			// A label of a button that switches the HTML embed to the source editing mode.
			'Edit source': '소스 편집',
			// A label of a button that saves the HTML embed content and navigates back to the preview.
			'Save changes': '변경사항 저장',
			// An information displayed in the HTML embed preview if the content is not previewable.
			'No preview available': '미리보기를 이용할 수 없습니다',
			// An information displayed in the HTML embed preview if the HTML snippet has no content.
			'Empty snippet content': '빈 코드 조각 내용'
		}
	}
};

export default translations;
