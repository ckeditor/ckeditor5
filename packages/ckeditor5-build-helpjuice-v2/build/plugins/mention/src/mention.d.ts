/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module mention/mention
 */
import { Plugin } from 'ckeditor5/src/core';
import type { Element } from 'ckeditor5/src/engine';
import MentionEditing from './mentionediting';
import MentionUI from './mentionui';
import '../theme/mention.css';
/**
 * The mention plugin.
 *
 * For a detailed overview, check the {@glink features/mentions Mention feature} guide.
 */
export default class Mention extends Plugin {
    /**
     * Creates a mention attribute value from the provided view element and optional data.
     *
     * ```ts
     * editor.plugins.get( 'Mention' ).toMentionAttribute( viewElement, { userId: '1234' } );
     *
     * // For a view element: <span data-mention="@joe">@John Doe</span>
     * // it will return:
     * // { id: '@joe', userId: '1234', uid: '7a7bc7...', _text: '@John Doe' }
     * ```
     *
     * @param viewElement
     * @param data Additional data to be stored in the mention attribute.
     */
    toMentionAttribute(viewElement: Element, data?: MentionAttribute): MentionAttribute | undefined;
    /**
     * @inheritDoc
     */
    static get pluginName(): 'Mention';
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof MentionEditing, typeof MentionUI];
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
    uid?: string;
};
