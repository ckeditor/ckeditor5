/**
 * This class wraps DOM element as a CKEditor5 UI View.
 *
 * It allows to render any DOM element and use it in mentions list.
 *
 * @extends {module:ui/view~View}
 */
export default class DomWrapperView {
    /**
     * Creates an instance of {@link module:mention/ui/domwrapperview~DomWrapperView} class.
     *
     * Also see {@link #render}.
     *
     * @param {module:utils/locale~Locale} [locale] The localization services instance.
     * @param {Element} domElement
     */
    constructor(locale?: any, domElement: Element);
    template: boolean;
    /**
     * The DOM element for which wrapper was created.
     *
     * @type {Element}
     */
    domElement: Element;
    /**
     * @inheritDoc
     */
    render(): void;
    element: Element | undefined;
}
