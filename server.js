const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Configuração do bodyParser para lidar com formulários
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Para processar JSON, se necessário

// Função para carregar usuários
function loadUsers() {
    const usersPath = path.join(__dirname, 'users.json');
    try {
        const data = fs.readFileSync(usersPath);
        return JSON.parse(data);
    } catch (err) {
        if (err.code === 'ENOENT') {
            // Arquivo não encontrado, retorna um array vazio
            return [];
        } else {
            throw err;
        }
    }
}

// Função para salvar usuários
function saveUsers(users) {
    const usersPath = path.join(__dirname, 'users.json');
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
}

// Função para carregar votos
function loadVotes() {
    const votesPath = path.join(__dirname, 'votes.json');
    try {
        const data = fs.readFileSync(votesPath);
        return JSON.parse(data);
    } catch (err) {
        if (err.code === 'ENOENT') {
            // Arquivo não encontrado, retorna um array vazio
            return [];
        } else {
            throw err;
        }
    }
}

// Função para salvar votos
function saveVotes(votes) {
    const votesPath = path.join(__dirname, 'votes.json');
    fs.writeFileSync(votesPath, JSON.stringify(votes, null, 2));
}

// Rota para servir a página inicial (Login)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para servir a página de registro
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Rota para servir a página de votação
app.get('/vote', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'vote.html'));
});

// Página de cadastro
app.post('/register', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
        return res.json({ success: false, message: 'Todos os campos são obrigatórios.' });
    }

    const users = loadUsers();

    // Verificar se o usuário já está cadastrado
    const userExists = users.some(user => user.email === email);
    if (userExists) {
        return res.json({ success: false, message: 'E-mail já cadastrado.' });
    }

    // Adicionar novo usuário
    users.push({ email, password });
    saveUsers(users);

    // Responder com sucesso
    res.json({ success: true });
});

// Página de login
app.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
        return res.json({ success: false, message: 'Todos os campos são obrigatórios.' });
    }

    const users = loadUsers();
    const user = users.find(user => user.email === email && user.password === password);

    if (user) {
        res.json({ success: true });
    } else {
        res.json({ success: false, message: 'E-mail ou senha incorretos.' });
    }
});

// Página de votação
app.post('/vote', (req, res) => {
    const candidate = req.body.candidate;

    if (!candidate) {
        return res.json({ success: false, message: 'Por favor, selecione um candidato.' });
    }

    const votes = loadVotes();

    // Adicionar voto
    votes.push({ candidate });
    saveVotes(votes);

    // Responder com sucesso
    res.json({ success: true });
});

// Servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname)));

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
