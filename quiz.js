/**
 * Quiz - Fórmula Chocolate & Lucro™
 * Personalizado e sem volta
 */

class Quiz {
    constructor() {
        this.modal = document.getElementById('quiz-modal');
        this.container = document.querySelector('.quiz-container');
        this.screens = document.querySelectorAll('.quiz-screen');
        this.progressBar = document.querySelector('.quiz-progress');
        this.progressFill = document.querySelector('.quiz-progress-fill');
        this.progressText = document.querySelector('.quiz-progress-text');
        this.closeBtn = document.querySelector('.quiz-close');
        this.overlay = document.querySelector('.quiz-overlay');

        this.currentScreen = 1;
        this.totalScreens = 17;
        this.userName = '';
        this.answers = {};
        this.quizCompleted = false;

        // Nomes das telas para tracking
        this.screenNames = {
            1: 'nome',
            2: 'filhos',
            3: 'trabalho',
            4: 'renda',
            5: 'cidade',
            6: 'validacao_cidade',
            7: 'tempo',
            8: 'experiencia',
            9: 'validacao_perfil',
            10: 'margem_lucro',
            11: 'iniciantes_sucesso',
            12: 'investimento',
            13: 'objetivo',
            14: 'medo',
            15: 'roi_simulacao',
            16: 'validacao_medo',
            17: 'decisao',
            18: 'loading',
            19: 'resultado_final'
        };

        this.init();
    }

    // Analytics: Envia evento para GA4
    trackEvent(eventName, params = {}) {
        if (typeof gtag === 'function') {
            gtag('event', eventName, params);
            console.log(`📊 [GA4] ${eventName}`, params);
        }
    }

