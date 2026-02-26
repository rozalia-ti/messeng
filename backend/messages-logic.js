const MessagesLogic = {
    // Отправка сообщения
    async sendMessage(userId, username, text) {
         try {
            // Создаем документ сообщения
            const messageData = {
                chatId: chatId,
                userId: userId,
                username: username,
                text: text,
                timestamp: new Date().toISOString()
            };
        
            await db.collection('messages').add(messageData);
            // Обновляем информацию о последнем сообщении в чате
            await ChatLogic.updateChatLastMeessage(chatId, messageData);
            return {success: true};
        } catch (error) {
            console.error('Ошибка отправки:', error);
            return {success: false, error: error.message};
        }
    },

    // Подписка на сообщения в реальном времени
    subscribeToMessages(chatId, callback) {
        return db.collection('messages')
            .where('chatId', '==', chatId)
            .orderBy('timestamp', 'asc')
            .onSnapshot((snapshot) => {
                const messages = [];
                snapshot.forEach(doc => {
                    messages.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                callback(messages);
            });
    }
};

window.MessagesLogic = MessagesLogic;
console.log('MessagesLogic загружен');