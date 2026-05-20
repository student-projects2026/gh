// 直接从原小程序项目复用，无改动

export const contactPatterns = {
  phone: /1[3-9]\d{9}/g,
  wechatId: /(?:微信|vx|wechat|v信|薇信|威信)[：:]?\s*([a-zA-Z\d_-]{5,20})/gi,
  wechatQr: /(?:微信|vx)二维码/gi,
  qq: /(?:qq|QQ)[：:]?\s*(\d{5,11})/g,
  qqGroup: /(?:q群|QQ群|群号)[：:]?\s*(\d{5,11})/g,
  email: /[\w.-]+@[\w.-]+\.\w+/g,
  url: /https?:\/\/[^\s，。！？、"'（）【】]+/gi,
  shortUrl: /(?:链接|网址|网站|url)[：:]?\s*([^\s，。！？、"'（）【】]{5,})/gi,
}

const defaultSensitiveWords = [
  '傻逼', 'sb', '他妈的', 'tmd', 'nmsl', '尼玛', '草泥马', '贱人', '去死', '垃圾', '脑残',
  '诈骗', '骗局', '传销', '赌博', '博彩', '色情', '嫖娼', '吸毒', '贩毒',
]

export function detectContactInfo(text: string): Array<{ type: string; match: string }> {
  const results: Array<{ type: string; match: string }> = []
  for (const [type, pattern] of Object.entries(contactPatterns)) {
    const matches = text.match(pattern)
    if (matches) {
      matches.forEach((m) => results.push({ type, match: m }))
    }
  }
  return results
}

export function maskContactInfo(text: string): string {
  let masked = text
  masked = masked.replace(contactPatterns.phone, '***手机号已隐藏***')
  masked = masked.replace(contactPatterns.wechatId, '***微信号已隐藏***')
  masked = masked.replace(contactPatterns.wechatQr, '***二维码已隐藏***')
  masked = masked.replace(contactPatterns.qq, '***QQ已隐藏***')
  masked = masked.replace(contactPatterns.qqGroup, '***群号已隐藏***')
  masked = masked.replace(contactPatterns.email, '***邮箱已隐藏***')
  masked = masked.replace(contactPatterns.url, '***链接已隐藏***')
  return masked
}

export function hasContactInfo(text: string): boolean {
  return detectContactInfo(text).length > 0
}

export function checkSensitiveWords(text: string, extraWords: string[] = []): Array<{ word: string; index: number }> {
  const words = [...defaultSensitiveWords, ...extraWords]
  const results: Array<{ word: string; index: number }> = []
  const lowerText = text.toLowerCase()

  words.forEach((word) => {
    let index = lowerText.indexOf(word.toLowerCase())
    while (index !== -1) {
      results.push({ word, index })
      index = lowerText.indexOf(word.toLowerCase(), index + 1)
    }
  })

  return results
}

export function replaceSensitiveWords(text: string, extraWords: string[] = []): string {
  const words = [...defaultSensitiveWords, ...extraWords]
  let result = text

  words.forEach((word) => {
    const reg = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
    result = result.replace(reg, '**')
  })

  return result
}

export function validateContent(text: string, options?: { minLength?: number; maxLength?: number }): { valid: boolean; message: string } {
  const { minLength = 1, maxLength = 2000 } = options || {}

  if (!text || text.trim().length === 0) {
    return { valid: false, message: '内容不能为空' }
  }

  if (text.trim().length < minLength) {
    return { valid: false, message: `内容至少${minLength}个字` }
  }

  if (text.length > maxLength) {
    return { valid: false, message: `内容最多${maxLength}个字` }
  }

  const contacts = detectContactInfo(text)
  if (contacts.length > 0) {
    const typeMap: Record<string, string> = {
      phone: '手机号',
      wechatId: '微信号',
      wechatQr: '微信二维码',
      qq: 'QQ号',
      qqGroup: 'QQ群号',
      email: '邮箱',
      url: '链接',
      shortUrl: '链接',
    }
    const types = [...new Set(contacts.map((c) => typeMap[c.type] || '联系方式'))]
    return { valid: false, message: `检测到${types.join('、')}，平台禁止发布任何联系方式，请通过平台内沟通` }
  }

  const sensitive = checkSensitiveWords(text)
  if (sensitive.length > 0) {
    return { valid: false, message: '内容包含敏感词，请修改后重新提交' }
  }

  return { valid: true, message: '' }
}

export function validateContentRelaxed(text: string, options?: { minLength?: number; maxLength?: number }): { valid: boolean; message: string } {
  const { minLength = 1, maxLength = 2000 } = options || {}

  if (!text || text.trim().length === 0) {
    return { valid: false, message: '内容不能为空' }
  }

  if (text.trim().length < minLength) {
    return { valid: false, message: `内容至少${minLength}个字` }
  }

  if (text.length > maxLength) {
    return { valid: false, message: `内容最多${maxLength}个字` }
  }

  const sensitive = checkSensitiveWords(text)
  if (sensitive.length > 0) {
    return { valid: false, message: '内容包含敏感词，请修改后重新提交' }
  }

  return { valid: true, message: '' }
}

export function generateAnonymousId(openid: string, postId: string, seed: string): string {
  const str = `${openid}_${postId}_${seed}`
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  const absHash = Math.abs(hash).toString(16).padStart(6, '0')
  return `匿名#${absHash.substring(0, 6)}`
}
