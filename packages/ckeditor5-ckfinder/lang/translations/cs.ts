/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'cs': {
		dictionary: {
			// Toolbar button tooltip for inserting an image or file via a CKFinder file browser.
			'Insert image or file': 'Vložit obrázek nebo soubor',
			// Error message displayed when inserting a resized version of an image failed.
			'Could not obtain resized image URL.': 'Nelze získat URL obrázku se změněnou velikostí.',
			// Title of a notification displayed when inserting a resized version of an image failed.
			'Selecting resized image failed': 'Výběr obrázku se změněnou velikostí selhal',
			// Error message displayed when an image cannot be inserted at the current position.
			'Could not insert image at the current position.': 'Na současnou pozici nelze vložit obrázek.',
			// Title of a notification displayed when an image cannot be inserted at the current position.
			'Inserting image failed': 'Vložení obrázku selhalo'
		}
	}
};

export default translations;
