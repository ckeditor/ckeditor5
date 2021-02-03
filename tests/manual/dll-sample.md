# DLL sample test

**This DLL sample test requires that the DLL core and DLL packages are built.**

To build the DLL core and packages, run `yarn run build:dll` and then refresh this page.

Expected results:
* There should be no errors in the console.
* Four editors should be initialized correctly: Classic, Decoupled, Inline, and Balloon.
* Each editor should have the following features enabled and working: Bold, Italic, Insert table, Insert HTML, custom Ad-hoc button, Undo and Redo.
* Clicking the `Ad-hoc` button logs `It works!` in the console.