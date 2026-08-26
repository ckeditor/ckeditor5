/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'ru': {
		dictionary: {
			// A label of the button indicating that using this button will make a selected text or blocks non–editable.
			'Disable editing': 'Отключить редактирование',
			// A label of the button indicating that using this button will make a selected text or blocks editable.
			'Enable editing': 'Разрешить редактирование',
			// A label of the button indicating that using this button will make a selected text non–editable.
			'Disable inline editing': 'Отключить встроенное редактирование',
			// A label of the button indicating that using this button will make a selected text editable.
			'Enable inline editing': 'Включить встроенное редактирование',
			// A label of the button indicating that using this button will make a selected blocks non–editable.
			'Disable block editing': 'Отключить блочное редактирование',
			// A label of the button indicating that using this button will make a selected blocks editable.
			'Enable block editing': 'Включить блочное редактирование',
			// A label of the button that moves selection to the previous editable region in the content.
			'Previous editable region': 'Предыдущий редактируемый регион',
			// A label of the button that moves selection to the next editable region in the content.
			'Next editable region': 'Следующий редактируемый регион',
			// A label of the dropdown that provides controls to navigate editable regions in the content.
			'Navigate editable regions': 'Навигация по редактируемым регионам'
		}
	}
};

export default translations;
