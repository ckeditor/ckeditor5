/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module media-embed/mediaembedstyle/utils
 */

import { logWarning } from '@ckeditor/ckeditor5-utils';
import type { ToolbarConfigItem } from '@ckeditor/ckeditor5-core';
import type {
	MediaStyleConfig,
	MediaStyleDropdownDefinition,
	MediaStyleOptionDefinition,
	NormalizedMediaStyleOption
} from '../mediaembedconfig.js';
import { DEFAULT_ICONS, DEFAULT_OPTIONS } from './constants.js';

/**
 * In-flight shape used inside the normalizer. After string-to-default resolution every entry
 * carries at least a `name`. The remaining required fields (`title`, `icon`, `className` unless
 * `isDefault`) are checked by {@link ~isValidOption} before the entry reaches the resolved list.
 */
type DraftStyle = Partial<MediaStyleOptionDefinition> & { name: string };

/**
 * Normalizes the {@link module:media-embed/mediaembedconfig~MediaStyleConfig#options style options}
 * provided by the integrator. Each entry is resolved into a full
 * {@link module:media-embed/mediaembedconfig~MediaStyleOptionDefinition} and invalid entries
 * are filtered out with a console warning.
 *
 * @internal
 */
export function normalizeStyles( configuredStyles: MediaStyleConfig ): Array<NormalizedMediaStyleOption> {
	const configured = configuredStyles.options || [];

	return configured
		.map( entry => normalizeDefinition( entry ) )
		.filter( ( entry ): entry is NormalizedMediaStyleOption => isValidOption( entry ) );
}

/**
 * Resolves a single config entry into a style option definition. A string entry is first
 * promoted to its object form (`{ name }`) and then shallow-merged on top of the matching
 * built-in default — entries without a matching built-in pass through unchanged and are
 * rejected by {@link ~isValidOption} if they lack required fields.
 *
 * Also resolves icon-name aliases (`'left'`, `'inlineLeft'`, etc.) to the corresponding
 * SVG sources from {@link module:media-embed/mediaembedstyle/constants~DEFAULT_ICONS}.
 */
function normalizeDefinition( entry: string | DraftStyle ): DraftStyle {
	// Spread of `undefined` is a no-op, so unknown-name overrides produce a clean passthrough.
	const override: DraftStyle = typeof entry === 'string' ? { name: entry } : entry;
	const definition: DraftStyle = { ...DEFAULT_OPTIONS[ override.name ], ...override };

	if ( typeof definition.icon === 'string' && DEFAULT_ICONS[ definition.icon ] ) {
		definition.icon = DEFAULT_ICONS[ definition.icon ];
	}

	return definition;
}

/**
 * Validates a normalized style option. `name`, `title`, and `icon` are always required.
 * `className` is required unless the entry is the default style (defaults encode as
 * attribute-absence and intentionally have no class). Emits a console warning and returns
 * `false` when any of these checks fails.
 */
function isValidOption( option: DraftStyle ): boolean {
	if ( !option.name || !option.title || !option.icon || ( !option.isDefault && !option.className ) ) {
		warnInvalidStyle( { style: option } );

		return false;
	}

	return true;
}

function warnInvalidStyle( info: object ): void {
	/**
	 * The media style configuration provided in the editor config is invalid. The warning is
	 * emitted in two situations:
	 *
	 * * An entry in {@link module:media-embed/mediaembedconfig~MediaEmbedConfig#styles `config.mediaEmbed.styles.options`}
	 *   does not reference a built-in style by name (`'alignLeft'`, `'alignBlockLeft'`,
	 *   `'alignCenter'`, `'alignBlockRight'`, `'alignRight'`) and does not follow the
	 *   {@link module:media-embed/mediaembedconfig~MediaStyleOptionDefinition} shape —
	 *   `name`, `title`, `icon`, and (unless `isDefault: true`) `className` are required.
	 *   The offending entry is reported under the `style` parameter.
	 * * A dropdown entry placed inline in
	 *   {@link module:media-embed/mediaembedconfig~MediaEmbedConfig#toolbar `config.mediaEmbed.toolbar`}
	 *   does not follow the {@link module:media-embed/mediaembedconfig~MediaStyleDropdownDefinition} shape
	 *   (`name` and every `items[]` entry must use the full `mediaEmbed:` prefix, `defaultItem` must
	 *   be one of the `items`, `title` must be a non-empty string), or its `items[]` reference styles
	 *   that are not in the resolved
	 *   {@link module:media-embed/mediaembedconfig~MediaEmbedConfig#styles `config.mediaEmbed.styles`} list.
	 *   The offending entry is reported under the `dropdown` parameter.
	 *
	 * @error media-style-configuration-definition-invalid
	 */
	logWarning( 'media-style-configuration-definition-invalid', info );
}

/**
 * Type guard for toolbar config entries shaped like a media style dropdown definition. The
 * discriminator is `defaultItem` — generic toolbar groupings use `items` + `label` and never
 * carry a `defaultItem` field.
 *
 * @internal
 */
export function isMediaStyleDropdown(
	item: ToolbarConfigItem | MediaStyleDropdownDefinition
): item is MediaStyleDropdownDefinition {
	return typeof item === 'object' && item !== null && typeof ( item as MediaStyleDropdownDefinition ).defaultItem === 'string';
}
