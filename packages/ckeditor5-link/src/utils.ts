/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module link/utils
 */

import type {
	DowncastConversionApi,
	Element,
	Schema,
	ViewAttributeElement,
	ViewNode,
	ViewDocumentFragment,
	Range
} from 'ckeditor5/src/engine.js';

import type { LocaleTranslate } from 'ckeditor5/src/utils.js';

import type {
	LinkDecoratorAutomaticDefinition,
	LinkDecoratorDefinition,
	LinkDecoratorManualDefinition
} from './linkconfig.js';

import { upperFirst } from 'es-toolkit/compat';

const ATTRIBUTE_WHITESPACES = /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205f\u3000]/g; // eslint-disable-line no-control-regex

const SAFE_URL_TEMPLATE = '^(?:(?:<protocols>):|[^a-z]|[a-z+.-]+(?:[^a-z+.:-]|$))';

// Simplified email test - should be run over previously found URL.
const EMAIL_REG_EXP = /^[\S]+@((?![-_])(?:[-\w\u00a1-\uffff]{0,63}[^-_]\.))+(?:[a-z\u00a1-\uffff]{2,})$/i;

// The regex checks for the protocol syntax ('xxxx://' or 'xxxx:')
// or non-word characters at the beginning of the link ('/', '#' etc.).
const PROTOCOL_REG_EXP = /^((\w+:(\/{2,})?)|(\W))/i;

const DEFAULT_LINK_PROTOCOLS = [
	'https?',
	'ftps?',
	'mailto'
];

/**
 * A keystroke used by the {@link module:link/linkui~LinkUI link UI feature}.
 */
export const LINK_KEYSTROKE = 'Ctrl+K';

/**
 * Returns `true` if a given view node is the link element.
 */
export function isLinkElement( node: ViewNode | ViewDocumentFragment ): boolean {
	return node.is( 'attributeElement' ) && !!node.getCustomProperty( 'link' );
}

/**
 * Creates a link {@link module:engine/view/attributeelement~AttributeElement} with the provided `href` attribute.
 */
export function createLinkElement( href: string, { writer }: DowncastConversionApi ): ViewAttributeElement {
	// Priority 5 - https://github.com/ckeditor/ckeditor5-link/issues/121.
	const linkElement = writer.createAttributeElement( 'a', { href }, { priority: 5 } );

	writer.setCustomProperty( 'link', true, linkElement );

	return linkElement;
}

/**
 * Returns a safe URL based on a given value.
 *
 * A URL is considered safe if it is safe for the user (does not contain any malicious code).
 *
 * If a URL is considered unsafe, a simple `"#"` is returned.
 *
 * @internal
 */
export function ensureSafeUrl( url: unknown, allowedProtocols: Array<string> = DEFAULT_LINK_PROTOCOLS ): string {
	const urlString = String( url );

	const protocolsList = allowedProtocols.join( '|' );
	const customSafeRegex = new RegExp( `${ SAFE_URL_TEMPLATE.replace( '<protocols>', protocolsList ) }`, 'i' );

	return isSafeUrl( urlString, customSafeRegex ) ? urlString : '#';
}

/**
 * Checks whether the given URL is safe for the user (does not contain any malicious code).
 */
function isSafeUrl( url: string, customRegexp: RegExp ): boolean {
	const normalizedUrl = url.replace( ATTRIBUTE_WHITESPACES, '' );

	return !!normalizedUrl.match( customRegexp );
}

/**
 * Returns the {@link module:link/linkconfig~LinkConfig#decorators `config.link.decorators`} configuration processed
 * to respect the locale of the editor, i.e. to display the {@link module:link/linkconfig~LinkDecoratorManualDefinition label}
 * in the correct language.
 *
 * **Note**: Only the few most commonly used labels are translated automatically. Other labels should be manually
 * translated in the {@link module:link/linkconfig~LinkConfig#decorators `config.link.decorators`} configuration.
 *
 * @param t Shorthand for {@link module:utils/locale~Locale#t Locale#t}.
 * @param decorators The decorator reference where the label values should be localized.
 */
export function getLocalizedDecorators(
	t: LocaleTranslate,
	decorators: Array<NormalizedLinkDecoratorDefinition>
): Array<NormalizedLinkDecoratorDefinition> {
	const localizedDecoratorsLabels: Record<string, string> = {
		'Open in a new tab': t( 'Open in a new tab' ),
		'Downloadable': t( 'Downloadable' )
	};

	decorators.forEach( decorator => {
		if ( 'label' in decorator && localizedDecoratorsLabels[ decorator.label ] ) {
			decorator.label = localizedDecoratorsLabels[ decorator.label ];
		}

		return decorator;
	} );

	return decorators;
}

/**
 * Converts an object with defined decorators to a normalized array of decorators. The `id` key is added for each decorator and
 * is used as the attribute's name in the model.
 */
export function normalizeDecorators( decorators?: Record<string, LinkDecoratorDefinition> ): Array<NormalizedLinkDecoratorDefinition> {
	const retArray: Array<NormalizedLinkDecoratorDefinition> = [];

	if ( decorators ) {
		for ( const [ key, value ] of Object.entries( decorators ) ) {
			const decorator = Object.assign(
				{},
				value,
				{ id: `link${ upperFirst( key ) }` }
			);

			retArray.push( decorator );
		}
	}

	return retArray;
}

/**
 * Returns `true` if the specified `element` can be linked (the element allows the `linkHref` attribute).
 */
export function isLinkableElement( element: Element | null, schema: Schema ): element is Element {
	if ( !element ) {
		return false;
	}

	return schema.checkAttribute( element.name, 'linkHref' );
}

/**
 * Returns `true` if the specified `value` is an email.
 */
export function isEmail( value: string ): boolean {
	return EMAIL_REG_EXP.test( value );
}

/**
 * Adds the protocol prefix to the specified `link` when:
 *
 * * it does not contain it already, and there is a {@link module:link/linkconfig~LinkConfig#defaultProtocol `defaultProtocol` }
 * configuration value provided,
 * * or the link is an email address.
 */
export function addLinkProtocolIfApplicable( link: string, defaultProtocol?: string ): string {
	const protocol = isEmail( link ) ? 'mailto:' : defaultProtocol;
	const isProtocolNeeded = !!protocol && !linkHasProtocol( link );

	return link && isProtocolNeeded ? protocol + link : link;
}

/**
 * Checks if protocol is already included in the link.
 */
export function linkHasProtocol( link: string ): boolean {
	return PROTOCOL_REG_EXP.test( link );
}

/**
 * Opens the link in a new browser tab.
 */
export function openLink( link: string ): void {
	window.open( link, '_blank', 'noopener' );
}

/**
 * Returns a text of a link range.
 *
 * If the returned value is `undefined`, the range contains elements other than text nodes.
 */
export function extractTextFromLinkRange( range: Range ): string | undefined {
	let text = '';

	for ( const item of range.getItems() ) {
		if ( !item.is( '$text' ) && !item.is( '$textProxy' ) ) {
			return;
		}

		text += item.data;
	}

	return text;
}

export type NormalizedLinkDecoratorAutomaticDefinition = LinkDecoratorAutomaticDefinition & { id: string };
export type NormalizedLinkDecoratorManualDefinition = LinkDecoratorManualDefinition & { id: string };
export type NormalizedLinkDecoratorDefinition = NormalizedLinkDecoratorAutomaticDefinition | NormalizedLinkDecoratorManualDefinition;
