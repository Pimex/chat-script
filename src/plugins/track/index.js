import mixpanel from 'mixpanel-browser'
const MIXPANEL_TOKEN = '4eb2ba43842cf4f6f3d91af158012213'

mixpanel.init(MIXPANEL_TOKEN)

/* function event (eventName, data = false) {
  mixpanel.track(eventName, data)
  return eventName
} */

export default mixpanel
