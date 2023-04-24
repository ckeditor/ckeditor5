/**
 * The image text alternative editing plugin.
 *
 * Registers the `'imageTextAlternative'` command.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageTextAlternativeEditing {
    /**
     * @inheritDoc
     */
    static get requires(): (typeof ImageUtils)[];
    /**
     * @inheritDoc
     */
    static get pluginName(): string;
    /**
     * @inheritDoc
     */
    init(): void;
}
import ImageUtils from "../imageutils";
