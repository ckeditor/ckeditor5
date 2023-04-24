/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module mention/ui/mentionlistitemview
 */
import { ListItemView } from 'ckeditor5/src/ui';
import type { MentionFeedItem } from '../mentionconfig';
export default class MentionListItemView extends ListItemView {
    item: MentionFeedItem;
    marker: string;
    highlight(): void;
    removeHighlight(): void;
}
