/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'vi': {
		dictionary: {
			// Title of the CKEditor5 editor.
			'Rich Text Editor': 'Trình soạn thảo văn bản',
			// Label of the block toolbar icon (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Edit block': 'Chỉnh sửa đoạn',
			// First part of the label of the block toolbar icon when functionality of drag and drop is available (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Click to edit block': 'Nhấp để sửa khối',
			// Second part of the label of the block toolbar icon when functionality of drag and drop is available (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Drag to move': 'Kéo để di chuyển',
			// Label for a button showing the next thing (tab, page, etc.).
			'Next': 'Tiếp theo',
			// Label for a button showing the previous thing (tab, page, etc.).
			'Previous': 'Quay lại',
			// Label used by assistive technologies describing a generic editor toolbar.
			'Editor toolbar': 'Thanh công cụ biên tập',
			// Label used by assistive technologies describing a toolbar displayed inside a dropdown.
			'Dropdown toolbar': 'Thanh công cụ danh mục',
			// Label used by assistive technologies describing a menu displayed inside a dropdown.
			'Dropdown menu': 'Trình đơn thả xuống',
			// Label of a button that applies a black color in color pickers.
			'Black': 'Đen',
			// Label of a button that applies a dim grey color in color pickers.
			'Dim grey': 'Xám mờ',
			// Label of a button that applies a grey color in color pickers.
			'Grey': 'Xám',
			// Label of a button that applies a light grey color in color pickers.
			'Light grey': 'Xám nhạt',
			// Label of a button that applies a white color in color pickers.
			'White': 'Trắng',
			// Label of a button that applies a red color in color pickers.
			'Red': 'Đỏ',
			// Label of a button that applies a orange color in color pickers.
			'Orange': 'Cam',
			// Label of a button that applies a yellow color in color pickers.
			'Yellow': 'Vàng',
			// Label of a button that applies a light green color in color pickers.
			'Light green': 'Xanh lá nhạt',
			// Label of a button that applies a green color in color pickers.
			'Green': 'Xanh lá',
			// Label of a button that applies a aquamarine color in color pickers.
			'Aquamarine': 'Xanh ngọc biển',
			// Label of a button that applies a turquoise color in color pickers.
			'Turquoise': 'Xanh ngọc bích',
			// Label of a button that applies a light blue color in color pickers.
			'Light blue': 'Xanh dương',
			// Label of a button that applies a blue color in color pickers.
			'Blue': 'Xanh biển',
			// Label of a button that applies a purple color in color pickers.
			'Purple': 'Tím',
			// Accessible label of a toolbar that shows up next to the blocks of content (e.g. headings, paragraphs).
			'Editor block content toolbar': 'Thanh công cụ chỉnh sửa khối nội dung',
			// Accessible label of a balloon toolbar that shows up right next to the user selection (the caret).
			'Editor contextual toolbar': 'Thanh công cụ chỉnh sửa theo ngữ cảnh',
			// Label of an input field for typing colors in the HEX color format.
			'HEX': 'HEX',
			// The main text of the message shown to the user when given query does not match any results.
			'No results found': 'Không tìm thấy kết quả',
			// The main text of the message shown to the user when no results are available.
			'No searchable items': 'Không có mục nào tìm kiếm được',
			// A default label of a dialog window displayed on top the editor.
			'Editor dialog': 'Hộp thoại trình biên tập',
			// The label and the tooltip for the close button in the dialog header.
			'Close': 'Đóng',
			// Accessibility help dialog assistive technologies label telling users how to exit the dialog.
			'Help Contents. To close this dialog press ESC.': 'Nội dung Trợ giúp. Nhấn phím ESC để đóng hộp thoại này.',
			// Accessibility help dialog text explaining what can be found in that dialog.
			'Below, you can find a list of keyboard shortcuts that can be used in the editor.': 'Dưới đây, bạn có thể tìm thấy danh sách các phím tắt mà bạn có thể dùng trong trình biên tập này.',
			// Accessibility help dialog text displayed next to keystrokes that may require the Fn key on Mac.
			'(may require <kbd>Fn</kbd>)': '(có thể cần nhấn phím <kbd>Fn</kbd>)',
			// The label for the button that opens the Accessibility help dialog from the application menu bar.
			'Accessibility': 'Trợ năng',
			// Accessibility help dialog title.
			'Accessibility help': 'Trợ giúp về khả năng truy cập',
			// Assistive technologies label added to each editor editing area informing users about the possibility of opening the accessibility help dialog.
			'Press %0 for help.': 'Nhấn %0 để được trợ giúp.',
			// Keystroke description for assistive technologies: keystroke for moving focus out of an active dialog window.
			'Move focus in and out of an active dialog window': 'Di chuyển tiêu điểm vào và ra khỏi cửa sổ hộp thoại đang kích hoạt',
			// The label of the top-level application menu bar menu containing buttons and features related to the whole document (e.g. export to PDF, import from Word, etc.).
			'MENU_BAR_MENU_FILE': 'Tệp',
			// The label of the top-level application menu bar menu containing buttons and features related to general editing (e.g. undo, redo, select all, etc.).
			'MENU_BAR_MENU_EDIT': 'Chỉnh sửa',
			// The label of the top-level application menu bar menu containing buttons and features related to the view of the editor (e.g. show source).
			'MENU_BAR_MENU_VIEW': 'Xem',
			// The label of the top-level application menu bar menu containing buttons and features that insert content (e.g. insert table, insert image, etc.).
			'MENU_BAR_MENU_INSERT': 'Chèn',
			// The label of the top-level application menu bar menu containing buttons and features related to content formatting (e.g. bold, font color, heading, etc.).
			'MENU_BAR_MENU_FORMAT': 'Định dạng',
			// The label of the top-level application menu bar menu containing various editor tools (e.g. AI assistant, track changes, etc.).
			'MENU_BAR_MENU_TOOLS': 'Công cụ',
			// The label of the top-level application menu bar menu containing buttons and features helping users to learn about the editor (e.g. accessibility help).
			'MENU_BAR_MENU_HELP': 'Trợ giúp',
			// The label of the application menu bar menu containing buttons and features that apply formatting to a text (e.g. bold, italic, etc.).
			'MENU_BAR_MENU_TEXT': 'Văn bản',
			// The label of the application menu bar menu containing buttons and features that control the font of the edited content (e.g. font size, font color, etc.).
			'MENU_BAR_MENU_FONT': 'Phông chữ',
			// The accessible label of the editor menu bar used by assistive technologies.
			'Editor menu bar': 'Thanh menu Trình soạn thảo',
			// An error text displayed when user attempted to enter an color that is not in HEX format.
			'Please enter a valid color (e.g. "ff0000").': 'Vui lòng nhập một màu sắc hợp lệ (ví dụ: "ff0000").'
		}
	}
};

export default translations;
