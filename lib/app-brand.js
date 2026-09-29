const APP_NAME = 'Dea Trans HRGA'
const APP_LOGO_SRC = '/dea-trans-logo.png'

function getPageTitle(section) {
  return section ? `${section} - ${APP_NAME}` : APP_NAME
}

module.exports = { APP_NAME, APP_LOGO_SRC, getPageTitle }
