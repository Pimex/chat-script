import mixpanel from './plugins/track'
import { Buffer } from 'buffer'

const URL_API = 'http://localhost:3001/chats'
const URL_WIDGET = 'http://localhost:8081'
let f = false
let iframeContainer = null

const Base64 = {
  encode: string => Buffer.from(string, 'utf8').toString('base64'),
  decode: string => Buffer.from(string, 'base64').toString('utf8')
}

async function getLocation () {
  try {
    const location = (
      await fetch('https://freegeoip.app/json/', {
        method: 'GET'
      })
    ).json()
    return location.city || location.country_name
  } catch (e) {
    return ''
  }
}

async function createChat (auth, boardId) {
  const location = await getLocation()
  const newChat = (
    await (
      await fetch(`${URL_API}`, {
        method: 'POST',
        headers: {
          Authorization: auth,
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          boardId,
          location
        })
      })
    ).json()
  ).data

  const chatInfo = {
    chatId: newChat.id,
    contactId: newChat.contactInfo.id
  }

  localStorage.setItem('pimexChatData', Base64.encode(JSON.stringify(chatInfo)))

  return chatInfo
}

async function getChatsSettings (auth, boardId) {
  return (
    await (
      await fetch(`${URL_API}/settings/${boardId}`, {
        method: 'GET',
        headers: { Authorization: auth }
      })
    ).json()
  ).data
}

