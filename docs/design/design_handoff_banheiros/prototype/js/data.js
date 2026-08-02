// Mock data for the Banheiros prototype — fictional reviews/hours placed on
// a stylized illustration of Maceió, AL. Not real facility data.
window.BanheirosData = (function () {
  var CATEGORY_META = {
    public: { icon: "building2", paid: false, tone: "accent" },
    instore: { icon: "store", paid: false, tone: "accent2" },
    public_paid: { icon: "building2", paid: true, tone: "accent" },
    instore_paid: { icon: "store", paid: true, tone: "accent2" }
  };

  function avg(ratings) {
    var vals = Object.values(ratings);
    return vals.reduce(function (a, b) { return a + b; }, 0) / vals.length;
  }

  var bathrooms = [
    { id: "b1", name: "Banheiro Público — Orla de Pajuçara", category: "public", address: "Av. Doutor Antônio Gouveia, Pajuçara", x: 24, y: 66, hours: { open: "06:00", close: "22:00" },
      ratings: { accessibility: 2, lighting: 2, odor: 1, maintenance: 2, cleanliness: 2 },
      reviews: [
        { id: "r1", author: "mari.santos", date: "2026-07-18", comment: "Dá pra usar, mas o cheiro incomoda perto do meio-dia. Rampa de acesso existe.", categoryRatings: { accessibility: 2, lighting: 2, odor: 1, maintenance: 2, cleanliness: 2 } },
        { id: "r2", author: null, date: "2026-06-30", comment: "Sempre tem papel higiênico, o que já ajuda bastante para um banheiro de orla.", categoryRatings: { accessibility: 2, lighting: 3, odor: 1, maintenance: 2, cleanliness: 2 } }
      ] },
    { id: "b2", name: "Shopping Center Maceió", category: "instore_paid", address: "Av. Fernandes Lima, Farol", x: 54, y: 32, hours: { open: "10:00", close: "22:00" },
      ratings: { accessibility: 3, lighting: 3, odor: 3, maintenance: 3, cleanliness: 3 },
      reviews: [
        { id: "r3", author: "carlos_ac", date: "2026-07-22", comment: "Impecável, com fraldário e banheiro adaptado bem sinalizado. Cobra R$2 na entrada.", categoryRatings: { accessibility: 3, lighting: 3, odor: 3, maintenance: 3, cleanliness: 3 } }
      ] },
    { id: "b3", name: "Praça Sinimbu", category: "public", address: "Praça Sinimbu, Centro", x: 39, y: 47, hours: { open: "07:00", close: "18:00" },
      ratings: { accessibility: 1, lighting: 2, odor: 1, maintenance: 1, cleanliness: 1 },
      reviews: [
        { id: "r4", author: null, date: "2026-05-14", comment: "Precisa de manutenção urgente, a porta de uma das cabines não fecha.", categoryRatings: { accessibility: 1, lighting: 2, odor: 1, maintenance: 1, cleanliness: 1 } }
      ] },
    { id: "b4", name: "Posto Ipiranga — Farol", category: "instore", address: "Av. Fernandes Lima, Farol", x: 68, y: 54, hours: { open: "00:00", close: "23:59" },
      ratings: { accessibility: 2, lighting: 3, odor: 2, maintenance: 2, cleanliness: 3 },
      reviews: [
        { id: "r5", author: "roberta.k", date: "2026-07-02", comment: "Aberto 24h, funcionário limpa com frequência. Pedem para consumir algo, mas não é regra fixa.", categoryRatings: { accessibility: 2, lighting: 3, odor: 2, maintenance: 2, cleanliness: 3 } },
        { id: "r6", author: null, date: "2026-04-11", comment: "Bom para parar numa viagem à noite.", categoryRatings: { accessibility: 2, lighting: 3, odor: 3, maintenance: 2, cleanliness: 3 } }
      ] },
    { id: "b5", name: "Parque da Cidade", category: "public", address: "Tabuleiro do Martins", x: 18, y: 24, hours: { open: "05:00", close: "20:00" },
      ratings: { accessibility: 2, lighting: 1, odor: 2, maintenance: 2, cleanliness: 2 },
      reviews: [] },
    { id: "b6", name: "Restaurante Divina Gula", category: "instore", address: "Rua Eng. Mário de Gusmão, Ponta Verde", x: 33, y: 58, hours: { open: "11:30", close: "23:00" },
      ratings: { accessibility: 2, lighting: 3, odor: 3, maintenance: 3, cleanliness: 3 },
      reviews: [
        { id: "r7", author: "fefeoliveira", date: "2026-07-27", comment: "Só para clientes, mas vale — cheiroso e bem decorado.", categoryRatings: { accessibility: 2, lighting: 3, odor: 3, maintenance: 3, cleanliness: 3 } }
      ] },
    { id: "b7", name: "Mercado Público de Maceió", category: "public_paid", address: "Praça dos Palmares, Centro", x: 58, y: 71, hours: { open: "06:00", close: "17:00" },
      ratings: { accessibility: 1, lighting: 2, odor: 1, maintenance: 2, cleanliness: 1 },
      reviews: [
        { id: "r8", author: null, date: "2026-06-05", comment: "Cobra R$1, tem zelador na porta mas o odor ainda incomoda no fim do dia.", categoryRatings: { accessibility: 1, lighting: 2, odor: 1, maintenance: 2, cleanliness: 1 } }
      ] },
    { id: "b8", name: "Farol Shopping", category: "instore_paid", address: "Av. Fernandes Lima, Farol", x: 74, y: 22, hours: { open: "10:00", close: "22:00" },
      ratings: { accessibility: 3, lighting: 3, odor: 2, maintenance: 3, cleanliness: 3 },
      reviews: [
        { id: "r9", author: "juuh.alves", date: "2026-07-10", comment: "Banheiro família e adaptado bem localizados perto do estacionamento.", categoryRatings: { accessibility: 3, lighting: 3, odor: 2, maintenance: 3, cleanliness: 3 } }
      ] },
    { id: "b9", name: "Banheiro Público — Praia de Jatiúca", category: "public", address: "Av. Álvaro Otacílio, Jatiúca", x: 14, y: 82, hours: { open: "06:00", close: "21:00" },
      ratings: { accessibility: 2, lighting: 2, odor: 2, maintenance: 1, cleanliness: 2 },
      reviews: [
        { id: "r10", author: null, date: "2026-07-30", comment: "Fila grande no fim de semana, mas resolve. Chuveiro externo funcionando.", categoryRatings: { accessibility: 2, lighting: 2, odor: 2, maintenance: 1, cleanliness: 2 } }
      ] }
  ];

  return { CATEGORY_META: CATEGORY_META, bathrooms: bathrooms, avg: avg };
})();
