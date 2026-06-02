/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module media-embed/mediaembedstyle/constants
 */

import {
	IconObjectCenter,
	IconObjectInlineLeft,
	IconObjectInlineRight,
	IconObjectLeft,
	IconObjectRight
} from '@ckeditor/ckeditor5-icons';
import type { MediaStyleDropdownDefinition, NormalizedMediaStyleOption } from '../mediaembedconfig.js';

/**
 * Built-in style options provided by the plugin. Integrators can refer to these by
 * name in {@link module:media-embed/mediaembedconfig~MediaEmbedConfig#styles `config.mediaEmbed.styles`}
 * to opt out, override individual fields, or coexist with custom styles.
 *
 * @internal
 */
export const DEFAULT_OPTIONS: Record<string, NormalizedMediaStyleOption> = {
	alignLeft: {
		name: 'alignLeft',
		title: 'Left aligned media',
		icon: IconObjectInlineLeft,
		className: 'media-style-align-left'
	},
	alignBlockLeft: {
		name: 'alignBlockLeft',
		title: 'Left aligned media',
		icon: IconObjectLeft,
		className: 'media-style-block-align-left'
	},
	alignCenter: {
		name: 'alignCenter',
		title: 'Centered media',
		icon: IconObjectCenter,
		isDefault: true
	},
	alignBlockRight: {
		name: 'alignBlockRight',
		title: 'Right aligned media',
		icon: IconObjectRight,
		className: 'media-style-block-align-right'
	},
	alignRight: {
		name: 'alignRight',
		title: 'Right aligned media',
		icon: IconObjectInlineRight,
		className: 'media-style-align-right'
	}
};

/**
 * Short icon-name aliases that can be used as the `icon` value in a media style
 * option definition. Matches the alias set exposed by the image styles feature so
 * the two APIs feel symmetrical.
 *
 * @internal
 */
export const DEFAULT_ICONS: Record<string, string> = {
	inlineLeft: IconObjectInlineLeft,
	left: IconObjectLeft,
	center: IconObjectCenter,
	right: IconObjectRight,
	inlineRight: IconObjectInlineRight
};

/**
 * Built-in dropdown groupings. Each entry references built-in style component names. If any
 * items are filtered out by configuration, the dropdown is rebuilt from the remaining names
 * (or skipped entirely if fewer than two remain).
 *
 * @internal
 */
export const DEFAULT_DROPDOWN_DEFINITIONS: Array<MediaStyleDropdownDefinition> = [
	{
		name: 'mediaEmbed:wrapText',
		title: 'Wrap text',
		items: [ 'mediaEmbed:alignLeft', 'mediaEmbed:alignRight' ],
		defaultItem: 'mediaEmbed:alignLeft'
	},
	{
		name: 'mediaEmbed:breakText',
		title: 'Break text',
		items: [ 'mediaEmbed:alignBlockLeft', 'mediaEmbed:alignCenter', 'mediaEmbed:alignBlockRight' ],
		defaultItem: 'mediaEmbed:alignCenter'
	}
];
