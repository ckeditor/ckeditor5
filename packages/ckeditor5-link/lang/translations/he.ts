/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'he': {
		dictionary: {
			// Toolbar button tooltip for the Unlink feature.
			'Unlink': 'ביטול קישור',
			// Toolbar button tooltip for the Link feature.
			'Link': 'קישור',
			// Label for the URL input in the Link URL editing balloon.
			'Link URL': 'קישור כתובת אתר',
			// An error text displayed when user attempted to enter an empty URL.
			'Link URL must not be empty.': 'כתובת ה-URL של הקישור לא יכולה להיות ריקה.',
			// Label for the image link button.
			'Link image': 'קישור תמונה',
			// Label for the link properties link balloon title.
			'Link properties': 'מאפייני קישור',
			// Button opening the Link URL editing balloon.
			'Edit link': 'עריכת קישור',
			// Button opening the link in new browser tab.
			'Open link in new tab': 'פתח קישור בכרטיסייה חדשה',
			// The label of the switch button that controls whether the edited link will open in a new tab.
			'Open in a new tab': 'פתח בכרטיסייה חדשה',
			// The label of the switch button that controls whether the edited link refers to downloadable resource.
			'Downloadable': 'ניתן להורדה',
			// Keystroke description for assistive technologies: keystroke for creating a link.
			'Create link': 'יצירת קישור',
			// Keystroke description for assistive technologies: keystroke for moving out of a link.
			'Move out of a link': 'יציאה מקישור',
			// The label of the input field for the displayed text of the link.
			'Displayed text': 'טקסט מוצג',
			// Placeholder shown when placeholder items view is empty.
			'No links available': 'אין קישורים זמינים',
			// The label of the switch button shown when link has empty href attribute.
			'This link has no URL': 'לקישור הזה אין URL'
		}
	}
};

export default translations;
