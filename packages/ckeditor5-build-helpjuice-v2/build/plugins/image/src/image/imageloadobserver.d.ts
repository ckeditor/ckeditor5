/**
 * Observes all new images added to the {@link module:engine/view/document~Document},
 * fires {@link module:engine/view/document~Document#event:imageLoaded} and
 * {@link module:engine/view/document~Document#event:layoutChanged} event every time when the new image
 * has been loaded.
 *
 * **Note:** This event is not fired for images that has been added to the document and rendered as `complete` (already loaded).
 *
 * @extends module:engine/view/observer/observer~Observer
 */
export default class ImageLoadObserver {
    /**
     * @inheritDoc
     */
    observe(domRoot: any): void;
    /**
     * Fires {@link module:engine/view/document~Document#event:layoutChanged} and
     * {@link module:engine/view/document~Document#event:imageLoaded}
     * if observer {@link #isEnabled is enabled}.
     *
     * @protected
     * @param {Event} domEvent The DOM event.
     */
    protected _fireEvents(domEvent: Event): void;
}
