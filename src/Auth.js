const Auth = ({ onLogin }) => {
    const [isLogin, setIsLogin] = React.useState(true);
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        let result;
        if (isLogin) {
            result = await AuthLogic.checkPassword(username, password);
        } else {
            result = await AuthLogic.register(username, password);
        }

        if (result?.success) {
            onLogin(result.user);
        } else {
            alert(result?.message || 'Ошибка');
        }
    };


    return (
        <div>
            <h1>Регистрация</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Имя пользователя"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button type="submit">
                    {isLogin ? 'Войти' : 'Зарегистрироваться'}
                </button>
            </form>

            {/* меняет окошко регистрации на окошко со входом */}
            <button onClick={() => setIsLogin(!isLogin)}>
                 {isLogin ? 'Нет аккаунта? Создать' : 'Уже есть аккаунт? Войти'}
            </button>
        </div>
    )

}

window.Auth = Auth;