/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'ko': {
		dictionary: {
			// Label for the Cancel button.
			'Cancel': '취소',
			// Label for the Clear button.
			'Clear': '지우기',
			// The label used by a button next to the color palette in the color picker that removes the color (resets it to an empty value, example usages in font color or table properties).
			'Remove color': '색깔 제거',
			// The label used by a button next to the color palette in the color picker that restores the default value if the default table properties are specified.
			'Restore default': '기본값 복원',
			// Label for the Save button.
			'Save': '저장',
			// Label of a toolbar button which reveals more toolbar items.
			'Show more items': '더보기',
			// Label for an ‘X of Y’ status of a typical next/previous navigation. For instance, ‘Page 5 of 20’ or 'Search result 5 of 20'.
			'%0 of %1': '%0 / %1',
			// A generic error message displayed on upload failure. The file name is concatenated to this text.
			'Cannot upload file:': '파일 업로드할 수 없음: ',
			// Accessible label of the specific editing area of the editor acting as a root of the entire application.
			'Rich Text Editor. Editing area: %0': '리치 텍스트 편집기. 편집 영역: %0',
			// The label for the insert image with the file manager toolbar button with visible label in insert image dropdown.
			'Insert with file manager': '파일 관리자를 사용하여 삽입',
			// The label for the replace image with the file manager toolbar button with visible label in insert image dropdown.
			'Replace with file manager': '파일 관리자를 사용하여 교체',
			// The label for the insert image with the file manager toolbar button.
			'Insert image with file manager': '파일 관리자를 사용하여 이미지 삽입',
			// The label for the replace image with the file manager toolbar button.
			'Replace image with file manager': '파일 관리자를 사용하여 이미지 교체',
			// The label for a button that opens a file manager in order to insert a file.
			'File': '파일',
			// The label for the insert image with the file manager menu bar button (inside 'Insert' menu)
			'With file manager': '파일 관리 버튼으로 이미지 삽입',
			// The button label for the object (e.g. image, table) toolbar for hiding the attached caption.
			'Toggle caption off': '캡션 지우기',
			// The button label for the object (e.g. image, table) toolbar for showing the attached caption.
			'Toggle caption on': '캡션 넣기',
			// Accessibility help dialog category header text for keystrokes related to content creation.
			'Content editing keystrokes': '콘텐츠 편집 키 입력',
			// Accessibility help dialog text further explaining the purpose of the "Content editing keystrokes" category.
			'These keyboard shortcuts allow for quick access to content editing features.': '이러한 키보드 단축키를 사용하면 콘텐츠 편집 기능을 빠르게 사용할 수 있습니다.',
			// Accessibility help dialog category header text for keystrokes related to navigation in the user interface.
			'User interface and content navigation keystrokes': '사용자 인터페이스 및 콘텐츠 탐색 키 입력',
			// Accessibility help dialog text further explaining the purpose of the "User interface and content navigation keystrokes" category.
			'Use the following keystrokes for more efficient navigation in the CKEditor 5 user interface.': '다음 키 입력을 사용하여 CKEditor 5 사용자 인터페이스를 더 효율적으로 탐색하세요.',
			// Keystroke description for assistive technologies: keystroke for closing contextual balloons, dropdowns, and dialogs.
			'Close contextual balloons, dropdowns, and dialogs': '상황별 풍선, 드롭다운, 대화 상자 닫기',
			// Keystroke description for assistive technologies: keystroke for opening the accessibility help dialog.
			'Open the accessibility help dialog': '접근성 도움말 대화 상자 열기',
			// Keystroke description for assistive technologies: keystroke for moving between fields.
			'Move focus between form fields (inputs, buttons, etc.)': '양식 필드(입력, 버튼 등) 간에 포커스 이동',
			// Keystroke description for assistive technologies: keystroke for moving focus to the menu bar.
			'Move focus to the menu bar, navigate between menu bars': '메뉴 표시줄로 포커스 이동, 메뉴 표시줄 탐색',
			// Keystroke description for assistive technologies: keystroke for moving focus to the toolbar.
			'Move focus to the toolbar, navigate between toolbars': '도구 모음으로 포커스 이동, 도구 모음 간 탐색',
			// Keystroke description for assistive technologies: keystroke for navigating through the toolbar.
			'Navigate through the toolbar or menu bar': '도구 모음 또는 메뉴 표시줄 탐색',
			// Keystroke description for assistive technologies: keystroke for executing currently focused button.
			'Execute the currently focused button. Executing buttons that interact with the editor content moves the focus back to the content.': '현재 포커스가 맞춰진 버튼을 실행합니다. 편집기 콘텐츠와 상호 작용하는 버튼을 실행하면 포커스가 다시 콘텐츠로 이동합니다.',
			// Label of the button confirming the changes done in the current interface.
			'Accept': '수락',
			// The label of the source editing related features used in toolbar buttons.
			'Source': '소스',
			// Dropdown option label for the paragraph format.
			'Paragraph': '문단',
			// The label used by assistive technologies describing a button that opens a color picker, where user can choose a configured color for a certain properties (eg.: background color, color, border-color etc.).
			'Color picker': '색상 선택기',
			// Label for the Insert button.
			'Insert': '삽입',
			// Label for the Update button.
			'Update': '업데이트',
			// Label for the Back button.
			'Back': '뒤로',
			// The secondary text of the message shown to the user when no results are available for the search criteria.
			'Please try a different phrase or check the spelling.': '다른 문구를 사용해 보시거나 철자를 확인해 주세요.',
			// The label for the object (e.g. image, media) style button that wraps text around the object.
			'Wrap text': '텍스트 줄 바꿈',
			// The label for the object (e.g. image, media) style button that breaks the text around the object.
			'Break text': '텍스트 분리',
			// The label for the resize option that allows the user to enter a custom size.
			'Custom': '사용자 지정',
			// The default label for the resize option that resets the size.
			'Original': '원본',
			// Text used as an error label when the user submitted a custom resize form with a blank value.
			'The value must not be empty.': '값은 비워둘 수 없습니다.',
			// Text used as an error label when the user submitted a custom resize form with an incorrect value.
			'The value should be a plain number.': '일반 숫자로 된 값을 입력해야 합니다.'
		},
		getPluralForm: ( n: number ) => 0
	}
};

export default translations;
