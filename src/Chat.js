const Chat = ({ user, chat, onLogout }) => {
    const [messages, setMessages] = React.useState([]);
    const [newMessage, setNewMessage] = React.useState('');

    React.useEffect(() => {
        if (!chat) return;
        const unsubscribe = MessagesLogic.subscribeToMessages(chat.id, (msgs) => {
            setMessages(msgs);
        });
        return () => unsubscribe();
    }, [chat]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !chat) return;
        await MessagesLogic.sendMessage(
            chat.id, user.uid, user.username, newMessage);
        setNewMessage('');
    };


    const formatDate = (timestamp) => {
        if (!timestamp) return 'только что';
        try {
            const date = new Date(timestamp);
            if (isNaN(date.getTime())) return 'только что';
            return date.toLocaleTimeString();
        } catch {
            return 'только что';
        }
    };
    // если чат не выбран
    if (!chat) {
        return (
            <div>
                <div>
                    <h3>Чат</h3>
                    <button onClick={onLogout}>
                        Выйти
                    </button>
                </div>
                <div>
                    <p>Выберите чат</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div>
                <h3>
                    {chat.isGroup
                        ? (chat.name || 'Групповой чат')
                        : chat.otherUserName
                    }
                </h3>
                <button onClick={onLogout}>
                    Выйти
                </button>
            </div>

            <div>
                {messages.map(msg => (
                    <div key={msg.id}>
                        <div>
                            {msg.username} • {formatDate(msg.timestamp)}
                        </div>
                        <div>
                            {msg.info || msg.text}
                        </div>
                    </div>
                ))}
            </div>
            <form onSubmit={sendMessage}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Введите сообщение..."
                />
                <button type="submit" disabled={!newMessage.trim()}>
                    Отправить
                </button>
            </form>
        </div>
    );
};

window.Chat = Chat;