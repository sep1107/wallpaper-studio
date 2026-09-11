# 留白 · 壁纸分区工坊

一个在浏览器里制作桌面分区壁纸的小工具。上传喜欢的背景，添加半透明分区和标题，导出原尺寸 PNG，再把桌面图标放到对应区域。

**纯 HTML / CSS / JavaScript，无需注册、登录、后端或构建。图片只在浏览器本地处理，不上传服务器。**

## 功能

- 上传或拖入 JPG、PNG、WebP，也可直接使用内置的原创山景背景。
- 两、三、四分区预设，自由添加、复制和删除分区。
- 拖动分区移动，拖右下角调整大小。
- 修改标题、底色、文字颜色、透明度、圆角、字体和字号。
- 内置站酷小薇体、站酷快乐体、马善政楷书，按需加载，也可使用系统字体。
- 导出原尺寸 PNG，不带水印和编辑选框。
- 自适应桌面与窄屏布局。

## 本地运行

安装 Python 3 后，在终端执行：

```sh
git clone https://github.com/sep1107/wallpaper-studio.git
cd wallpaper-studio
python3 -m http.server 8766 --bind 127.0.0.1 --directory site
```

浏览器打开 <http://localhost:8766> 即可使用。也可以使用任意静态文件服务器。建议通过 HTTP 运行，避免直接双击 HTML 时浏览器限制本地字体加载。

## 使用方法

1. 上传背景，或者使用示例背景。
2. 选择一个分区布局，或自行添加分区。
3. 在画布中拖动分区，右侧调整标题与样式。
4. 点击右上角“导出壁纸”，将下载的 PNG 设置为系统壁纸。

此工具只生成视觉分区，不会自动整理真实文件或移动桌面图标。

## 静态部署

将 `site/` 中的全部文件连同 `fonts/` 上传到任意静态托管服务即可，无环境变量、数据库或 API。支持部署在子目录。

如使用 GitHub Pages，可以把 `site/` 的内容放到配置的发布目录；本仓库不自动启用托管服务。

## 限制

- 当前设计只保留在页面内存中，刷新或关闭页面会丢失。
- 最多 20 个分区；图片最大 40 MB、3200 万像素，最长边 8192 像素。
- 小图片仍按原尺寸导出，不会自动提高清晰度。
- 字号和圆角按 1920 像素宽度基准缩放；标题超出分区宽度会裁切，可减小字号或加宽分区。
- 字体首次选择需加载约 1.5–6.3 MB；导出会等待字体加载完成。系统字体的外观随设备变化。
- 使用支持 Canvas roundRect、Pointer Events 和 Image.decode 的现代浏览器。Safari 和真实手机触摸操作尚未完整验证。

## 项目结构

```text
site/
  index.html       页面
  style.css        样式
  app.js           Canvas 编辑与 PNG 导出
  fonts/           字体与各自的 OFL 许可
tests/browser.cjs  浏览器验收脚本
FONT-SOURCES.md    字体来源与 SHA-256
LICENSE           应用代码的 MIT 许可证
```

## 验证

启动上面的本地服务后，安装 Playwright 与 Chromium，再执行：

```sh
npm install --no-save --package-lock=false playwright
npx playwright install chromium
node tests/browser.cjs
```

可通过 `TEST_URL` 指定地址、`PLAYWRIGHT_MODULE` 指定已有的 Playwright 包路径。验收脚本覆盖字体、增删复制、拖动缩放、上传、PNG 尺寸与背景像素、空状态、窄屏布局和运行时错误。

## 许可证

应用代码采用 [MIT](LICENSE)，允许使用、修改、再分发及商用，需保留许可证与版权声明。

`site/fonts/` 中的三款字体分别采用 SIL Open Font License 1.1，**不适用应用代码的 MIT 许可**。原始字体和完整版权声明一并保留，详情见 [字体来源](FONT-SOURCES.md) 和 [字体许可说明](site/fonts/licenses.html)。上传图片的使用权由使用者自行确认。
