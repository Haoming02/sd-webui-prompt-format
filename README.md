# SD Webui Prompt Format
This is an Extension for the [Automatic1111 Webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui), which helps formatting prompts.

<p align="center"><img src="Demo.jpg"></p>

## What is This ?
- Sometimes, when you type too fast or copy prompts from all over the places, you end up with duplicated **spaces** or **commas**.
- This simple script helps removing them whenever you click **Generate**.
- Works in both `txt2img` and `img2img`.
- You can also toggle `Remove Duplicates` to remove duplicated tags found in the prompts. *(This is optional, since you may want duplicate tags to strengthen the concept sometimes.)*
  - **Note:** Only works for tag-based prompt but not for sentence-based prompt 
    - **eg.** `1girl, solo, smile, 1girl` will become `1girl, solo, smile`
    - **eg.** `a girl smiling, a girl standing` will not be changed
- Now respect line breaks too
  - **Note:** Dedupe only works within the same line