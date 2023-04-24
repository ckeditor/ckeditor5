/**
 * The image text alternative command. It is used to change the `alt` attribute of `<imageBlock>` and `<imageInline>` model elements.
 *
 * @extends module:core/command~Command
 */
export default class ImageTextAlternativeCommand {
    /**
     * The command value: `false` if there is no `alt` attribute, otherwise the value of the `alt` attribute.
     *
     * @readonly
     * @observable
     * @member {String|Boolean} #value
     */
    /**
     * @inheritDoc
     */
    refresh(): void;
    isEnabled: boolean | undefined;
    value: any;
    /**
     * Executes the command.
     *
     * @fires execute
     * @param {Object} options
     * @param {String} options.newValue The new value of the `alt` attribute to set.
     */
    execute(options: {
        newValue: string;
    }): void;
}
