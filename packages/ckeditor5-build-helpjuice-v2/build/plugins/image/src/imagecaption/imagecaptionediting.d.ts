/**
 * The image caption engine plugin. It is responsible for:
 *
 * * registering converters for the caption element,
 * * registering converters for the caption model attribute,
 * * registering the {@link module:image/imagecaption/toggleimagecaptioncommand~ToggleImageCaptionCommand `toggleImageCaption`} command.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageCaptionEditing {
    /**
     * @inheritDoc
     */
    static get requires(): (typeof ImageUtils | typeof ImageCaptionUtils)[];
    /**
     * @inheritDoc
     */
    static get pluginName(): string;
    /**
     * @inheritDoc
     */
    constructor(editor: any);
    /**
     * A map that keeps saved JSONified image captions and image model elements they are
     * associated with.
     *
     * To learn more about this system, see {@link #_saveCaption}.
     *
     * @member {WeakMap.<module:engine/model/element~Element,Object>}
     */
    _savedCaptionsMap: WeakMap<object, any>;
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Configures conversion pipelines to support upcasting and downcasting
     * image captions.
     *
     * @private
     */
    private _setupConversion;
    /**
     * Integrates with {@link module:image/image/imagetypecommand~ImageTypeCommand image type commands}
     * to make sure the caption is preserved when the type of an image changes so it can be restored
     * in the future if the user decides they want their caption back.
     *
     * @private
     */
    private _setupImageTypeCommandsIntegration;
    /**
     * Returns the saved {@link module:engine/model/element~Element#toJSON JSONified} caption
     * of an image model element.
     *
     * See {@link #_saveCaption}.
     *
     * @protected
     * @param {module:engine/model/element~Element} imageModelElement The model element the
     * caption should be returned for.
     * @returns {module:engine/model/element~Element|null} The model caption element or `null` if there is none.
     */
    protected _getSavedCaption(imageModelElement: any): any;
    /**
     * Saves a {@link module:engine/model/element~Element#toJSON JSONified} caption for
     * an image element to allow restoring it in the future.
     *
     * A caption is saved every time it gets hidden and/or the type of an image changes. The
     * user should be able to restore it on demand.
     *
     * **Note**: The caption cannot be stored in the image model element attribute because,
     * for instance, when the model state propagates to collaborators, the attribute would get
     * lost (mainly because it does not convert to anything when the caption is hidden) and
     * the states of collaborators' models would de-synchronize causing numerous issues.
     *
     * See {@link #_getSavedCaption}.
     *
     * @protected
     * @param {module:engine/model/element~Element} imageModelElement The model element the
     * caption is saved for.
     * @param {module:engine/model/element~Element} caption The caption model element to be saved.
     */
    protected _saveCaption(imageModelElement: any, caption: any): void;
}
import ImageUtils from "../imageutils";
import ImageCaptionUtils from "./imagecaptionutils";
