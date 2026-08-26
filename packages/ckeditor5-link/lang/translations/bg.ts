/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'bg': {
		dictionary: {
			// Toolbar button tooltip for the Unlink feature.
			'Unlink': 'Премахване на линка',
			// Toolbar button tooltip for the Link feature.
			'Link': 'Линк',
			// Label for the URL input in the Link URL editing balloon.
			'Link URL': 'Уеб адрес на линка',
			// An error text displayed when user attempted to enter an empty URL.
			'Link URL must not be empty.': 'URL препратката не трябва да е празна.',
			// Label for the image link button.
			'Link image': 'Свържи изображение',
			// Label for the link properties link balloon title.
			'Link properties': 'Свойства на връзката',
			// Button opening the Link URL editing balloon.
			'Edit link': 'Редакция на линк',
			// Button opening the link in new browser tab.
			'Open link in new tab': 'Отваряне на линк в нов раздел',
			// The label of the switch button that controls whether the edited link will open in a new tab.
			'Open in a new tab': 'Отваряне в нов раздел',
			// The label of the switch button that controls whether the edited link refers to downloadable resource.
			'Downloadable': 'Изтегляне',
			// Keystroke description for assistive technologies: keystroke for creating a link.
			'Create link': 'Създаване на линк',
			// Keystroke description for assistive technologies: keystroke for moving out of a link.
			'Move out of a link': 'Излизане от линк',
			// The label of the input field for the displayed text of the link.
			'Displayed text': 'Показан текст',
			// Placeholder shown when placeholder items view is empty.
			'No links available': 'Няма налични връзки',
			// The label of the switch button shown when link has empty href attribute.
			'This link has no URL': 'Тази връзка няма URL адрес'
		}
	}
};

export default translations;
