/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'tr': {
		dictionary: {
			// Label for the Cancel button.
			'Cancel': 'İptal',
			// Label for the Clear button.
			'Clear': 'Temizle',
			// The label used by a button next to the color palette in the color picker that removes the color (resets it to an empty value, example usages in font color or table properties).
			'Remove color': 'Rengi Sil',
			// The label used by a button next to the color palette in the color picker that restores the default value if the default table properties are specified.
			'Restore default': 'Varsayılanı geri yükle',
			// Label for the Save button.
			'Save': 'Kaydet',
			// Label of a toolbar button which reveals more toolbar items.
			'Show more items': 'Daha fazla öğe göster',
			// Label for an ‘X of Y’ status of a typical next/previous navigation. For instance, ‘Page 5 of 20’ or 'Search result 5 of 20'.
			'%0 of %1': '%0/%1',
			// A generic error message displayed on upload failure. The file name is concatenated to this text.
			'Cannot upload file:': 'Dosya yüklenemedi:',
			// Accessible label of the specific editing area of the editor acting as a root of the entire application.
			'Rich Text Editor. Editing area: %0': 'Zengin Metin Editörü.Düzenleme alanı: %0',
			// The label for the insert image with the file manager toolbar button with visible label in insert image dropdown.
			'Insert with file manager': 'Dosya yöneticisiyle ekle',
			// The label for the replace image with the file manager toolbar button with visible label in insert image dropdown.
			'Replace with file manager': 'Dosya yöneticisiyle değiştirin',
			// The label for the insert image with the file manager toolbar button.
			'Insert image with file manager': 'Dosya yöneticisiyle görüntü ekleyin',
			// The label for the replace image with the file manager toolbar button.
			'Replace image with file manager': 'Resmi dosya yöneticisiyle değiştir',
			// The label for a button that opens a file manager in order to insert a file.
			'File': 'Dosya',
			// The label for the insert image with the file manager menu bar button (inside 'Insert' menu)
			'With file manager': 'Dosya yöneticisi ile',
			// The button label for the object (e.g. image, table) toolbar for hiding the attached caption.
			'Toggle caption off': 'Açıklamayı kapat',
			// The button label for the object (e.g. image, table) toolbar for showing the attached caption.
			'Toggle caption on': 'Açıklamayı aç',
			// Accessibility help dialog category header text for keystrokes related to content creation.
			'Content editing keystrokes': 'İçerik düzenleme tuş vuruşları',
			// Accessibility help dialog text further explaining the purpose of the "Content editing keystrokes" category.
			'These keyboard shortcuts allow for quick access to content editing features.': 'Bu klavye kısayolları içerik düzenleme özelliklerine hızlı erişim sağlar.',
			// Accessibility help dialog category header text for keystrokes related to navigation in the user interface.
			'User interface and content navigation keystrokes': 'Kullanıcı arayüzü ve içerik gezinme tuş vuruşları',
			// Accessibility help dialog text further explaining the purpose of the "User interface and content navigation keystrokes" category.
			'Use the following keystrokes for more efficient navigation in the CKEditor 5 user interface.': 'CKEditor 5 kullanıcı arayüzünde daha etkili gezinti için aşağıdaki tuş vuruşlarını kullanın.',
			// Keystroke description for assistive technologies: keystroke for closing contextual balloons, dropdowns, and dialogs.
			'Close contextual balloons, dropdowns, and dialogs': 'Bağlamsal balonları, açılır menüleri ve iletişim kutularını kapat',
			// Keystroke description for assistive technologies: keystroke for opening the accessibility help dialog.
			'Open the accessibility help dialog': 'Erişilebilirlik yardımı iletişim kutusunu aç',
			// Keystroke description for assistive technologies: keystroke for moving between fields.
			'Move focus between form fields (inputs, buttons, etc.)': 'Odağı, form alanları (girdiler, düğmeler vb.) arasında taşı',
			// Keystroke description for assistive technologies: keystroke for moving focus to the menu bar.
			'Move focus to the menu bar, navigate between menu bars': 'Odağı menü çubuğuna taşıyın, menü çubukları arasında gezinin',
			// Keystroke description for assistive technologies: keystroke for moving focus to the toolbar.
			'Move focus to the toolbar, navigate between toolbars': 'Odağı araç çubuğuna taşı, araç çubukları arasında gezin',
			// Keystroke description for assistive technologies: keystroke for navigating through the toolbar.
			'Navigate through the toolbar or menu bar': 'Araç çubuğu veya menü çubuğunda gezinme',
			// Keystroke description for assistive technologies: keystroke for executing currently focused button.
			'Execute the currently focused button. Executing buttons that interact with the editor content moves the focus back to the content.': 'O anda odaklanılan düğmeyi çalıştırın. Düzenleyici içeriğiyle etkileşime giren düğmelerin çalıştırılması, odağı içeriğe geri taşır.',
			// Label of the button confirming the changes done in the current interface.
			'Accept': 'Kabul et',
			// The label of the source editing related features used in toolbar buttons.
			'Source': 'Kaynak',
			// Dropdown option label for the paragraph format.
			'Paragraph': 'Paragraf',
			// The label used by assistive technologies describing a button that opens a color picker, where user can choose a configured color for a certain properties (eg.: background color, color, border-color etc.).
			'Color picker': 'Renk seçici',
			// Label for the Insert button.
			'Insert': 'Ekle',
			// Label for the Update button.
			'Update': 'Güncelle',
			// Label for the Back button.
			'Back': 'Geri',
			// The secondary text of the message shown to the user when no results are available for the search criteria.
			'Please try a different phrase or check the spelling.': 'Lütfen farklı bir kelime grubu deneyin veya yazım denetimi yapın.',
			// The label for the object (e.g. image, media) style button that wraps text around the object.
			'Wrap text': 'Metni kaydır',
			// The label for the object (e.g. image, media) style button that breaks the text around the object.
			'Break text': 'Metni böl',
			// The label for the resize option that allows the user to enter a custom size.
			'Custom': 'Özel',
			// The default label for the resize option that resets the size.
			'Original': 'Orijinal',
			// Text used as an error label when the user submitted a custom resize form with a blank value.
			'The value must not be empty.': 'Değer boş olmamalıdır.',
			// Text used as an error label when the user submitted a custom resize form with an incorrect value.
			'The value should be a plain number.': 'Değer düz bir sayı olmalıdır.'
		},
		getPluralForm: ( n: number ) => (n > 1)
	}
};

export default translations;
