interface CartItem {
  name: string;
  quantity: number;
  price: number;
  emoji?: string;
}

export type DisplayStatus = 'idle' | 'ready' | 'processing' | 'success' | 'error' | 'qr' | 'signup' | 'split_pending' | 'link_pending';

const API_URL = 'https://api.dltpays.com/nfc/api/v1';

export async function updateCustomerDisplay(
  storeId: string,
  storeName: string,
  cart: any[],
  total: number,
  status: DisplayStatus,
  qrCode?: string | null,
  tip?: number,
  tipsEnabled?: boolean
) {
  try {
    await fetch(`${API_URL}/display/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        store_id: storeId,
        store_name: storeName,
        cart,
        total,
        status,
        qr_code: qrCode || null,
        tip: tip || 0,
        tips_enabled: tipsEnabled ?? false
      })
    });
  } catch (error) {
    console.error('Failed to update display:', error);
  }
}

export async function clearCustomerDisplay(storeId: string, storeName: string) {
  await updateCustomerDisplay(storeId, storeName, [], 0, 'idle', null);
}