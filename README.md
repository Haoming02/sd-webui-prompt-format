# SD Webui Prompt Format
[English|[中文](README_ZH.md)]

This is an Extension for the [Automatic1111 Webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui), which helps formatting prompts.

> Also supports [SD.Next](https://github.com/vladmandic/automatic) and [Forge](https://github.com/lllyasviel/stable-diffusion-webui-forge) out of the box!

<p align="center"><img src="sample.jpg" width=512></p>

Sometimes, when you type too fast or copy prompts from all over the places, you end up with duplicated **spaces** or **commas**. This simple Extension helps removing them whenever you click **Generate**.

## Features
- [x] Works in both `txt2img` and `img2img`
- [x] Remove duplicated **spaces** and **commas**
- [x] Fix misplaced **brackets** and **commas**
- [x] Toggle `Remove Duplicates` to remove identical tags found in the prompts
  - **Note:** Only works for tag-based prompt, not sentence-based prompt
    - **eg.** `1girl, solo, smile, 1girl` will become `1girl, solo, smile`
    - **eg.** `a girl smiling, a girl standing` will not be changed
- [x] Toggle `Remove Underscores` to replace `_` with `space`
  - Some newer anime checkpoints claim to eliminate the need of using underscores
- [x] Respect line breaks
  - `Remove Duplicates` only checks within the same line
- [x] Toggle between auto formatting and manual formatting
  - In `Auto`: The process is ran whenever you press **Generate**
  - In `Manual`: The process is only ran when you press the **Format** button
- [x] Toggle which above features is enabled/disabled by default in `System` section of the **Settings** tab
- [x] Pressing `Alt` + `Shift` + `F` can also trigger formatting

## Note
1. Since the formatting in `Auto` mode is triggered at the same time as the generation,
the immediate image will not have its metadata updated (unless you already did manual formatting beforehand).

2. Some Extensions *(**eg.** [tagcomplete](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete))* listen to the text editing event,
meaning the formatting will cause them to trigger. You can disable updating the actual prompts in the `System` section of the **Settings** tab.
