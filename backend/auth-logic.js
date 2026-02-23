
const AuthLogic = {
    async findUserByUsername(username) {
        try {
            const usersRef = collection(window.db, "users");
            const q = query(usersRef, where("username", "==", username));
            const snapshot = await getDocs(q);
            
            if (snapshot.empty) {
                console.log('Пользователь не найден');
                return null;
            }
            
            const doc = snapshot.docs[0];
            
            return {
                uid: doc.id,
                ...doc.data()
            };
        } catch (error) {
            console.error('Ошибка при поиске:', error);
            return null;
        }
    },

    // создание нового пользователя
    async createUser(username, password) {
        try {
            const usersRef = collection(window.db, "users");
            const docRef = await addDoc(usersRef, {
                username: username,
                password: password,
                createdAt: new Date().toISOString()
            });
            
            return {
                uid: docRef.id,
                username: username
            };
        } catch (error) {
            console.error('Ошибка при создании:', error);
            return null;
        }
    },

    // проверка пароля
    async checkPassword(username, password) {
        const user = await this.findUserByUsername(username);
        
        if (!user) {
            return { success: false, message: 'Пользователь не найден' };
        }
        
        if (user.password !== password) {
            return { success: false, message: 'Неверный пароль' };
        }
        
        return {
            success: true,
            user: {
                uid: user.uid,
                username: user.username
            }
        };
    },

    // регистрация
    async register(username, password) {
        // Проверяем, не занят ли username
        const existingUser = await this.findUserByUsername(username);
        
        if (existingUser) {
            return { success: false, message: 'Имя пользователя занято' };
        }
        
        const newUser = await this.createUser(username, password);
        
        if (!newUser) {
            return { success: false, message: 'Ошибка при создании пользователя' };
        }
        
        return {
            success: true,
            user: newUser
        };
    }
};

window.AuthLogic = AuthLogic;
console.log('AuthLogic загружен с новым синтаксисом');