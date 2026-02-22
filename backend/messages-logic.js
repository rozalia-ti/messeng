const MessagesLogic = {
    // отправка сообщения
    async sendMessage(userId, username, info) {
        await db.collection('messages').add({
            info: info,
            userId: userId,
            username: username,
            timestamp: new Date().toISOString()
        });
    },

    // получение сообщений в реальном времени
    subscribeToMessages(callback) {
        // orderBy('timestamp', 'asc') - сортируем по времени (старые сверху)
        // onSnapshot - слушаем изменения (автообновление)
        return db.collection('messages')
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