/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'id': {
		dictionary: {
			// Title of the CKEditor5 editor.
			'Rich Text Editor': 'Editor Teks Kaya',
			// Label of the block toolbar icon (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Edit block': 'Sunting blok',
			// First part of the label of the block toolbar icon when functionality of drag and drop is available (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Click to edit block': 'Klik untuk mengedit blok',
			// Second part of the label of the block toolbar icon when functionality of drag and drop is available (a block toolbar is displayed next to each paragraph, heading, list item, etc. and contains e.g. block formatting options)
			'Drag to move': 'Seret untuk memindahkan',
			// Label for a button showing the next thing (tab, page, etc.).
			'Next': 'Berikutnya',
			// Label for a button showing the previous thing (tab, page, etc.).
			'Previous': 'Sebelumnya',
			// Label used by assistive technologies describing a generic editor toolbar.
			'Editor toolbar': 'Alat editor',
			// Label used by assistive technologies describing a toolbar displayed inside a dropdown.
			'Dropdown toolbar': 'Alat dropdown',
			// Label used by assistive technologies describing a menu displayed inside a dropdown.
			'Dropdown menu': 'Menu tarik-turun',
			// Label of a button that applies a black color in color pickers.
			'Black': 'Hitam',
			// Label of a button that applies a dim grey color in color pickers.
			'Dim grey': 'Kelabu gelap',
			// Label of a button that applies a grey color in color pickers.
			'Grey': 'Kelabu',
			// Label of a button that applies a light grey color in color pickers.
			'Light grey': 'Kelabu terang',
			// Label of a button that applies a white color in color pickers.
			'White': 'Putih',
			// Label of a button that applies a red color in color pickers.
			'Red': 'Merah',
			// Label of a button that applies a orange color in color pickers.
			'Orange': 'Jingga',
			// Label of a button that applies a yellow color in color pickers.
			'Yellow': 'Kuning',
			// Label of a button that applies a light green color in color pickers.
			'Light green': 'Hijau terang',
			// Label of a button that applies a green color in color pickers.
			'Green': 'Hijau',
			// Label of a button that applies a aquamarine color in color pickers.
			'Aquamarine': 'Biru laut',
			// Label of a button that applies a turquoise color in color pickers.
			'Turquoise': 'Turkish',
			// Label of a button that applies a light blue color in color pickers.
			'Light blue': 'Biru terang',
			// Label of a button that applies a blue color in color pickers.
			'Blue': 'Biru',
			// Label of a button that applies a purple color in color pickers.
			'Purple': 'Ungu',
			// Accessible label of a toolbar that shows up next to the blocks of content (e.g. headings, paragraphs).
			'Editor block content toolbar': 'Bilah alat konten blok editor',
			// Accessible label of a balloon toolbar that shows up right next to the user selection (the caret).
			'Editor contextual toolbar': 'Bilah alat kontekstual editor',
			// Label of an input field for typing colors in the HEX color format.
			'HEX': 'HEX',
			// The main text of the message shown to the user when given query does not match any results.
			'No results found': 'Hasil tidak ditemukan',
			// The main text of the message shown to the user when no results are available.
			'No searchable items': 'Tidak ada item yang dapat dicari',
			// A default label of a dialog window displayed on top the editor.
			'Editor dialog': 'Dialog editor',
			// The label and the tooltip for the close button in the dialog header.
			'Close': 'Tutup',
			// Accessibility help dialog assistive technologies label telling users how to exit the dialog.
			'Help Contents. To close this dialog press ESC.': 'Konten Bantuan. Untuk menutup dialog ini, tekan ESC.',
			// Accessibility help dialog text explaining what can be found in that dialog.
			'Below, you can find a list of keyboard shortcuts that can be used in the editor.': 'Di bawah ini, Anda dapat menemukan daftar pintasan keyboard yang dapat digunakan di editor.',
			// Accessibility help dialog text displayed next to keystrokes that may require the Fn key on Mac.
			'(may require <kbd>Fn</kbd>)': '(mungkin memerlukan <kbd>Fn</kbd>)',
			// The label for the button that opens the Accessibility help dialog from the application menu bar.
			'Accessibility': 'Aksesibilitas',
			// Accessibility help dialog title.
			'Accessibility help': 'Bantuan aksesibilitas',
			// Assistive technologies label added to each editor editing area informing users about the possibility of opening the accessibility help dialog.
			'Press %0 for help.': 'Tekan %0 untuk mendapatkan bantuan.',
			// Keystroke description for assistive technologies: keystroke for moving focus out of an active dialog window.
			'Move focus in and out of an active dialog window': 'Pindahkan fokus ke dalam dan ke luar jendela dialog yang aktif',
			// The label of the top-level application menu bar menu containing buttons and features related to the whole document (e.g. export to PDF, import from Word, etc.).
			'MENU_BAR_MENU_FILE': 'File',
			// The label of the top-level application menu bar menu containing buttons and features related to general editing (e.g. undo, redo, select all, etc.).
			'MENU_BAR_MENU_EDIT': 'Ubah',
			// The label of the top-level application menu bar menu containing buttons and features related to the view of the editor (e.g. show source).
			'MENU_BAR_MENU_VIEW': 'Lihat',
			// The label of the top-level application menu bar menu containing buttons and features that insert content (e.g. insert table, insert image, etc.).
			'MENU_BAR_MENU_INSERT': 'Sisipkan',
			// The label of the top-level application menu bar menu containing buttons and features related to content formatting (e.g. bold, font color, heading, etc.).
			'MENU_BAR_MENU_FORMAT': 'Format',
			// The label of the top-level application menu bar menu containing various editor tools (e.g. AI assistant, track changes, etc.).
			'MENU_BAR_MENU_TOOLS': 'Alat',
			// The label of the top-level application menu bar menu containing buttons and features helping users to learn about the editor (e.g. accessibility help).
			'MENU_BAR_MENU_HELP': 'Bantuan',
			// The label of the application menu bar menu containing buttons and features that apply formatting to a text (e.g. bold, italic, etc.).
			'MENU_BAR_MENU_TEXT': 'Teks',
			// The label of the application menu bar menu containing buttons and features that control the font of the edited content (e.g. font size, font color, etc.).
			'MENU_BAR_MENU_FONT': 'Fon',
			// The accessible label of the editor menu bar used by assistive technologies.
			'Editor menu bar': 'Bilah menu editor',
			// An error text displayed when user attempted to enter an color that is not in HEX format.
			'Please enter a valid color (e.g. "ff0000").': 'Silakan masukkan warna yang absah (e.g. “ff0000”).'
		}
	}
};

export default translations;
