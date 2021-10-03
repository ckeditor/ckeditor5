import Command from '@ckeditor/ckeditor5-core/src/command';

export default class InlineTooltipCommand extends Command {
    execute({ tooltip, text }) {
        const editor = this.editor;
        const selection = editor.model.document.selection;

        editor.model.change(writer => {
            const inlinetooltip = writer.createElement('inlinetooltip', {
                ...Object.fromEntries(selection.getAttributes()),
                tooltip,
                text
            });

            // ... and insert it into the document.
            editor.model.insertContent(inlinetooltip);

            // Put the selection on the inserted element.
            writer.setSelection(inlinetooltip, 'on');
        });
    }

    refresh() {
        const model = this.editor.model;
        const selection = model.document.selection;

        const isAllowed = model.schema.checkChild(selection.focus.parent, 'inlinetooltip');

        this.isEnabled = isAllowed;
    }
}