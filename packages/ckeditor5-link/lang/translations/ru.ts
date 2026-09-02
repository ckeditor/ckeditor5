/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'ru': {
		dictionary: {
			// Toolbar button tooltip for the Unlink feature.
			'Unlink': 'Убрать ссылку',
			// Toolbar button tooltip for the Link feature.
			'Link': 'Ссылка',
			// Label for the URL input in the Link URL editing balloon.
			'Link URL': 'Ссылка URL',
			// An error text displayed when user attempted to enter an empty URL.
			'Link URL must not be empty.': 'URL-адрес ссылки не должен быть пустым.',
			// Label for the image link button.
			'Link image': 'Ссылка на изображение',
			// Label for the link properties link balloon title.
			'Link properties': 'Свойства ссылки',
			// Button opening the Link URL editing balloon.
			'Edit link': 'Редактировать ссылку',
			// Button opening the link in new browser tab.
			'Open link in new tab': 'Открыть ссылку в новой вкладке',
			// The label of the switch button that controls whether the edited link will open in a new tab.
			'Open in a new tab': 'Открыть в новой вкладке',
			// The label of the switch button that controls whether the edited link refers to downloadable resource.
			'Downloadable': 'Загружаемые',
			// Keystroke description for assistive technologies: keystroke for creating a link.
			'Create link': 'Создать ссылку',
			// Keystroke description for assistive technologies: keystroke for moving out of a link.
			'Move out of a link': 'Выйти из ссылки',
			// The label of the input field for the displayed text of the link.
			'Displayed text': 'Отображаемый текст',
			// Placeholder shown when placeholder items view is empty.
			'No links available': 'Нет доступных ссылок',
			// The label of the switch button shown when link has empty href attribute.
			'This link has no URL': 'У этой ссылки нет URL-адреса'
		}
	}
};

export default translations;
