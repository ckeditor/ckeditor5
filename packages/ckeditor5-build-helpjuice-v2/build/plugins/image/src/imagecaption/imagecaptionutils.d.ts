/**
 * The image caption utilities plugin.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageCaptionUtils {
    /**
     * @inheritDoc
     */
    static get pluginName(): string;
    /**
     * @inheritDoc
     */
    static get requires(): (typeof ImageUtils)[];
    /**
     * Returns the caption model element from a given image element. Returns `null` if no caption is found.
     *
     * @param {module:engine/model/element~Element} imageModelElement
     * @returns {module:engine/model/element~Element|null}
     */
    getCaptionFromImageModelElement(imageModelElement: any): any;
    /**
     * Returns the caption model element for a model selection. Returns `null` if the selection has no caption element ancestor.
     *
     * @param {module:engine/model/selection~Selection} selection
     * @returns {module:engine/model/element~Element|null}
     */
    getCaptionFromModelSelection(selection: any): any;
    /**
     * {@link module:engine/view/matcher~Matcher} pattern. Checks if a given element is a `<figcaption>` element that is placed
     * inside the image `<figure>` element.
     *
     * @param {module:engine/view/element~Element} element
     * @returns {Object|null} Returns the object accepted by {@link module:engine/view/matcher~Matcher} or `null` if the element
     * cannot be matched.
     */
    matchImageCaptionViewElement(element: any): Object | null;
}
import ImageUtils from "../imageutils";
