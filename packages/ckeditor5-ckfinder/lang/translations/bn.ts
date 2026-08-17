/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'bn': {
		dictionary: {
			// Toolbar button tooltip for inserting an image or file via a CKFinder file browser.
			'Insert image or file': 'ছবি অথবা ফাইল ঢোকান',
			// Error message displayed when inserting a resized version of an image failed.
			'Could not obtain resized image URL.': 'আকার পরিবর্তন করা ছবির URL পাওয়া যাচ্ছে না।',
			// Title of a notification displayed when inserting a resized version of an image failed.
			'Selecting resized image failed': 'আকার পরিবর্তন করা ছবি নির্বাচন করা ব্যর্থ হয়েছে',
			// Error message displayed when an image cannot be inserted at the current position.
			'Could not insert image at the current position.': 'বর্তমান অবস্থানে ছবি ঢোকানো যাচ্ছে না।',
			// Title of a notification displayed when an image cannot be inserted at the current position.
			'Inserting image failed': 'ছবি ঢোকানো ব্যর্থ হয়েছে।'
		}
	}
};

export default translations;
