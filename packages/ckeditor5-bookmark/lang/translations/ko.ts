/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'ko': {
		dictionary: {
			// The label of the bookmark toolbar button. Also, a bookmark form header.
			'Bookmark': '책갈피',
			// Button opening the Bookmark editing balloon.
			'Edit bookmark': '책갈피 편집',
			// Toolbar button tooltip for bookmark remove button.
			'Remove bookmark': '책갈피 제거',
			// The label of the input in the bookmark insert and update form. Also, the tooltip for the bookmark name in the bookmark preview.
			'Bookmark name': '책갈피 이름',
			// The description of bookmark input in the bookmark insert form.
			'Enter the bookmark name without spaces.': '공백 없이 책갈피 이름을 입력하세요.',
			// The error message. Displayed when the bookmark name is empty.
			'Bookmark must not be empty.': '책갈피 이름은 비워 둘 수 없습니다.',
			// The error message. Displayed when provided name includes spaces.
			'Bookmark name cannot contain space characters.': '책갈피 이름에는 공백이 포함될 수 없습니다.',
			// The error message. Displayed when provided name already exists.
			'Bookmark name already exists.': '책갈피 이름이 이미 존재합니다.',
			// The label for the bookmark widget.
			'bookmark widget': '책갈피 위젯',
			// The label used by assistive technologies describing an bookmark toolbar attached to a bookmark widget.
			'Bookmark toolbar': '북마크 도구 모음',
			// Title for a feature displaying a list of bookmarks.
			'Bookmarks': '북마크',
			// A message displayed instead of a list of bookmarks if it is empty.
			'No bookmarks available.': '사용 가능한 북마크가 없습니다.',
			// Tooltip shown after hovering the bookmark link preview.
			'Scroll to bookmark': '북마크로 이동'
		}
	}
};

export default translations;
