const App = () => {
    const [user, setUser] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

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
        localStorage.removeItem('chatUser');
    };

    if (loading) {
        return <h3 style={{ textAlign: 'center' }}>Загрузка...</h3>;
    }

    return (
        <div>
            {user ? (
                <Chat user={user} onLogout={handleLogout} />
            ) : (
                <Auth onLogin={handleLogin} />
            )}
        </div>
    );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);