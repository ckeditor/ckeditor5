export default class MentionsView extends ListView {
    constructor(locale: any);
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
     * @param {Number} index Index of an item to be marked as selected.
     */
    select(index: number): void;
    selected: any;
    /**
     * Triggers the `execute` event on the {@link #select selected} item.
     */
    executeSelected(): void;
    _isItemVisibleInScrolledArea(item: any): boolean;
}
import { ListView } from "@ckeditor/ckeditor5-ui";
