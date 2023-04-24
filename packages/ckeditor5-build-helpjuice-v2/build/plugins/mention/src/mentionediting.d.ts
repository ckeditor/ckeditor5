/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module mention/mentionediting
 */
import { Plugin } from 'ckeditor5/src/core';
/**
 * The mention editing feature.
 *
 * It introduces the {@link module:mention/mentioncommand~MentionCommand command} and the `mention`
 * attribute in the {@link module:engine/model/model~Model model} which renders in the {@link module:engine/view/view view}
 * as a `<span class="mention" data-mention="@mention">`.
 */
export default class MentionEditing extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): 'MentionEditing';
    /**
     * @inheritDoc
     */
    init(): void;
}
