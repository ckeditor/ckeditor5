/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'ar': {
		dictionary: {
			// Label for the Cancel button.
			'Cancel': 'إلغاء',
			// Label for the Clear button.
			'Clear': 'مسح',
			// The label used by a button next to the color palette in the color picker that removes the color (resets it to an empty value, example usages in font color or table properties).
			'Remove color': 'إزالة اللون',
			// The label used by a button next to the color palette in the color picker that restores the default value if the default table properties are specified.
			'Restore default': 'استعادة الافتراضي',
			// Label for the Save button.
			'Save': 'حفظ',
			// Label of a toolbar button which reveals more toolbar items.
			'Show more items': 'عرض المزيد من العناصر',
			// Label for an ‘X of Y’ status of a typical next/previous navigation. For instance, ‘Page 5 of 20’ or 'Search result 5 of 20'.
			'%0 of %1': '%0 من %1',
			// A generic error message displayed on upload failure. The file name is concatenated to this text.
			'Cannot upload file:': 'لا يمكن رفع الملف:',
			// Accessible label of the specific editing area of the editor acting as a root of the entire application.
			'Rich Text Editor. Editing area: %0': 'محرر النصوص المنسّقة. منطقة التحرير: %0',
			// The label for the insert image with the file manager toolbar button with visible label in insert image dropdown.
			'Insert with file manager': 'إدخال مع مدير الملفات',
			// The label for the replace image with the file manager toolbar button with visible label in insert image dropdown.
			'Replace with file manager': 'استبدال بمدير الملفات',
			// The label for the insert image with the file manager toolbar button.
			'Insert image with file manager': 'إدراج صورة مع مدير الملفات',
			// The label for the replace image with the file manager toolbar button.
			'Replace image with file manager': 'استبدال الصورة بمدير الملفات',
			// The label for a button that opens a file manager in order to insert a file.
			'File': 'ملف',
			// The label for the insert image with the file manager menu bar button (inside 'Insert' menu)
			'With file manager': 'باستخدام مدير الملفات',
			// The button label for the object (e.g. image, table) toolbar for hiding the attached caption.
			'Toggle caption off': 'إخفاء التسمية التوضيحية',
			// The button label for the object (e.g. image, table) toolbar for showing the attached caption.
			'Toggle caption on': 'عرض التسمية التوضيحية',
			// Accessibility help dialog category header text for keystrokes related to content creation.
			'Content editing keystrokes': 'ضغطة المفاتيح لتحرير المحتوى',
			// Accessibility help dialog text further explaining the purpose of the "Content editing keystrokes" category.
			'These keyboard shortcuts allow for quick access to content editing features.': 'تسمح اختصارات لوحة المفاتيح هذه بالوصول سريعاً إلى ميزات تحرير المحتوى.',
			// Accessibility help dialog category header text for keystrokes related to navigation in the user interface.
			'User interface and content navigation keystrokes': 'واجهة المستخدم وضغطة المفاتيح للتنقل في المحتوى',
			// Accessibility help dialog text further explaining the purpose of the "User interface and content navigation keystrokes" category.
			'Use the following keystrokes for more efficient navigation in the CKEditor 5 user interface.': 'استخدمْ ضغطة المفاتيح التالية للتنقل بشكل أكثر كفاءة في واجهة مستخدم CKEditor 5.',
			// Keystroke description for assistive technologies: keystroke for closing contextual balloons, dropdowns, and dialogs.
			'Close contextual balloons, dropdowns, and dialogs': 'أغلقْ البالونات السياقية والقوائم المنسدلة ومربعات الحوار',
			// Keystroke description for assistive technologies: keystroke for opening the accessibility help dialog.
			'Open the accessibility help dialog': 'افتحْ مربع الحوار بشأن تعليمات إمكانية الوصول',
			// Keystroke description for assistive technologies: keystroke for moving between fields.
			'Move focus between form fields (inputs, buttons, etc.)': 'انقلْ التركيز بين حقول النموذج (المدخلات والأزرار وما إلى ذلك)',
			// Keystroke description for assistive technologies: keystroke for moving focus to the menu bar.
			'Move focus to the menu bar, navigate between menu bars': 'انقلْ التركيز إلى شريط القائمة، وتَنقّلْ بين أشرطة القوائم',
			// Keystroke description for assistive technologies: keystroke for moving focus to the toolbar.
			'Move focus to the toolbar, navigate between toolbars': 'انقلْ التركيز إلى شريط الأدوات، وتنقّلْ بين أشرطة الأدوات',
			// Keystroke description for assistive technologies: keystroke for navigating through the toolbar.
			'Navigate through the toolbar or menu bar': 'تنقّلْ عبر شريط الأدوات أو شريط القوائم',
			// Keystroke description for assistive technologies: keystroke for executing currently focused button.
			'Execute the currently focused button. Executing buttons that interact with the editor content moves the focus back to the content.': 'قم بتنفيذ الزر المركَّز حالياً، حيث أن تنفيذ الأزرار المتفاعلة مع محتوى المحرِّر يؤدي إلى إعادة التركيز إلى المحتوى.',
			// Label of the button confirming the changes done in the current interface.
			'Accept': 'قبول',
			// The label of the source editing related features used in toolbar buttons.
			'Source': 'المصدر',
			// Dropdown option label for the paragraph format.
			'Paragraph': 'فقرة',
			// The label used by assistive technologies describing a button that opens a color picker, where user can choose a configured color for a certain properties (eg.: background color, color, border-color etc.).
			'Color picker': 'أداة انتقاء الألوان',
			// Label for the Insert button.
			'Insert': 'إدراج',
			// Label for the Update button.
			'Update': 'تحديث',
			// Label for the Back button.
			'Back': 'الرجوع',
			// The secondary text of the message shown to the user when no results are available for the search criteria.
			'Please try a different phrase or check the spelling.': 'يُرجى محاولة البحث باستخدام عبارة أخرى أو تدقيق عبارة البحث إملائياً.',
			// The label for the object (e.g. image, media) style button that wraps text around the object.
			'Wrap text': 'التفاف النص',
			// The label for the object (e.g. image, media) style button that breaks the text around the object.
			'Break text': 'اعتراض النص',
			// The label for the resize option that allows the user to enter a custom size.
			'Custom': 'مخصص',
			// The default label for the resize option that resets the size.
			'Original': 'الحجم الأصلي',
			// Text used as an error label when the user submitted a custom resize form with a blank value.
			'The value must not be empty.': 'يجب ألا تكون القيمة فارغة.',
			// Text used as an error label when the user submitted a custom resize form with an incorrect value.
			'The value should be a plain number.': 'يجب أن تكون القيمة رقماً عادياً.'
		},
		getPluralForm: ( n: number ) => (n == 0 ? 0 : n == 1 ? 1 : n == 2 ? 2 : n % 100 >= 3 && n % 100 <= 10 ? 3 : n % 100 >= 11 ? 4 : 5)
	}
};

export default translations;
