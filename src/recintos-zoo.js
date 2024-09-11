class RecintosZoo {
    constructor() {
        this.recintos = {
            1:  { biomas: ['savana'], tamanhoTotal: 10, animais: [{ especie: 'MACACO', quantidade: 3 }] },
            2:  { biomas: ['floresta'], tamanhoTotal: 5, animais: [] },
            3:  { biomas: ['savana', 'rio'], tamanhoTotal: 7, animais: [{ especie: 'GAZELA', quantidade: 1 }] },
            4:  { biomas: ['rio'], tamanhoTotal: 8, animais: [] },
            5:  { biomas: ['savana'], tamanhoTotal: 9, animais: [{ especie: 'LEAO', quantidade: 1 }] }
        };

        this.animaisPermitidos = {
            LEAO: { tamanho: 3, biomas: ['savana'], carnivoro: true },
            LEOPARDO: { tamanho: 2, biomas: ['savana'], carnivoro: true },
            CROCODILO: { tamanho: 3, biomas: ['rio'], carnivoro: true },
            MACACO: { tamanho: 1, biomas: ['savana', 'floresta'], carnivoro: false },
            GAZELA: { tamanho: 2, biomas: ['savana'], carnivoro: false },
            HIPOPOTAMO: { tamanho: 4, biomas: ['savana', 'rio'], carnivoro: false }
        };
    }

    analisaRecintos(animal, quantidade) {
        if (!this.animaisPermitidos[animal]) {
            return { erro: "Animal inválido" };
        }

        if (quantidade <= 0 || isNaN(quantidade)) {
            return { erro: "Quantidade inválida" };
        }

        const especieInfo = this.animaisPermitidos[animal];
        const espacoPorAnimal = especieInfo.tamanho;
        const espacoNecessario = espacoPorAnimal * quantidade;
        let recintosViaveis = [];

        for (let recintoKey in this.recintos) {
            const recinto = this.recintos[recintoKey];

            // Biomas compátiveis
            const biomasValidos = recinto.biomas.filter(bioma => especieInfo.biomas.includes(bioma));

            if (biomasValidos.length > 0) {
                // Verifica se o recinto é adequado para o animal
                const espacoOcupado = recinto.animais.reduce((total, animalExistente) => {
                    const infoExistente = this.animaisPermitidos[animalExistente.especie];
                    return total + (infoExistente.tamanho * animalExistente.quantidade);
                }, 0);

                // Adiciona o espaço necessário para o novo animal
                const espacoTotalOcupado = espacoOcupado + espacoNecessario;

                // 'Empurra' o resultado ao array final
                if (espacoTotalOcupado <= recinto.tamanhoTotal) {
                    recintosViaveis.push({
                        id: recintoKey,
                        espacoLivre: recinto.tamanhoTotal - espacoTotalOcupado,
                        especiesPresentes: new Set(recinto.animais.map(a => a.especie)),
                        biomas: recinto.biomas,
                        possuiOutrosAnimais: recinto.animais.length > 0
                    });
                }
            }
        }

        // Teste de erro caso não haja recintos viáveis
        if (recintosViaveis.length === 0) {
            return { erro: "Não há recinto viável" };
        }

        // Teste carnívoros
        if (especieInfo.carnivoro) {
            recintosViaveis = recintosViaveis.filter(recinto => {
                const recintoAtual = this.recintos[recinto.id];
                const temAnimaisNaoCarnivoros = recintoAtual.animais.some(animalExistente => !this.animaisPermitidos[animalExistente.especie].carnivoro);
                return !temAnimaisNaoCarnivoros;
            });
        } else {
            recintosViaveis = recintosViaveis.filter(recinto => {
                const recintoAtual = this.recintos[recinto.id];
                const temAnimaisCarnivoros = recintoAtual.animais.some(animalExistente => this.animaisPermitidos[animalExistente.especie].carnivoro);
                return !temAnimaisCarnivoros;
            });
        }

        // Penalidade mais 1 de espécie
        recintosViaveis.forEach(recinto => {
            if (recinto.especiesPresentes.size > 0 && !recinto.especiesPresentes.has(animal)) {
                recinto.espacoLivre -= 1; // Penalidade de 1 unidade para cada nova espécie
            }
        });

        // Hipopótamos
        if (animal === 'HIPOPOTAMO') {
            recintosViaveis = recintosViaveis.filter(recinto => 
                (recinto.biomas.includes('savana') && recinto.biomas.includes('rio')) || recinto.especiesPresentes.size === 0
            );
        }

        // Macaco
        if (animal === 'MACACO') {
            recintosViaveis = recintosViaveis.filter(recinto => {
                if (quantidade === 1) {
                    return recinto.possuiOutrosAnimais;
                }
                return true; // Retorna true, regra não aplica se tem mais de 1 macaco
            });
        }

        // Remove espaço livre negativo, pois é inválido
        recintosViaveis = recintosViaveis.filter(recinto => recinto.espacoLivre >= 0);

        // Formata a saída para o formato correto
        const recintosFormatados = recintosViaveis.map(recinto => 
            `Recinto ${recinto.id} (espaço livre: ${recinto.espacoLivre} total: ${this.recintos[recinto.id].tamanhoTotal})`
        );

        return { recintosViaveis: recintosFormatados };
    }
}

// Teste de entrada
const zoo = new RecintosZoo();
const resultado = zoo.analisaRecintos('HIPOPOTAMO', 1);
console.log(resultado);

export { RecintosZoo };
