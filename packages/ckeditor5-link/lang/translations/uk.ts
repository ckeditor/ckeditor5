/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'uk': {
		dictionary: {
			// Toolbar button tooltip for the Unlink feature.
			'Unlink': 'Видалити посилання',
			// Toolbar button tooltip for the Link feature.
			'Link': 'Посилання',
			// Label for the URL input in the Link URL editing balloon.
			'Link URL': 'URL посилання',
			// An error text displayed when user attempted to enter an empty URL.
			'Link URL must not be empty.': 'URL-адреса посилання не може бути порожньою.',
			// Label for the image link button.
			'Link image': 'Посилання зображення',
			// Label for the link properties link balloon title.
			'Link properties': 'Властивості посилання',
			// Button opening the Link URL editing balloon.
			'Edit link': 'Редагувати посилання',
			// Button opening the link in new browser tab.
			'Open link in new tab': 'Відкрити посилання у новій вкладці',
			// The label of the switch button that controls whether the edited link will open in a new tab.
			'Open in a new tab': 'Вікрити у новій вкладці',
			// The label of the switch button that controls whether the edited link refers to downloadable resource.
			'Downloadable': 'Завантажувальне',
			// Keystroke description for assistive technologies: keystroke for creating a link.
			'Create link': 'Створити посилання',
			// Keystroke description for assistive technologies: keystroke for moving out of a link.
			'Move out of a link': 'Вийти з посилання',
			// The label of the input field for the displayed text of the link.
			'Displayed text': 'Відображений текст',
			// Placeholder shown when placeholder items view is empty.
			'No links available': 'Немає доступних посилань',
			// The label of the switch button shown when link has empty href attribute.
			'This link has no URL': 'Ця посилання не має URL-адреси'
		}
	}
};

export default translations;
