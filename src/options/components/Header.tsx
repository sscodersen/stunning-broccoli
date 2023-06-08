import { getExtensionVersion, AppName } from '@/utils/utils'
import logo from '@/assets/img/logo.png'

function Header() {
  return (
    <>
      <nav className="nectargpt--flex nectargpt--flex-row nectargpt--justify-between nectargpt--items-center nectargpt--mt-5 nectargpt--px-2">
        <div className="nectargpt--flex nectargpt--flex-row nectargpt--items-center nectargpt--gap-2">
          <a href="https://nectargpt.app/" target="_blank" rel="noreferrer">
            <img
              src={logo}
              className="nectargpt--w-10 nectargpt--h-10 nectargpt--rounded-lg"
              style={{ 'vertical-align': 'middle' }}
            />
            <span className="font-semibold">
              {AppName} (v
              {getExtensionVersion()})
            </span>{' '}
          </a>
        </div>
        <div className="nectargpt--flex nectargpt--flex-row nectargpt--gap-3">
          <a href="https://discord.gg/JEJExVuWVM" target="_blank" rel="noreferrer">
            Discord
          </a>
          <a
            href="https://github.com/sparticleinc/chatgpt-google-summary-extension/issues"
            target="_blank"
            rel="noreferrer"
          >
            Feedback
          </a>
          <a href="https://twitter.com/Nectargpt_summary" target="_blank" rel="noreferrer">
            Twitter
          </a>
          <a
            href="https://github.com/sparticleinc/chatgpt-google-summary-extension"
            target="_blank"
            rel="noreferrer"
          >
            Source code
          </a>
        </div>
      </nav>
    </>
  )
}

export default Header
