/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'id': {
		dictionary: {
			// Label for the Cancel button.
			'Cancel': 'Batal',
			// Label for the Clear button.
			'Clear': 'Kosongkan',
			// The label used by a button next to the color palette in the color picker that removes the color (resets it to an empty value, example usages in font color or table properties).
			'Remove color': 'Hapus warna',
			// The label used by a button next to the color palette in the color picker that restores the default value if the default table properties are specified.
			'Restore default': 'Pulihkan nilai baku',
			// Label for the Save button.
			'Save': 'Simpan',
			// Label of a toolbar button which reveals more toolbar items.
			'Show more items': 'Tampilkan lebih banyak item',
			// Label for an ‘X of Y’ status of a typical next/previous navigation. For instance, ‘Page 5 of 20’ or 'Search result 5 of 20'.
			'%0 of %1': '%0 dari %1',
			// A generic error message displayed on upload failure. The file name is concatenated to this text.
			'Cannot upload file:': 'Tidak dapat mengunggah berkas:',
			// Accessible label of the specific editing area of the editor acting as a root of the entire application.
			'Rich Text Editor. Editing area: %0': 'Editor Teks Kaya. Area edit: %0',
			// The label for the insert image with the file manager toolbar button with visible label in insert image dropdown.
			'Insert with file manager': 'Sisipkan dengan pengelola file',
			// The label for the replace image with the file manager toolbar button with visible label in insert image dropdown.
			'Replace with file manager': 'Ganti dengan pengelola file',
			// The label for the insert image with the file manager toolbar button.
			'Insert image with file manager': 'Sisipkan gambar dengan pengelola file',
			// The label for the replace image with the file manager toolbar button.
			'Replace image with file manager': 'Ganti gambar dengan pengelola file',
			// The label for a button that opens a file manager in order to insert a file.
			'File': 'File',
			// The label for the insert image with the file manager menu bar button (inside 'Insert' menu)
			'With file manager': 'Dengan pengelola file',
			// The button label for the object (e.g. image, table) toolbar for hiding the attached caption.
			'Toggle caption off': 'Sembunyikan keterangan',
			// The button label for the object (e.g. image, table) toolbar for showing the attached caption.
			'Toggle caption on': 'Tampilkan keterangan',
			// Accessibility help dialog category header text for keystrokes related to content creation.
			'Content editing keystrokes': 'Penekanan tombol untuk mengedit konten',
			// Accessibility help dialog text further explaining the purpose of the "Content editing keystrokes" category.
			'These keyboard shortcuts allow for quick access to content editing features.': 'Pintasan keyboard ini mengizinkan akses cepat ke fitur pengeditan konten.',
			// Accessibility help dialog category header text for keystrokes related to navigation in the user interface.
			'User interface and content navigation keystrokes': 'Antarmuka pengguna dan penekanan tombol navigasi konten',
			// Accessibility help dialog text further explaining the purpose of the "User interface and content navigation keystrokes" category.
			'Use the following keystrokes for more efficient navigation in the CKEditor 5 user interface.': 'Gunakan penekanan tombol berikut untuk navigasi yang lebih efisien di antarmuka pengguna CKEditor 5.',
			// Keystroke description for assistive technologies: keystroke for closing contextual balloons, dropdowns, and dialogs.
			'Close contextual balloons, dropdowns, and dialogs': 'Tutup balon kontekstual, menu tarik-turun, dan dialog',
			// Keystroke description for assistive technologies: keystroke for opening the accessibility help dialog.
			'Open the accessibility help dialog': 'Buka dialog bantuan aksesibilitas',
			// Keystroke description for assistive technologies: keystroke for moving between fields.
			'Move focus between form fields (inputs, buttons, etc.)': 'Pindahkan fokus di antara bidang formulir (input, tombol, dll.)',
			// Keystroke description for assistive technologies: keystroke for moving focus to the menu bar.
			'Move focus to the menu bar, navigate between menu bars': 'Pindahkan fokus ke bilah menu, telusuri di antara bilah-bilah menu',
			// Keystroke description for assistive technologies: keystroke for moving focus to the toolbar.
			'Move focus to the toolbar, navigate between toolbars': 'Pindahkan fokus ke toolbar, jelajahi antar toolbar',
			// Keystroke description for assistive technologies: keystroke for navigating through the toolbar.
			'Navigate through the toolbar or menu bar': 'Telusuri bilah alat atau bilah menu',
			// Keystroke description for assistive technologies: keystroke for executing currently focused button.
			'Execute the currently focused button. Executing buttons that interact with the editor content moves the focus back to the content.': 'Jalankan tombol yang sedang difokuskan. Menjalankan tombol yang berinteraksi dengan konten editor akan memindahkan fokus kembali ke konten tersebut.',
			// Label of the button confirming the changes done in the current interface.
			'Accept': 'Setuju',
			// The label of the source editing related features used in toolbar buttons.
			'Source': 'Sumber',
			// Dropdown option label for the paragraph format.
			'Paragraph': 'Paragraf',
			// The label used by assistive technologies describing a button that opens a color picker, where user can choose a configured color for a certain properties (eg.: background color, color, border-color etc.).
			'Color picker': 'Pengambil warna',
			// Label for the Insert button.
			'Insert': 'Sisipkan',
			// Label for the Update button.
			'Update': 'PErbarui',
			// Label for the Back button.
			'Back': 'Kembali',
			// The secondary text of the message shown to the user when no results are available for the search criteria.
			'Please try a different phrase or check the spelling.': 'Silakan coba frasa lain atau periksa ejaannya.',
			// The label for the object (e.g. image, media) style button that wraps text around the object.
			'Wrap text': 'Bungkus teks',
			// The label for the object (e.g. image, media) style button that breaks the text around the object.
			'Break text': 'Pecahkan teks',
			// The label for the resize option that allows the user to enter a custom size.
			'Custom': 'khusus',
			// The default label for the resize option that resets the size.
			'Original': 'Asli',
			// Text used as an error label when the user submitted a custom resize form with a blank value.
			'The value must not be empty.': 'Nilai tidak boleh kosong.',
			// Text used as an error label when the user submitted a custom resize form with an incorrect value.
			'The value should be a plain number.': 'Nilai harus berupa angka biasa.'
		},
		getPluralForm: ( n: number ) => 0
	}
};

export default translations;
