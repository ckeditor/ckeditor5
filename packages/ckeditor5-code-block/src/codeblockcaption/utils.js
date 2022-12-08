
/**
 * 
 * @param {module:engine/model/element~Element} modelElement Element to check if it is a codeblock wrapper
 * @returns 
 */
export function isCodeblockWrapper( modelElement ) {
    return !!modelElement && modelElement.is( 'element', 'codeBlock' );
}

/**
 * {@link module:engine/view/matcher~Matcher} pattern. Checks if a given element is a caption for codeblock.
 * Example format for codeblock caption is like below.
 * 
 * `<pre>
 *      <code>
 *          some codes here
 *      </code>
 *      <figcaption>
 *          some caption is here
 *      </figcaption>
 * </pre>`
 * 
 * @param {module:engine/view/element~Element} element 
 * @returns {Object|null} Returns the object accepted by {@link module:engine/view/matcher~Matcher} or `null` if the element
 * cannot be matched.
 */
export function matchCodeblockCaptionViewElement( element ) {
    const parent = element.parent;

    if ( element.name == 'figcaption' && parent && parent.name == 'pre') {
        return { name: true };
    }

    return null;
}

