const App = () => {
    const [user, setUser] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [selectedChat, setSelectedChat] = React.useState(null);

    React.useEffect(() => {
        const savedUser = localStorage.getItem('chatUser');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const handleLogin = (userData) => {
        setUser(userData);
        localStorage.setItem('chatUser', JSON.stringify(userData));
    };

    const handleLogout = () => {
        setUser(null);
        setSelectedChat(null);
        localStorage.removeItem('chatUser');
    };

    const handleSelectChat = (chat) => {
        setSelectedChat(chat);
    };

    if (loading) {
        return <h3>Загрузка...</h3>;
    }

    if (!user) {
        return <Auth onLogin={handleLogin} />;
    }

    return (
        <div>
            <ChatList 
            user={user}
            onSelectChat={handleSelectChat}
            selectedChatId = {selectedChat?.id}
            />
            <Chat 
                user = {user}
                chat = {selectedChat}
            />
        </div>
    );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);