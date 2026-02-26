//файл, который обнаруживает какой пользователь в каком чате состоит.
const ChatLogic = {
    // participants - массив ID пользователей которые будут состоять в этом чате
    // isGroup - true для группового чата, false - для лс
    // chatName - название группы (для лс = null)
    // возвращает создан или нет, айли чата, существует ли чат уже.
    async createChat(participants, isGroup = false, chatName = null) {
        try {
            if (!isGroup && participants.length === 2) {
                // проверяем, существует ли уже личный чат, в котором состоит и первый, и второй пользователь.
                const exsistingChat = await this.findPrivateChat(participants[0], participants[1]);

                if (exsistingChat) {
                    // если существует такой чат, то мы используем существующий, чтобы не дублировать чат.
                    return {
                        success: true, chatId: exsistingChat.id, isExisting: true

                    };
                }
            }

            // добавляем новый чат, будь он групповой или личный.
            const chatRef = await db.collection('chats').add({
                isGroup: isGroup,
                name: chatName,
                createdBy: participants[0]
            });
            // добавляем для каджого пользователя айди чата, в котором он состоит.
            for (const userId of participants) {
                await db.collection('chatParticipants').add({
                    chatId: chatRef.id,
                    userId: userId
                });
            }

            return { success: true, chatId: chatRef.id, isExisting: false };

        } catch (error) {
            console.error('Ошибка при создании чата:', error);
            return { success: false, error: error.message };
        }
    },

    // ищем существует ли лс между двумя пользователями
    async findPrivateChat(userId1, userId2) {
        try {
            // Находим все чаты, где участвует первый пользователь
            const participants1 = await db.collection('chatParticipants')
                .where('userId', '==', userId1)
                .get();

            const chatIds1 = participants1.docs.map(doc => doc.data().chatId);
            if (chatIds1.length === 0) return null;

            // Среди этих чатов ищем те, где есть второй пользователь
            const participants2 = await db.collection('chatParticipants')
                .where('userId', '==', userId2)
                .where('chatId', 'in', chatIds1)
                .get();

            if (participants2.empty) return null;

            // Проверяем каждый найденный чат на то, что он не групповой
            for (const doc of participants2.docs) {
                const chatData = doc.data();
                const chatSnapshot = await db.collection('chats').doc(chatData.chatId).get();
                const chat = chatSnapshot.data();

                // Если чат не групповой - возвращаем его
                if (chat && !chat.isGroup) {
                    return { id: chatSnapshot.id, ...chat };
                }
            }

            return null;
        } catch (error) {
            console.error('Ошибка при поиске личного чата:', error);
            return null;
        }
    },

    // получение всех чатов пользователя
    async getUserChats(userId) {
        try {
            const participantsSnapshot = await db.collection('chatParticipants')
                .where('userId', '==', userId)
                .get()

            const chatIds = participantsSnapshot.docs.map(doc => doc.data().chatId);
            if (chatIds.length === 0) return [];

            const chats = [];
            for (const chatId of chatIds) {
                const chatSnapshot = await db.collection('chats').doc(chatId).get();
                if (chatSnapshot.exists) {
                    const chatData = chatSnapshot.data();
                    // Для личных чатов находим имя собеседника
                    if (!chatData.isGroup) {
                        const otherUser = await this.getOtherParticipant(chatId, userId);
                        chatData.otherUserName = otherUser?.username || 'Пользователь';
                        chatData.otherUserId = otherUser?.uid;
                    }
                    chats.push({
                        id: chatSnapshot.id,
                        ...chatData
                    });
                }
            }
            return chats;
        } catch (error) {
            console.error('Ошибка при получении чатов:', error);
            return [];
        }
    },


    // Получение собеседника в личном чате (задействуется выше)
    async getOtherParticipant(chatId, currentUserId) {
        try {
            // ищем участника, который не равен текущему пользователю
            const participantsSnapshot = await db.collection('chatParticipants')
                .where('chatId', '==', chatId)
                .where('userId', '!=', currentUserId)
                .limit(1)
                .get();

            if (participantsSnapshot.empty) return null;
            // у нас остался один пользователь и из бдшки мы достаем его как первого из списка
            const getOtherParticipant = participantsSnapshot.docs[0].data();
            // а затем находим этого пользователя по его ID
            const userSnapshot = await db.collection('users').doc(getOtherParticipant.userId).get();

            if (userSnapshot.exists) {
                return {
                    uid: userSnapshot.id,
                    ...userSnapshot.data()
                };
            }
            return null;
        } catch (error) {
            console.error('Ошибка при получении собеседника:', error);
            return null;
        }
    },

    subscribeToUserChats(userId, callBack) {
        return db.collection('chatParticipants')
            .where('userId', '==', userId)
            .onSnapshot(async (snapshot) => {
                const chatIds = snapshot.docs.map(doc => doc.data().chatId);

                if (chatIds.length === 0) {
                    callBack([]);
                    return;
                }
                const chats = [];
                for (const chatId of chatIds) {
                    const chatSnapshot = await db.collection('chats').doc(chatId).get();
                    if (chatSnapshot.exists) {
                        const chatData = chatSnapshot.data();
                        if (!chatData.isGroup) {
                            const otherUser = await this.getOtherParticipant(chatId, userId);
                            chatData.otherUserName = otherUser?.username || 'Пользователь';
                            chatData.otherUserId = otherUser?.uid;
                        }
                        chats.push({
                            id: chatSnapshot.id,
                            ...chatData
                        });
                    }
                }
                callback(chats);
            });
    },
    // поиск пользователей по username
    async searchUsers(searchTerm, currentUserId) {
        try {
            if (!searchTerm || searchTerm.length < 1) return [];
            const snapshot = await db.collection('users')
            .where('username', '==', searchTerm)
            .where('username', '<=', searchTerm + '\uf8ff')
            .limit(10)
            .get();

        const users = [];
        snapshot.forEach(doc => {
            // исключение текущего пользователя из результатов
            if(doc.id != currentUserId) {
                users.push({
                    uid:doc.id,
                    username: doc.data().username
                });
            }
        });
        return users;
        } catch (error) {
            console.error('Ошибка при поиске пользователей:', error);
            return [];
        }
    },
    async updateChatLastMeessage(chatId, message) {
        try {
            await db.collection('chats').doc('chaiId').update({
                lastMessage: message.text,
                lastMessageTime: message.timestamp,
                lastMessageSender: message.username
            });
        } catch(error) {
            console.error('Ошибка при обновлении последнего сообщения', error)
        }
    }
};

window.ChatLogic = ChatLogic;
console.log('Загружена логика между чатами - ChatsLogic.js')