import Command from "@ckeditor/ckeditor5-core/src/command";
import ReactDOM from "react-dom";
import React from "react";
import FindAndReplaceForm from "./findandreplaceform";

export default class FindAndReplaceCommand extends Command {
  execute() {
    this.editor.fire("findAndReplace:open");

    const container = document.getElementById("search-results");

    ReactDOM.render(<FindAndReplaceForm editor={this.editor} />, container);

    this.activeSearch = null;
  }
}
