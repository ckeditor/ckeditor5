import InlineTooltipEditing from './inlinetooltipediting.js';
import InlineTooltipUI from './inlinetooltipui';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class InlineTooltip extends Plugin {
    static get requires() {
        return [InlineTooltipEditing, InlineTooltipUI];
    }
}