import { useState, useCallback, useEffect } from 'preact/hooks'
import classNames from 'classnames'
import { XCircleFillIcon, GearIcon } from '@primer/octicons-react'
import Browser from 'webextension-polyfill'
import ChatGPTQuery from '@/content-script/compenents/ChatGPTQuery'
// import { extractFromHtml } from '@/utils/article-extractor/cjs/article-extractor.esm'
import { getUserConfig, Language, getProviderConfigs, APP_TITLE } from '@/config'
import { getSummaryPrompt } from '@/content-script/prompt'
import { isIOS } from '@/utils/utils'
import { getPageSummaryContntent, getPageSummaryComments } from '@/content-script/utils'
import { commentSummaryPrompt, pageSummaryPrompt, pageSummaryPromptHighlight } from '@/utils/prompt'
import logoWhite from '@/assets/img/logo-white.png'
import logo from '@/assets/img/logo.png'

interface Props {
  pageSummaryEnable: boolean
  pageSummaryWhitelist: string
  pageSummaryBlacklist: string
  siteRegex: RegExp
}

function PageSummary(props: Props) {
  const { pageSummaryEnable, pageSummaryWhitelist, pageSummaryBlacklist, siteRegex } = props
  const [showCard, setShowCard] = useState(false)
  const [supportSummary, setSupportSummary] = useState(true)
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState<boolean>(false)

  const onSwitch = useCallback(() => {
    setShowCard((state) => {
      const cardState = !state

      if (cardState) {
        setQuestion('')
        setLoading(false)
      }

      return cardState
    })
  }, [])

  const openOptionsPage = useCallback(() => {
    Browser.runtime.sendMessage({ type: 'OPEN_OPTIONS_PAGE' })
  }, [])

  const onSummary = useCallback(async () => {
    setLoading(true)
    setSupportSummary(true)

    setQuestion('')

    const pageComments = await getPageSummaryComments()
    const pageContent = await getPageSummaryContntent()
    const article = pageComments ? pageComments : pageContent

    const title = article?.title || document.title || ''
    const description =
      article?.description ||
      document.querySelector('meta[name="description"]')?.getAttribute('content') ||
      ''
    const content = article?.content ? description + article?.content : title + description

    if (article?.content || description) {
      const language = window.navigator.language
      const userConfig = await getUserConfig()
      const providerConfigs = await getProviderConfigs()

      const promptContent = getSummaryPrompt(
        content.replace(/(<[^>]+>|\{[^}]+\})/g, ''),
        providerConfigs.provider,
      )
      const replyLanguage = userConfig.language === Language.Auto ? language : userConfig.language

      const prompt = pageComments?.content
        ? commentSummaryPrompt({
            content: promptContent,
            language: replyLanguage,
            prompt: userConfig.promptComment
              ? userConfig.promptComment
              : pageSummaryPromptHighlight,
            rate: article?.['rate'],
          })
        : pageSummaryPrompt({
            content: promptContent,
            language: replyLanguage,
            prompt: userConfig.promptPage ? userConfig.promptPage : pageSummaryPromptHighlight,
          })

      setQuestion(prompt)
      return
    }

    setSupportSummary(false)
  }, [])

  useEffect(() => {
    Browser.runtime.onMessage.addListener((message) => {
      const { type } = message
      if (type === 'OPEN_WEB_SUMMARY') {
        if (showCard) {
          return
        }

        setQuestion('')
        setShowCard(true)
        setLoading(false)
      }
    })
  }, [showCard])

  useEffect(() => {
    const hostname = location.hostname
    const blacklist = pageSummaryBlacklist.replace(/[\s\r\n]+/g, '')
    const whitelist = pageSummaryWhitelist.replace(/[\s\r\n]+/g, '')

    const inWhitelist = !whitelist
      ? !blacklist.includes(hostname)
      : !blacklist.includes(hostname) && pageSummaryWhitelist.includes(hostname)

    const show =
      pageSummaryEnable && ((isIOS && inWhitelist) || (inWhitelist && !siteRegex?.test(hostname)))

    setShow(show)
  }, [pageSummaryBlacklist, pageSummaryEnable, pageSummaryWhitelist, siteRegex])

  return (
    <>
      {showCard ? (
        <div className="nectargpt--card">
          <div className="nectargpt--card__head ">
            <div className="nectargpt--card__head--title">
              <a href="https://nectargpt.app" rel="noreferrer" target="_blank">
                <img src={logo} alt={APP_TITLE} /> {APP_TITLE}
              </a>{' '}
              <button
                className={classNames('nectargpt--btn', 'nectargpt--btn__icon')}
                onClick={openOptionsPage}
              >
                <GearIcon size={14} />
              </button>
            </div>

            <div className="nectargpt--card__head--action">
              <button
                className={classNames('nectargpt--btn', 'nectargpt--btn__icon')}
                onClick={onSwitch}
              >
                <XCircleFillIcon />
              </button>
            </div>
          </div>

          <div className="nectargpt--card__content">
            {question ? (
              <div className="nectargpt--container">
                <div className="nectargpt--chatgpt">
                  <ChatGPTQuery question={question} />
                </div>
              </div>
            ) : (
              <div className="nectargpt--card__empty ">
                {!supportSummary ? (
                  'Sorry, the summary of this page is not supported.'
                ) : (
                  <button
                    className={classNames(
                      'nectargpt--btn',
                      'nectargpt--btn__primary',
                      // 'nectargpt--btn__large',
                      'nectargpt--btn__block',
                    )}
                    onClick={onSummary}
                    disabled={loading}
                  >
                    Summary
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        show && (
          <button
            onClick={onSwitch}
            className={classNames('nectargpt--btn', 'nectargpt--btn__launch', 'nectargpt--btn__primary')}
          >
            <img
              src={logoWhite}
              alt={APP_TITLE}
              className="nectargpt--w-5 nectargpt--h-5 nectargpt--rounded-sm"
            />
          </button>
        )
      )}
    </>
  )
}

export default PageSummary
