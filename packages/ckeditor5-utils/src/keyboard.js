/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import CKEditorError from './ckeditorerror.js';

/**
 * Set of utils related to keyboard support.
 *
 * @namespace utils.keyboard
 */

/**
 * Object with `keyName => keyCode` pairs.
 *
 * Contains:
 *
 * * `a-z`,
 * * `0-9`,
 * * `arrow(left|up|right|bottom)`,
 * * `backspace`, `delete`, `enter`,
 * * `ctrl`, `cmd`, `shift`, `alt`.
 *
 * @member {Object} utils.keyboard.knownKeyNames
 */
export const knownKeyNames = generateKnownKeyNames();

/**
 * Converts a key name or a {@link utils.keyboard.KeystrokeInfo keystroke info} into a key code.
 *
 * Note: Key names are matched with {@link utils.keyboard.knownKeyNames} in a case-insensitive way.
 *
 * @method utils.keyboard.getCode
 * @param {String|utils.keyboard.KeystrokeInfo} Key name (see {@link utils.keyboard.knownKeyNames})
 * or a keystroke data object.
 * @returns {Number} Key or keystroke code.
 */
export function getCode( key ) {
	let keyCode;

	if ( typeof key == 'string' ) {
		keyCode = knownKeyNames[ key.toLowerCase() ];

		if ( !keyCode ) {
			throw new CKEditorError( 'keyboard-unknown-key: Unknown key name.', { key } );
		}
	} else {
		keyCode = key.keyCode +
			( key.altKey ? knownKeyNames.alt : 0 ) +
			( key.ctrlKey ? knownKeyNames.ctrl : 0 ) +
			( key.shiftKey ? knownKeyNames.shift : 0 );
	}

	return keyCode;
}

/**
 * Parses keystroke and returns a keystroke code that will match the code returned by
 * link {@link utils.keyboard.getCode} for a corresponding {@link utils.keyboard.KeystrokeInfo keystroke info}.
 *
 * The keystroke can be passed in two formats:
 *
 * * as a single string – e.g. `ctrl + A`,
 * * as an array of {@link utils.keyboard.knownKeyNames known key names} and key codes – e.g.:
 *   * `[ 'ctrl', 32 ]` (ctrl + space),
 *   * `[ 'ctrl', 'a' ]` (ctrl + A).
 *
 * Note: Key names are matched with {@link utils.keyboard.knownKeyNames} in a case-insensitive way.
 *
 * Note: Only keystrokes with a single non-modifier key are supported (e.g. `ctrl+A` is OK, but `ctrl+A+B` is not).
 *
 * @method utils.keyboard.parseKeystroke
 * @param {String|Array.<Number|String>} keystroke Keystroke definition.
 * @returns {Number} Keystroke code.
 */
export function parseKeystroke( keystroke ) {
	if ( typeof keystroke == 'string' ) {
		keystroke = keystroke.split( /\s*\+\s*/ );
	}

	return keystroke
		.map( key => ( typeof key == 'string' ) ? getCode( key ) : key )
		.reduce( ( key, sum ) => sum + key, 0 );
}

function generateKnownKeyNames() {
	const knownKeyNames = {
		arrowleft: 37,
		arrowup: 38,
		arrowright: 39,
		arrowdown: 40,
		backspace: 8,
		delete: 46,
		enter: 13,

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

		knownKeyNames[ letter.toLowerCase() ] = code;
	}

	// 0-9
	for ( let code = 48; code <= 57; code++ ) {
		knownKeyNames[ code - 48 ] = code;
	}

	return knownKeyNames;
}

/**
 * Information about a keystroke.
 *
 * @interface utils.keyboard.KeystrokeInfo
 */

/**
 * The [key code](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode).
 *
 * @member {Number} utils.keyboard.KeystrokeInfo#keyCode
 */

/**
 * Whether the <kbd>Alt</kbd> modifier was pressed.
 *
 * @member {Bolean} utils.keyboard.KeystrokeInfo#altKey
 */

/**
 * Whether the <kbd>Ctrl</kbd> or <kbd>Cmd</kbd> modifier was pressed.
 *
 * @member {Bolean} utils.keyboard.KeystrokeInfo#ctrlKey
 */

/**
 * Whether the <kbd>Shift</kbd> modifier was pressed.
 *
 * @member {Bolean} utils.keyboard.KeystrokeInfo#shiftKey
 */
