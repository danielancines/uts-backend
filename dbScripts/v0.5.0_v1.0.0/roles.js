db.roles.insertMany(
    [
        { name: 'Listar Grupos', description: 'Usuário pode acessar e listar os grupos', role: 'accessGroups', collectionName: 'Groups' },
        { name: 'Incluir Grupos', description: 'Usuário pode incluir grupos', role: 'insertGroup', collectionName: 'Groups' },
        { name: 'Editar Grupos', description: 'Usuário pode editar grupos', role: 'updateGroup', collectionName: 'Groups' },
        { name: 'Excluir Grupos', description: 'Usuário pode excluir grupos', role: 'deleteGroup', collectionName: 'Groups' },
        { name: 'Listar Categorias', description: 'Usuário pode acessar e listar as categorias', role: 'accessCategories', collectionName: 'Categories' },
        { name: 'Incluir Categorias', description: 'Usuário pode incluir categorias', role: 'insertCategory', collectionName: 'Categories' },
        { name: 'Editar Categorias', description: 'Usuário pode editar categorias', role: 'updateCategory', collectionName: 'Categories' },
        { name: 'Excluir Categorias', description: 'Usuário pode excluir categorias', role: 'deleteCategory', collectionName: 'Categories' }        
    ])