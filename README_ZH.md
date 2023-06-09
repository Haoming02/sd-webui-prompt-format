# SD Webui Prompt Format
[[English](README.md)|中文]

這是一個[Automatic1111 Webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui)的插件，可以幫忙校正咒語。

<p align="center"><img src="Demo.jpg" width=512></p>

> 示範圖

有時候打字太快，或是從各地東拼西湊咒語，常造成多個重複的空格或逗點。這項插件可以幫忙移除它們。

## 功能實作
- [x] 在`txt2img`和`img2img`都有用
- [x] 移除多餘**空格**和**逗點**
- [x] 修改錯誤的**括弧**
- [x] 開啟`Remove Duplicates`會把咒語中重複的單詞消除
  - **注意:** 只對單詞類咒語有效
    - **例.** `1girl, solo, smile, 1girl` 會變成 `1girl, solo, smile`
    - **例.** `a girl smiling, a girl standing` 則不變
- [x] 開啟`Remove Underscores`會將 `_` 換成**空格**
  - *一些較新的動漫模型聲稱不用再加底線*
- [x] 保留咒語的換行
  - **注意:** 上述的`Remove Duplicates`只在同一行中有效
- [x] 按下`Ctrl + \`來跳脫目前游標所在的單字
  - 平時，**括弧**是用來強調單字。所以若使用像是`mejiro mcqueen (umamusume)`的咒語，便必須跳脫成`mejiro mcqueen \(umamusume\)`
- [X] **[New]** 按下`Auto Format`以在手動與自動間切換
  - `自動`: 每次按下 **生成 (Generate)** 時處裡
  - `手動`: 手動按下`Format`時才處裡

<hr>

<sup><b>注意:</b> 上述美化只是視覺效果。唯有再次手動編輯後，咒語才會更新。</sup>