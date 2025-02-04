/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Plugin } from 'ckeditor5/src/core.js';
import type { EmojiCdnResource, EmojiEntry } from './emojirepository.js';
import type { SkinToneId } from './emojiconfig.js';
import isEmojiSupported from './utils/isemojisupported.js';

/**
 * @module emoji/emojiutils
 */

const SKIN_TONE_MAP: Record<number, SkinToneId> = {
	0: 'default',
	1: 'light',
	2: 'medium-light',
	3: 'medium',
	4: 'medium-dark',
	5: 'dark'
};

/**
 * A map representing an emoji and its release version.
 * It's used to identify a user's minimal supported emoji level.
 */
const EMOJI_SUPPORT_LEVEL = {
	'🫩': 16, // Face with bags under eyes.
	'🫨': 15.1 // Shaking head. Although the version of emoji is 15, it is used to detect versions 15 and 15.1.
};

const BASELINE_EMOJI_WIDTH = 24;

/**
 * The Emoji utilities plugin.
 */
export default class EmojiUtils extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'EmojiUtils' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * Checks if the emoji is supported by verifying the emoji version supported by the system first.
	 * Then checks if emoji contains a zero width joiner (ZWJ), and if yes, then checks if it is supported by the system.
	 */
	public isEmojiSupported( item: EmojiCdnResource, emojiSupportedVersionByOs: number, container: HTMLDivElement ): boolean {
		const isEmojiVersionSupported = item.version <= emojiSupportedVersionByOs;

		if ( !isEmojiVersionSupported ) {
			return false;
		}

		if ( !this.hasZwj( item.emoji ) ) {
			return true;
		}

		return this.isEmojiZwjSupported( item, container );
	}

	/**
	 * Checks the supported emoji version by the OS, by sampling some representatives from different emoji releases.
	 */
	public getEmojiSupportedVersionByOs(): number {
		return Object.entries( EMOJI_SUPPORT_LEVEL )
			.reduce( ( currentVersion, [ emoji, newVersion ] ) => {
				if ( newVersion > currentVersion && EmojiUtils._isEmojiSupported( emoji ) ) {
					return newVersion;
				}

				return currentVersion;
			}, 0 );
	}

	/**
	 * Check for ZWJ (zero width joiner) character.
	 */
	public hasZwj( emoji: string ): boolean {
		return emoji.includes( '\u200d' );
	}

	/**
	 * Checks whether the emoji is supported in the operating system.
	 */
	public isEmojiZwjSupported( item: EmojiCdnResource, container: HTMLDivElement ): boolean {
		const emojiWidth = this.getNodeWidth( container, item.emoji );

		// On Windows, some supported emoji are ~50% bigger than the baseline emoji, but what we really want to guard
		// against are the ones that are 2x the size, because those are truly broken (person with red hair = person with
		// floating red wig, black cat = cat with black square, polar bear = bear with snowflake, etc.)
		// So here we set the threshold at 1.8 times the size of the baseline emoji.
		return emojiWidth < BASELINE_EMOJI_WIDTH * 1.8;
	}

	/**
	 * Returns the width of the provided node.
	 */
	public getNodeWidth( container: HTMLDivElement, node: string ): number {
		const span = document.createElement( 'span' );
		span.textContent = node;
		container.appendChild( span );
		const nodeWidth = span.offsetWidth;
		container.removeChild( span );

		return nodeWidth;
	}

	/**
	 * Creates a div for emoji width testing purposes.
	 */
	public createEmojiWidthTestingContainer(): HTMLDivElement {
		const container = document.createElement( 'div' );

		container.setAttribute( 'aria-hidden', 'true' );
		container.style.position = 'absolute';
		container.style.left = '-9999px';
		container.style.whiteSpace = 'nowrap';
		container.style.fontSize = BASELINE_EMOJI_WIDTH + 'px';

		return container;
	}

	/**
	 * Adds default skin tone property to each emoji. If emoji defines other skin tones, they are added as well.
	 */
	public normalizeEmojiSkinTone( item: EmojiCdnResource ): EmojiEntry {
		const entry: EmojiEntry = {
			...item,
			skins: {
				default: item.emoji
			}
		};

		if ( item.skins ) {
			item.skins.forEach( skin => {
				const skinTone = SKIN_TONE_MAP[ skin.tone ];

				entry.skins[ skinTone ] = skin.emoji;
			} );
		}

		return entry;
	}

	/**
	 * Checks whether the emoji belongs to a group that is allowed.
	 */
	public isEmojiCategoryAllowed( item: EmojiCdnResource ): boolean {
		// Category group=2 contains skin tones only, which we do not want to render.
		return item.group !== 2;
	}

	/**
	 * A function used to determine if emoji is supported by detecting pixels.
	 *
	 * Referenced for unit testing purposes. Kept in a separate file because of licensing.
	 */
	private static _isEmojiSupported = isEmojiSupported;
}
