export interface CartItem {
  productId: number;
  quantity: number;
}

export interface Cart {
  username: string;
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
}
