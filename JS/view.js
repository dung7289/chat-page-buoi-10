const view = {}
view.setActiveScreen = (screenName, fromCreateConversation = false) => {
    switch (screenName) {
        case 'registerPage':
            document.getElementById('app').innerHTML = component.registerPage
            document.getElementById('Login-btn').addEventListener('click', () => { view.setActiveScreen('loginPage') })
            const registerForm = document.getElementById('register-form')
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault()
                const data = {
                    firstName: registerForm.firstName.value,
                    lastName: registerForm.lastName.value,
                    email: registerForm.email.value,
                    password: registerForm.password.value,
                    confirmPassword: registerForm.confirmPassword.value,
                }
                controller.register(data)
            })
            break;
        case 'loginPage':
            document.getElementById('app').innerHTML = component.loginPage
            document.getElementById('Register-btn').addEventListener('click', () => { view.setActiveScreen('registerPage') })
            const loginForm = document.getElementById('login-form')
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault()
                const data = {
                    email: loginForm.email.value,
                    password: loginForm.password.value,
                }
                controller.login(data)

            })

            break;
        case 'chatPage':
            document.getElementById('app').innerHTML = component.chatPage
            document.getElementById('create-conversation').addEventListener('click', () => {
                view.setActiveScreen('createNewChatPage')
            })
            if (fromCreateConversation) {
                view.showCurrentConversation()
                view.showConversations()
            } else {
                model.listenConversationChange()
                model.getConversations()
            }
            const sendMessageForm = document.getElementById('send-message-form')
            sendMessageForm.addEventListener('submit', async (e) => {

                e.preventDefault()
                const message = {
                    content: sendMessageForm.message.value,
                    owner: model.currentUser.email,
                    createdAt: new Date().toISOString()
                }



                if (sendMessageForm.message.value.trim() !== '') {
                    model.addMessage(message)


                }
                sendMessageForm.message.value = ``


            })
            document.querySelector('#send-message-form input').addEventListener('click', () => {
                view.hideNotification(model.currentConversation.id)
            })
            const addFriendForm = document.getElementById('add-user-form')
            addFriendForm.addEventListener('submit', (e) => {
                e.preventDefault()
                const friendEmail = {
                    email: addFriendForm.email.value
                }
                controller.addFriend(friendEmail)
                addFriendForm.email.value = ''
            })

            break;
        case 'createNewChatPage':
            document.getElementById('app').innerHTML = component.createNewChatPage
            const createNewChatForm = document.getElementById('create-conversation-form')
            createNewChatForm.addEventListener('submit', (e) => {
                e.preventDefault()
                const data = {
                    title: createNewChatForm.title.value,
                    email: createNewChatForm.email.value,
                }
                if (controller.createConversation(data) === false) {
                    view.setActiveScreen('chatPage', true)
                }

            })
            const redirectToChat = document.getElementById('redirect-to-chat')
            redirectToChat.addEventListener('click', () => {
                view.setActiveScreen('chatPage', true)
            })
            break;
    }
}
view.setErrorMessage = (elementId, content) => {
    document.getElementById(elementId).innerText = content
}

view.addMessage = (message) => {
    const messageWrapper = document.createElement('div')
    messageWrapper.classList.add('message')
    if (message.owner === model.currentUser.email) {
        messageWrapper.classList.add('mine')
        messageWrapper.innerHTML = `
        <div class="content"> ${message.content}</div>`
    } else {
        messageWrapper.classList.add('their')
        messageWrapper.innerHTML = `
        <div class="owner">${message.owner}</div>
        <div class="content"> ${message.content}</div>`
    }

    document.querySelector('.list-message').appendChild(messageWrapper)
    document.querySelector('.list-message').scrollTop = messageWrapper.offsetHeight + messageWrapper.offsetTop
}

function checkMessage(message) {
    let space_number = 0
    console.log('check number ' + message.length)
    for (let index = 0; index < message.length; index++) {
        if (message[index] === ' ') {
            space_number = space_number + 1
        }
    }
    if (space_number === message.length) {
        return false
    } else {
        return true
    }
}
view.showCurrentConversation = () => {
    document.querySelector('.list-message').innerHTML = ''
    for (message of model.currentConversation.messages) {
        view.addMessage(message)
    }
    document.querySelector('.list-user').innerHTML = ''
    document.querySelector('.conversation-title').innerHTML = model.currentConversation.title
    for (user of model.currentConversation.users) {
        view.addUser(user)
    }
    view.scrollToEndElement()

}
view.scrollToEndElement = () => {
    const element = document.querySelector(".list-message")
    element.scrollTop = element.scrollHeight
}
view.showConversations = () => {
    for (conversation of model.conversations) {
        view.addConversation(conversation)
    }
}
view.addConversation = (conversation) => {
    const conversationWrapper = document.createElement('div')
    conversationWrapper.classList.add('conversation')
    conversationWrapper.classList.add('cursor-pointer')
    conversationWrapper.id = conversation.id
    if (conversation.id === model.currentConversation.id) {
        conversationWrapper.classList.add('current')
    }
    conversationWrapper.innerHTML = `
        <div class="left-conversation-title">${conversation.title}</div>
        <div class="num-of-user">${conversation.users.length} users</div>
        <div class="notification"></div>`
    const mediaQuery = window.matchMedia('(max-width:768px)')
    if (mediaQuery.matches) {
        conversationWrapper.firstElementChild.innerText = conversation.title[0].toUpperCase()
        document.getElementById('create-conversation').innerText = '+'
    }
    mediaQuery.addListener((e) => {
        if (e.matches) {
            conversationWrapper.firstElementChild.innerText = conversation.title[0].toUpperCase()
            document.getElementById('create-conversation').innerText = '+'
        } else {
            conversationWrapper.firstElementChild.innerText = conversation.title
            document.getElementById('create-conversation').innerText = '+ New Conversation'
        }
    })
    document.querySelector('.list-conversations').appendChild(conversationWrapper)
    conversationWrapper.addEventListener('click', () => {
        console.log(conversation.title)
        model.currentConversation = model.conversations.filter(item => item.id === conversation.id)[0]
        view.showCurrentConversation()
        document.querySelector('.conversation.current').classList.remove('current')
        conversationWrapper.classList.add('current')
        view.hideNotification(conversation.id)
    })
}
view.addUser = (user) => {
    const addWrapper = document.createElement('div')
    addWrapper.classList.add('user-email')
    addWrapper.innerHTML = user
    document.querySelector('.list-user').appendChild(addWrapper)

}
view.addUserInConversation = (numberUser) => {
    const currentConversationElement = document.querySelector('.conversation.current .num-of-user')
    currentConversationElement.innerText = numberUser + ' users'

}
view.showNotification = (docId) => {
    console.log(docId)
    const conversation = document.getElementById(docId)
    conversation.querySelector('.notification').style = 'display: block'
}
view.hideNotification = (docId) => {
    console.log(docId)
    const conversation = document.getElementById(docId)
    conversation.querySelector('.notification').style = 'display: none'
}

