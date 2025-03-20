export class CardFilterPipe {
  transform(cards: any[], searchTerm: string): any[] {
    if (!cards || !searchTerm) {
      return cards;
    }
    return cards.filter(card =>
      card.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
}