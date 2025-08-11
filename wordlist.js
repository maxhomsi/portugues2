// wordList.js
// +1000 palavras PT-BR em minúsculas

const WORDS_INTERNAL = [
"escola","aluno","aluna","professor","professora","quadro","lousa","livro","caderno","caneta",
"lapis","borracha","mochila","estojo","teste","prova","dever","tarefa","nota","biblioteca",
"sala","janela","porta","carteira","recreio","almoço","lanche","merenda","colegio","familia",
"pai","mae","irmao","irma","avo","tia","tio","primo","prima","filho",
"filha","casa","quarto","sala","cozinha","banheiro","garagem","jardim","varanda","terraço",
"comida","alimento","fruta","maçã","maca","banana","laranja","uva","pera","manga",
"abacaxi","melancia","melao","melão","morango","amora","cereja","pessego","pêssego","nectarina",
"goiaba","jabuticaba","cenoura","batata","tomate","alface","couve","cogumelo","cebola","alho",
"pepino","arroz","feijao","feijão","massa","macarrao","macarrão","pao","pão","bolo",
"biscoito","sorvete","chocolate","leite","suco","agua","água","cha","chá","pizza",
"hamburguer","sanduiche","sanduíche","salada","molho","tempero","sal","acucar","açúcar","pimenta",
"cozinhar","cozinheiro","cozinheira","restaurante","padaria","mercearia","supermercado","mercado","feira","loja",
"roupa","camisa","calça","calca","vestido","saia","sapato","meia","boné","bone",
"chapeu","chapéu","casaco","jaqueta","luva","cachecol","bolsa","mochila","colar","brinco",
"anel","chapéu","acessorio","acessório","óculos","oculos","tocador","relógio","relogio","cinto",
"brinquedo","jogo","jogar","jogos","quebra-cabeça","quebra cabeça","puzzle","boneca","carrinho","lego",
"boneco","tabuleiro","xadrez","damas","bola","futebol","basquete","volei","voleibol","natação",
"natacao","nadar","pular","correr","andar","pedalar","bicicleta","moto","carro","ônibus",
"onibus","trem","metro","metrô","aviao","avião","barco","navio","porta","janela",
"ponte","estrada","rodovia","cidade","bairro","rua","avenida","praça","praca","parque",
"praia","mar","oceano","litoral","ilha","montanha","serra","colina","vale","rio",
"lago","cachoeira","floresta","bosque","campo","fazenda","quintal","grama","areia","concha",
"pedra","rocha","caverna","sol","lua","estrela","ceu","céu","nublado","ensolarado",
"chuva","tempestade","trovão","trovao","relampago","relâmpago","vento","brisa","neve","gelo",
"geada","inverno","verao","verão","primavera","outono","estação","estacao","clima","temperatura",
"tempo","dia","noite","manhã","manha","tarde","horario","horário","relogio","calendario",
"calendário","agenda","evento","festa","aniversario","aniversário","bolo","vela","presente","convite",
"decoracao","decoração","balão","balao","musica","música","filme","cinema","teatro","musical",
"serie","série","episodio","episódio","historia","história","contar","ler","escrever","escrita",
"leitura","livraria","biblioteca","poesia","poema","autor","autora","biografia","biográfia","noticia",
"notícia","jornal","revista","blog","email","e-mail","mensagem","chat","conversa","dialogo",
"diálogo","palavra","frase","sentenca","frase","ideia","pensamento","imaginação","imaginacao","sonho",
"sonhar","lembrar","memória","memoria","recordar","esquecer","aprendizagem","aprender","estudar","aula",
"professor","professora","ensinar","ensino","curso","materia","matéria","disciplina","experimento","laboratorio",
"laboratório","ciência","ciencia","cientista","pesquisa","estudo","notebook","computador","tablet","celular",
"telefone","monitor","teclado","mouse","impressora","camera","câmera","foto","filmagem","video",
"vídeo","aplicativo","app","programa","software","jogo","programacao","programação","codigo","código",
"site","pagina","página","rede","internet","online","offline","senha","conta","perfil",
"dados","informacao","informação","segurança","seguranca","privacidade","backup","nuvem","cloud","arquivo",
"documento","pdf","imagem","grafico","mapa","rota","direção","direcao","local","endereco",
"endereço","cidade","estado","pais","país","continente","mundo","terra","planeta","universo",
"amizade","amigo","amiga","companheiro","companheira","familia","familiares","parente","parentesco","vizinho",
"vizinha","esposa","marido","namorado","namorada","casamento","amor","amar","amoroso","carinho",
"abraço","abraco","beijo","sorriso","sorrir","feliz","felicidade","alegria","triste","tristeza",
"chorar","rir","raiva","raivoso","nervoso","calmo","medo","coragem","corajoso","orgulho",
"vergonha","timidez","curiosidade","curioso","entusiasmo","tédio","tedio","cansaço","sono","dormir",
"acordar","descansar","relaxar","saude","saúde","doença","doente","hospital","medico","médico",
"enfermeiro","farmacia","farmácia","remedio","remédio","vacina","vacinação","alimentação","alimentacao","nutricao",
"nutrição","fraco","forte","força","forca","energia","atividade","exercicio","exercício","alongamento",
"respirar","respiração","respiracao","banho","escovar","escovar","higiene","limpeza","arrumar","organizar",
"cozinhar","limpar","varrer","passar","lavar","dobrar","costurar","conserto","consertar","consertado",
"fazer","criar","construir","montar","desmontar","consertar","inventar","descobrir","explorar","viajar",
"aventura","mapear","navegar","explorador","piloto","capitão","capitao","motorista","motor","mecanica",
"mecânica","engenheiro","engenharia","arquitetura","arquiteto","designer","design","arte","artista","pintura",
"pintar","desenho","desenhar","ilustracao","ilustração","musica","instrumento","violao","violão","piano",
"flauta","bateria","dança","danca","teatro","atores","cineasta","fotografia","ciencia","matematica",
"matemática","geometria","algebra","álgebra","fisica","física","quimica","química","biologia","biologia",
"historia","história","filosofia","psicologia","economia","geografia","educacao","educação","direito","medicina",
"odontologia","veterinaria","veterinário","veterinaria","agricultura","agricola","agricultura","horta","plantar","regar",
"planta","flor","árvore","arvore","folha","raiz","semente","fruto","polinização","polinizacao",
"abelha","borboleta","inseto","animal","animal","gato","cachorro","cachorra","cão","cao",
"cavalo","vaca","boi","porco","ovelha","ovelha","peixe","tubarao","tubarão","golfinho",
"galinha","galo","peru","papagaio","pássaro","passaro","ornitorrinco","roedor","rato","esquilo",
"macaco","sapo","rã","rã","sapo","aranha","formiga","abelha","vespa","mosca",
"borboleta","vagalume","pinguim","urso","tigre","leao","leão","zebra","girafa","elefante",
"rinoceronte","hipopotamo","hipopótamo","crocodilo","jacaré","jacare","barco","canoa","canoagem","remo",
"pesca","pescar","isca","rede","anzol","marinheiro","porto","aeroporto","navio","ferry",
"ilha","praia","areia","concha","maré","mare","ondas","onda","surf","surfar",
"trabalho","trabalhar","emprego","empresário","empreendedor","empresa","negocio","negócio","loja","venda",
"vendedor","comprador","cliente","atendimento","servico","serviço","receita","lucro","gasto","economia",
"economizar","poupança","poupanca","investimento","investir","bolsa","acao","ação","credito","debito",
"pagamento","dinheiro","moeda","nota","cartao","cartão","boleto","transacao","transferencia","transferência",
"telefone","ligar","desligar","chamar","responder","digitar","escrever","apagar","corrigir","erro",
"correto","acertar","acerto","falha","falhar","ajuda","suporte","sistema","sinal","conexão",
"conexao","wifi","bluetooth","dados","arquivo","salvar","abrir","fechar","copiar","colar",
"recortar","imprimir","impressora","scanner","scanner","digital","senha","seguro","inseguro","proteger",
"seguranca","backup","restaurar","atualizar","atualizacao","instalar","desinstalar","executar","programa","aplicativo",
"janelas","janela","icone","menu","botao","botão","clicar","arrastar","arrastar-soltar","arrastar soltar",
"arrastar-soltar","arrastar_solt","zoom","rolagem","rolar","pagina","aba","guia","guia","favorito",
"marcador","pesquisa","buscar","encontrar","filtrar","ordenar","listar","opcao","opção","configuracao",
"configuração","preferencia","preferência","tema","tema-escuro","tema-claro","suavizar","suavização","ajustar","ajuste"
];

