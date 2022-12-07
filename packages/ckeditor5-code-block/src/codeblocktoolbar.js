/**
 * @module code-block/codeblocktoolbar
 */
 import { Plugin } from 'ckeditor5/src/core';
 import { WidgetToolbarRepository } from 'ckeditor5/src/widget';
 import { getClosestSelectedCodeblock } from './utils';

 /**
  * The codeblock toolbar plugin. It creates and manages the codeblock toolbar. (the toolbar displayed when an codeblock is selected).
  */
 export default class CodeblockToolbar extends Plugin {
    /**
     * @inheritDoc
     */
    static get require() {
        return [ WidgetToolbarRepository ];
    }

    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'CodeblockToolbar';
    }

    /**
     * @inheritDoc
     */
    afterInit() {
        const editor = this.editor;
        const t = editor.t;
        const widgetToolbarRepository = editor.plugins.get( WidgetToolbarRepository );
        
        console.log(`Einstrasse codeblock-toolbar afterInit() called!`);
        console.log(`editor.config.get('codeblock.toolbar') => ${editor.config.get( 'codeblock.toolbar' )}`);

        widgetToolbarRepository.register( 'codeblock', {
            ariaLabel: t( 'Image toolbar'), //TODO: rename this value.... for locale setting
            items: editor.config.get( 'codeblock.toolbar' ),
            // getRelatedElement: selection => selection.getSelectedElement()
            getRelatedElement: function(selection) {
                console.log(`Einstrasse: ${selection}`);
                const selectedPosition = selection.getFirstPosition();
                console.log(`Parent = ${selectedPosition.parent}`);
                let ret = getClosestSelectedCodeblock( selection );
                console.log(`ret = ${ret}`);
                return ret;
                return getClosestSelectedCodeblock( selection );
            }
            
        } );
    }
 }