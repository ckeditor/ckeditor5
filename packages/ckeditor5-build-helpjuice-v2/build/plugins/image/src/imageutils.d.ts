/**
 * A set of helpers related to images.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageUtils {
    /**
     * @inheritDoc
     */
    static get pluginName(): string;
    /**
     * Checks if the provided model element is an `image` or `imageInline`.
     *
     * @param {module:engine/model/element~Element} modelElement
     * @returns {Boolean}
     */
    isImage(modelElement: any): boolean;
    /**
     * Checks if the provided view element represents an inline image.
     *
     * Also, see {@link module:image/imageutils~ImageUtils#isImageWidget}.
     *
     * @param {module:engine/view/element~Element} element
     * @returns {Boolean}
     */
    isInlineImageView(element: any): boolean;
    /**
     * Checks if the provided view element represents a block image.
     *
     * Also, see {@link module:image/imageutils~ImageUtils#isImageWidget}.
     *
     * @param {module:engine/view/element~Element} element
     * @returns {Boolean}
     */
    isBlockImageView(element: any): boolean;
    /**
     * Handles inserting single file. This method unifies image insertion using {@link module:widget/utils~findOptimalInsertionRange}
     * method.
     *
     *		const imageUtils = editor.plugins.get( 'ImageUtils' );
     *
     *		imageUtils.insertImage( { src: 'path/to/image.jpg' } );
     *
     * @param {Object} [attributes={}] Attributes of the inserted image.
     * This method filters out the attributes which are disallowed by the {@link module:engine/model/schema~Schema}.
     * @param {module:engine/model/selection~Selectable} [selectable] Place to insert the image. If not specified,
     * the {@link module:widget/utils~findOptimalInsertionRange} logic will be applied for the block images
     * and `model.document.selection` for the inline images.
     *
     * **Note**: If `selectable` is passed, this helper will not be able to set selection attributes (such as `linkHref`)
     * and apply them to the new image. In this case, make sure all selection attributes are passed in `attributes`.
     *
     * @param {'imageBlock'|'imageInline'} [imageType] Image type of inserted image. If not specified,
     * it will be determined automatically depending of editor config or place of the insertion.
     * @return {module:engine/view/element~Element|null} The inserted model image element.
     */
    insertImage(attributes?: Object | undefined, selectable?: any, imageType?: "imageBlock" | "imageInline" | undefined): any;
    /**
     * Returns an image widget editing view element if one is selected or is among the selection's ancestors.
     *
     * @protected
     * @param {module:engine/view/selection~Selection|module:engine/view/documentselection~DocumentSelection} selection
     * @returns {module:engine/view/element~Element|null}
     */
    protected getClosestSelectedImageWidget(selection: any): any;
    /**
     * Returns a image model element if one is selected or is among the selection's ancestors.
     *
     * @param {module:engine/model/selection~Selection|module:engine/model/documentselection~DocumentSelection} selection
     * @returns {module:engine/model/element~Element|null}
     */
    getClosestSelectedImageElement(selection: any): any;
    /**
     * Checks if image can be inserted at current model selection.
     *
     * @protected
     * @returns {Boolean}
     */
    protected isImageAllowed(): boolean;
    /**
     * Converts a given {@link module:engine/view/element~Element} to an image widget:
     * * Adds a {@link module:engine/view/element~Element#_setCustomProperty custom property} allowing to recognize the image widget
     * element.
     * * Calls the {@link module:widget/utils~toWidget} function with the proper element's label creator.
     *
     * @protected
     * @param {module:engine/view/element~Element} viewElement
     * @param {module:engine/view/downcastwriter~DowncastWriter} writer An instance of the view writer.
     * @param {String} label The element's label. It will be concatenated with the image `alt` attribute if one is present.
     * @returns {module:engine/view/element~Element}
     */
    protected toImageWidget(viewElement: any, writer: any, label: string): any;
    /**
     * Checks if a given view element is an image widget.
     *
     * @protected
     * @param {module:engine/view/element~Element} viewElement
     * @returns {Boolean}
     */
    protected isImageWidget(viewElement: any): boolean;
    /**
     * Checks if the provided model element is an `image`.
     *
     * @param {module:engine/model/element~Element} modelElement
     * @returns {Boolean}
     */
    isBlockImage(modelElement: any): boolean;
    /**
     * Checks if the provided model element is an `imageInline`.
     *
     * @param {module:engine/model/element~Element} modelElement
     * @returns {Boolean}
     */
    isInlineImage(modelElement: any): boolean;
    /**
     * Get the view `<img>` from another view element, e.g. a widget (`<figure class="image">`), a link (`<a>`).
     *
     * The `<img>` can be located deep in other elements, so this helper performs a deep tree search.
     *
     * @param {module:engine/view/element~Element} figureView
     * @returns {module:engine/view/element~Element}
     */
    findViewImgElement(figureView: any): any;
}
