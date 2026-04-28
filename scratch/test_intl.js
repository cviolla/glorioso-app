const formatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Sao_Paulo',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  weekday: 'long',
  hour12: false
});

const parts = formatter.formatToParts(new Date());
console.log('Parts:', JSON.stringify(parts, null, 2));

const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
const weekdayPart = parts.find(p => p.type === 'weekday')?.value || '';
const isMonday = weekdayPart.toLowerCase().includes('segunda');

console.log('Hour:', hour);
console.log('Weekday:', weekdayPart);
console.log('Is Monday:', isMonday);
console.log('Is Open (15-24):', hour >= 15 && hour < 24);
