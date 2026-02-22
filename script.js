let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
const form = document.getElementById('cadastroForm');
const btnSubmit = document.getElementById('btn-submit');
const btnCancel = document.getElementById('btn-cancel');

// Inicializar lista
renderizarTabela();

form.addEventListener('submit', (e) => {
    e.preventDefault();
    limparErros();

    try {
        const indexEdit = parseInt(document.getElementById('editIndex').value);
        const novoUsuario = {
            nome: document.getElementById('nome').value.trim(),
            usuario: document.getElementById('usuario').value.trim(),
            email: document.getElementById('email').value.trim(),
            senha: document.getElementById('senha').value,
            dataNasc: document.getElementById('dataNascimento').value
        };

        validarCadastro(novoUsuario, indexEdit);

        if (indexEdit === -1) {
            usuarios.push(novoUsuario);
            exibirSucesso("CADASTRO_CONCLUÍDO");
        } else {
            usuarios[indexEdit] = novoUsuario;
            exibirSucesso("REGISTRO_ATUALIZADO");
            cancelarEdicao();
        }

        salvarEDesenhar();
        form.reset();

    } catch (erro) {
        const campoErro = document.getElementById(`error-${erro.campo}`);
        if (campoErro) campoErro.innerText = `> ERR: ${erro.message}`;
    }
});

function validarCadastro(dados, indexEdit) {
    if (!dados.nome) throw { campo: 'nome', message: 'NOME_REQUERIDO' };
    if (!dados.usuario) throw { campo: 'usuario', message: 'USER_ID_REQUERIDO' };
    
    // Verificar se usuário já existe (exceto se for o próprio sendo editado)
    const jaExiste = usuarios.some((u, i) => u.usuario === dados.usuario && i !== indexEdit);
    if (jaExiste) throw { campo: 'usuario', message: 'USER_ID_DUPLICADO' };

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) throw { campo: 'email', message: 'EMAIL_INVALIDO' };
    if (dados.senha.length < 6) throw { campo: 'senha', message: 'SENHA_CURTA (MIN 6)' };
    
    if (!dados.dataNasc) throw { campo: 'dataNascimento', message: 'DATA_REQUERIDA' };
    const idade = calcularIdade(dados.dataNasc);
    if (idade < 18) throw { campo: 'dataNascimento', message: 'IDADE_MINIMA_18' };
}

function calcularIdade(data) {
    const hoje = new Date();
    const nasc = new Date(data);
    let idade = hoje.getFullYear() - nasc.getFullYear();
    if (hoje.getMonth() < nasc.getMonth() || (hoje.getMonth() === nasc.getMonth() && hoje.getDate() < nasc.getDate())) idade--;
    return idade;
}

function salvarEDesenhar() {
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    renderizarTabela();
}

function renderizarTabela() {
    const corpoTabela = document.getElementById('listaUsuarios');
    corpoTabela.innerHTML = '';

    usuarios.forEach((u, index) => {
        corpoTabela.innerHTML += `
            <tr>
                <td>${u.nome}</td>
                <td>@${u.usuario}</td>
                <td>${u.email}</td>
                <td>${calcularIdade(u.dataNasc)}</td>
                <td class="actions">
                    <button onclick="prepararEdicao(${index})">EDIT</button>
                    <button class="btn-secondary" onclick="excluirUsuario(${index})">DEL</button>
                </td>
            </tr>
        `;
    });
}

function excluirUsuario(index) {
    if (confirm("CONFIRMAR_EXCLUSÃO?")) {
        usuarios.splice(index, 1);
        salvarEDesenhar();
    }
}

function prepararEdicao(index) {
    const u = usuarios[index];
    document.getElementById('nome').value = u.nome;
    document.getElementById('usuario').value = u.usuario;
    document.getElementById('email').value = u.email;
    document.getElementById('senha').value = u.senha;
    document.getElementById('dataNascimento').value = u.dataNasc;
    document.getElementById('editIndex').value = index;

    document.getElementById('form-title').innerText = "EDITAR_REGISTRO_#" + index;
    btnSubmit.innerText = "ATUALIZAR_DADOS";
    btnCancel.style.display = "inline-block";
    window.scrollTo(0, 0);
}

function cancelarEdicao() {
    form.reset();
    document.getElementById('editIndex').value = "-1";
    document.getElementById('form-title').innerText = "NOVO_CADASTRO";
    btnSubmit.innerText = "EXECUTAR_CADASTRO";
    btnCancel.style.display = "none";
}

btnCancel.addEventListener('click', cancelarEdicao);

function limparErros() {
    document.querySelectorAll('.error-message').forEach(e => e.innerText = '');
}

function exibirSucesso(msg) {
    const div = document.getElementById('mensagemSucesso');
    div.innerText = `> ${msg}_SUCCESS`;
    setTimeout(() => div.innerText = '', 3000);
}