import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import ButtonView from "@ckeditor/ckeditor5-ui/src/button/buttonview";

import i18n from "@namespace/i18n";
import findAndReplaceIcon from "../../assets/images/findandreplace.svg";

export const COMMAND_NAME = "findAndReplace";

/**
 * Example Find & Replace UI that uses FindAndReplace plugin API.
 *
 * It demonstrates how to use that API form outside the editor (except UI buttons).
 */
export default class FindAndReplaceUI extends Plugin {
  init() {
    const { editor } = this;

    editor.ui.componentFactory.add(COMMAND_NAME, (locale) => {
      // The state of the button will be bound to the widget command.

      const command = editor.commands.get(COMMAND_NAME);

      // The button will be an instance of ButtonView.
      const buttonView = new ButtonView(locale);

      buttonView.set({
        // The t() function helps localize the editor. All strings enclosed in t() can be
        // translated and change when the language of the editor changes.
        label: i18n.t("sidebar.findAndReplace.title"),
        icon: findAndReplaceIcon,
        tooltip: true,
      });

      // Bind the state of the button to the command.
      buttonView.bind("isOn", "isEnabled").to(command, "value", "isEnabled");

      this.listenTo(buttonView, "execute", () => editor.execute(COMMAND_NAME));

      return buttonView;
    });
  }
}
