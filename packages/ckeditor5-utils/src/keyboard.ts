/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * A set of utilities related to keyboard support.
 *
 * @module utils/keyboard
 */

import type { LanguageDirection } from './language';
import CKEditorError from './ckeditorerror';
import env from './env';

const modifiersToGlyphsMac = {
	ctrl: '⌃',
	cmd: '⌘',
	alt: '⌥',
	shift: '⇧'
} as const;

const modifiersToGlyphsNonMac = {
	ctrl: 'Ctrl+',
	alt: 'Alt+',
	shift: 'Shift+'
} as const;

/**
 * An object with `keyName => keyCode` pairs for a set of known keys.
 *
 * Contains:
 *
 * * `a-z`,
 * * `0-9`,
 * * `f1-f12`,
 * * `` ` ``, `-`, `=`, `[`, `]`, `;`, `'`, `,`, `.`, `/`, `\`,
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
 * Note: Key names are matched with {@link module:utils/keyboard#keyCodes} in a case-insensitive way.
 *
 * @param key A key name (see {@link module:utils/keyboard#keyCodes}) or a keystroke data object.
 * @returns Key or keystroke code.
 */
export function getCode( key: string | Readonly<KeystrokeInfo> ): number {
	let keyCode: number | undefined;

	if ( typeof key == 'string' ) {
		keyCode = keyCodes[ key.toLowerCase() ];

		if ( !keyCode ) {
			/**
			 * Unknown key name. Only key names included in the {@link module:utils/keyboard#keyCodes} can be used.
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
 * Note: Key names are matched with {@link module:utils/keyboard#keyCodes} in a case-insensitive way.
 *
 * Note: Only keystrokes with a single non-modifier key are supported (e.g. `ctrl+A` is OK, but `ctrl+A+B` is not).
 *
 * Note: On macOS, keystroke handling is translating the `Ctrl` key to the `Cmd` key and handling only that keystroke.
 * For example, a registered keystroke `Ctrl+A` will be translated to `Cmd+A` on macOS. To disable the translation of some keystroke,
 * use the forced modifier: `Ctrl!+A` (note the exclamation mark).
 *
 * @param keystroke The keystroke definition.
 * @returns Keystroke code.
 */
export function parseKeystroke( keystroke: string | ReadonlyArray<number | string> ): number {
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
 * @param keystroke The keystroke text.
 * @returns The keystroke text specific for the environment.
 */
export function getEnvKeystrokeText( keystroke: string ): string {
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
 * @param keyCode A key code as in {@link module:utils/keyboard~KeystrokeInfo#keyCode}.
 */
export function isArrowKeyCode( keyCode: number ): boolean {
	return keyCode == keyCodes.arrowright ||
		keyCode == keyCodes.arrowleft ||
		keyCode == keyCodes.arrowup ||
		keyCode == keyCodes.arrowdown;
}

/**
 * String representing a direction of an arrow key kode.
 */
export type ArrowKeyCodeDirection = 'left' | 'up' | 'right' | 'down';

/**
 * Returns the direction in which the {@link module:engine/model/documentselection~DocumentSelection selection}
 * will move when the provided arrow key code is pressed considering the language direction of the editor content.
 *
 * For instance, in right–to–left (RTL) content languages, pressing the left arrow means moving the selection right (forward)
 * in the model structure. Similarly, pressing the right arrow moves the selection left (backward).
 *
 * @param keyCode A key code as in {@link module:utils/keyboard~KeystrokeInfo#keyCode}.
 * @param contentLanguageDirection The content language direction, corresponding to
 * {@link module:utils/locale~Locale#contentLanguageDirection}.
 * @returns Localized arrow direction or `undefined` for non-arrow key codes.
 */
export function getLocalizedArrowKeyCodeDirection(
	keyCode: number,
	contentLanguageDirection: LanguageDirection
): ArrowKeyCodeDirection | undefined {
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

/**
 * Converts a key name to the key code with mapping based on the env.
 *
 * See: {@link module:utils/keyboard~getCode}.
 *
 * @param key The key name (see {@link module:utils/keyboard#keyCodes}).
 * @returns Key code.
 */
function getEnvKeyCode( key: string ): number {
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
 * @param keyCode A key code as in {@link module:utils/keyboard~KeystrokeInfo#keyCode}.
 * @param contentLanguageDirection The content language direction, corresponding to
 * {@link module:utils/locale~Locale#contentLanguageDirection}.
 */
export function isForwardArrowKeyCode(
	keyCode: number,
	contentLanguageDirection: LanguageDirection
): boolean {
	const localizedKeyCodeDirection = getLocalizedArrowKeyCodeDirection( keyCode, contentLanguageDirection );

	return localizedKeyCodeDirection === 'down' || localizedKeyCodeDirection === 'right';
}

function generateKnownKeyCodes(): { readonly [ keyCode: string ]: number } {
	const keyCodes: { [keyCode: string]: number } = {
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

	// other characters
	for ( const char of '`-=[];\',./\\' ) {
		keyCodes[ char ] = char.charCodeAt( 0 );
	}

	return keyCodes;
}

function splitKeystrokeText( keystroke: string ): Array<string> {
	return keystroke.split( '+' ).map( key => key.trim() );
}

/**
 * Information about the keystroke.
 */
export interface KeystrokeInfo {

	/**
	 * The [key code](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode).
	 */
	keyCode: number;

	/**
	 * Whether the <kbd>Alt</kbd> modifier was pressed.
	 */
	altKey: boolean;

	/**
	 * Whether the <kbd>Cmd</kbd> modifier was pressed.
	 */
	metaKey: boolean;

	/**
	 * Whether the <kbd>Ctrl</kbd> modifier was pressed.
	 */
	ctrlKey: boolean;

	/**
	 * Whether the <kbd>Shift</kbd> modifier was pressed.
	 */
	shiftKey: boolean;
}
