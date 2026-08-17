/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'ar': {
		dictionary: {
			// Toolbar button tooltip for the Unlink feature.
			'Unlink': 'إلغاء الرابط',
			// Toolbar button tooltip for the Link feature.
			'Link': 'رابط',
			// Label for the URL input in the Link URL editing balloon.
			'Link URL': 'رابط عنوان',
			// An error text displayed when user attempted to enter an empty URL.
			'Link URL must not be empty.': 'يجب ألا يكون عنوان الرابط فارغاً.',
			// Label for the image link button.
			'Link image': 'ربط الصورة',
			// Label for the link properties link balloon title.
			'Link properties': 'خصائص الرابط',
			// Button opening the Link URL editing balloon.
			'Edit link': 'تحرير الرابط',
			// Button opening the link in new browser tab.
			'Open link in new tab': 'فتح الرابط في تبويب جديد',
			// The label of the switch button that controls whether the edited link will open in a new tab.
			'Open in a new tab': 'فتح في تبويب جديد',
			// The label of the switch button that controls whether the edited link refers to downloadable resource.
			'Downloadable': 'يمكن تنزيله',
			// Keystroke description for assistive technologies: keystroke for creating a link.
			'Create link': 'قمْ بإنشاء رابط',
			// Keystroke description for assistive technologies: keystroke for moving out of a link.
			'Move out of a link': 'ابتعدْ عن الرابط',
			// The label of the input field for the displayed text of the link.
			'Displayed text': 'النص المعروض',
			// Placeholder shown when placeholder items view is empty.
			'No links available': 'لا توجد روابط متاحة',
			// The label of the switch button shown when link has empty href attribute.
			'This link has no URL': 'هذا الرابط ليس له عنوان URL'
		}
	}
};

export default translations;
