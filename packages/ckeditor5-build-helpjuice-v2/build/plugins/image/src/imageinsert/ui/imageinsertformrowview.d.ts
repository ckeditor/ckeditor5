/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module image/imageinsert/ui/imageinsertformrowview
 */
import type { Locale } from 'ckeditor5/src/utils';
import { View, type ViewCollection, type LabelView } from 'ckeditor5/src/ui';
import '../../../theme/imageinsertformrowview.css';
/**
 * The class representing a single row in a complex form,
 * used by {@link module:image/imageinsert/ui/imageinsertpanelview~ImageInsertPanelView}.
 *
 * **Note**: For now this class is private. When more use cases appear (beyond `ckeditor5-table` and `ckeditor5-image`),
 * it will become a component in `ckeditor5-ui`.
 *
 * @private
 */
export default class ImageUploadFormRowView extends View {
    /**
     * An additional CSS class added to the {@link #element}.
     *
     * @observable
     */
    class: string | null;
    /**
     * A collection of row items (buttons, dropdowns, etc.).
     */
    readonly children: ViewCollection;
    /**
     * The role property reflected by the `role` DOM attribute of the {@link #element}.
     *
     * **Note**: Used only when a `labelView` is passed to constructor `options`.
     *
     * @observable
     * @private
     */
    _role: string | null;
    /**
     * The ARIA property reflected by the `aria-labelledby` DOM attribute of the {@link #element}.
     *
     * **Note**: Used only when a `labelView` is passed to constructor `options`.
     *
     * @observable
     * @private
     */
    _ariaLabelledBy: string | null;
    /**
     * Creates an instance of the form row class.
     *
     * @param locale The locale instance.
     * @param options.labelView When passed, the row gets the `group` and `aria-labelledby`
     * DOM attributes and gets described by the label.
     */
    constructor(locale: Locale, options?: {
        children?: Array<View>;
        class?: string;
        labelView?: LabelView;
    });
}
