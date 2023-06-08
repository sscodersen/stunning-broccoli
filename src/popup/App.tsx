import logo from '@/assets/img/logo.png'
import '@/assets/styles/base.scss'
import { APP_TITLE } from '@/config'
import { useCallback, useState } from 'react'
import useSWR from 'swr'
import Browser from 'webextension-polyfill'
import './styles.scss'

const isChrome = /chrome/i.test(navigator.userAgent)

function App() {
  const [question, setQuestion] = useState('')

  const accessTokenQuery = useSWR(
    'accessToken',
    () => Browser.runtime.sendMessage({ type: 'GET_ACCESS_TOKEN' }),
    { shouldRetryOnError: false },
  )
  const hideShortcutsTipQuery = useSWR('hideShortcutsTip', async () => {
    const { hideShortcutsTip } = await Browser.storage.local.get('hideShortcutsTip')
    return !!hideShortcutsTip
  })

  const openOptionsPage = useCallback(() => {
    Browser.runtime.sendMessage({ type: 'OPEN_OPTIONS_PAGE' })
  }, [])

  const openShortcutsPage = useCallback(() => {
    Browser.storage.local.set({ hideShortcutsTip: true })
    Browser.tabs.create({ url: 'chrome://extensions/shortcuts' })
  }, [])

  return (
    <div className="nectargpt--flex nectargpt--flex-col nectargpt--h-full nectargpt--popup">
      <div className="nectargpt--mb-1 nectargpt--flex nectargpt--flex-row nectargpt--items-center nectargpt--px-1">
        <img src={logo} className="nectargpt--w-5 nectargpt--h-5 nectargpt--rounded-sm" />
        <p className="nectargpt--text-sm nectargpt--font-semibold nectargpt--m-0 nectargpt--ml-1">
          {APP_TITLE}
        </p>
      </div>
      {isChrome && !hideShortcutsTipQuery.isLoading && !hideShortcutsTipQuery.data && (
        <p className="nectargpt--m-0 nectargpt--mb-1">
          Tip:{' '}
          <a onClick={openShortcutsPage} className="nectargpt--underline nectargpt--cursor-pointer">
            setup shortcuts
          </a>{' '}
          for faster access.
        </p>
      )}
    </div>
  )
}

export default App
