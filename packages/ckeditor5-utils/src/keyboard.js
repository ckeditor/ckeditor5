/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * A set of utilities related to keyboard support.
 *
 * @module utils/keyboard
 */

import CKEditorError from './ckeditorerror';
import env from './env';

const modifiersToGlyphsMac = {
	ctrl: '⌃',
	cmd: '⌘',
	alt: '⌥',
	shift: '⇧'
};

const modifiersToGlyphsNonMac = {
	ctrl: 'Ctrl+',
	alt: 'Alt+',
	shift: 'Shift+'
};

/**
 * An object with `keyName => keyCode` pairs for a set of known keys.
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

const keyCodeNames = Object.fromEntries(
	Object.entries( keyCodes ).map( ( [ name, code ] ) => [ code, name.charAt( 0 ).toUpperCase() + name.slice( 1 ) ] )
);

/**
 * Converts a key name or {@link module:utils/keyboard~KeystrokeInfo keystroke info} into a key code.
 *
 * Note: Key names are matched with {@link module:utils/keyboard~keyCodes} in a case-insensitive way.
 *
 * @param {String|module:utils/keyboard~KeystrokeInfo} A key name (see {@link module:utils/keyboard~keyCodes})
 * or a keystroke data object.
 * @returns {Number} Key or keystroke code.
 */
export function getCode( key ) {
	let keyCode;

	if ( typeof key == 'string' ) {
		keyCode = keyCodes[ key.toLowerCase() ];

		if ( !keyCode ) {
			/**
			 * Unknown key name. Only key names included in the {@link module:utils/keyboard~keyCodes} can be used.
			 *
			 * @error keyboard-unknown-key
			 * @param {String} key
			 */
			throw new CKEditorError( 'keyboard-unknown-key', null, { key } );
		}
	} else {
		keyCode = key.keyCode +
			( key.altKey ? keyCodes.alt : 0 ) +
			( key.ctrlKey ? keyCodes.ctrl : 0 ) +
			( key.shiftKey ? keyCodes.shift : 0 ) +
			( key.metaKey ? keyCodes.cmd : 0 );
	}

	return keyCode;
}

/**
 * Parses the keystroke and returns a keystroke code that will match the code returned by
 * {@link module:utils/keyboard~getCode} for the corresponding {@link module:utils/keyboard~KeystrokeInfo keystroke info}.
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
 * Note: On macOS, keystroke handling is translating the `Ctrl` key to the `Cmd` key and handling only that keystroke.
 * For example, a registered keystroke `Ctrl+A` will be translated to `Cmd+A` on macOS. To disable the translation of some keystroke,
 * use the forced modifier: `Ctrl!+A` (note the exclamation mark).
 *
 * @param {String|Array.<Number|String>} keystroke The keystroke definition.
 * @returns {Number} Keystroke code.
 */
export function parseKeystroke( keystroke ) {
	if ( typeof keystroke == 'string' ) {
		keystroke = splitKeystrokeText( keystroke );
	}

	return keystroke
		.map( key => ( typeof key == 'string' ) ? getEnvKeyCode( key ) : key )
		.reduce( ( key, sum ) => sum + key, 0 );
}

/**
 * Translates any keystroke string text like `"Ctrl+A"` to an
 * environment–specific keystroke, i.e. `"⌘A"` on macOS.
 *
 * @param {String} keystroke The keystroke text.
 * @returns {String} The keystroke text specific for the environment.
 */
export function getEnvKeystrokeText( keystroke ) {
	let keystrokeCode = parseKeystroke( keystroke );

	const modifiersToGlyphs = Object.entries( env.isMac ? modifiersToGlyphsMac : modifiersToGlyphsNonMac );

	const modifiers = modifiersToGlyphs.reduce( ( modifiers, [ name, glyph ] ) => {
		// Modifier keys are stored as a bit mask so extract those from the keystroke code.
		if ( ( keystrokeCode & keyCodes[ name ] ) != 0 ) {
			keystrokeCode &= ~keyCodes[ name ];
			modifiers += glyph;
		}

		return modifiers;
	}, '' );

	return modifiers + ( keystrokeCode ? keyCodeNames[ keystrokeCode ] : '' );
}