    init() {
        // Open quiz
        document.querySelectorAll('[data-action="open-quiz"]').forEach(btn => {
            btn.addEventListener('click', () => this.open());
        });

        // Close - only after quiz completed
        this.closeBtn?.addEventListener('click', () => {
            if (this.quizCompleted) this.close();
        });

        // Overlay click - blocked during quiz
        this.overlay?.addEventListener('click', (e) => {
            if (this.quizCompleted) this.close();
        });

        // Name input and start
        const startBtn = document.getElementById('btn-start-quiz');
        const nameInput = document.getElementById('quiz-name-input');

        startBtn?.addEventListener('click', () => {
            const name = nameInput?.value.trim();
            if (name && name.length >= 2) {
                this.userName = name;
                this.updateUserNameDisplays();
                this.goToScreen(2);
            } else {
                nameInput?.focus();
                nameInput?.classList.add('error');
                setTimeout(() => nameInput?.classList.remove('error'), 500);
            }
        });

        nameInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') startBtn?.click();
        });

        // Quiz options
        document.querySelectorAll('.quiz-option').forEach(option => {
            option.addEventListener('click', () => {
                const key = option.dataset.key;
                const value = option.dataset.value;
                const nextScreen = parseInt(option.dataset.next);

                if (key && value) {
                    this.answers[key] = value;
                }

                // Handle special screens
                if (nextScreen === 9) this.handleValidationScreen();
                if (nextScreen === 17) this.handleFearScreen();

                if (nextScreen) {
                    this.goToScreen(nextScreen);
                }
            });
        });

        // Navigation buttons
        document.querySelectorAll('[data-next]').forEach(btn => {
            if (!btn.classList.contains('quiz-option')) {
                btn.addEventListener('click', () => {
                    const nextScreen = parseInt(btn.dataset.next);
                    if (nextScreen) this.goToScreen(nextScreen);
                });
            }
        });

        // News carousel
        this.initNewsCarousel();
        this.initQuizTicker();

        // FAQ
        this.initFAQ();

        // Block ESC during quiz
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                if (this.quizCompleted) this.close();
            }
        });
    }

    open() {
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.quizCompleted = false;
        this.closeBtn?.classList.add('hidden');

        // GA4: Quiz iniciado
        this.trackEvent('quiz_start');

        this.goToScreen(1);
    }

    close() {
        // GA4: Se fechou sem completar, é abandono
        if (!this.quizCompleted && this.currentScreen > 1) {
            const lastScreenName = this.screenNames[this.currentScreen] || `tela_${this.currentScreen}`;
            this.trackEvent('quiz_abandon', {
                last_step_number: this.currentScreen,
                last_step_name: lastScreenName
            });
        }

        this.modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    goToScreen(screenNumber) {
        // Intercepta a tela final (19) para mostrar na LP (Experience "Unlock")
        if (screenNumber === 19) {
            this.handleResultScreenLP();
            return;
        }

        this.screens.forEach(screen => screen.classList.remove('active'));

        const targetScreen = document.querySelector(`[data-screen="${screenNumber}"]`);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenNumber;
            this.updateProgress();
            this.container.scrollTop = 0;

            // GA4: Trackeia cada tela visitada
            const screenName = this.screenNames[screenNumber] || `tela_${screenNumber}`;
            this.trackEvent('quiz_step', {
                step_number: screenNumber,
                step_name: screenName
            });

            // Special handlers
            if (screenNumber === 6) this.handleCityValidation();
            if (screenNumber === 15) this.handleROIScreen();
            if (screenNumber === 18) this.handleLoadingScreen();
        }
    }

    updateProgress() {
        if (this.currentScreen === 1 || this.currentScreen >= 18) {
            this.progressBar.classList.remove('show');
        } else {
            this.progressBar.classList.add('show');
            const progress = ((this.currentScreen - 1) / 16) * 100;
            this.progressFill.style.width = `${Math.min(progress, 100)}%`;
            this.progressText.textContent = `Etapa ${this.currentScreen - 1} de 16`;
        }
    }

    updateUserNameDisplays() {
        document.querySelectorAll('.user-name').forEach(el => {
            el.textContent = this.userName;
        });
    }

    handleValidationScreen() {
        const filhos = this.answers.filhos;
        const trabalho = this.answers.trabalho;

        let title = `Excelente ponto, ${this.userName}. 🤔`;
        let text = 'Sua rotina tem desafios reais, mas identificamos um padrão interessante: perfis como o seu tendem a ter resultados surpreendentes porque focam na QUALIDADE do tempo.';
        let testimonial = {
            img: 'https://i.pravatar.cc/40?img=34',
            quote: '"Achei que minha rotina ia me impedir, mas descobri que precisava de 1h focada, não o dia todo. Foi libertador!"',
            author: '— Patrícia R.'
        };

        if (trabalho === 'dona-casa' && (filhos === '2-3' || filhos === '4+')) {
            title = `Sua força vem daí, ${this.userName} ❤️`;
            text = 'Muitas acham que filhos atrapalham, mas nossas alunas provam o contrário: eles são o MOTIVO. Você não precisa de "tempo sobrando", precisa de uma fórmula que respeite seus intervalos de mãe.';
            testimonial = {
                img: 'https://i.pravatar.cc/40?img=16',
                quote: '"Faço nos horários de soneca e à noite. Cansativo? Sim. Mas pagar a escola deles à vista... não tem preço!"',
                author: '— Amanda O.'
            };
        } else if (trabalho === 'clt') {
            title = `O tempo é seu ativo, ${this.userName} ⏳`;
            text = 'Quem trabalha fora tem uma vantagem secreta: Objetividade. Você não tem tempo a perder, e essa fórmula foi desenhada para render o triplo em 2 horas do que amadores fazem em 8h.';
            testimonial = {
                img: 'https://i.pravatar.cc/40?img=5',
                quote: '"Chegava do trabalho e fazia 1h de produção focada. Fiz R$4.800 só nos fins de semana e noites. É método, não milagre."',
                author: '— Carla M.'
            };
        } else if (trabalho === 'desempregada') {
            title = `Seu momento de virada, ${this.userName} 🌟`;
            text = 'Pode parecer difícil agora, mas você tem algo valioso: Foco Total. Enquanto outras dividem atenção, você pode mergulhar e dominar o mercado da sua região em semanas.';
            testimonial = {
                img: 'https://i.pravatar.cc/40?img=23',
                quote: '"Estava no fundo do poço, devendo tudo. Peguei R$150 com medo. Hoje sustento a casa só com os doces. A Páscoa mudou minha vida."',
                author: '— Fernanda L.'
            };
        } else if (trabalho === 'autonoma') {
            title = `Visão de Águia, ${this.userName} 🦅`;
            text = 'Você já sabe que renda depende de esforço inteligente. A "Fórmula Chocolate & Lucro" não é gasto, é uma nova linha de receita sazonal para injetar caixa rápido no seu negócio.';
            testimonial = {
                img: 'https://i.pravatar.cc/40?img=35',
                quote: '"Integrei os ovos no meu salão e vendi para as clientes que já tinha. Dobrei meu faturamento de abril sem gastar com anúncio!"',
                author: '— Juliana C.'
            };
        }

        document.getElementById('validation-title').innerHTML = title;
        document.getElementById('validation-text').textContent = text;

        const testEl = document.getElementById('validation-testimonial');
        if (testEl) {
            testEl.querySelector('img').src = testimonial.img;
            testEl.querySelector('p').textContent = testimonial.quote;
            testEl.querySelector('span').textContent = testimonial.author;
        }
    }

    handleCityValidation() {
        const cidade = this.answers.cidade;

        let title = `Excelente localização, ${this.userName}!`;
        let text = 'Sua região tem um potencial incrível para vendas de ovos artesanais.';
        let testimonial = {
            img: 'https://i.pravatar.cc/40?img=25',
            quote: '"Minha cidade é pequena, mas isso foi minha vantagem. Virei referência rapidinho!"',
            author: '— Sandra M., Interior de MG'
        };

        if (cidade === 'pequena') {
            title = `Sua cidade é uma mina de ouro, ${this.userName}! 🏆`;
            text = 'Cidades pequenas têm uma vantagem SECRETA: Menos concorrência + Boca a boca mais forte = Você pode dominar o mercado em semanas. Quem chega primeiro, fica com tudo!';
            testimonial = {
                img: 'https://i.pravatar.cc/40?img=25',
                quote: '"Moro numa cidade de 15 mil habitantes. Na primeira Páscoa vendi pra 80 famílias. Hoje TODOS me conhecem como a \"moça do ovo\"."',
                author: '— Sandra M., Interior de MG'
            };
        } else if (cidade === 'media') {
            title = `Equilíbrio perfeito, ${this.userName}! ⚡`;
            text = 'Cidades médias são o ponto ideal: Mercado grande o suficiente para crescer, mas pequeno o suficiente para você se destacar. Você pode construir uma marca forte rapidinho!';
            testimonial = {
                img: 'https://i.pravatar.cc/40?img=47',
                quote: '"Minha cidade tem 80 mil habitantes. Comecei atendendo meu bairro, depois viralizei no WhatsApp. Fiz R$12.000 na última Páscoa!"',
                author: '— Renata K., Itajubá/MG'
            };
        } else if (cidade === 'grande') {
            title = `Mercado gigante te esperando, ${this.userName}! 🌆`;
            text = 'Cidade grande = Demanda infinita. Com a estratégia certa de nichos (escritórios, condomínios, igrejas), você pode criar uma clientela fiel que te garante vendas todo ano!';
            testimonial = {
                img: 'https://i.pravatar.cc/40?img=38',
                quote: '"Mora numa cidade de 300 mil. Foquei em empresas e condomínios. Fechei encomendas de 50+ ovos por cliente. O lucro foi absurdo!"',
                author: '— Patrícia F., Ribeirão Preto/SP'
            };
        } else if (cidade === 'capital') {
            title = `Potencial ilimitado na sua mão, ${this.userName}! 🏙️`;
            text = 'Capitais têm um mercado ENORME para produtos artesanais premium. As pessoas pagam até 3x mais por algo feito com amor. Você tem milhões de potenciais clientes a poucos km!';
            testimonial = {
                img: 'https://i.pravatar.cc/40?img=41',
                quote: '"Moro em São Paulo. Achei que ia ter muita concorrência, mas o mercado é TÃO grande que vendi tudo antes da Páscoa. Fiz R$18.000 trabalhando de casa!"',
                author: '— Juliana S., São Paulo/SP'
            };
        }

        document.getElementById('city-validation-title').innerHTML = title;
        document.getElementById('city-validation-text').textContent = text;

        const cityTestEl = document.getElementById('city-testimonial');
        if (cityTestEl) {
            cityTestEl.querySelector('img').src = testimonial.img;
            cityTestEl.querySelector('p').textContent = testimonial.quote;
            cityTestEl.querySelector('span').textContent = testimonial.author;
        }
    }

    handleFearScreen() {
        const fear = this.answers.medo;
        const contents = {
            'nao-vender': {
                title: `Esse medo é um bom sinal, ${this.userName} �️`,
                text: 'Ele mostra responsabilidade. Mas a verdade é que em tempos de crise, as pessoas cortam viagens, mas NÃO CORTAM o chocolate. A demanda reprimida para 2026 é gigante, e você só precisa estar posicionada.',
                img: 'https://i.pravatar.cc/40?img=44',
                quote: '"Eu tremia de medo de sobrar ovo. Segui o script de antecipação e vendi tudo ANTES de produzir. Fiquei chocada!"',
                author: '— Luciana A.'
            },
            'nao-ficar-bom': {
                title: `O perfeccionismo te protege, mas... `,
                text: 'Entendo seu receio. A boa notícia? Confeitaria não é "dom", é química e processo. Se você sabe ler e seguir instruções, o resultado é matemático. Seus ovos VÃO ficar lindos porque a fórmula não deixa errar.',
                img: 'https://i.pravatar.cc/40?img=36',
                quote: '"Achava que tinha mão pesada. O guia de temperagem é tão visual que até minha filha de 10 anos conseguiu fazer casca brilhante!"',
                author: '— Camila R.'
            },
            'nao-dar-conta': {
                title: `Não tente ser a Mulher Maravilha ‍♀️`,
                text: 'Você não precisa dar conta de tudo sozinha, só precisa de ORGANIZAÇÃO. A fórmula tem um Cronograma de Produção que te diz: "Hoje faça X, amanhã Y". Assim você produz muito sem virar noite.',
                img: 'https://i.pravatar.cc/40?img=30',
                quote: '"Com o calendário, parei de correr igual barata tonta. Trabalhei tranquila e ainda tive tempo pra família no domingo de Páscoa."',
                author: '— Amanda O.'
            },
            'perder-dinheiro': {
                title: `Vamos falar de Matemática, ${this.userName} 🧮`,
                text: 'Medo financeiro se resolve com cálculo. Ovos artesanais têm margem de 300%. Se você vender 3 ovos, já paga o curso e os materiais iniciais. O resto é lucro puro. O risco é matematicamente quase zero.',
                img: 'https://i.pravatar.cc/40?img=48',
                quote: '"Morria de medo de investir. Comecei com 1 barra de chocolate. Vendi, comprei 2. Vendi, comprei 4. Transformei R$50 em R$3.000 em um mês."',
                author: '— Fernanda L.'
            },
            'sem-medo': {
                title: `Sua mentalidade já venceu 🏆`,
                text: 'Quem elimina o medo da equação sai na frente de 99% das pessoas. Você tem a atitude certa. Agora só precisa da ferramenta certa (a Fórmula) para transformar essa coragem em dinheiro no bolso.',
                img: 'https://i.pravatar.cc/40?img=35',
                quote: '"Eu sabia que ia dar certo, só não sabia como. O curso foi o mapa do tesouro que eu precisava pra explodir de vender."',
                author: '— Juliana C.'
            }
        };

        const content = contents[fear] || contents['sem-medo'];

        document.getElementById('fear-title').innerHTML = content.title;
        document.getElementById('fear-text').textContent = content.text;
        document.getElementById('fear-avatar').src = content.img;
        document.getElementById('fear-quote').textContent = content.quote;
        document.getElementById('fear-author').textContent = content.author;
    }

    handleROIScreen() {
        const invest = this.answers.investimento;

        // Base de cálculo: Custo R$15,00 -> Venda Média R$95,00 (Entre 80 e 125)
        const values = {
            'menos100': {
                inv: 75,
                prod: 5,
                vendas: 475,
                lucro: 400,
                percent: 533
            },
            '100a200': {
                inv: 150,
                prod: 10,
                vendas: 950,
                lucro: 800,
                percent: 533
            },
            '200a400': {
                inv: 300,
                prod: 20,
                vendas: 1900,
                lucro: 1600,
                percent: 533
            },
            'mais400': {
                inv: 450,
                prod: 30,
                vendas: 2850,
                lucro: 2400,
                percent: 533
            }
        };

        const v = values[invest] || values['100a200'];

        // Atualiza DOM
        document.getElementById('roi-invest').innerHTML = `<span style="font-size:0.9em; display:block; color:#666; font-weight:400; margin-bottom:4px;">Custo Material</span>R$ ${v.inv}`;
        document.getElementById('roi-prod').textContent = `${v.prod} ovos`;
        document.getElementById('roi-vendas').textContent = `R$ ${v.vendas.toLocaleString('pt-BR')}`;
        document.getElementById('roi-lucro').textContent = `R$ ${v.lucro.toLocaleString('pt-BR')}`;
        document.getElementById('roi-percent').textContent = `+${v.percent}% de retorno sobre material`;
    }

    handleLoadingScreen() {
        const items = document.querySelectorAll('.loading-item');

        items.forEach((item, index) => {
            const delay = parseInt(item.dataset.delay) || index * 1500;

            setTimeout(() => item.classList.add('active'), delay);
            setTimeout(() => {
                item.classList.remove('active');
                item.classList.add('done');
                item.querySelector('i').className = 'ph ph-check-circle';
            }, delay + 1200);
        });

        setTimeout(() => this.goToScreen(19), 6000);
    }

    handleResultScreenLP() {
        this.quizCompleted = true;
        this.close(); // Fecha o modal

        // GA4: Quiz completo com resumo das respostas
        this.trackEvent('quiz_complete', {
            user_name: this.userName,
            trabalho: this.answers.trabalho || 'not_set',
            filhos: this.answers.filhos || 'not_set',
            cidade: this.answers.cidade || 'not_set',
            tempo: this.answers.tempo || 'not_set',
            medo: this.answers.medo || 'not_set'
        });

        // Desbloqueia a seção na LP
        const offerSection = document.getElementById('oferta-desbloqueada');
        if (offerSection) {
            offerSection.classList.remove('hidden');

            // 1. Gera Headline Personalizada
            this.generatePersonalHeadline();

            // 2. Gera Matemática do Potencial
            this.generatePotentialMath();

            // 3. Gera Validação de Perfil
            this.generateProfileValidation();

            // 4. Gera Quebra de Objeção
            this.generateObjectionBreaker();

            // 5. Transição com Nome
            const transitionName = document.getElementById('user-name-transition');
            if (transitionName) transitionName.textContent = this.userName;

            // 6. Atualiza TODOS os botões da LP para levar à oferta
            const checkoutUrl = "https://pay.cakto.com.br/f5isonf_753149";
            document.querySelectorAll('[data-action="open-quiz"]').forEach(btn => {
                // Muda visual e texto
                btn.innerHTML = '<span>LIBERAR MEU ACESSO AGORA</span><i class="ph ph-lock-key-open"></i>';
                btn.classList.add('btn-pulsing');
                btn.classList.remove('pulse-animation'); // Remove animação antiga se houver

                // Remove listener antigo substituindo o elemento
                const newBtn = btn.cloneNode(true);

                // Se for um link, atualiza o href também
                if (newBtn.tagName === 'A') {
                    newBtn.href = checkoutUrl;
                }

                btn.parentNode.replaceChild(newBtn, btn);

                // Adiciona o novo evento de scroll para a seção de oferta
                newBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const offerSection = document.getElementById('oferta-desbloqueada');
                    if (offerSection) {
                        const headerOffset = 20;
                        const elementPosition = offerSection.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: "smooth"
                        });
                    }
                });
            });

            // Scroll suave (com pequeno delay para renderização)
            setTimeout(() => {
                const headerOffset = 20;
                const elementPosition = offerSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }, 300);
        }
    }

    generatePersonalHeadline() {
        const filhos = this.answers.filhos;
        const trabalho = this.answers.trabalho;
        const tempo = this.answers.tempo;

        let partFilhos = "";
        if (filhos === 'nao') partFilhos = "sem filhos";
        else if (filhos === '1') partFilhos = "mãe de 1";
        else if (filhos === '2-3') partFilhos = "mãe de 2 ou 3";
        else if (filhos === '4+') partFilhos = "super mãe de 4+";

        let partTrabalho = "";
        if (trabalho === 'clt') partTrabalho = "que trabalha fora";
        else if (trabalho === 'autonoma') partTrabalho = "que já empreende";
        else if (trabalho === 'dona-casa') partTrabalho = "que cuida da casa";
        else if (trabalho === 'desempregada') partTrabalho = "que busca uma virada";

        let partTempo = "";
        if (tempo === 'menos1h') partTempo = "e tem rapidinho por dia";
        else if (tempo === '1a2h') partTempo = "e tem 1h a 2h por dia";
        else if (tempo === '2a4h') partTempo = "e tem umas 3h por dia";
        else if (tempo === 'mais4h') partTempo = "e pode focar mais de 4h";

        // Monta a frase: "Ana, mãe de 2, que trabalha fora e tem 1h a 2h por dia..."
        const headline = `${this.userName}, ${partFilhos}, ${partTrabalho} ${partTempo}...`;

        const el = document.getElementById('result-headline-personal');
        if (el) el.textContent = headline;
    }

    generatePotentialMath() {
        // Lógica de cálculo baseada no TEMPO disponível (fator limitante principal)
        const tempoMap = {
            'menos1h': { ovos: 2, labelTempo: '1h' },
            '1a2h': { ovos: 4, labelTempo: '2h' },
            '2a4h': { ovos: 8, labelTempo: '3h' },
            'mais4h': { ovos: 12, labelTempo: '4h+' }
        };

        const dados = tempoMap[this.answers.tempo] || tempoMap['1a2h']; // Fallback

        // Ajuste por cidade (preço médio)
        let lucroUnitario = 35; // Base
        if (this.answers.cidade === 'capital' || this.answers.cidade === 'grande') lucroUnitario = 45;

        const diasProdutivos = 25; // Sendo conservador (não 30)
        const totalOvos = dados.ovos * diasProdutivos;
        const faturamentoPotencial = totalOvos * lucroUnitario;

        // Margem de variação para o range
        const minVal = faturamentoPotencial * 0.9;
        const maxVal = faturamentoPotencial * 1.2;

        // Preenche o DOM
        document.getElementById('result-min-new').textContent = `R$ ${Math.round(minVal).toLocaleString('pt-BR')}`;
        document.getElementById('result-max-new').textContent = `R$ ${Math.round(maxVal).toLocaleString('pt-BR')}`;
        document.getElementById('magic-context').textContent = `trabalhando ${dados.labelTempo} por dia na Páscoa`;

        // Preenche os passos matemáticos
        document.getElementById('math-production').textContent = `Com ${dados.labelTempo}/dia você faz ~${dados.ovos} ovos`;
        document.getElementById('math-total').textContent = `Em ${diasProdutivos} dias = ${totalOvos} ovos produzidos`;
        document.getElementById('math-profit').textContent = `A R$ ${lucroUnitario} de lucro cada = R$ ${faturamentoPotencial.toLocaleString('pt-BR')}`;
    }

    generateProfileValidation() {
        const exp = this.answers.experiencia;
        let text = "";
        let badges = [];

        if (exp === 'zero' || exp === 'familia') {
            text = "Você está no grupo que mais cresce — iniciantes têm 34% mais chances de seguir a fórmula certinha pois não têm 'vícios' de produção.";
            badges = ["Mente Aberta", "Curva de Aprendizado Rápida", "Perfil Executor"];
        } else {
            text = "Você já tem a base, o que é excelente! Seu desafio agora não é 'aprender a fazer', e sim 'aprender a escalar' e vender com lucro máximo.";
            badges = ["Base Técnica", "Potencial de Escala", "Líder de Mercado"];
        }

        document.getElementById('profile-validation-text').textContent = text;

        // Atualiza badges
        for (let i = 0; i < 3; i++) {
            const el = document.getElementById(`profile-badge-${i + 1}`);
            if (el && badges[i]) {
                el.querySelector('span').textContent = badges[i];
            }
        }
    }

    generateObjectionBreaker() {
        const medo = this.answers.medo;
        const map = {
            'nao-vender': {
                fear: '"E se eu fizer e não vender?"',
                stat: '83%',
                label: 'das alunas fazem a primeira venda em 7 dias',
                text: 'A fórmula inclui scripts de "Venda Antecipada". Você vende primeiro e produz depois, eliminando 100% do risco de prejuízo.'
            },
            'nao-ficar-bom': {
                fear: '"E se meus ovos ficarem feios?"',
                stat: '100%',
                label: 'visual profissional seguindo o gabarito',
                text: 'Confeitaria não é dom, é técnica. A fórmula tem "Gabaritos de Decoração" que você coloca do lado e copia. Impossível ficar feio se seguir.'
            },
            'nao-dar-conta': {
                fear: '"E se eu não der conta?"',
                stat: '2h',
                label: 'por dia é o suficiente para faturar alto',
                text: 'Você não precisa virar a noite. O "Cronograma Anti-Caos" te diz exatamente o que fazer em cada bloco de tempo para produzir muito sem se matar.'
            },
            'perder-dinheiro': {
                fear: '"E se eu perder dinheiro?"',
                stat: '300%',
                label: 'é a margem de lucro média de um ovo',
                text: 'A matemática joga a seu favor. Vendendo apenas 3 ovos você já pagou seu investimento inicial. O resto é lucro puro no bolso.'
            },
            'sem-medo': {
                fear: '"Só preciso do caminho certo"',
                stat: '7',
                label: 'passos separam você da sua primeira venda',
                text: 'Você já tem a coragem, e isso é o mais difícil. Agora eu vou te dar o MAPA. É só seguir as coordenadas e coletar o resultado.'
            }
        };

        const data = map[medo] || map['nao-vender'];

        document.getElementById('objection-fear').innerHTML = `<strong>${data.fear}</strong>`;
        const answerDiv = document.getElementById('objection-answer');

        answerDiv.querySelector('.stat-big').textContent = data.stat;
        answerDiv.querySelector('.stat-label').textContent = data.label;
        document.getElementById('objection-explanation').textContent = data.text;
    }

    initNewsCarousel() {
        const track = document.querySelector('.news-carousel-track');
        const dots = document.querySelectorAll('.news-carousel-dots .dot');

        if (!track || !dots.length) return;

        track.addEventListener('scroll', () => {
            const scrollLeft = track.scrollLeft;
            const slideWidth = track.querySelector('.news-slide')?.offsetWidth || 260;
            const currentSlide = Math.round(scrollLeft / (slideWidth + 16));

            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentSlide);
            });
        });
    }

    initQuizTicker() {
        const items = document.querySelectorAll('.news-ticker-item');
        if (!items.length) return;
        let current = 0;

        setInterval(() => {
            items[current].classList.remove('active');
            current = (current + 1) % items.length;
            items[current].classList.add('active');
        }, 3000);
    }

    initFAQ() {
        document.querySelectorAll('.faq-item').forEach(item => {
            item.querySelector('.faq-question')?.addEventListener('click', () => {
                const isOpen = item.classList.contains('active');
                document.querySelectorAll('.faq-item').forEach(i => {
                    i.classList.remove('active');
                    i.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
                });
                if (!isOpen) {
                    item.classList.add('active');
                    item.querySelector('.faq-question')?.setAttribute('aria-expanded', 'true');
                }
            });
        });
    }
}

// Lazy Load Quiz: Inicia apenas na primeira interação do usuário para não bloquear LCP
let quizInitialized = false;
function initQuizLazy() {
    if (quizInitialized) return;
    quizInitialized = true;
    new Quiz();
    // Remove listeners após init
    ['scroll', 'mousemove', 'touchstart', 'click'].forEach(evt =>
        window.removeEventListener(evt, initQuizLazy)
    );
}

// Listeners passivos para performance
['scroll', 'mousemove', 'touchstart', 'click'].forEach(evt =>
    window.addEventListener(evt, initQuizLazy, { passive: true, once: true })
);

// Fallback: Inicia após 4 segundos se nada acontecer (para garantir)
setTimeout(initQuizLazy, 4000);
