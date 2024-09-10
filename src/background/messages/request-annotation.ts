import type { PlasmoMessaging } from "@plasmohq/messaging"

import type { HtmlOptions } from "~constants"
import { convertTextContentToHtml } from "~util"

export type RequestBody = {
  text: string
  htmlOptions: HtmlOptions
}

export type RequestResponse = {
  action: string
  html: string
}

const handler: PlasmoMessaging.MessageHandler<
  RequestBody,
  RequestResponse
> = async (req, res) => {
  const { text, htmlOptions } = req.body
  const html = convertTextContentToHtml(text, htmlOptions)
  res.send({ action: "receiveAnnotation", html })
}

export default handler
