export default function Home() {
  return <RedirectToApp />
}

function RedirectToApp() {
  return (
    <html lang="zh-CN">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <title>AI 电商内容工坊</title>
        <meta name="description" content="AI驱动的电商内容生成工具，支持商品主图、种草文案、短视频脚本一站式生成" />
      </head>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.location.href = '/app'`,
          }}
        />
        跳转中...
      </body>
    </html>
  )
}
