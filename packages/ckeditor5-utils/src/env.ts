/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/env
 */

import global from './dom/global.js';

/**
 * Safely returns `userAgent` from browser's navigator API in a lower case.
 * If navigator API is not available it will return an empty string.
 */
export function getUserAgent(): string {
	// In some environments navigator API might not be available.
	try {
		return navigator.userAgent.toLowerCase();
	} catch {
		return '';
	}
}

const userAgent = /* #__PURE__ */ getUserAgent();

// This interface exists to make our API pages more readable.
/**
 * A namespace containing environment and browser information.
 */
export interface EnvType {

	/**
	 * Indicates that the application is running on Macintosh.
	 */
	readonly isMac: boolean;

	/**
	 * Indicates that the application is running on Windows.
	 */
	readonly isWindows: boolean;

	/**
	 * Indicates that the application is running in Firefox (Gecko).
	 */
	readonly isGecko: boolean;

	/**
	 * Indicates that the application is running in Safari.
	 */
	readonly isSafari: boolean;

	/**
	 * Indicates that the application is running in iOS.
	 */
	readonly isiOS: boolean;

	/**
	 * Indicates that the application is running on Android mobile device.
	 */
	readonly isAndroid: boolean;

	/**
	 * Indicates that the application is running in a browser using the Blink engine.
	 */
	readonly isBlink: boolean;

	/**
	 * Indicates that the user agent has enabled a forced colors mode (e.g. Windows High Contrast mode).
	 *
	 * Note that the value of this property is evaluated each time it is accessed, and it may change over time, if the environment
	 * settings have changed.
	 */
	readonly isMediaForcedColors: boolean;

	/**
	 * Indicates that "prefer reduced motion" browser setting is active.
	 *
	 * Note that the value of this property is evaluated each time it is accessed, and it may change over time, if the environment
	 * settings have changed.
	 */
	readonly isMotionReduced: boolean;

	/**
	 * Environment features information.
	 */
	readonly features: EnvFeaturesType;
}

export interface EnvFeaturesType {

	/**
	 * Indicates that the environment supports ES2018 Unicode property escapes — like `\p{P}` or `\p{L}`.
	 * More information about unicode properties might be found
	 * [in Unicode Standard Annex #44](https://www.unicode.org/reports/tr44/#GC_Values_Table).
	 */
	readonly isRegExpUnicodePropertySupported: boolean;
}

/**
 * A namespace containing environment and browser information.
 */
const env: EnvType = {
	isMac: /* #__PURE__ */ isMac( userAgent ),

	isWindows: /* #__PURE__ */ isWindows( userAgent ),

	isGecko: /* #__PURE__ */ isGecko( userAgent ),

	isSafari: /* #__PURE__ */ isSafari( userAgent ),

	isiOS: /* #__PURE__ */ isiOS( userAgent ),

	isAndroid: /* #__PURE__ */ isAndroid( userAgent ),

	isBlink: /* #__PURE__ */ isBlink( userAgent ),

	get isMediaForcedColors() {
		return isMediaForcedColors();
	},

	get isMotionReduced() {
		return isMotionReduced();
	},

	features: {
		isRegExpUnicodePropertySupported: /* #__PURE__ */ isRegExpUnicodePropertySupported()
	}
};

export default env;

/**
 * Checks if User Agent represented by the string is running on Macintosh.
 *
 * @param userAgent **Lowercase** `navigator.userAgent` string.
 * @returns Whether User Agent is running on Macintosh or not.
 */
export function isMac( userAgent: string ): boolean {
	return userAgent.indexOf( 'macintosh' ) > -1;
}

/**
 * Checks if User Agent represented by the string is running on Windows.
 *
 * @param userAgent **Lowercase** `navigator.userAgent` string.
 * @returns Whether User Agent is running on Windows or not.
 */
export function isWindows( userAgent: string ): boolean {
	return userAgent.indexOf( 'windows' ) > -1;
}

/**
 * Checks if User Agent represented by the string is Firefox (Gecko).
 *
 * @param userAgent **Lowercase** `navigator.userAgent` string.
 * @returns Whether User Agent is Firefox or not.
 */
export function isGecko( userAgent: string ): boolean {
	return !!userAgent.match( /gecko\/\d+/ );
}

/**
 * Checks if User Agent represented by the string is Safari.
 *
 * @param userAgent **Lowercase** `navigator.userAgent` string.
 * @returns Whether User Agent is Safari or not.
 */
export function isSafari( userAgent: string ): boolean {
	return userAgent.indexOf( ' applewebkit/' ) > -1 && userAgent.indexOf( 'chrome' ) === -1;
}

/**
 * Checks if User Agent represented by the string is running in iOS.
 *
 * @param userAgent **Lowercase** `navigator.userAgent` string.
 * @returns Whether User Agent is running in iOS or not.
 */
export function isiOS( userAgent: string ): boolean {
	// "Request mobile site" || "Request desktop site".
	return !!userAgent.match( /iphone|ipad/i ) || ( isMac( userAgent ) && navigator.maxTouchPoints > 0 );
}

/**
 * Checks if User Agent represented by the string is Android mobile device.
 *
 * @param userAgent **Lowercase** `navigator.userAgent` string.
 * @returns Whether User Agent is Safari or not.
 */
export function isAndroid( userAgent: string ): boolean {
	return userAgent.indexOf( 'android' ) > -1;
}

/**
 * Checks if User Agent represented by the string is Blink engine.
 *
 * @param userAgent **Lowercase** `navigator.userAgent` string.
 * @returns Whether User Agent is Blink engine or not.
 */
export function isBlink( userAgent: string ): boolean {
	// The Edge browser before switching to the Blink engine used to report itself as Chrome (and "Edge/")
	// but after switching to the Blink it replaced "Edge/" with "Edg/".
	return userAgent.indexOf( 'chrome/' ) > -1 && userAgent.indexOf( 'edge/' ) < 0;
}

/**
 * Checks if the current environment supports ES2018 Unicode properties like `\p{P}` or `\p{L}`.
 * More information about unicode properties might be found
 * [in Unicode Standard Annex #44](https://www.unicode.org/reports/tr44/#GC_Values_Table).
 */
export function isRegExpUnicodePropertySupported(): boolean {
	let isSupported = false;

	// Feature detection for Unicode properties. Added in ES2018. Currently Firefox does not support it.
	// See https://github.com/ckeditor/ckeditor5-mention/issues/44#issuecomment-487002174.

	try {
		// Usage of regular expression literal cause error during build (ckeditor/ckeditor5-dev#534).
		isSupported = 'ć'.search( new RegExp( '[\\p{L}]', 'u' ) ) === 0;
	} catch {
		// Firefox throws a SyntaxError when the group is unsupported.
	}

	return isSupported;
}

/**
 * Checks if the user agent has enabled a forced colors mode (e.g. Windows High Contrast mode).
 *
 * Returns `false` in environments where `window` global object is not available.
 */
export function isMediaForcedColors(): boolean {
	return global.window.matchMedia ? global.window.matchMedia( '(forced-colors: active)' ).matches : false;
}

/**
 * Checks if the user enabled "prefers reduced motion" setting in browser.
 *
 * Returns `false` in environments where `window` global object is not available.
 */
export function isMotionReduced(): boolean {
	return global.window.matchMedia ? global.window.matchMedia( '(prefers-reduced-motion)' ).matches : false;
}
