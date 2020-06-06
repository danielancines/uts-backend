db.roles.insertMany(
    [
        { name: 'Listar Registro de Jogos e Saldo', description: 'Usuário pode acessar e listar o Registro de Jogos e Saldo', role: 'accessDailyBalances', collectionName: 'DailyBalances' },
        { name: 'Incluir Registro de Jogos e Saldo', description: 'Usuário pode incluir Registro de Jogos e Saldo', role: 'insertDailyBalances', collectionName: 'DailyBalances' },
        { name: 'Editar Registro de Jogos e Saldo', description: 'Usuário pode editar Registro de Jogos e Saldo', role: 'updateDailyBalances', collectionName: 'DailyBalances' },
        { name: 'Excluir Registro de Jogos e Saldo', description: 'Usuário pode excluir Registro de Jogos e Saldo', role: 'deleteDailyBalances', collectionName: 'DailyBalances' }
    ])