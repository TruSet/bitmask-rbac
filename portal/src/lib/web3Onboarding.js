export const metamaskIsApproved = async () =>
  window.ethereum &&
  window.ethereum._metamask &&
  (await window.ethereum._metamask.isApproved()) // eslint-disable-line

export const metamaskIsEnabled = async () =>
  window.ethereum &&
  window.ethereum._metamask &&
  (await window.ethereum._metamask.isEnabled()) // eslint-disable-line

export const metamaskIsUnlocked = async () =>
  window.ethereum &&
  window.ethereum._metamask &&
  (await window.ethereum._metamask.isUnlocked()) // eslint-disable-line


// This is a heuristic. It is not 100% reliable because user agents are spoofable and subject to change
// As such, no function should be hidden or exposed based on this result
export const metamaskAvail = () => {
  const ua = navigator.userAgent
  const isChromeOrBraveOrOperaOrFirefox =
    (/Chrome/.test(ua) && // Chrome, Brave and Opera, but also Edge
      !/Edge/.test(ua)) ||
    /Firefox/.test(ua)
  const isMobile = ua.match(/(iPad)|(iPhone)|(iPod)|(android)|(webOS)/i)
  return !isMobile && isChromeOrBraveOrOperaOrFirefox
}
