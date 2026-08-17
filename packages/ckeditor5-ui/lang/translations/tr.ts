/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'tr': {
		dictionary: {
			// Title of the CKEditor5 editor.
			'Rich Text Editor': 'Zengin İçerik Editörü',
			// Label of the block toolbar icon (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Edit block': 'Bloğu Düzenle',
			// First part of the label of the block toolbar icon when functionality of drag and drop is available (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Click to edit block': 'Bloğu düzenlemek için tıkla',
			// Second part of the label of the block toolbar icon when functionality of drag and drop is available (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Drag to move': 'Taşımak için sürükle',
			// Label for a button showing the next thing (tab, page, etc.).
			'Next': 'Sonraki',
			// Label for a button showing the previous thing (tab, page, etc.).
			'Previous': 'Önceki',
			// Label used by assistive technologies describing a generic editor toolbar.
			'Editor toolbar': 'Düzenleme araç çubuğu',
			// Label used by assistive technologies describing a toolbar displayed inside a dropdown.
			'Dropdown toolbar': 'Açılır araç çubuğu',
			// Label used by assistive technologies describing a menu displayed inside a dropdown.
			'Dropdown menu': 'Aşağı açılır menü',
			// Label of a button that applies a black color in color pickers.
			'Black': 'Siyah',
			// Label of a button that applies a dim grey color in color pickers.
			'Dim grey': 'Koyu Gri',
			// Label of a button that applies a grey color in color pickers.
			'Grey': 'Gri',
			// Label of a button that applies a light grey color in color pickers.
			'Light grey': 'Açık Gri',
			// Label of a button that applies a white color in color pickers.
			'White': 'Beyaz',
			// Label of a button that applies a red color in color pickers.
			'Red': 'Kırmızı',
			// Label of a button that applies a orange color in color pickers.
			'Orange': 'Turuncu',
			// Label of a button that applies a yellow color in color pickers.
			'Yellow': 'Sarı',
			// Label of a button that applies a light green color in color pickers.
			'Light green': 'Açık Yeşil',
			// Label of a button that applies a green color in color pickers.
			'Green': 'Yeşil',
			// Label of a button that applies a aquamarine color in color pickers.
			'Aquamarine': 'Su Yeşili',
			// Label of a button that applies a turquoise color in color pickers.
			'Turquoise': 'Turkuaz',
			// Label of a button that applies a light blue color in color pickers.
			'Light blue': 'Açık Mavi',
			// Label of a button that applies a blue color in color pickers.
			'Blue': 'Mavi',
			// Label of a button that applies a purple color in color pickers.
			'Purple': 'Mor',
			// Accessible label of a toolbar that shows up next to the blocks of content (e.g. headings, paragraphs).
			'Editor block content toolbar': 'Düzenleyici engelleme içerik araç çubuğu',
			// Accessible label of a balloon toolbar that shows up right next to the user selection (the caret).
			'Editor contextual toolbar': 'Düzenleyici içeriksel araç çubuğu',
			// Label of an input field for typing colors in the HEX color format.
			'HEX': 'ONALTILIK',
			// The main text of the message shown to the user when given query does not match any results.
			'No results found': 'Sonuç bulunamadı',
			// The main text of the message shown to the user when no results are available.
			'No searchable items': 'Aranabilir öge yok',
			// A default label of a dialog window displayed on top the editor.
			'Editor dialog': 'Düzenleyici iletişim kutusu',
			// The label and the tooltip for the close button in the dialog header.
			'Close': 'Kapat',
			// Accessibility help dialog assistive technologies label telling users how to exit the dialog.
			'Help Contents. To close this dialog press ESC.': 'Yardım İçerikleri. Bu iletişim kutusunu kapatmak için ESC tuşuna basın.',
			// Accessibility help dialog text explaining what can be found in that dialog.
			'Below, you can find a list of keyboard shortcuts that can be used in the editor.': 'Aşağıda editörde kullanılabilecek klavye kısayollarının bir listesini bulabilirsiniz.',
			// Accessibility help dialog text displayed next to keystrokes that may require the Fn key on Mac.
			'(may require <kbd>Fn</kbd>)': '(<kbd>Fn</kbd> gerekebilir)',
			// The label for the button that opens the Accessibility help dialog from the application menu bar.
			'Accessibility': 'Erişilebilirlik',
			// Accessibility help dialog title.
			'Accessibility help': 'Erişilebilirlik yardımı',
			// Assistive technologies label added to each editor editing area informing users about the possibility of opening the accessibility help dialog.
			'Press %0 for help.': 'Yardım için %0 tuşuna basın.',
			// Keystroke description for assistive technologies: keystroke for moving focus out of an active dialog window.
			'Move focus in and out of an active dialog window': 'Odağı etkin iletişim penceresinin içine ve dışına taşı',
			// The label of the top-level application menu bar menu containing buttons and features related to the whole document (e.g. export to PDF, import from Word, etc.).
			'MENU_BAR_MENU_FILE': 'Dosya',
			// The label of the top-level application menu bar menu containing buttons and features related to general editing (e.g. undo, redo, select all, etc.).
			'MENU_BAR_MENU_EDIT': 'Düzenle',
			// The label of the top-level application menu bar menu containing buttons and features related to the view of the editor (e.g. show source).
			'MENU_BAR_MENU_VIEW': 'Görüntüle',
			// The label of the top-level application menu bar menu containing buttons and features that insert content (e.g. insert table, insert image, etc.).
			'MENU_BAR_MENU_INSERT': 'Ekle',
			// The label of the top-level application menu bar menu containing buttons and features related to content formatting (e.g. bold, font color, heading, etc.).
			'MENU_BAR_MENU_FORMAT': 'Biçim',
			// The label of the top-level application menu bar menu containing various editor tools (e.g. AI assistant, track changes, etc.).
			'MENU_BAR_MENU_TOOLS': 'Araçlar',
			// The label of the top-level application menu bar menu containing buttons and features helping users to learn about the editor (e.g. accessibility help).
			'MENU_BAR_MENU_HELP': 'Yardım',
			// The label of the application menu bar menu containing buttons and features that apply formatting to a text (e.g. bold, italic, etc.).
			'MENU_BAR_MENU_TEXT': 'Metin',
			// The label of the application menu bar menu containing buttons and features that control the font of the edited content (e.g. font size, font color, etc.).
			'MENU_BAR_MENU_FONT': 'Yazı Tipi',
			// The accessible label of the editor menu bar used by assistive technologies.
			'Editor menu bar': 'Düzenleyici menü çubuğu',
			// An error text displayed when user attempted to enter an color that is not in HEX format.
			'Please enter a valid color (e.g. "ff0000").': 'Lütfen geçerli bir renk girin (ör. "ff0000").'
		}
	}
};

export default translations;
