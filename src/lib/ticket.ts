export function formatTicketCode(prefix: string, ticketNumber: number) {
  return `${prefix}${String(ticketNumber).padStart(3, '0')}`;
}
