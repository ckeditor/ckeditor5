/**
 * The auto-image plugin. It recognizes image links in the pasted content and embeds
 * them shortly after they are injected into the document.
 *
 * @extends module:core/plugin~Plugin
 */
export default class AutoImage {
    /**
     * @inheritDoc
     */
    static get requires(): (typeof Delete | typeof Clipboard | typeof Undo | typeof ImageUtils)[];
    /**
     * @inheritDoc
     */
    static get pluginName(): string;
    /**
     * @inheritDoc
     */
    constructor(editor: any);
    /**
     * The paste–to–embed `setTimeout` ID. Stored as a property to allow
     * cleaning of the timeout.
     *
     * @private
     * @member {Number} #_timeoutId
     */
    private _timeoutId;
    /**
     * The position where the `<imageBlock>` element will be inserted after the timeout,
     * determined each time a new content is pasted into the document.
     *
     * @private
     * @member {module:engine/model/liveposition~LivePosition} #_positionToInsert
     */
    private _positionToInsert;
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Analyzes the part of the document between provided positions in search for a URL representing an image.
     * When the URL is found, it is automatically converted into an image.
     *
     * @protected
     * @param {module:engine/model/liveposition~LivePosition} leftPosition Left position of the selection.
     * @param {module:engine/model/liveposition~LivePosition} rightPosition Right position of the selection.
     */
    protected _embedImageBetweenPositions(leftPosition: any, rightPosition: any): void;
}
import { Delete } from "@ckeditor/ckeditor5-typing";
import { Clipboard } from "@ckeditor/ckeditor5-clipboard";
import { Undo } from "@ckeditor/ckeditor5-undo";
import ImageUtils from "./imageutils";
