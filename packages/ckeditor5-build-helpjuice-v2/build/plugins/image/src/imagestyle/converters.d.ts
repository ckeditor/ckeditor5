/**
 * @module image/imagestyle/converters
 */
/**
 * Returns a converter for the `imageStyle` attribute. It can be used for adding, changing and removing the attribute.
 *
 * @param {Array.<module:image/imagestyle~ImageStyleOptionDefinition>} styles
 * An array containing available image style options.
 * @returns {Function} A model-to-view attribute converter.
 */
export function modelToViewStyleAttribute(styles: any): Function;
/**
 * Returns a view-to-model converter converting image CSS classes to a proper value in the model.
 *
 * @param {Array.<module:image/imagestyle~ImageStyleOptionDefinition>} styles
 * Image style options for which the converter is created.
 * @returns {Function} A view-to-model converter.
 */
export function viewToModelStyleAttribute(styles: any): Function;
