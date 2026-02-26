// компонент списка чатов
const ChatList = ({ user, onSelectChat, selectedChatId }) => {
    const [chats, setChats] = React.useState([]);
    // showNewChatModal - показывается новое модальное окно, или нет (деструктуризация)
    const [showNewChatModal, setShowNewChatModal] = React.useState(false);
    React.useEffect(() => {
        if (!user) return;
        const unsubscribe = ChatLogic.subscribeToUserChats(user.uid, (updatedChats) => {
            setChats(updatedChats);
        });
        return () => unsubscribe();
    }, [user]);

    return (
        <div>
            <div>
                {/* при нажатии на кнопку всплывает модальное окно */}
                <button onClick={() => setShowNewChatModal(true)}>
                    Новый чат
                </button>
            </div>
            {/* Список чатов */}
            <div>
                {chats.map(chat => (
                    <div
                        key={chat.id}
                        onClick={() => onSelectChat(chat)}
                    >
                        <div>
                            {chat.isGroup
                                ? (chat.name || 'Групповой чат')
                                : chat.otherUserName
                            }
                        </div>
                        {/* Отображаем последнее сообщение, если оно есть */}
                        {chat.lastMessage && (
                            <div>
                                {chat.lastMessageSender}:{chat.lastMessage}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {/* Модальное окно создания чата */}
            {showNewChatModal && (
                <NewChatModal 
                    user = {user}
                    onClose = {() => setShowNewChatModal(false)}
                    onChatCreated = {(chatId) => {
                        setShowNewChatModal(false);
                        const newChat = chats.find(c => c.id === chatId);
                        if (newChat) onSelectChat(newChat)
                    }}
                />
            )}
        </div>

    );
};
window.ChatList = ChatList;