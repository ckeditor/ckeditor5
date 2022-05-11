import Command from '@ckeditor/ckeditor5-core/src/command';

export default class InsertGlossaryCommand extends Command {
    execute({ id, definition }) {
        const editor = this.editor
        const selection = editor.model.document.selection

        editor.model.enqueueChange({ isUndoable: false }, writer => {
            const ranges = editor.model.schema.getValidRanges(selection.getRanges(), 'glossary')

            for (const range of ranges) {
				writer.setAttribute('glossary', {
					class: 'hj-glossary-item',
					id: id,
					definition: definition
				}, range);
            }
        })
    }

    refresh() {
        const model = this.editor.model
        const selection = model.document.selection
        this.isEnabled = !selection.isCollapsed
    }
}
