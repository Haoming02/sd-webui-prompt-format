# SD Webui Prompt Format
[English|[中文](README_ZH.md)]

This is an Extension for the [Automatic1111 Webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui), which helps formatting prompts.

<p align="center"><img src="Demo.jpg" width=512></p>

> The above demo was achieved in just 1 process

Sometimes, when you type too fast or copy prompts from all over the places, you end up with duplicated **spaces** or **commas**. This simple Extension helps removing them whenever you click **Generate**.

## Feature List
- [x] Works in both `txt2img` and `img2img`
- [x] Remove duplicated **spaces** and **commas**
- [x] Fix misplaced **brackets** and **commas**
- [x] Toggle `Remove Duplicates` to remove identical tags found in the prompts
  - **Note:** Only works for tag-based prompt, not sentence-based prompt 
    - **eg.** `1girl, solo, smile, 1girl` will become `1girl, solo, smile`
    - **eg.** `a girl smiling, a girl standing` will not be changed
- [x] Toggle `Remove Underscores` to replace `_` with **space**
  - *Some newer anime checkpoints claim to eliminate the need of using underscores*
- [x] Respect line breaks
  - **Note:** `Remove Duplicates` only checks within the same line
- [x] Pressing `Ctrl + \` to quickly escape the **parentheses** of the hovered tag *(the words where the caret is)*
  - Normally, **parentheses** are used to increase the weight of a prompt. Therefore, for tags like `mejiro mcqueen (umamusume)`, you will need to escape it like `mejiro mcqueen \(umamusume\)`.
- [x] Toggle between auto formatting and manual formatting
  - In `Auto`: The process is ran whenever you press **Generate**
  - In `Manual`: The process is only ran when you press the **Format** button
- [x] **[New]** Toggle between auto updating prompts or not[^1]
  - Some Extensions *(**eg.** [tagcomplete](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete))* listen to the text editing event, which means the formatting causes them to trigger
  - You only really need to disable this if you have the above Extension
    - You can open `prompt_format.js` and edit this line at the top `static updateInput = true;` to `static updateInput = false;` to save the setting
  - When `disabled`, the formatting is purely visual. It will only update once you manually edit the prompt again

[^1]: Due to the implementation being in `JavaScript` instead pf `Python`, the image's metadata will still only be updated in the next generation. This toggle mainly affects when you click `Send to img2img`, will the prompt be already formatted or not, etc.