/**
 * @module code-block/codeblockcaption
 */

import { Plugin } from 'ckeditor5/src/core';
import CodeblockCaptionUI from './codeblockcaption/codeblockcaptionui';
import CodeblockCaptionEditing from './codeblockcaption/codeblockcaptionediting';

import '../theme/codeblockcaption.css';

/**
 * The codeblock caption plugin.
 * 
 * For a detailed overview, check the {@glink features/codeblock/codeblock-captions codeblock caption} documentation.
 * 
 * @extends module:core/plugin~Plugin
 */
export default class CodeblockCaption extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires() {
        return [ CodeblockCaptionUI, CodeblockCaptionEditing ];
    }

    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'CodeblockCaption';
    }
}