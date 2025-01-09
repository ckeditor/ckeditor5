/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module mention/mention
 */

import { Plugin } from 'ckeditor5/src/core.js';
import type { Element } from 'ckeditor5/src/engine.js';

import MentionEditing, { _toMentionAttribute } from './mentionediting.js';
import MentionUI from './mentionui.js';

import '../theme/mention.css';

/**
 * The mention plugin.
 *
 * For a detailed overview, check the {@glink features/mentions Mention feature} guide.
 */
export default class Mention extends Plugin {
	/**
	 * Creates a mention attribute value from the provided view element and additional data.
	 *
	 * ```ts
	 * editor.plugins.get( 'Mention' ).toMentionAttribute( viewElement, { userId: '1234' } );
	 *
	 * // For a view element: <span data-mention="@joe">@John Doe</span>
	 * // it will return:
	 * // { id: '@joe', userId: '1234', uid: '7a7bc7...', _text: '@John Doe' }
	 * ```
	 *
	 * @param data Additional data to be stored in the mention attribute.
	 */
	public toMentionAttribute<MentionData extends Record<string, unknown>>(
		viewElement: Element,
		data: MentionData
	): ( MentionAttribute & MentionData ) | undefined;

	/**
	 * Creates a mention attribute value from the provided view element.
	 *
	 * ```ts
	 * editor.plugins.get( 'Mention' ).toMentionAttribute( viewElement );
	 *
	 * // For a view element: <span data-mention="@joe">@John Doe</span>
	 * // it will return:
	 * // { id: '@joe', uid: '7a7bc7...', _text: '@John Doe' }
	 * ```
	 */
	public toMentionAttribute( viewElement: Element ): MentionAttribute | undefined;

	public toMentionAttribute( viewElement: Element, data?: Record<string, unknown> ): MentionAttribute | undefined {
		return _toMentionAttribute( viewElement, data );
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'Mention' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ MentionEditing, MentionUI ] as const;
	}
}

/**
 * Represents a mention in the model.
 *
 * See {@link module:mention/mention~Mention#toMentionAttribute `Mention#toMentionAttribute()`}.
 */
export type MentionAttribute = {

	/**
	 * The ID of a mention. It identifies the mention item in the mention feed. There can be multiple mentions
	 * in the document with the same ID (e.g. the same hashtag being mentioned).
	 */
	id: string;

	/**
	 * A unique ID of this mention instance. Should be passed as an `option.id` when using
	 * {@link module:engine/view/downcastwriter~DowncastWriter#createAttributeElement writer.createAttributeElement()}.
	 */
	uid: string;

	/**
	 * Helper property that stores the text of the inserted mention. Used for detecting a broken mention
	 * in the editing area.
	 *
	 * @internal
	 */
	_text: string;
};
