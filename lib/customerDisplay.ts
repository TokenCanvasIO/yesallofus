interface CartItem {
  name: string;
  quantity: number;
  price: number;
  emoji?: string;
}

export type DisplayStatus = 'idle' | 'ready' | 'processing' | 'success' | 'error';

const API_URL = 'https://api.dltpays.com/nfc/api/v1';

export async function updateCustomerDisplay(
  storeId: string,
  storeName: string,
  cart: CartItem[],
  total: number,
  status: DisplayStatus = 'idle'
) {
  if (!storeId) return;
  
  try {
    await fetch(`${API_URL}/display/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        store_id: storeId,
        store_name: storeName,
        cart: cart,
        total: total,
        status: status
      })
    });
  } catch (error) {
    console.error('Failed to update customer display:', error);
  }
}

export async function clearCustomerDisplay(storeId: string, storeName: string) {
  await updateCustomerDisplay(storeId, storeName, [], 0, 'idle');
}