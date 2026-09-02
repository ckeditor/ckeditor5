/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'ko': {
		dictionary: {
			// Toolbar button tooltip for the Unlink feature.
			'Unlink': '링크 삭제',
			// Toolbar button tooltip for the Link feature.
			'Link': '링크',
			// Label for the URL input in the Link URL editing balloon.
			'Link URL': '링크 주소',
			// An error text displayed when user attempted to enter an empty URL.
			'Link URL must not be empty.': '링크 URL은 비워둘 수 없습니다.',
			// Label for the image link button.
			'Link image': '사진 링크',
			// Label for the link properties link balloon title.
			'Link properties': '링크 속성',
			// Button opening the Link URL editing balloon.
			'Edit link': '링크 편집',
			// Button opening the link in new browser tab.
			'Open link in new tab': '새 탭에서 링크 열기',
			// The label of the switch button that controls whether the edited link will open in a new tab.
			'Open in a new tab': '새 탭에서 열기',
			// The label of the switch button that controls whether the edited link refers to downloadable resource.
			'Downloadable': '다운로드 가능',
			// Keystroke description for assistive technologies: keystroke for creating a link.
			'Create link': '링크 생성',
			// Keystroke description for assistive technologies: keystroke for moving out of a link.
			'Move out of a link': '링크 밖으로 이동',
			// The label of the input field for the displayed text of the link.
			'Displayed text': '표시 텍스트',
			// Placeholder shown when placeholder items view is empty.
			'No links available': '사용 가능한 링크 없음',
			// The label of the switch button shown when link has empty href attribute.
			'This link has no URL': '이 링크에는 URL이 없습니다'
		}
	}
};

export default translations;
