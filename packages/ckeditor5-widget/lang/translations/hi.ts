/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'hi': {
		dictionary: {
			// The label used by assistive technologies describing a toolbar attached to a widget.
			'Widget toolbar': 'Widget toolbar',
			// The title displayed when a mouse is over a button that inserts a paragraph before a block.
			'Insert paragraph before block': 'Insert paragraph before block',
			// The title displayed when a mouse is over a button that inserts a paragraph after a block.
			'Insert paragraph after block': 'Insert paragraph after block',
			// Information to be read by screen reader about shortcuts to type around a widget.
			'Press Enter to type after or press Shift + Enter to type before the widget': 'विजेट के बाद टाइप करने के लिए एंटर  दबाएं या पहले टाइप करने के लिए शिफ्ट+एंटर दबाएं',
			// Accessibility help dialog section title for widget plugin keystrokes.
			'Keystrokes that can be used when a widget is selected (for example: image, table, etc.)': 'वे कीस्ट्रोक्स जिनका इस्तेमाल किसी विजेट के सेलेक्ट किए जाने पर किया जा सकता है (जैसे: इमेज, टेबल, आदि)',
			// Accessibility help dialog entry explaining the meaning of the keystroke that inserts a paragraph after a widget.
			'Insert a new paragraph directly after a widget': 'किसी विजेट के ठीक आगे एक नया पैराग्राफ़ इंसर्ट करें',
			// Accessibility help dialog entry explaining the meaning of the keystroke that inserts a paragraph before a widget.
			'Insert a new paragraph directly before a widget': 'किसी विजेट के ठीक पीछे एक नया पैराग्राफ़ इंसर्ट करें',
			// Accessibility help dialog entry explaining the meaning of the keystroke that moves the caret before a widget.
			'Move the caret to allow typing directly before a widget': 'किसी विजेट के ठीक पीछे टाइप करने के लिए कैरेट को मूव करें',
			// Accessibility help dialog entry explaining the meaning of the keystroke that moves the caret after a widget.
			'Move the caret to allow typing directly after a widget': 'किसी विजेट के ठीक आगे टाइप करने के लिए कैरेट को मूव करें',
			// Accessibility help dialog entry explaining the meaning of the keystroke that moves selection from a nested editable area back to the parent widget.
			'Move focus from an editable area back to the parent widget': 'एक एडिटेबल एरिया से पेरेंट विजेट पर फ़ोकस वापिस लाएँ'
		}
	}
};

export default translations;
