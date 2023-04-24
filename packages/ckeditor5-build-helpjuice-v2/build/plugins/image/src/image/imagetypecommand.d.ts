/**
 * The image type command. It changes the type of a selected image, depending on the configuration.
 *
 * @extends module:core/command~Command
 */
export default class ImageTypeCommand {
    /**
     * @inheritDoc
     *
     * @param {module:core/editor/editor~Editor} editor
     * @param {'imageBlock'|'imageInline'} modelElementName Model element name the command converts to.
     */
    constructor(editor: any, modelElementName: 'imageBlock' | 'imageInline');
    /**
     * Model element name the command converts to.
     *
     * @readonly
     * @private
     * @member {'imageBlock'|'imageInline'}
     */
    private readonly _modelElementName;
    /**
     * @inheritDoc
     */
    refresh(): void;
    isEnabled: any;
    /**
     * Executes the command and changes the type of a selected image.
     *
     * @fires execute
     * @returns {Object|null} An object containing references to old and new model image elements
     * (for before and after the change) so external integrations can hook into the decorated
     * `execute` event and handle this change. `null` if the type change failed.
     */
    execute(): Object | null;
}
