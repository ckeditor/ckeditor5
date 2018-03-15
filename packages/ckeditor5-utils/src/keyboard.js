/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * Set of utils related to keyboard support.
 *
 * @module utils/keyboard
 */

import CKEditorError from './ckeditorerror';
import env from './env';

const macGlyphsToModifiers = {
	'⌘': 'ctrl',
	'⇧': 'shift',
	'⌥': 'alt'
};

const modifiersToMacGlyphs = {
	'ctrl': '⌘',
	'shift': '⇧',
	'alt': '⌥'
};

/**
 * Object with `keyName => keyCode` pairs for a set of known keys.
 *
 * Contains:
 *
 * * `a-z`,
 * * `0-9`,
 * * `f1-f12`,
 * * `arrow(left|up|right|bottom)`,
 * * `backspace`, `delete`, `enter`, `esc`, `tab`,
 * * `ctrl`, `cmd`, `shift`, `alt`.
 */
export const keyCodes = generateKnownKeyCodes();

/**
 * Converts a key name or a {@link module:utils/keyboard~KeystrokeInfo keystroke info} into a key code.
 *
 * Note: Key names are matched with {@link module:utils/keyboard~keyCodes} in a case-insensitive way.
 *
 * @param {String|module:utils/keyboard~KeystrokeInfo} Key name (see {@link module:utils/keyboard~keyCodes})
 * or a keystroke data object.
 * @returns {Number} Key or keystroke code.
 */
export function getCode( key ) {
	let keyCode;

	if ( typeof key == 'string' ) {
		keyCode = keyCodes[ key.toLowerCase() ];

		if ( !keyCode ) {
			/**
			 * Unknown key name. Only key names contained by the {@link module:utils/keyboard~keyCodes} can be used.
			 *
			 * @errror keyboard-unknown-key
			 * @param {String} key
			 */
			throw new CKEditorError( 'keyboard-unknown-key: Unknown key name.', { key } );
		}
	} else {
		keyCode = key.keyCode +
			( key.altKey ? keyCodes.alt : 0 ) +
			( key.ctrlKey ? keyCodes.ctrl : 0 ) +
			( key.shiftKey ? keyCodes.shift : 0 );
	}

	return keyCode;
}

/**
 * Parses keystroke and returns a keystroke code that will match the code returned by
 * link {@link module:utils/keyboard.getCode} for a corresponding {@link module:utils/keyboard~KeystrokeInfo keystroke info}.
 *
 * The keystroke can be passed in two formats:
 *
 * * as a single string – e.g. `ctrl + A`,
 * * as an array of {@link module:utils/keyboard~keyCodes known key names} and key codes – e.g.:
 *   * `[ 'ctrl', 32 ]` (ctrl + space),
 *   * `[ 'ctrl', 'a' ]` (ctrl + A).
 *
 * Note: Key names are matched with {@link module:utils/keyboard~keyCodes} in a case-insensitive way.
 *
 * Note: Only keystrokes with a single non-modifier key are supported (e.g. `ctrl+A` is OK, but `ctrl+A+B` is not).
 *
 * @param {String|Array.<Number|String>} keystroke Keystroke definition.
 * @returns {Number} Keystroke code.
 */
export function parseKeystroke( keystroke ) {
	if ( typeof keystroke == 'string' ) {
		keystroke = splitKeystrokeText( keystroke );
	}

	return keystroke
		.map( key => ( typeof key == 'string' ) ? getCode( key ) : key )
		.reduce( ( key, sum ) => sum + key, 0 );
}

/**
 * It translates any keystroke string text like `"CTRL+A"` to an
 * environment–specific keystroke, i.e. `"⌘A"` on Mac OSX.
 *
 * @param {String} keystroke Keystroke text.
 * @returns {String} Keystroke text specific for the environment.
 */
export function getEnvKeystrokeText( keystroke ) {
	if ( !env.isMac ) {
		return keystroke;
	}

	return splitKeystrokeText( keystroke )
		// Replace modifiers (e.g. "ctrl") with Mac glyphs (e.g. "⌘") first.
		.map( key => modifiersToMacGlyphs[ key.toLowerCase() ] || key )

		// Decide whether to put "+" between keys in the keystroke or not.
		.reduce( ( value, key ) => {
			if ( value.slice( -1 ) in macGlyphsToModifiers ) {
				return value + key;
			} else {
				return value + '+' + key;
			}
		} );
}

function generateKnownKeyCodes() {
	const keyCodes = {
		arrowleft: 37,
		arrowup: 38,
		arrowright: 39,
		arrowdown: 40,
		backspace: 8,
		delete: 46,
		enter: 13,
		space: 32,
		esc: 27,
		tab: 9,

		// The idea about these numbers is that they do not collide with any real key codes, so we can use them
		// like bit masks.
		ctrl: 0x110000,
		// Has the same code as ctrl, because their behaviour should be unified across the editor.
		// See http://ckeditor.github.io/editor-recommendations/general-policies#ctrl-vs-cmd
		cmd: 0x110000,
		shift: 0x220000,
		alt: 0x440000
	};

	// a-z
	for ( let code = 65; code <= 90; code++ ) {
		const letter = String.fromCharCode( code );

		keyCodes[ letter.toLowerCase() ] = code;
	}

	// 0-9
	for ( let code = 48; code <= 57; code++ ) {
		keyCodes[ code - 48 ] = code;
	}

	// F1-F12
	for ( let code = 112; code <= 123; code++ ) {
		keyCodes[ 'f' + ( code - 111 ) ] = code;
	}

	return keyCodes;
}

function splitKeystrokeText( keystroke ) {
	return keystroke.split( /\s*\+\s*/ );
}

/**
 * Information about a keystroke.
 *
 * @interface module:utils/keyboard~KeystrokeInfo
 */

/**
 * The [key code](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode).
 *
 * @member {Number} module:utils/keyboard~KeystrokeInfo#keyCode
 */

/**
 * Whether the <kbd>Alt</kbd> modifier was pressed.
 *
 * @member {Bolean} module:utils/keyboard~KeystrokeInfo#altKey
 */

/**
 * Whether the <kbd>Ctrl</kbd> or <kbd>Cmd</kbd> modifier was pressed.
 *
 * @member {Bolean} module:utils/keyboard~KeystrokeInfo#ctrlKey
 */

/**
 * Whether the <kbd>Shift</kbd> modifier was pressed.
 *
 * @member {Bolean} module:utils/keyboard~KeystrokeInfo#shiftKey
 */
