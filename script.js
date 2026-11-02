const capa = document.getElementById("capa");
const progresso = document.getElementById("progresso");

const paginas = document.querySelectorAll(".pagina");
const numeroPagina = document.getElementById("numeroPagina");

let paginaAtual = 0;

let arrastando = false;
let inicioX = 0;
let movimentoX = 0;

let paginaSendoVirada = null;
let direcao = 0;


// ===============================
// ABRIR A CAPA
// ===============================

let segurando = false;
let inicioSegurar = 0;
let animacaoSegurar = null;

capa.addEventListener("pointerdown", function (e) {

    if (capa.classList.contains("aberta")) return;

    segurando = true;
    inicioSegurar = Date.now();

    capa.setPointerCapture(e.pointerId);

    animacaoSegurar = requestAnimationFrame(atualizarSegurar);
});


capa.addEventListener("pointerup", function () {

    if (!segurando) return;

    segurando = false;

    cancelAnimationFrame(animacaoSegurar);

    progresso.style.width = "0%";

    if (Date.now() - inicioSegurar >= 2000) {
        abrirAlbum();
    }
});


capa.addEventListener("pointercancel", function () {

    segurando = false;

    cancelAnimationFrame(animacaoSegurar);

    progresso.style.width = "0%";
});


function atualizarSegurar() {

    if (!segurando) return;

    const tempo = Date.now() - inicioSegurar;

    let porcentagem = Math.min((tempo / 2000) * 100, 100);

    progresso.style.width = porcentagem + "%";

    if (tempo < 2000) {
        animacaoSegurar = requestAnimationFrame(atualizarSegurar);
    }
}


function abrirAlbum() {

    capa.classList.add("aberta");

    setTimeout(() => {
        if (paginas.length > 0) {
            paginas[0].classList.add("ativa");
        }
    }, 500);

    tocarSomFolha();
}


// ===============================
// PREPARAR AS PÁGINAS
// ===============================

paginas.forEach((pagina, index) => {

    pagina.style.transformOrigin = "left center";

    pagina.style.setProperty("--ordem", index);

    pagina.addEventListener("pointerdown", iniciarArraste);
    pagina.addEventListener("pointermove", moverPagina);
    pagina.addEventListener("pointerup", finalizarArraste);
    pagina.addEventListener("pointercancel", cancelarArraste);

});


// ===============================
// COMEÇAR A ARRASTAR
// ===============================

function iniciarArraste(e) {

    if (!capa.classList.contains("aberta")) return;

    arrastando = true;
    inicioX = e.clientX;
    movimentoX = 0;

    this.setPointerCapture(e.pointerId);

    paginaSendoVirada = this;

    this.classList.add("virando");

}


// ===============================
// MOVIMENTO DO DEDO
// ===============================

function moverPagina(e) {

    if (!arrastando || paginaSendoVirada !== this) return;

    movimentoX = e.clientX - inicioX;

    const largura = this.offsetWidth;

    let porcentagem = movimentoX / largura;

    // Limita o movimento
    porcentagem = Math.max(-1, Math.min(1, porcentagem));

    // Ângulo da folha
    let angulo = porcentagem * 180;

    this.style.transform =
        `rotateY(${angulo}deg)`;

    // Pequeno efeito de dobra
    let sombra = Math.abs(porcentagem);

    this.style.setProperty(
        "--sombra-folha",
        sombra
    );

}


// ===============================
// SOLTAR O DEDO
// ===============================

function finalizarArraste() {

    if (!arrastando || !paginaSendoVirada) return;

    arrastando = false;

    const pagina = paginaSendoVirada;

    const largura = pagina.offsetWidth;

    let porcentagem = movimentoX / largura;

    paginaSendoVirada = null;

    // Se arrastou bastante
    if (Math.abs(porcentagem) > 0.25) {

        if (porcentagem < 0) {

            // Próxima página
            virarProxima(pagina);

        } else {

            // Página anterior
            virarAnterior(pagina);

        }

    } else {

        // Volta para o lugar
        pagina.style.transition =
            "transform 0.45s cubic-bezier(.2,.8,.2,1)";

        pagina.style.transform =
            "rotateY(0deg)";

        setTimeout(() => {
            pagina.style.transition = "";
        }, 450);
    }

    pagina.classList.remove("virando");
}


// ===============================
// CANCELAR
// ===============================

function cancelarArraste() {

    arrastando = false;

    if (paginaSendoVirada) {

        paginaSendoVirada.style.transition =
            "transform 0.45s ease";

        paginaSendoVirada.style.transform =
            "rotateY(0deg)";

        paginaSendoVirada = null;
    }
}


// ===============================
// PRÓXIMA PÁGINA
// ===============================

function virarProxima(pagina) {

    if (paginaAtual >= paginas.length - 1) {

        pagina.style.transition =
            "transform 0.5s ease";

        pagina.style.transform =
            "rotateY(-180deg)";

        tocarSomFolha();

        return;
    }

    pagina.style.transition =
        "transform 0.65s cubic-bezier(.2,.8,.2,1)";

    pagina.style.transform =
        "rotateY(-180deg)";

    tocarSomFolha();

    paginaAtual++;

    atualizarNumero();

}


// ===============================
// PÁGINA ANTERIOR
// ===============================

function virarAnterior(pagina) {

    if (paginaAtual <= 0) {

        pagina.style.transition =
            "transform 0.5s ease";

        pagina.style.transform =
            "rotateY(0deg)";

        return;
    }

    pagina.style.transition =
        "transform 0.65s cubic-bezier(.2,.8,.2,1)";

    pagina.style.transform =
        "rotateY(0deg)";

    tocarSomFolha();

    paginaAtual--;

    atualizarNumero();

}


// ===============================
// NÚMERO DA PÁGINA
// ===============================

function atualizarNumero() {

    if (numeroPagina) {

        numeroPagina.textContent =
            `${paginaAtual + 1} / ${paginas.length}`;

    }
}


// ===============================
// SOM DE FOLHA
// ===============================

function tocarSomFolha() {

    try {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        const audio =
            new AudioContext();

        const duracao = 0.18;

        const buffer =
            audio.createBuffer(
                1,
                audio.sampleRate * duracao,
                audio.sampleRate
            );

        const dados =
            buffer.getChannelData(0);

        for (let i = 0; i < dados.length; i++) {

            const envelope =
                1 - i / dados.length;

            dados[i] =
                (Math.random() * 2 - 1) *
                envelope *
                0.15;
        }

        const fonte =
            audio.createBufferSource();

        const ganho =
            audio.createGain();

        fonte.buffer = buffer;

        ganho.gain.value = 0.35;

        fonte.connect(ganho);
        ganho.connect(audio.destination);

        fonte.start();

    } catch (erro) {

        console.log(
            "Som não disponível"
        );

    }
}