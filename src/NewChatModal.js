// модальное окно создания нового чата
const NewChatModal = ({ user, onClose, onChatCreated }) => {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [searchResults, setSearchResults] = React.useState([]);
    const [selectedUsers, setSelectedUsers] = React.useState([]);
    const [isGroup, setIsGroup] = React.useState(false);
    const [groupName, setGroupName] = React.useState('');

    React.useEffect(() => {
        const searchUsers = async () => {
            if (searchTerm.length < 1) {
                setSearchResults([]);
                return;
            }

            const users = await ChatsLogic.searchUsers(searchTerm, user.uid);
            // есть ли в бд хотя бы один пользователь, айди которого совпадает с айди вводимом в search?
            const filtered = users.filter(u => !selectedUsers.some(su => su.uid === u.uid));
            setSearchResults(filtered);
        };
        // задержка чтобы сильно часто не фигачило
        const timeout = setTimeout(searchUsers, 250);
        return () => clearTimeout(timeout);
    }, [searchTerm, selectedUsers, user.uid]);
    // выбор пользователя из найденных
    const handleSelectUser = (selectedUser) => {
        setSelectedUsers([...selectedUsers, selectedUser]);
        setSearchTerm(''); // очистка поиска
        setSearchResults([]); // очистка результатов поиска
    };

    const handleRemoveUser = (userId) => {
        setSelectedUsers(selectedUsers.filter(u => u.uid !== userId));
    };

    const handleCreateChat = async () => {
        if (selectedUsers.length === 0) return;
        // формируем массив участников (включая текущего пользователя)
        const participants = [user.uid, ...selectedUsers.map(u => u.uid)];

        const result = await ChatsLogic.createChat(
            participants,
            isGroup,
            isGroup ? groupName : null
        );

        if (result.success) {
            onChatCreated(result.chatId);
        }
    };

    return (
        <div>
            <div>
                <h3>
                    {isGroup ? 'Создать группу' : 'Новый личный чат'}</h3>
                {/* переключатель типа чата */}
                <div>
                    <label>
                        <input
                            type="radio"
                            checked={!isGroup}
                            onChange={() => setIsGroup(false)}
                        /> Личный чат
                    </label>
                    <label>
                        <input
                            type="radio"
                            checked={isGroup}
                            onChange={() => setIsGroup(true)}
                        /> Групповой чат
                    </label>
                </div>
                {/* поле для названия группы */}
                {isGroup && (
                    <input
                        type="text"
                        placeholder="Название группы"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                    />
                )}

                {selectedUsers.length > 0 && (
                    <div>
                        {selectedUsers.map(u => (
                            <span key={u.uid}>
                                {u.username}
                                <button onClick={() => handleRemoveUser(u.uid)}>×</button>
                            </span>
                        ))}
                    </div>
                )}
                <div>
                    <input
                        type="text"
                        placeholder="Поиск пользователей..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchResults.length > 0 && (
                        <div>
                            {searchResults.map(u => (
                                <div key={u.uid} onClick={() => handleSelectUser(u)}>
                                    {u.username}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div>
                    <button onClick={onClose}>Отмена</button>
                    <button onClick={handleCreateChat} disabled={selectedUsers.length === 0}>
                        Создать
                    </button>
                </div>
            </div>
        </div>
    )
}