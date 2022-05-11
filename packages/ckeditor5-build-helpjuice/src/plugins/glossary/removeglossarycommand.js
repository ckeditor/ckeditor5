import Command from '@ckeditor/ckeditor5-core/src/command';

export default class RemoveGlossaryCommand extends Command {
    execute({ id }) {
        const editor = this.editor

        editor.model.enqueueChange({ isUndoable: false }, writer => {
            this._findGlossary(editor.model.document.getRoot(), id).forEach(el => {
                writer.removeAttribute('glossary', el)
                writer.removeAttribute('htmlSpan', el)
            });
        })
    }

    _findGlossary(root, id) {
        let result = []
		const glossary = root.getAttribute('glossary')

        if (glossary && glossary.id === id) {
            result.push(root)
            return result
        }

        if (!root.childCount) {
            return result
        }

        for (const child of root.getChildren()) {
            result.push(...this._findGlossary(child, id))
        }
        return result;
    }
}