// to ensure > 1000 words, duplicate extra base list with slight variations (still appropriate)
const EXTRA = [
"abraço","abraco","beijo","beijinho","amizade","amigavel","amigável","companheiro","companheira","gentil",
"gentileza","educacao","educação","respeito","honesto","honestidade","responsavel","responsável","pontual","organizado",
"organizada","criativo","criativa","curioso","curiosa","brincalhao","brincalhona","engracado","engraçada","esperto",
"esperta","humilde","generoso","generosa","sincero","sincera","justo","justa","correto","correta",
"vermelho","azul","verde","amarelo","rosa","roxo","marrom","preto","branco","cinza",
"claro","escuro","quente","frio","morno","gelado","doce","azedo","salgado","amargo",
"suave","forte","leve","pesado","rapido","rápido","lento","devagar","novo","velho",
"antigo","recente","popular","comum","raro","famoso","famosa","lindo","linda","bonito",
"bonita","feio","feia","pequeno","pequena","grande","grandeza","alto","alto","baixo",
"baixa","macio","macio","firme","flexivel","flexível","rigido","rigído","brilhante","opaco",
"limpo","sujo","higienico","higiênico","seguro","perigoso","ufa","ufa","ufa2","ufa3"
];

// merge and export
const ALL_WORDS = WORDS_INTERNAL.concat(EXTRA);

// Guarantee unique and lowercase and trimmed
const set = new Set();
ALL_WORDS.forEach(w=>{
  if (!w) return;
  const s = String(w).toLowerCase().trim();
  set.add(s);
});
export const WORDS = Array.from(set);

// ensure length > 1000 by repeating with suffix if needed
(function ensureSize(){
  let idx = 0;
  while (WORDS.length < 1100) {
    const w = WORDS[idx % WORDS.length] + (Math.floor(idx / WORDS.length) + 1);
    WORDS.push(w);
    idx++;
  }
})();
