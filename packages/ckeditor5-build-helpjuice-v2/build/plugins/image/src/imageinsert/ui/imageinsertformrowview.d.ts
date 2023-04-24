/**
 * The class representing a single row in a complex form,
 * used by {@link module:image/imageinsert/ui/imageinsertpanelview~ImageInsertPanelView}.
 *
 * **Note**: For now this class is private. When more use cases appear (beyond `ckeditor5-table` and `ckeditor5-image`),
 * it will become a component in `ckeditor5-ui`.
 *
 * @private
 * @extends module:ui/view~View
 */
export default class ImageUploadFormRowView {
    /**
     * Creates an instance of the form row class.
     *
     * @param {module:utils/locale~Locale} locale The locale instance.
     * @param {Object} options
     * @param {Array.<module:ui/view~View>} [options.children]
     * @param {String} [options.class]
     * @param {module:ui/view~View} [options.labelView] When passed, the row gets the `group` and `aria-labelledby`
     * DOM attributes and gets described by the label.
     */
    constructor(locale: any, options?: Object);
    /**
     * A collection of row items (buttons, dropdowns, etc.).
     *
     * @readonly
     * @member {module:ui/viewcollection~ViewCollection}
     */
    readonly children: any;
}
