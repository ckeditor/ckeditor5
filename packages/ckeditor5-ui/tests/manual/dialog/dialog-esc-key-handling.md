# Esc key handling in dialogs

1. This manual test showcases how the dialog system interacts with the Esc key press.
2. Open the dialog by clicking the "Open dialog" button.
3. Keep pressing Esc key according to the instructions.
4. The dialog should not close until the last (10th) Esc key press. Only then the child view will stop `preventDefaulting` on the keydown event.
