/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module mention/ui/mentionsview
 */
import { ListView } from 'ckeditor5/src/ui';
import { type Locale } from 'ckeditor5/src/utils';
import type MentionListItemView from './mentionlistitemview';
import '../../theme/mentionui.css';
/**
 * The mention ui view.
 */
export default class MentionsView extends ListView {
    selected: MentionListItemView | undefined;
    position: string | undefined;
    /**
     * @inheritDoc
     */
    constructor(locale: Locale);
    /**
     * {@link #select Selects} the first item.
     */
    selectFirst(): void;
    /**
     * Selects next item to the currently {@link #select selected}.
     *
     * If the last item is already selected, it will select the first item.
     */
    selectNext(): void;
    /**
     * Selects previous item to the currently {@link #select selected}.
     *
     * If the first item is already selected, it will select the last item.
     */
    selectPrevious(): void;
    /**
     * Marks item at a given index as selected.
     *
     * Handles selection cycling when passed index is out of bounds:
     * - if the index is lower than 0, it will select the last item,
     * - if the index is higher than the last item index, it will select the first item.
     *
     * @param index Index of an item to be marked as selected.
     */
    select(index: number): void;
    /**
     * Triggers the `execute` event on the {@link #select selected} item.
     */
    executeSelected(): void;
    /**
     * Checks if an item is visible in the scrollable area.
     *
     * The item is considered visible when:
     * - its top boundary is inside the scrollable rect
     * - its bottom boundary is inside the scrollable rect (the whole item must be visible)
     */
    private _isItemVisibleInScrolledArea;
}
