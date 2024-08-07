﻿# SD Webui Prompt Format
[[English](README.md)|中文]

這是一個[Automatic1111 Webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui)的插件，用來幫忙校正咒語。

> 亦支援 [SD.Next](https://github.com/vladmandic/automatic) 與 [Forge](https://github.com/lllyasviel/stable-diffusion-webui-forge) !

<p align="center"><img src="sample.jpg" width=512></p>

有時候如果打字太快或是從各處東拼西湊咒語，常會造成多個重複的空格或逗點。這個擴充可以幫忙移除它們。

## 功能
- [x] 在`txt2img`和`img2img`都有用
- [x] 移除多餘的**空格**和**逗點**
- [x] 修改錯誤的**括弧**
- [x] 開啟`Remove Duplicates`會把咒語中重複的單詞消除
  - **注意:** 只對單詞類咒語有效
    - **例.** `1girl, solo, smile, 1girl` 會變成 `1girl, solo, smile`
    - **例.** `a girl smiling, a girl standing` 則不變
- [x] 開啟`Remove Underscores`會將 `_` 換成 `空格`
  - 一些較新的動漫模型聲稱不用再加底線
- [x] 保留咒語的換行
  - 上述的`Remove Duplicates`只在同一行中有效
- [x] 按下`Auto Format`以在手動與自動間切換
  - `自動`: 每次按下 **生成 (Generate)** 時處裡
  - `手動`: 手動按下 **Format** 時才處裡
- [x] 在 **Settings** 頁面的 `System` 區 開啟/關閉 上述預設功能
- [x] 按下 `Alt` + `Shift` + `F` 亦可觸發格式化

## 注意
1. 由於`自動`校正和生成是同時觸發，除非有先用過`手動`校正，不然當下所產的第一張圖片之內部資料並不會被更新。

2. 有些擴充 *(如. [tagcomplete](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete))* 追蹤文字的編輯事件，意即文字校正會導致它們啟動。
你可以到 **Settings** 頁面的 `System` 區關閉咒語的自動編輯。
