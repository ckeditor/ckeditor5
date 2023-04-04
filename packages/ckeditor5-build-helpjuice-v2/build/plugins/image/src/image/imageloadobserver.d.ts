/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module image/image/imageloadobserver
 */
import { Observer } from 'ckeditor5/src/engine';
/**
 * Observes all new images added to the {@link module:engine/view/document~Document},
 * fires {@link module:engine/view/document~Document#event:imageLoaded} and
 * {@link module:engine/view/document~Document#event:layoutChanged} event every time when the new image
 * has been loaded.
 *
 * **Note:** This event is not fired for images that has been added to the document and rendered as `complete` (already loaded).
 */
export default class ImageLoadObserver extends Observer {
    /**
     * @inheritDoc
     */
    observe(domRoot: HTMLElement): void;
    /**
     * @inheritDoc
     */
    stopObserving(domRoot: HTMLElement): void;
    /**
     * Fires {@link module:engine/view/document~Document#event:layoutChanged} and
     * {@link module:engine/view/document~Document#event:imageLoaded}
     * if observer {@link #isEnabled is enabled}.
     *
     * @param domEvent The DOM event.
     */
    private _fireEvents;
}
/**
 * Fired when an <img/> DOM element has been loaded in the DOM root.
 *
 * Introduced by {@link module:image/image/imageloadobserver~ImageLoadObserver}.
 *
 * @see module:image/image/imageloadobserver~ImageLoadObserver
 *
 * @eventName module:engine/view/document~Document#imageLoaded
 * @param data Event data.
 */
export type ImageLoadedEvent = {
    name: 'imageLoaded';
    args: [Event];
};
