const MessagesLogic = {
    // Отправка сообщения
    async sendMessage(userId, username, text) {
        try {
            await db.collection('messages').add({
                text: text,
                userId: userId,
                username: username,
                timestamp: new Date().toISOString()
            });
            console.log('✅ Сообщение отправлено');
        } catch (error) {
            console.error('❌ Ошибка отправки:', error);
        }
    },

    // Подписка на сообщения в реальном времени
    subscribeToMessages(callback) {
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
console.log('MessagesLogic загружен');