/**
 * Creates a view element representing the inline image.
 *
 *		<span class="image-inline"><img></img></span>
 *
 * Note that `alt` and `src` attributes are converted separately, so they are not included.
 *
 * @protected
 * @param {module:engine/view/downcastwriter~DowncastWriter} writer
 * @returns {module:engine/view/containerelement~ContainerElement}
 */
export function createInlineImageViewElement(writer: any): any;
/**
 * Creates a view element representing the block image.
 *
 *		<figure class="image"><img></img></figure>
 *
 * Note that `alt` and `src` attributes are converted separately, so they are not included.
 *
 * @protected
 * @param {module:engine/view/downcastwriter~DowncastWriter} writer
 * @returns {module:engine/view/containerelement~ContainerElement}
 */
export function createBlockImageViewElement(writer: any): any;
/**
 * A function returning a `MatcherPattern` for a particular type of View images.
 *
 * @protected
 * @param {module:core/editor/editor~Editor} editor
 * @param {'imageBlock'|'imageInline'} matchImageType The type of created image.
 * @returns {module:engine/view/matcher~MatcherPattern}
 */
export function getImgViewElementMatcher(editor: any, matchImageType: 'imageBlock' | 'imageInline'): any;
/**
 * Considering the current model selection, it returns the name of the model image element
 * (`'imageBlock'` or `'imageInline'`) that will make most sense from the UX perspective if a new
 * image was inserted (also: uploaded, dropped, pasted) at that selection.
 *
 * The assumption is that inserting images into empty blocks or on other block widgets should
 * produce block images. Inline images should be inserted in other cases, e.g. in paragraphs
 * that already contain some text.
 *
 * @protected
 * @param {module:engine/model/schema~Schema} schema
 * @param {module:engine/model/selection~Selection|module:engine/model/documentselection~DocumentSelection} selection
 * @returns {'imageBlock'|'imageInline'}
 */
export function determineImageTypeForInsertionAtSelection(schema: any, selection: any): 'imageBlock' | 'imageInline';
