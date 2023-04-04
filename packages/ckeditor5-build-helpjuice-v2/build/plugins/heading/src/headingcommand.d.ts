/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module heading/headingcommand
 */
import { Command, type Editor } from 'ckeditor5/src/core';
/**
 * The heading command. It is used by the {@link module:heading/heading~Heading heading feature} to apply headings.
 */
export default class HeadingCommand extends Command {
    /**
     * If the selection starts in a heading (which {@link #modelElements is supported by this command})
     * the value is set to the name of that heading model element.
     * It is  set to `false` otherwise.
     *
     * @observable
     * @readonly
     */
    value: false | string;
    /**
     * Set of defined model's elements names that this command support.
     * See {@link module:heading/headingconfig~HeadingOption}.
     */
    readonly modelElements: Array<string>;
    /**
     * Creates an instance of the command.
     *
     * @param editor Editor instance.
     * @param modelElements Names of the element which this command can apply in the model.
     */
    constructor(editor: Editor, modelElements: Array<string>);
    /**
     * @inheritDoc
     */
    refresh(): void;
    /**
     * Executes the command. Applies the heading to the selected blocks or, if the first selected
     * block is a heading already, turns selected headings (of this level only) to paragraphs.
     *
     * @param options.value Name of the element which this command will apply in the model.
     * @fires execute
     */
    execute(options: {
        value: string;
    }): void;
}