/**
 * Returns `true` if the provided key code represents one of the arrow keys.
 *
 * @param {Number} keyCode A key code as in {@link module:utils/keyboard~KeystrokeInfo#keyCode}.
 * @returns {Boolean}
 */
export function isArrowKeyCode( keyCode ) {
	return keyCode == keyCodes.arrowright ||
		keyCode == keyCodes.arrowleft ||
		keyCode == keyCodes.arrowup ||
		keyCode == keyCodes.arrowdown;
}

/**
 * Returns the direction in which the {@link module:engine/model/documentselection~DocumentSelection selection}
 * will move when the provided arrow key code is pressed considering the language direction of the editor content.
 *
 * For instance, in right–to–left (RTL) content languages, pressing the left arrow means moving the selection right (forward)
 * in the model structure. Similarly, pressing the right arrow moves the selection left (backward).
 *
 * @param {Number} keyCode A key code as in {@link module:utils/keyboard~KeystrokeInfo#keyCode}.
 * @param {'ltr'|'rtl'} contentLanguageDirection The content language direction, corresponding to
 * {@link module:utils/locale~Locale#contentLanguageDirection}.
 * @returns {'left'|'up'|'right'|'down'} Localized arrow direction.
 */
export function getLocalizedArrowKeyCodeDirection( keyCode, contentLanguageDirection ) {
	const isLtrContent = contentLanguageDirection === 'ltr';

	switch ( keyCode ) {
		case keyCodes.arrowleft:
			return isLtrContent ? 'left' : 'right';

		case keyCodes.arrowright:
			return isLtrContent ? 'right' : 'left';

		case keyCodes.arrowup:
			return 'up';

		case keyCodes.arrowdown:
			return 'down';
	}
}

// Converts a key name to the key code with mapping based on the env.
//
// See: {@link module:utils/keyboard~getCode}.
//
// @param {String} key The key name (see {@link module:utils/keyboard~keyCodes}).
// @returns {Number} Key code.
function getEnvKeyCode( key ) {
	// Don't remap modifier key for forced modifiers.
	if ( key.endsWith( '!' ) ) {
		return getCode( key.slice( 0, -1 ) );
	}

	const code = getCode( key );

	return env.isMac && code == keyCodes.ctrl ? keyCodes.cmd : code;
}

/**
 * Determines if the provided key code moves the {@link module:engine/model/documentselection~DocumentSelection selection}
 * forward or backward considering the language direction of the editor content.
 *
 * For instance, in right–to–left (RTL) languages, pressing the left arrow means moving forward
 * in the model structure. Similarly, pressing the right arrow moves the selection backward.
 *
 * @param {Number} keyCode A key code as in {@link module:utils/keyboard~KeystrokeInfo#keyCode}.
 * @param {'ltr'|'rtl'} contentLanguageDirection The content language direction, corresponding to
 * {@link module:utils/locale~Locale#contentLanguageDirection}.
 * @returns {Boolean}
 */
export function isForwardArrowKeyCode( keyCode, contentLanguageDirection ) {
	const localizedKeyCodeDirection = getLocalizedArrowKeyCodeDirection( keyCode, contentLanguageDirection );

	return localizedKeyCodeDirection === 'down' || localizedKeyCodeDirection === 'right';
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
		shift: 0x220000,
		alt: 0x440000,
		cmd: 0x880000
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
 * Information about the keystroke.
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
 * @member {Boolean} module:utils/keyboard~KeystrokeInfo#altKey
 */

/**
 * Whether the <kbd>Ctrl</kbd> modifier was pressed.
 *
 * @member {Boolean} module:utils/keyboard~KeystrokeInfo#ctrlKey
 */

/**
 * Whether the <kbd>Shift</kbd> modifier was pressed.
 *
 * @member {Boolean} module:utils/keyboard~KeystrokeInfo#shiftKey
 */

/**
 * Whether the <kbd>Cmd</kbd> modifier was pressed.
 *
 * @member {Boolean} module:utils/keyboard~KeystrokeInfo#metaKey
 */