window.ChatsPimex = {
  init: async function ({ id, token }) {
    const auth = 'Basic ' + Base64.encode(`${id}:${token}`)
    const buttonId = 'button-pimex-cf414d48-aca2-4c94-ba9a-9170d8df4a79'
    const chatsSettings = await getChatsSettings(auth, id)

    const buttonStyles = `
    #${buttonId} {
      background-color: ${chatsSettings.color};
      border-radius: 50%;
      position: fixed;
      bottom: ${chatsSettings.margin.bottom}px;
      right: ${chatsSettings.margin.right}px;
      z-index: 10000;
      width: 60px;
      height: 60px;
      padding: 0;
      border: none;
      outline: none;
      transform: scale(0);
      opacity: 0;
      transition: opacity 0.2s ease-out, transform 0.2s ease-out;
    }
    
    #${buttonId}.loaded {
      transform: scale(1);
      opacity: 1;
    }

    #${buttonId} .icons .open {
      transform: scale(0.6) rotate(0);
      transition: transform 0.2s ease-out, opacity 0.2s ease-out;
    }
    
    #${buttonId} .icons .close {
      opacity: 0;
      transform: scale(0.1) rotate(-90deg);
      transition: transform 0.2s ease-out, opacity 0.2s ease-out;
    }
    
    #${buttonId}.active .icons .open {
      opacity: 0;
      transform: scale(0.1) rotate(90deg);
    }
    
    #${buttonId}.active .icons .close {
      opacity: 1;
      transform: scale(0.5) rotate(0);
    }
    
    #${buttonId} .icons {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
      height: 100%;
    }
    
    #${buttonId} .icons svg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
    
    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
    `

    // STYLES

    const styleSheet = document.createElement('style')
    document.head.appendChild(styleSheet)

    styleSheet.innerHTML = buttonStyles

    // BUTTON

    const buttonRef = document.createElement('button')
    buttonRef.setAttribute('id', buttonId)

    const buttonIconsRef = document.createElement('div')
    buttonIconsRef.classList.add('icons')

    const svgOpenButtonIcon = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg'
    )
    const svgCloseButtonIcon = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg'
    )
    const pathOpenButtonIconInner = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'path'
    )
    const pathOpenButtonIconOutter = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'path'
    )
    const pathCloseButtonIcon = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'path'
    )

    pathOpenButtonIconInner.setAttributeNS(null, 'fill', 'white')
    pathOpenButtonIconInner.setAttributeNS(
      null,
      'd',
      'M125.19,84l.14.29c.11.25.22.49.29.62A54.07,54.07,0,0,0,149.72,110a20.18,20.18,0,0,1-9.34,2.38,3.12,3.12,0,0,0-2.51,1.24,2.84,2.84,0,0,0-.42,2.67,21.24,21.24,0,0,0,7.45,9.22c-1.92.37-3.83.84-5.7,1.39l28.64,25a2,2,0,0,0,3.32-1.5V111a27.6,27.6,0,0,0,25.41-27.53V27.6A27.6,27.6,0,0,0,169,0H70A27.62,27.62,0,0,0,42.33,27.62V47.19a55.64,55.64,0,0,1,23.83-6,55.41,55.41,0,0,1,29,8.91,9.52,9.52,0,0,0,10.22-.22,93.64,93.64,0,0,1,34.52-13.41,3.11,3.11,0,0,1,2.58.62,3,3,0,0,1,1.12,2.38c-.25,8.69-2.18,28.93-14,39.44'
    )
    pathOpenButtonIconOutter.setAttributeNS(null, 'fill', 'white')

    pathOpenButtonIconOutter.setAttributeNS(
      null,
      'd',
      'M124.44,52.45A38.15,38.15,0,0,0,107,61.38s0,0,0,0l0,0a3.47,3.47,0,0,0-.26.37,3.3,3.3,0,0,0-.3.43,2.11,2.11,0,0,0-.12.48,2.68,2.68,0,0,0-.11.49,3.93,3.93,0,0,0,.06.48,2.1,2.1,0,0,0,.09.5,2.76,2.76,0,0,0,.25.44,3.38,3.38,0,0,0,.24.41l0,0,0,0A67.73,67.73,0,0,1,120,84.7l.12.26c.09.22.19.43.25.54a46.52,46.52,0,0,0,20.28,22.06,16.33,16.33,0,0,1-7.87,2.09,2.61,2.61,0,0,0-2.47,3.43,18.59,18.59,0,0,0,6.28,8.09,52.4,52.4,0,0,0-12.77,4.37,41.79,41.79,0,0,0-6.12,4.17A71.47,71.47,0,0,1,70.3,146.09a71.46,71.46,0,0,1-47.37-16.38,42.24,42.24,0,0,0-6.11-4.17A53,53,0,0,0,4,121.17a18.66,18.66,0,0,0,6.28-8.09,2.61,2.61,0,0,0-2.48-3.43A16.37,16.37,0,0,1,0,107.55a46.39,46.39,0,0,0,20.22-22c.1-.21.2-.42.29-.64l.14-.31A67.76,67.76,0,0,1,33.8,65.13l0,0,0,0a3.38,3.38,0,0,0,.24-.41,1.5,1.5,0,0,0,.34-.94,3.93,3.93,0,0,0,.06-.48,2.68,2.68,0,0,0-.11-.49,2.81,2.81,0,0,0-.12-.48,2.61,2.61,0,0,0-.31-.43,1.9,1.9,0,0,0-.26-.37l0,0,0,0a38.13,38.13,0,0,0-17.48-8.93,2.6,2.6,0,0,0-1,5.1,32,32,0,0,1,13,6.06A73.77,73.77,0,0,0,16.92,80.3C7,71.07,5.38,53.31,5.16,45.7a2.65,2.65,0,0,1,1-2.1,2.57,2.57,0,0,1,2.17-.54A76.8,76.8,0,0,1,37.34,54.83a7.72,7.72,0,0,0,8.59.18A45.38,45.38,0,0,1,70.3,47.19,45.32,45.32,0,0,1,94.67,55a7.72,7.72,0,0,0,8.6-.19,77,77,0,0,1,29.06-11.76,2.49,2.49,0,0,1,2.16.54,2.63,2.63,0,0,1,.95,2.09c-.21,7.62-1.83,25.38-11.75,34.61a73.77,73.77,0,0,0-11.22-16.69,32,32,0,0,1,13-6.06,2.59,2.59,0,0,0,2-1.72'
    )
    pathCloseButtonIcon.setAttributeNS(null, 'fill', 'white')
    pathCloseButtonIcon.setAttributeNS(
      null,
      'd',
      'M11.469,10l7.08-7.08c0.406-0.406,0.406-1.064,0-1.469c-0.406-0.406-1.063-0.406-1.469,0L10,8.53l-7.081-7.08 c-0.406-0.406-1.064-0.406-1.469,0c-0.406,0.406-0.406,1.063,0,1.469L8.531,10L1.45,17.081c-0.406,0.406-0.406,1.064,0,1.469 c0.203,0.203,0.469,0.304,0.735,0.304c0.266,0,0.531-0.101,0.735-0.304L10,11.469l7.08,7.081c0.203,0.203,0.469,0.304,0.735,0.304 c0.267,0,0.532-0.101,0.735-0.304c0.406-0.406,0.406-1.064,0-1.469L11.469,10z'
    )

    svgOpenButtonIcon.appendChild(pathOpenButtonIconInner)
    svgOpenButtonIcon.appendChild(pathOpenButtonIconOutter)
    svgCloseButtonIcon.appendChild(pathCloseButtonIcon)

    svgOpenButtonIcon.classList.add('open')
    svgOpenButtonIcon.setAttributeNS(null, 'viewBox', '0 0 198 162.64')
    svgCloseButtonIcon.classList.add('close')
    svgCloseButtonIcon.setAttributeNS(null, 'viewBox', '0 0 20 20')

    buttonIconsRef.appendChild(svgOpenButtonIcon)
    buttonIconsRef.appendChild(svgCloseButtonIcon)

    buttonRef.appendChild(buttonIconsRef)

    document.querySelector('body').appendChild(buttonRef)

    buttonRef.onclick = async function () {
      if (!f) {
        const localChatData = JSON.parse(
          Base64.decode(localStorage.getItem('pimexChatData'))
        )
        const chatData = localChatData || (await createChat(auth, id))

        const iframeId = `chat-pimex-${chatData.id}`

        const iframeStyles = `
        #${iframeId} {
          position: relative;
          opacity: 0;
          visibility: hidden;
          position: fixed;
          bottom: 80px;
          right: 0;
          z-index: 9999;
          width: 430px;
          height: calc(100vh - 140px);
          transform: translateY(25px);
          transition: opacity 0.2s ease-out, visibility 0.2s ease-out, transform 0.1s ease-out;
        }
        
        #${iframeId}.active {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }
        
        #${iframeId}.loaded iframe {
          opacity: 1;
        }
        
        #${iframeId}.loaded .loader {
          opacity: 0;
          visibility: hidden;
        }
        
        #${iframeId} .loader {
          position: absolute;
          border-radius: 50%;
          width: 100px;
          height: 100px;
          top: 50%;
          left: calc(50% - 50px);
          border: 10px solid transparent;
          border-left: 10px solid #555;
          transition: opacity 0.2s ease-out, visibility 0.2s ease-out;
          animation: spin 1s infinite linear;
        }
        
        #${iframeId} iframe {
          width: 100%;
          height: 100%;
          border: none;
          opacity: 0;
          transition: opacity 0.2s ease-out;
        }
        
        @media (max-width: 767.98px) {
          #${iframeId} {
            width: 100vw;
            height: calc(100vh - 100px);
            right: 0;
            left: 0;
          }
        }`

        styleSheet.innerHTML += iframeStyles

        // IFRAME

        iframeContainer = document.createElement('div')
        iframeContainer.id = iframeId

        const iframeLoader = document.createElement('div')
        iframeLoader.classList.add('loader')

        const iframeRef = document.createElement('iframe')
        iframeRef.src = `${URL_WIDGET}/${chatData.contactId}/${chatData.id}/${id}/${token}`

        iframeContainer.appendChild(iframeRef)
        iframeContainer.appendChild(iframeLoader)

        document.querySelector('body').appendChild(iframeContainer)
        mixpanel.track('chat.customer.open-chat') // Track

        iframeRef.onload = function () {
          iframeContainer.classList.add('loaded')
        }
        f = true
      }

      buttonRef.classList.toggle('active')
      iframeContainer.classList.toggle('active')
    }

    setTimeout(() => {
      buttonRef.classList.add('loaded')
      console.log('Chat Pimex v1 init')
      mixpanel.track('chat.customer.view-page') // Track
    }, 500)
  }
}
