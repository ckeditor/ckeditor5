/**
 * Returns a function that converts the image view representation:
 *
 *		<figure class="image"><img src="..." alt="..."></img></figure>
 *
 * to the model representation:
 *
 *		<imageBlock src="..." alt="..."></imageBlock>
 *
 * The entire content of the `<figure>` element except the first `<img>` is being converted as children
 * of the `<imageBlock>` model element.
 *
 * @protected
 * @param {module:image/imageutils~ImageUtils} imageUtils
 * @returns {Function}
 */
export function upcastImageFigure(imageUtils: any): Function;
/**
 * Returns a function that converts the image view representation:
 *
 *		<picture><source ... /><source ... />...<img ... /></picture>
 *
 * to the model representation as the `sources` attribute:
 *
 *		<image[Block|Inline] ... sources="..."></image[Block|Inline]>
 *
 * @protected
 * @param {module:image/imageutils~ImageUtils} imageUtils
 * @returns {Function}
 */
export function upcastPicture(imageUtils: any): Function;
/**
 * Converter used to convert the `srcset` model image attribute to the `srcset`, `sizes` and `width` attributes in the view.
 *
 * @protected
 * @param {module:image/imageutils~ImageUtils} imageUtils
 * @param {'imageBlock'|'imageInline'} imageType The type of the image.
 * @returns {Function}
 */
export function downcastSrcsetAttribute(imageUtils: any, imageType: 'imageBlock' | 'imageInline'): Function;
/**
 * Converts the `source` model attribute to the `<picture><source /><source />...<img /></picture>`
 * view structure.
 *
 * @protected
 * @param {module:image/imageutils~ImageUtils} imageUtils
 * @returns {Function}
 */
export function downcastSourcesAttribute(imageUtils: any): Function;
/**
 * Converter used to convert a given image attribute from the model to the view.
 *
 * @protected
 * @param {module:image/imageutils~ImageUtils} imageUtils
 * @param {'imageBlock'|'imageInline'} imageType The type of the image.
 * @param {String} attributeKey The name of the attribute to convert.
 * @returns {Function}
 */
export function downcastImageAttribute(imageUtils: any, imageType: 'imageBlock' | 'imageInline', attributeKey: string): Function;
