const Chat = ({ user, onLogout }) => {
    const [messages, setMessages] = React.useState([]);
    const [newMessage, setNewMessage] = React.useState('');

    React.useEffect(() => {
        const unsubscribe = MessagesLogic.subscribeToMessages((msgs) => {
            console.log('Получены сообщения:', msgs);
            setMessages(msgs);
        });
        return () => unsubscribe();
    }, []);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        await MessagesLogic.sendMessage(user.uid, user.username, newMessage);
        setNewMessage('');
    };

    const handleLogout = () => {
        onLogout();
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

    return (
        <div>
            <div>
                <h3>Чат</h3>
                <button onClick={handleLogout}> 
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
                <button type="submit">Отправить</button>
            </form>
        </div>
    );
};

window.Chat = Chat;