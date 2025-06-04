/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/locale
 */

import toArray, { type ArrayOrItem } from './toarray.js';
import { _translate, _unifyTranslations, type Message } from './translation-service.js';
import { getLanguageDirection, type LanguageDirection } from './language.js';

/**
 * Represents the localization services.
 */
export default class Locale {
	/**
	 * The editor UI language code in the [ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1) format.
	 *
	 * If the {@link #contentLanguage content language} was not specified in the `Locale` constructor,
	 * it also defines the language of the content.
	 */
	public readonly uiLanguage: string;

	/**
	 * Text direction of the {@link #uiLanguage editor UI language}. Either `'ltr'` or `'rtl'`.
	 */
	public readonly uiLanguageDirection: LanguageDirection;

	/**
	 * The editor content language code in the [ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1) format.
	 *
	 * Usually the same as the {@link #uiLanguage editor language}, it can be customized by passing an optional
	 * argument to the `Locale` constructor.
	 */
	public readonly contentLanguage: string;

	/**
	 * Text direction of the {@link #contentLanguage editor content language}.
	 *
	 * If the content language was passed directly to the `Locale` constructor, this property represents the
	 * direction of that language.
	 *
	 * If the {@link #contentLanguage editor content language} was derived from the {@link #uiLanguage editor language},
	 * the content language direction is the same as the {@link #uiLanguageDirection UI language direction}.
	 *
	 * The value is either `'ltr'` or `'rtl'`.
	 */
	public readonly contentLanguageDirection: LanguageDirection;

	/**
	 * Translates the given message to the {@link #uiLanguage}. This method is also available in
	 * {@link module:core/editor/editor~Editor#t `Editor`} and {@link module:ui/view~View#t `View`}.
	 *
	 * This method's context is statically bound to the `Locale` instance and **should always be called as a function**:
	 *
	 * ```ts
	 * const t = locale.t;
	 * t( 'Label' );
	 * ```
	 *
	 * The message can be either a string or an object implementing the {@link module:utils/translation-service~Message} interface.
	 *
	 * The message may contain placeholders (`%<index>`) for value(s) that are passed as a `values` parameter.
	 * For an array of values, the `%<index>` will be changed to an element of that array at the given index.
	 * For a single value passed as the second argument, only the `%0` placeholders will be changed to the provided value.
	 *
	 * ```ts
	 * t( 'Created file "%0" in %1ms.', [ fileName, timeTaken ] );
	 * t( 'Created file "%0", fileName );
	 * ```
	 *
	 * The message supports plural forms. To specify the plural form, use the `plural` property. Singular or plural form
	 * will be chosen depending on the first value from the passed `values`. The value of the `plural` property is used
	 * as a default plural translation when the translation for the target language is missing.
	 *
	 * ```ts
	 * t( { string: 'Add a space', plural: 'Add %0 spaces' }, 1 ); // 'Add a space' for the English language.
	 * t( { string: 'Add a space', plural: 'Add %0 spaces' }, 5 ); // 'Add 5 spaces' for the English language.
	 * t( { string: '%1 a space', plural: '%1 %0 spaces' }, [ 2, 'Add' ] ); // 'Add 2 spaces' for the English language.
	 *
	 * t( { string: 'Add a space', plural: 'Add %0 spaces' }, 1 ); // 'Dodaj spację' for the Polish language.
	 * t( { string: 'Add a space', plural: 'Add %0 spaces' }, 5 ); // 'Dodaj 5 spacji' for the Polish language.
	 * t( { string: '%1 a space', plural: '%1 %0 spaces' }, [ 2, 'Add' ] ); // 'Dodaj 2 spacje' for the Polish language.
	 * ```
	 *
	 *  * The message should provide an ID using the `id` property when the message strings are not unique and their
	 * translations should be different.
	 *
	 * ```ts
	 * translate( 'en', { string: 'image', id: 'ADD_IMAGE' } );
	 * translate( 'en', { string: 'image', id: 'AN_IMAGE' } );
	 * ```
	 */
	public readonly t: LocaleTranslate;

	/**
	 * Object that contains translations.
	 */
	public translations?: Translations;

	/**
	 * Creates a new instance of the locale class. Learn more about
	 * {@glink getting-started/setup/ui-language configuring the language of the editor}.
	 *
	 * @param options Locale configuration.
	 * @param options.uiLanguage The editor UI language code in the
	 * [ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1) format. See {@link #uiLanguage}.
	 * @param options.contentLanguage The editor content language code in the
	 * [ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1) format. If not specified, the same as `options.language`.
	 * See {@link #contentLanguage}.
	 * @param options.translations Translations passed as a editor config parameter.
	 */
	constructor(
		{
			uiLanguage = 'en',
			contentLanguage,
			translations
		}: {
			readonly uiLanguage?: string;
			readonly contentLanguage?: string;
			readonly translations?: ArrayOrItem<Translations>;
		} = {}
	) {
		this.uiLanguage = uiLanguage;
		this.contentLanguage = contentLanguage || this.uiLanguage;
		this.uiLanguageDirection = getLanguageDirection( this.uiLanguage );
		this.contentLanguageDirection = getLanguageDirection( this.contentLanguage );
		this.translations = _unifyTranslations( translations );
		this.t = ( message, values ) => this._t( message, values );
	}

	/**
	 * An unbound version of the {@link #t} method.
	 */
	private _t( message: string | Message, values: number | string | ReadonlyArray<number | string> = [] ): string {
		values = toArray( values );

		if ( typeof message === 'string' ) {
			message = { string: message };
		}

		const hasPluralForm = !!message.plural;
		const quantity = hasPluralForm ? values[ 0 ] as number : 1;

		const translatedString = _translate( this.uiLanguage, message, quantity, this.translations );

		return interpolateString( translatedString, values );
	}
}

/**
 * @param message A message that will be localized (translated).
 * @param values A value or an array of values that will fill message placeholders.
 * For messages supporting plural forms the first value will determine the plural form.
 */
export type LocaleTranslate = (
	message: string | Message,
	values?: number | string | ReadonlyArray<number | string>
) => string;

/**
 * Fills the `%0, %1, ...` string placeholders with values.
 */
function interpolateString( string: string, values: ReadonlyArray<any> ): string {
	return string.replace( /%(\d+)/g, ( match, index ) => {
		return ( index < values.length ) ? values[ index ] : match;
	} );
}

/**
 * Translations object definition.
 */
export type Translations = {
	[ language: string ]: {
		dictionary: { [ messageId: string ]: string | ReadonlyArray<string> };
		getPluralForm?: ( ( n: number ) => number | boolean ) | null;
	};
};
