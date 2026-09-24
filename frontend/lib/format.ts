export function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatNumber(value: number) {
  return value.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
}

// As datas vêm do backend como meia-noite UTC. Formatar em UTC evita que
// 23/09 apareça como 22/09 em fusos atrás de Greenwich (Brasil, UTC-3).
export function formatDate(dateIso: string) {
  return new Date(dateIso).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}
